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
