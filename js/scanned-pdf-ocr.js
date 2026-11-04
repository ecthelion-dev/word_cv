/*
 * Browser-side OCR fallback for scanned/image-only PDFs.
 * The PDF itself is rendered and recognized locally in the browser. Only
 * the OCR library, WebAssembly core and language models are fetched remotely.
 */
(function attachScannedPdfOcr(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScannedPdfOcr = api;
})(typeof window !== "undefined" ? window : globalThis, function createScannedPdfOcr() {
  "use strict";

  const LANGUAGES = Object.freeze(["uzb", "uzb_cyrl", "rus", "eng"]);
  const OCR_OPTIONS = Object.freeze({
    workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js",
    corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5",
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    gzip: true,
    workerBlobURL: true
  });

  function renderScale(width, height, maxSide = 3200, maxScale = 1.5) {
    const edge = Math.max(Number(width) || 0, Number(height) || 0);
    if (!edge) throw new Error("PDF sahifasining o‘lchamini aniqlab bo‘lmadi.");
    return Math.min(maxScale, maxSide / edge);
  }

  function textToBlocks(pageTexts) {
    const textParts = [];
    const blocks = [];
    for (const pageText of pageTexts || []) {
      const lines = String(pageText || "").replace(/\r/g, "").split("\n");
      for (const value of lines) {
        const line = value.replace(/[ \t]+/g, " ").trim();
        if (!line) continue;
        textParts.push(line);
        blocks.push({ type: "p", text: line });
      }
    }
    return { blocks, textParts };
  }

  async function analyze(pdfjsLib, bytes, tesseract, core, options = {}, deps = {}) {
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error("PDF.js kutubxonasi topilmadi.");
    }
    if (!tesseract || typeof tesseract.createWorker !== "function") {
      throw new Error("OCR kutubxonasi yuklanmadi. Internet aloqasini tekshiring.");
    }
    if (!core || typeof core.analyzeBlocks !== "function") {
      throw new Error("Ma’lumotnoma tahlil moduli topilmadi.");
    }

    const makeCanvas = deps.createCanvas || (() => document.createElement("canvas"));
    const onProgress = typeof options.onProgress === "function" ? options.onProgress : () => {};
    const documentTask = pdfjsLib.getDocument({
      data: bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
      disableFontFace: true,
      isEvalSupported: false
    });
    const pdf = await documentTask.promise;
    let worker = null;
    const pages = [];

    try {
      worker = await tesseract.createWorker(
        [...LANGUAGES],
        1,
        {
          ...OCR_OPTIONS,
          logger(message) {
            onProgress({
              page: pages.length + 1,
              pages: pdf.numPages,
              status: message && message.status || "",
              progress: Number(message && message.progress) || 0
            });
          }
        }
      );

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const scale = renderScale(base.width, base.height);
        const viewport = page.getViewport({ scale });
        const canvas = makeCanvas();
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);

        const context = canvas.getContext("2d", { alpha: false, willReadFrequently: true });
        if (!context) throw new Error("PDF sahifasini chizish uchun canvas yaratilmadi.");

        await page.render({ canvasContext: context, viewport }).promise;
        const recognized = await worker.recognize(canvas);
        pages.push(String(recognized && recognized.data && recognized.data.text || ""));
        onProgress({
          page: pageNumber,
          pages: pdf.numPages,
          status: "page-complete",
          progress: 1
        });

        canvas.width = 1;
        canvas.height = 1;
        if (typeof page.cleanup === "function") page.cleanup();
      }

      const text = pages.join("\n\n").trim();
      if (text.replace(/\s/g, "").length < 40) {
        throw new Error("OCR skanerlangan PDF’dan yetarli matn ajrata olmadi. Skan sifati yoki sahifa yo‘nalishini tekshiring.");
      }

      const { blocks, textParts } = textToBlocks(pages);
      const result = core.analyzeBlocks(blocks, textParts, null, options.parserOptions || {});
      if (result && result.data) result.data.ocr = true;
      if (result && Array.isArray(result.warnings)) {
        result.warnings.unshift(
          "Bu PDF skanerlangan rasm edi. Matn OCR orqali avtomatik tanildi; F.I.Sh., tug‘ilgan sana, qarindoshlik va jadval ma’lumotlarini asl hujjat bilan albatta solishtiring."
        );
      }
      return result;
    } finally {
      if (worker && typeof worker.terminate === "function") {
        try { await worker.terminate(); } catch (_) {}
      }
      if (pdf && typeof pdf.destroy === "function") {
        try { await pdf.destroy(); } catch (_) {}
      }
    }
  }

  return Object.freeze({ LANGUAGES, OCR_OPTIONS, renderScale, textToBlocks, analyze });
});
