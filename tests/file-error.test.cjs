const test = require('node:test');
const assert = require('node:assert/strict');
const FileError = require('../js/file-error.js');

test('identifies scanned PDFs and explains OCR text-layer limitation', () => {
  const result = FileError.classify(
    'MA\'LUMOTNOMA.pdf',
    'Faylni o\'qib bo\'lmadi (buzilgan yoki parolli): PDF ichida matn yo‘q (skanerlangan rasm).'
  );
  assert.equal(result.code, 'scanned-pdf');
  assert.match(result.summary, /matn qatlami topilmadi/);
  assert.match(result.action, /OCR qilingan PDF/);
});

test('identifies password-protected PDFs', () => {
  const result = FileError.classify('xodim.pdf', 'PasswordException: No password given');
  assert.equal(result.code, 'password-protected');
});

test('identifies invalid or damaged PDF files', () => {
  const result = FileError.classify('xodim.pdf', 'Invalid PDF structure');
  assert.equal(result.code, 'invalid-pdf');
});

test('identifies PDF worker initialization errors', () => {
  const result = FileError.classify('xodim.pdf', 'Setting up fake worker failed');
  assert.equal(result.code, 'pdf-worker');
});

test('identifies PDF library loading errors', () => {
  const result = FileError.classify('xodim.pdf', 'PDF.js kutubxonasini yuklab bo\'lmadi.');
  assert.equal(result.code, 'pdf-library');
});

test('preserves an unknown technical error instead of replacing it with DOCX advice', () => {
  const result = FileError.classify('xodim.pdf', 'TypeError: Cannot read properties of undefined');
  assert.equal(result.code, 'pdf-unknown');
  assert.match(result.technical, /TypeError/);
  assert.doesNotMatch(result.summary, /Word/);
});

test('shows detailed reason when the user presses Sababi', () => {
  const message = FileError.details('xodim.pdf', 'Invalid PDF structure');
  assert.match(message, /PDF tuzilmasini o‘qib bo‘lmadi/);
  assert.match(message, /Texnik sabab: Invalid PDF structure/);
});

test('strips the old generic wrapper without losing the underlying error', () => {
  assert.equal(
    FileError.rawReason('Faylni o\'qib bo\'lmadi (buzilgan yoki parolli): Worker exception: failure'),
    'Worker exception: failure'
  );
});
