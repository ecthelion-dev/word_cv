const test = require('node:test');
const assert = require('node:assert/strict');
const PdfEngine = require('../js/pdf-engine.js');

test('resolves the PDF worker under the GitHub Pages project path', () => {
  assert.equal(
    PdfEngine.workerUrl('https://ecthelion-dev.github.io/word_cv/'),
    'https://ecthelion-dev.github.io/word_cv/vendor/pdf.worker.min.js'
  );
});

test('resolves the PDF worker under a nested index.html URL', () => {
  assert.equal(
    PdfEngine.workerUrl('https://example.test/word_cv/index.html'),
    'https://example.test/word_cv/vendor/pdf.worker.min.js'
  );
});

test('resolves the PDF worker for a root deployment', () => {
  assert.equal(
    PdfEngine.workerUrl('https://example.test/'),
    'https://example.test/vendor/pdf.worker.min.js'
  );
});

test('configures the same-origin worker on PDF.js', () => {
  const pdfjs = { GlobalWorkerOptions: { workerSrc: '' } };
  const result = PdfEngine.configure(pdfjs, 'https://example.test/word_cv/');
  assert.equal(result, pdfjs);
  assert.equal(
    pdfjs.GlobalWorkerOptions.workerSrc,
    'https://example.test/word_cv/vendor/pdf.worker.min.js'
  );
});

test('fails clearly when PDF.js has no worker configuration', () => {
  assert.throws(
    () => PdfEngine.configure({}, 'https://example.test/'),
    /worker sozlamasi topilmadi/
  );
});

test('fails clearly when the base URL is unavailable', () => {
  assert.throws(() => PdfEngine.workerUrl(''), /PDF manzilini aniqlab bo‘lmadi/);
});
