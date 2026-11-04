/*
 * User-facing file parsing errors. Preserve the actual parser reason instead
 * of replacing every failure with an unrelated "save as DOCX" instruction.
 */
(function attachFileError(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FileError = api;
})(typeof window !== "undefined" ? window : globalThis, function createFileError() {
  "use strict";

  const WRAPPER = /^Faylni o['‘]qib bo['‘]lmadi(?:\s*\([^)]*\))?\s*:\s*/i;

  function rawReason(value) {
    return String(value == null ? "" : value).trim().replace(WRAPPER, "").trim();
  }

  function classify(fileName, value) {
    const reason = rawReason(value);
    const file = String(fileName || "");
    const isPdf = /\.pdf$/i.test(file) || /pdf/i.test(reason);

    if (/PDF ichida matn yo['‘]q|no text layer|text layer.*not found/i.test(reason)) {
      return {
        code: "scanned-pdf",
        summary: "PDF ichida o‘qiladigan matn qatlami topilmadi — ehtimol skanerlangan rasm.",
        action: "Hozirgi parser rasm ichidagi matnni OCR qilmaydi. OCR qilingan PDF yoki Word (.docx) nusxasini yuboring.",
        technical: reason
      };
    }

    if (/PasswordException|password required|incorrect password|No password given|parol bilan himoyalangan/i.test(reason)) {
      return {
        code: "password-protected",
        summary: "PDF parol bilan himoyalangan.",
        action: "PDF egasidan parolsiz nusxa oling yoki parol himoyasini ruxsat bilan olib tashlang.",
        technical: reason
      };
    }

    if (/Invalid PDF|InvalidPDF|PDF structure|Unexpected server response|No PDF header|bad XRef|Invalid XRef|FormatError/i.test(reason)) {
      return {
        code: "invalid-pdf",
        summary: "PDF tuzilmasini o‘qib bo‘lmadi.",
        action: "Faylni PDF sifatida qayta eksport qiling. Kengaytmasini .pdf deb o‘zgartirishning o‘zi yetarli emas.",
        technical: reason
      };
    }

    if (/workerSrc|WorkerMessageHandler|Setting up fake worker|worker.*(failed|error)|importScripts|Failed to fetch/i.test(reason)) {
      return {
        code: "pdf-worker",
        summary: "PDF o‘qish moduli (Worker) ishga tushmadi.",
        action: "Sahifani yangilang. Xato takrorlansa, texnik sababni administratorga yuboring.",
        technical: reason
      };
    }

    if (/PDF\.js kutubxonasini yuklab bo['‘]lmadi|pdf\.js topilmadi/i.test(reason)) {
      return {
        code: "pdf-library",
        summary: "PDF o‘qish kutubxonasi yuklanmadi.",
        action: "Internet aloqasini tekshirib, sahifani qayta yuklang.",
        technical: reason
      };
    }

    return {
      code: isPdf ? "pdf-unknown" : "file-unknown",
      summary: isPdf ? "PDF faylni o‘qishda xatolik yuz berdi." : "Faylni o‘qishda xatolik yuz berdi.",
      action: "Asl faylni qayta yuklab ko‘ring. Xato takrorlansa, quyidagi texnik sababni yuboring.",
      technical: reason || "Parser aniq xato matnini qaytarmadi."
    };
  }

  function summary(fileName, reason) {
    return classify(fileName, reason).summary;
  }

  function details(fileName, reason) {
    const result = classify(fileName, reason);
    return [
      result.summary,
      result.action,
      result.technical ? "Texnik sabab: " + result.technical : ""
    ].filter(Boolean).join("\n");
  }

  return Object.freeze({ rawReason, classify, summary, details });
});
