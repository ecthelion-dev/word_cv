const test = require('node:test');
const assert = require('node:assert/strict');
const ScienceEngine = require('../js/science-engine.js');

const core = {
  norm(value) {
    return String(value || '').toLowerCase()
      .replace(/[‘’ʻʼ\u0060´']/g, '')
      .replace(/ё/g, 'е').replace(/ў/g, 'у')
      .replace(/қ/g, 'к').replace(/ғ/g, 'г').replace(/ҳ/g, 'х')
      .replace(/[^a-zа-я0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  }
};

test('scientific search is multi-word and order independent', () => {
  const fields = ['Абдурахмонов Элдор Баратович', 'Кимё-биология кафедраси мудири', 'Fan doktori (DSc)'];
  assert.equal(ScienceEngine.matches(fields, 'Элдор Абдурахмонов', core), true);
  assert.equal(ScienceEngine.matches(fields, 'DSc Кимё биология', core), true);
  assert.equal(ScienceEngine.matches(fields, 'BaraToVich professor', core), false);
});

test('scientific search includes additional roles and source details when supplied', () => {
  const fields = ['Саидов Чорихон Султонович', 'Физика кафедраси', 'Professor', 'dotsent lavozimi', 'Excel 25-qator'];
  assert.equal(ScienceEngine.matches(fields, 'dotsent 25-qator', core), true);
  assert.equal(ScienceEngine.matches(fields, 'excel', core), true);
});

test('empty scientific search matches all records', () => {
  assert.equal(ScienceEngine.matches(['Any employee'], '   ', core), true);
});

test('does not flag equivalent degree labels across sources', () => {
  assert.equal(
    ScienceEngine.sourceConflict('Fan doktori (DSc)', 'DSc', value => /dsc/i.test(value) ? 'dsc' : 'other', value => !value, core),
    false
  );
});

test('flags conflicting recognized categories across document and Excel', () => {
  assert.equal(
    ScienceEngine.sourceConflict('Falsafa doktori (PhD)', 'Fan doktori (DSc)', value => /phd/i.test(value) ? 'phd' : 'dsc', value => !value, core),
    true
  );
});

test('flags different unclassified raw values for manual review', () => {
  assert.equal(
    ScienceEngine.sourceConflict('Iqtisod fanlari doktori', 'Yuridik fanlari doktori', () => 'oth', value => !value, core),
    true
  );
});

test('does not report source conflict when either source is empty', () => {
  assert.equal(
    ScienceEngine.sourceConflict('DSc', '', value => value, value => !value, core),
    false
  );
});

test('ranks departments by recognized degree-holder percentage', () => {
  const rows = [
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: 'dsc', tk: 'prof' },
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: 'phd', tk: 'dots' },
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: 'nomzod', tk: null },
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: null, tk: null },
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: 'oth', tk: null, issues: ['degree'] },
    { grp: 'ped', dept: 'Pedagogika kafedrasi', dk: 'dsc', tk: 'prof' },
    { grp: 'ped', dept: 'Pedagogika kafedrasi', dk: null, tk: null }
  ];
  const result = ScienceEngine.departmentRanking(rows, core);
  assert.equal(result.total, 7);
  assert.equal(result.departmentCount, 2);
  assert.equal(result.departments[0].department, 'Fizika kafedrasi');
  assert.equal(result.departments[0].degreeHolders, 3);
  assert.equal(result.departments[0].staff, 5);
  assert.equal(result.departments[0].degreeRate, 60);
  assert.equal(result.departments[0].dsc, 1);
  assert.equal(result.departments[0].phd, 1);
  assert.equal(result.departments[0].candidate, 1);
  assert.equal(result.departments[0].otherDegree, 1);
  assert.equal(result.departments[0].professors, 1);
  assert.equal(result.departments[0].docents, 1);
  assert.equal(result.departments[0].rank, 1);
  assert.equal(result.departments[0].smallSample, false);
  assert.equal(result.departments[1].degreeRate, 50);
  assert.equal(result.departments[1].rank, 2);
  assert.equal(result.departments[1].smallSample, true);
});

test('does not count external staff or non-teaching groups in department ranking', () => {
  const result = ScienceEngine.departmentRanking([
    { grp: 'ped', dept: 'Fizika', dk: 'phd', ext: false },
    { grp: 'ped', dept: 'Fizika', dk: 'dsc', ext: true },
    { grp: 'oth', dept: 'Fizika', dk: 'dsc', ext: false }
  ], core);
  assert.equal(result.total, 1);
  assert.equal(result.departments[0].staff, 1);
  assert.equal(result.departments[0].degreeHolders, 1);
  assert.equal(result.departments[0].degreeRate, 100);
});

test('keeps employees without a department outside the department ranking', () => {
  const result = ScienceEngine.departmentRanking([
    { grp: 'ped', dept: '', dk: 'dsc' },
    { grp: 'ped', dept: '  ', dk: null },
    { grp: 'ped', dept: 'Informatika', dk: 'phd' }
  ], core);
  assert.equal(result.total, 3);
  assert.equal(result.assigned, 1);
  assert.equal(result.unassigned, 2);
  assert.equal(result.departmentCount, 1);
  assert.equal(result.departments[0].department, 'Informatika');
  assert.equal(result.degreeHolders, 2);
  assert.equal(result.degreeRate, 66.7);
  assert.equal(result.unassignedDegreeHolders, 1);
});

test('groups Latin and Cyrillic department spellings after canonical transliteration', () => {
  const bilingualCore = {
    ...core,
    cyrToLat(value) {
      return String(value).replace(/Физика/gi, 'Fizika').replace(/кафедраси/gi, 'kafedrasi');
    }
  };
  const result = ScienceEngine.departmentRanking([
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: 'dsc' },
    { grp: 'ped', dept: 'Физика кафедраси', dk: 'phd' },
    { grp: 'ped', dept: 'Fizika kafedrasi', dk: null }
  ], bilingualCore);
  assert.equal(result.departmentCount, 1);
  assert.equal(result.departments[0].staff, 3);
  assert.equal(result.departments[0].degreeHolders, 2);
  assert.equal(result.departments[0].degreeRate, 66.7);
});

test('gives equal ranks to departments with exactly equal degree-holder ratios', () => {
  const result = ScienceEngine.departmentRanking([
    { grp: 'ped', dept: 'A kafedrasi', dk: 'dsc' },
    { grp: 'ped', dept: 'A kafedrasi', dk: null },
    { grp: 'ped', dept: 'B kafedrasi', dk: 'phd' },
    { grp: 'ped', dept: 'B kafedrasi', dk: null }
  ], core);
  assert.equal(result.departments[0].rank, 1);
  assert.equal(result.departments[1].rank, 1);
});

test('quality summary separates missing fields from unclassified values and source conflicts', () => {
  assert.deepEqual(
    ScienceEngine.quality({ deg: 'Noma’lum daraja', dk: 'oth', tit: 'Professor', tk: 'prof', issues: ['title'] }),
    { unknownDegree: true, unknownTitle: false, sourceConflict: true, needsReview: true }
  );
  assert.deepEqual(
    ScienceEngine.quality({ deg: '', dk: null, tit: '', tk: null, issues: [] }),
    { unknownDegree: false, unknownTitle: false, sourceConflict: false, needsReview: false }
  );
});
