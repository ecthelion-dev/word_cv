/*
 * PDF.js runtime configuration.
 * Resolve the worker relative to the deployed application URL so the same
 * code works at the domain root and under GitHub Pages project paths.
 */
(function attachPdfEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.PdfEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function createPdfEngine() {
  "use strict";

  function workerUrl(baseUri) {
    if (!baseUri) throw new Error("PDF manzilini aniqlab bo‘lmadi.");
    return new URL("vendor/pdf.worker.min.js", baseUri).href;
  }

  function configure(pdfjsLib, baseUri) {
    if (!pdfjsLib || !pdfjsLib.GlobalWorkerOptions) {
      throw new Error("PDF.js yuklandi, ammo worker sozlamasi topilmadi.");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl(baseUri);
    return pdfjsLib;
  }

  return Object.freeze({ workerUrl, configure });
});
