const test = require('node:test');
const assert = require('node:assert/strict');
const ScannedPdfOcr = require('../js/scanned-pdf-ocr.js');

function makeMocks(pageTexts = ['Page one text', 'Page two text']) {
  const seenLanguages = [];
  const seenPages = [];
  let terminated = false;
  let destroyed = false;
  const tesseract = {
    async createWorker(languages, oem, options) {
      seenLanguages.push({ languages, oem, options });
      return {
        async recognize(canvas) {
          seenPages.push({ width: canvas.width, height: canvas.height });
          return { data: { text: pageTexts[seenPages.length - 1] || '' } };
        },
        async terminate() { terminated = true; }
      };
    }
  };
  const pdfjs = {
    getDocument() {
      return {
        promise: Promise.resolve({
          numPages: pageTexts.length,
          async getPage(number) {
            return {
              getViewport({ scale }) {
                return { width: 600 * scale, height: 800 * scale };
              },
              render({ canvasContext, viewport }) {
                canvasContext.rendered = true;
                return { promise: Promise.resolve(viewport) };
              },
              cleanup() {}
            };
          },
          async destroy() { destroyed = true; }
        })
      };
    }
  };
  const canvases = [];
  const createCanvas = () => {
    const canvas = {
      width: 0,
      height: 0,
      getContext() { return {}; }
    };
    canvases.push(canvas);
    return canvas;
  };
  const core = {
    analyzeBlocks(blocks, textParts) {
      return {
        data: { name: textParts[0], blocks },
        textParts,
        warnings: []
      };
    }
  };
  return { pdfjs, tesseract, core, createCanvas, seenLanguages, seenPages, canvases,
    markTerminated() { terminated = true; }, get terminated() { return terminated; }, get destroyed() { return destroyed; } };
}

test('OCR reads each scanned PDF page in order and creates parser blocks', async () => {
  const mocks = makeMocks(['Birinchi sahifa matni: Bosimova Mahliyo Dilshod qizi', 'Ikkinchi sahifa matni: yaqin qarindoshlari haqida ma’lumot']);
  const progress = [];
  const result = await ScannedPdfOcr.analyze(
    mocks.pdfjs, new Uint8Array([1, 2]), mocks.tesseract, mocks.core,
    { onProgress: value => progress.push(value) },
    { createCanvas: mocks.createCanvas }
  );
  assert.equal(result.data.ocr, true);
  assert.equal(result.textParts.join(' '), 'Birinchi sahifa matni: Bosimova Mahliyo Dilshod qizi Ikkinchi sahifa matni: yaqin qarindoshlari haqida ma’lumot');
  assert.equal(result.data.blocks.length, 2);
  assert.match(result.warnings[0], /OCR orqali avtomatik tanildi/);
  assert.equal(mocks.seenPages.length, 2);
  assert.equal(mocks.terminated, true);
  assert.equal(mocks.destroyed, true);
  assert.equal(progress.some(value => value.status === 'page-complete'), true);
});

test('OCR loads Uzbek Latin, Uzbek Cyrillic, Russian and English data', async () => {
  const mocks = makeMocks(['Namuna ma’lumotnoma matni o‘qilmoqda', 'Ikkinchi sahifada jadval ma’lumotlari mavjud']);
  await ScannedPdfOcr.analyze(
    mocks.pdfjs, new Uint8Array([1]), mocks.tesseract, mocks.core, {},
    { createCanvas: mocks.createCanvas }
  );
  assert.deepEqual(mocks.seenLanguages[0].languages, ['uzb', 'uzb_cyrl', 'rus', 'eng']);
  assert.equal(mocks.seenLanguages[0].oem, 1);
  assert.match(mocks.seenLanguages[0].options.workerPath, /tesseract\.js@5/);
});

test('caps render scale for unusually large scanned pages', () => {
  assert.equal(ScannedPdfOcr.renderScale(600, 800), 1.5);
  assert.equal(ScannedPdfOcr.renderScale(2000, 3000), 3200 / 3000);
  assert.throws(() => ScannedPdfOcr.renderScale(0, 0), /o‘lchamini aniqlab bo‘lmadi/);
});

test('converts OCR page text into non-empty paragraph blocks', () => {
  const result = ScannedPdfOcr.textToBlocks(['  Sarlavha  \n\n F.I.Sh.   xodim \n', 'Ikkinchi bet']);
  assert.deepEqual(result.textParts, ['Sarlavha', 'F.I.Sh. xodim', 'Ikkinchi bet']);
  assert.deepEqual(result.blocks.map(block => block.type), ['p', 'p', 'p']);
});

test('throws a useful error when OCR detects almost no text', async () => {
  const mocks = makeMocks(['', '   ']);
  await assert.rejects(
    ScannedPdfOcr.analyze(
      mocks.pdfjs, new Uint8Array([1]), mocks.tesseract, mocks.core, {},
      { createCanvas: mocks.createCanvas }
    ),
    /yetarli matn ajrata olmadi/
  );
  assert.equal(mocks.terminated, true);
  assert.equal(mocks.destroyed, true);
});

test('terminates OCR worker and PDF document after OCR error', async () => {
  const mocks = makeMocks();
  mocks.tesseract.createWorker = async () => ({
    async recognize() { throw new Error('synthetic OCR failure'); },
    async terminate() { mocks.markTerminated(); }
  });
  await assert.rejects(
    ScannedPdfOcr.analyze(
      mocks.pdfjs, new Uint8Array([1]), mocks.tesseract, mocks.core, {},
      { createCanvas: mocks.createCanvas }
    ),
    /synthetic OCR failure/
  );
  assert.equal(mocks.terminated, true);
  assert.equal(mocks.destroyed, true);
});
