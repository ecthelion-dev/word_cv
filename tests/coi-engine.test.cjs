const test = require('node:test');
const assert = require('node:assert/strict');
const CoiEngine = require('../js/coi-engine.js');

function fakeCore() {
  const latinToCyr = (input) => {
    let value = String(input || '').toLowerCase().replace(/[‘’ʻʼ´']/g, "'");
    const pairs = [
      ["o'", 'ў'], ["g'", 'ғ'], ['sh', 'ш'], ['ch', 'ч'], ['ng', 'нг'],
      ['yo', 'ё'], ['ya', 'я'], ['yu', 'ю'], ['ye', 'е']
    ];
    for (const [from, to] of pairs) value = value.replaceAll(from, to);
    const letters = {
      a:'а', b:'б', d:'д', e:'е', f:'ф', g:'г', h:'ҳ', i:'и', j:'ж',
      k:'к', l:'л', m:'м', n:'н', o:'о', p:'п', q:'қ', r:'р', s:'с',
      t:'т', u:'у', v:'в', x:'х', y:'й', z:'з'
    };
    return [...value].map((char) => letters[char] || char).join('');
  };
  return {
    latToCyr: latinToCyr,
    norm: (value) => String(value || '').toLowerCase()
      .replace(/ў/g, 'у').replace(/қ/g, 'к').replace(/ғ/g, 'г')
      .replace(/ҳ/g, 'х').replace(/й/g, 'и').replace(/ъ/g, '').replace(/ь/g, ''),
    nameScore: (_target, candidate) => candidate.testScore,
    nameParts: (value) => ({ sur: String(value).split(' ')[0] || '', giv: String(value).split(' ')[1] || '' })
  };
}

const core = fakeCore();

test('classifies close relatives in Cyrillic and Latin labels', () => {
  for (const label of ['Отаси', 'Онаси', 'Акаси', 'Опаси', 'Ўғли', 'Қизи', 'Турмуш ўртоғи', 'Қайнонаси']) {
    assert.equal(CoiEngine.relationKind(label, core), 'close', label);
  }
  for (const label of ["otasi", "onasi", "akasi", "qizi", "turmush o‘rtog‘i", "qaynonasi"]) {
    assert.equal(CoiEngine.relationKind(label, core), 'close', label);
  }
});

test('does not classify extended relatives as statutory close relatives', () => {
  for (const label of ['Амакиси', 'Аммаси', 'Тоғаси']) {
    assert.equal(CoiEngine.relationKind(label, core), 'other', label);
  }
});

test('classifies relationship categories for indirect-link analysis', () => {
  assert.equal(CoiEngine.relationshipType('Турмуш ўртоғи', core), 'spouse');
  assert.equal(CoiEngine.relationshipType('Отаси', core), 'parent');
  assert.equal(CoiEngine.relationshipType('Қайнотаси', core), 'parent');
  assert.equal(CoiEngine.relationshipType('Ўғли', core), 'child');
  assert.equal(CoiEngine.relationshipType('Қайни акаси', core), 'sibling');
  assert.equal(CoiEngine.relationshipType('Амакиси', core), 'other');
  assert.equal(CoiEngine.relationshipType('Turmush o‘rtog‘ining farzandi', core), 'child');
  assert.equal(CoiEngine.relationKind('Erining onasi', core), 'close');
  assert.equal(CoiEngine.relationKind('Erining akasi', core), 'close');
  assert.equal(CoiEngine.relationKind('Otasi singlisi', core), 'other');
  assert.equal(CoiEngine.relationKind('Turmush o‘rtog‘ining amakisi', core), 'other');
});

test('recognizes duplicate employee records as the same person', () => {
  assert.equal(
    CoiEngine.samePerson('Киёмов Абдулла Хайиталиевич', 'Киёмов Абдулла Хайиталиевич', core),
    true
  );
  assert.equal(
    CoiEngine.samePerson('Ташматов Бахром Мусурманович', 'Ташматов  Бахром Мусурманович', core),
    true
  );
});

test('does not merge same-name people when their known birth years differ', () => {
  assert.equal(
    CoiEngine.samePerson('Киёмов Абдулла Хайиталиевич', 'Киёмов Абдулла Хайиталиевич', core, 1975, 1988),
    false
  );
  assert.equal(
    CoiEngine.samePerson('Киёмов Абдулла Хайиталиевич', 'Киёмов Абдулла Хайиталиевич', core, 1975, 1976),
    true
  );
});

test('normalizes punctuation and whitespace when comparing identity', () => {
  assert.equal(
    CoiEngine.samePerson('Ташматов Бахром Мусурманович', 'Ташматов, Бахром   Мусурманович', core),
    true
  );
});

test('does not merge different or merely similar employee names', () => {
  assert.equal(
    CoiEngine.samePerson('Киёмов Абдулла Хайиталиевич', 'Киёмов Абдулла Хайитович', core),
    false
  );
  assert.equal(CoiEngine.samePerson('Абдулла Киёмов', 'Бахром Ташматов', core), false);
});

test('searches across multiple fields without requiring the same word order', () => {
  assert.equal(
    CoiEngine.matchesSearch(['Abdulla Qiyomov', 'Texnologiya kafedrasi'], 'qiyomov abdulla', core),
    true
  );
  assert.equal(
    CoiEngine.matchesSearch(['Abdulla Qiyomov', 'Texnologiya kafedrasi'], 'texnologiya qiyomov', core),
    true
  );
  assert.equal(
    CoiEngine.matchesSearch(['Abdulla Qiyomov', 'Texnologiya kafedrasi'], 'bahrom', core),
    false
  );
  assert.equal(CoiEngine.matchesSearch(['Abdulla Qiyomov'], '   ', core), true);
});

test('links an identical shared-relative name despite a two-year birth-date discrepancy', () => {
  const group = { parts: { sur: 'saidova', giv: 'qurbonoy' }, birth: 1979, links: [] };
  const target = { sur: 'saidova', giv: 'qurbonoy' };
  const result = CoiEngine.findSharedRelative(target, 1977, [group], {
    nameScore: () => 1
  });
  assert.equal(result.group, group);
  assert.equal(result.yearMismatch, true);
  assert.equal(result.yearGap, 2);
});

test('does not merge exact-name relative records with implausibly distant birth years', () => {
  const group = { parts: { sur: 'saidova', giv: 'qurbonoy' }, birth: 1979, links: [] };
  const result = CoiEngine.findSharedRelative(
    { sur: 'saidova', giv: 'qurbonoy' }, 1990, [group], { nameScore: () => 1 }
  );
  assert.equal(result.group, null);
});

test('still rejects weak fuzzy shared-relative matches with conflicting birth years', () => {
  const group = { parts: { sur: 'saidova', giv: 'qurbonoy' }, birth: 1979, links: [] };
  const result = CoiEngine.findSharedRelative(
    { sur: 'saidova', giv: 'qurbonoy' }, 1977, [group], { nameScore: () => 0.94 }
  );
  assert.equal(result.group, null);
});

test('accepts a strong shared-relative match with the same birth year without a warning', () => {
  const group = { parts: { sur: 'saidova', giv: 'qurbonoy' }, birth: 1979, links: [] };
  const result = CoiEngine.findSharedRelative(
    { sur: 'saidova', giv: 'qurbonoy' }, 1979, [group], { nameScore: () => 1 }
  );
  assert.equal(result.group, group);
  assert.equal(result.yearMismatch, false);
});

test('uses a matching birth year to break a near-equal name match', () => {
  const first = { name: 'Candidate A', by: 1980, parts: { testScore: 0.972 } };
  const second = { name: 'Candidate B', by: 1986, parts: { testScore: 0.978 } };
  const result = CoiEngine.findBestMatch({}, [first, second], { core, birthYear: 1980 });
  assert.equal(result.match[1], first);
  assert.equal(result.ambiguous, false);
});

test('marks near-equal names as ambiguous when birth year cannot distinguish them', () => {
  const first = { name: 'Candidate A', parts: { testScore: 0.972 } };
  const second = { name: 'Candidate B', parts: { testScore: 0.978 } };
  const result = CoiEngine.findBestMatch({}, [first, second], { core });
  assert.equal(result.match[1], second);
  assert.equal(result.ambiguous, true);
  assert.equal(result.alternatives.length, 1);
});

test('rejects a name match when the known birth years differ by more than one year', () => {
  const candidate = { name: 'Candidate', by: 1970, parts: { testScore: 0.99 } };
  const result = CoiEngine.findBestMatch({}, [candidate], { core, birthYear: 1985 });
  assert.equal(result.match, null);
  assert.equal(result.yearMismatch.person, candidate);
});

test('does not flag a unique high-confidence candidate as ambiguous', () => {
  const candidate = { name: 'Candidate', by: 1985, parts: { testScore: 0.99 } };
  const result = CoiEngine.findBestMatch({}, [candidate], { core, birthYear: 1985 });
  assert.equal(result.match[1], candidate);
  assert.equal(result.ambiguous, false);
});
