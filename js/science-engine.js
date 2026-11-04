/*
 * Pure search and data-source consistency helpers for the scientific-capacity
 * dashboard. No browser APIs are required, so these rules can be unit-tested.
 */
(function attachScienceEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.ScienceEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function createScienceEngine() {
  "use strict";

  function normalize(value, core) {
    const text = String(value == null ? "" : value);
    if (core && typeof core.norm === "function") return String(core.norm(text)).toLowerCase();
    return text.normalize("NFKC").toLowerCase()
      .replace(/[‘’ʻʼ\u0060´']/g, "")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function tokens(query, core) {
    return String(query == null ? "" : query).trim().split(/\s+/)
      .map((token) => normalize(token, core)).filter(Boolean);
  }

  // Every query word must occur somewhere in the combined searchable fields.
  // This makes "Abdulla Qiyomov" and "Qiyomov Abdulla" equivalent.
  function matches(fields, query, core) {
    const words = tokens(query, core);
    if (!words.length) return true;
    const values = Array.isArray(fields) ? fields : [fields];
    const haystack = normalize(values.filter((value) => value != null).join(" "), core);
    return words.every((word) => haystack.includes(word));
  }

  /**
   * Detect disagreement only when both sources contain meaningful values.
   * Equivalent classifications (e.g. "PhD" and "Falsafa doktori") are not
   * treated as conflicts. Unclassified raw strings are compared after
   * normalization so a genuinely different text is surfaced for review.
   */
  function sourceConflict(documentValue, excelValue, classify, isEmpty, core) {
    if (typeof isEmpty === "function" &&
        (isEmpty(documentValue) || isEmpty(excelValue))) return false;

    const first = typeof classify === "function" ? classify(documentValue) : null;
    const second = typeof classify === "function" ? classify(excelValue) : null;
    if (first !== second) return true;
    if (first === "oth" || first == null) {
      return normalize(documentValue, core) !== normalize(excelValue, core);
    }
    return false;
  }

  function quality(row) {
    const issues = Array.isArray(row && row.issues) ? row.issues : [];
    const unknownDegree = !!row && !!row.deg && row.dk === "oth";
    const unknownTitle = !!row && !!row.tit && row.tk === "oth";
    const sourceConflict = issues.length > 0;
    return {
      unknownDegree,
      unknownTitle,
      sourceConflict,
      needsReview: unknownDegree || unknownTitle || sourceConflict
    };
  }

  return Object.freeze({ normalize, tokens, matches, sourceConflict, quality });
});
