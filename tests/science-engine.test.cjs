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
  assert.equal(ScienceEngine.matches(fields, 'excel 25-qator', core), true);
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
