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

  function departmentKey(value, core) {
    let text = String(value == null ? "" : value).trim();
    if (core && typeof core.cyrToLat === "function") text = core.cyrToLat(text);
    return normalize(text, core).replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
  }

  /**
   * Department performance is measured by the share of professor-teachers
   * with a recognized scientific degree (DSc, PhD or candidate).
   * Academic titles are reported separately and do not increase the score.
   * External part-time staff are excluded; records without a department are
   * counted separately instead of being assigned to a guessed department.
   */
  function departmentRanking(rows, core, minSample) {
    const threshold = Number.isInteger(minSample) && minSample > 0 ? minSample : 5;
    const groups = new Map();
    let unassigned = 0;
    let total = 0;

    for (const row of rows || []) {
      if (!row || row.grp !== "ped" || row.ext) continue;
      total += 1;
      const displayName = String(row.dept || "").trim().replace(/\s+/g, " ");
      const key = departmentKey(displayName, core);
      if (!key) {
        unassigned += 1;
        continue;
      }

      let group = groups.get(key);
      if (!group) {
        group = {
          key,
          department: displayName,
          staff: 0,
          degreeHolders: 0,
          dsc: 0,
          phd: 0,
          candidate: 0,
          professors: 0,
          docents: 0,
          otherDegree: 0,
          review: 0,
          sourceConflicts: 0
        };
        groups.set(key, group);
      }

      group.staff += 1;
      if (row.dk === "dsc") {
        group.dsc += 1;
        group.degreeHolders += 1;
      } else if (row.dk === "phd") {
        group.phd += 1;
        group.degreeHolders += 1;
      } else if (row.dk === "nomzod") {
        group.candidate += 1;
        group.degreeHolders += 1;
      } else if (row.dk === "oth") {
        group.otherDegree += 1;
      }

      if (row.tk === "prof") group.professors += 1;
      if (row.tk === "dots") group.docents += 1;

      const flags = quality(row);
      if (flags.needsReview) group.review += 1;
      if (flags.sourceConflict) group.sourceConflicts += 1;
    }

    const departments = [...groups.values()];
    for (const group of departments) {
      group.degreeRate = group.staff
        ? Math.round((group.degreeHolders / group.staff) * 1000) / 10
        : 0;
      group.smallSample = group.staff < threshold;
    }

    departments.sort((a, b) =>
      (b.degreeHolders / b.staff) - (a.degreeHolders / a.staff) ||
      b.staff - a.staff ||
      a.department.localeCompare(b.department)
    );

    let previous = null;
    let currentRank = 0;
    departments.forEach((group, index) => {
      if (!previous ||
          group.degreeHolders * previous.staff !== previous.degreeHolders * group.staff) {
        currentRank = index + 1;
      }
      group.rank = currentRank;
      previous = group;
    });

    return {
      total,
      assigned: total - unassigned,
      unassigned,
      departmentCount: departments.length,
      ratedDepartmentCount: departments.filter(group => !group.smallSample).length,
      minSample: threshold,
      degreeHolders: departments.reduce((sum, group) => sum + group.degreeHolders, 0),
      departments
    };
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

  return Object.freeze({ normalize, tokens, matches, sourceConflict, quality, departmentKey, departmentRanking });
});
