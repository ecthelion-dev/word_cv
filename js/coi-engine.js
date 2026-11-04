/*
 * Pure helpers for conflicts-of-interest analysis.
 * Kept separate from app.js so relationship and identity matching can be
 * unit-tested without loading the browser UI.
 */
(function attachCoiEngine(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.CoiEngine = api;
})(typeof window !== "undefined" ? window : globalThis, function createCoiEngine() {
  "use strict";

  const CLOSE_LABELS = new Set([
    "ота", "отаси", "она", "онаси",
    "ака", "акаси", "ука", "укаси", "опа", "опаси", "сингил", "синглиси",
    "угил", "угли", "киз", "кизи", "фарзанд", "фарзанди",
    "турмушуртог", "турмушуртоги", "умрйулдош", "умрйулдоши",
    "ер", "ери", "ерим", "хотин", "хотини", "рафика", "рафикаси",
    "каинота", "каинотаси", "каинона", "каинонаси", "каиногаси",
    "каиниакаси", "каиниукаси", "каиниопаси", "каинсингили"
  ]);
  const SPOUSE_RELATIVE_PREFIXES = [
    "турмушуртогининг", "умрйулдошининг", "ерининг", "эрининг",
    "хотинининг", "рафикасининг"
  ];
  const SPOUSE_RELATIVE_LABELS = new Set([
    "ота", "отаси", "она", "онаси",
    "ака", "акаси", "ука", "укаси", "опа", "опаси", "сингил", "синглиси",
    "угил", "угли", "киз", "кизи", "фарзанд", "фарзанди"
  ]);

  function canonicalText(value, core) {
    let text = String(value == null ? "" : value).trim();
    if (!text) return "";

    if (core && typeof core.latToCyr === "function") text = core.latToCyr(text);
    if (core && typeof core.norm === "function") text = core.norm(text);
    else text = text.toLowerCase().normalize("NFKC");

    return String(text).toLowerCase()
      .replace(/[‘’ʻʼ\u0060´']/g, "")
      .replace(/[‐‑‒–—-]/g, " ")
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function compactText(value, core) {
    return canonicalText(value, core).replace(/\s+/g, "");
  }

  function relationKind(value, core) {
    const compact = compactText(value, core);
    if (!compact) return "other";
    if (CLOSE_LABELS.has(compact)) return "close";

    // A spouse's parents, siblings and children are included; their extended
    // relatives (for example, the spouse's uncle) are not inferred as close.
    const prefix = SPOUSE_RELATIVE_PREFIXES.find((item) => compact.startsWith(item));
    if (!prefix) return "other";
    return SPOUSE_RELATIVE_LABELS.has(compact.slice(prefix.length)) ? "close" : "other";
  }

  function relationshipType(value, core) {
    const compact = compactText(value, core);
    if (!compact) return "other";

    // The law also includes a spouse's parents, siblings and children.
    const spouseRelativePrefixes = [
      "турмушуртогининг", "умрйулдошининг", "ерининг", "эрининг",
      "хотинининг", "рафикасининг"
    ];
    const spouseRelativePrefix = spouseRelativePrefixes.find((prefix) => compact.startsWith(prefix));
    const relation = spouseRelativePrefix ? compact.slice(spouseRelativePrefix.length) : compact;

    if (/^(?:ота|она|каинота|каинона)/.test(relation)) return "parent";
    if (/^(?:угил|угли|огли|киз|фарзанд|бола)/.test(relation)) return "child";
    if (/^(?:ака|ука|опа|сингил|сингл|каини|каинсингил)/.test(relation)) return "sibling";
    if (spouseRelativePrefix) return "other";

    if (/^(?:турмушуртог|умрйулдош|ери|ерим|ер|хотин|рафик)/.test(compact)) return "spouse";
    if (/^(?:ота|она|каинота|каинона)/.test(compact)) return "parent";
    if (/^(?:угил|угли|огли|киз|фарзанд|бола)/.test(compact)) return "child";
    if (/^(?:ака|ука|опа|сингил|сингл|каини|каинсингил)/.test(compact)) return "sibling";
    return "other";
  }

  function siblingKind(value, core) {
    const compact = compactText(value, core);
    return {
      m: /^(?:ука|ака|каиниука|каиниака|каинука|каинака)/.test(compact),
      o: /^(?:ака|опа|сингил|каиниопа|каинисингил|каинопа|каинсингил)/.test(compact)
    };
  }

  function genderFromName(value, core) {
    const compact = compactText(value, core);
    if (/(?:ович|евич|угил|угли|оглы)$/.test(compact)) return "m";
    if (/(?:овна|евна|киз|кызы)$/.test(compact)) return "f";
    return "";
  }

  function personNameKey(value, core) {
    let name = String(value == null ? "" : value).trim();
    if (!name) return "";
    if (core && typeof core.cyrToLat === "function") name = core.cyrToLat(name);
    else if (core && typeof core.latToCyr === "function") name = core.latToCyr(name);
    if (core && typeof core.norm === "function") name = core.norm(name);
    else name = name.toLowerCase().normalize("NFKC");
    return String(name).toLowerCase().replace(/[^\\p{L}\\p{N}]/gu, "");
  }

  // Exact normalized full-name identity check. Deliberately avoids fuzzy
  // matching: two similar names are not enough to assert that two records
  // belong to the same person.
  function samePerson(firstName, secondName, core) {
    const first = personNameKey(firstName, core);
    const second = personNameKey(secondName, core);
    return !!first && first === second;
  }

  /**
   * Find the most defensible roster match for a relative's name.
   * A birth-year conflict (>1 year) disqualifies a candidate when both years
   * exist. Matching birth years break close name-score ties. Near-equal names
   * without a reliable birth-year discriminator are marked ambiguous.
   */
  function findBestMatch(targetParts, candidates, options) {
    const opts = options || {};
    const core = opts.core || null;
    const minScore = Number.isFinite(opts.minScore) ? opts.minScore : 0.9;
    const ambiguityGap = Number.isFinite(opts.ambiguityGap) ? opts.ambiguityGap : 0.025;
    const targetYear = Number.isInteger(opts.birthYear) ? opts.birthYear : null;
    const scoreFn = core && typeof core.nameScore === "function" ? core.nameScore.bind(core) : null;

    if (!scoreFn || !targetParts) {
      return { match: null, ambiguous: false, yearMismatch: null, alternatives: [] };
    }

    const scored = [];
    const rejectedByYear = [];
    const seen = new Set();

    for (const person of candidates || []) {
      if (!person || seen.has(person)) continue;
      seen.add(person);
      const parts = person.parts || (core.nameParts && core.nameParts(person.name || ""));
      if (!parts) continue;

      const score = Number(scoreFn(targetParts, parts)) || 0;
      if (score < minScore) continue;

      const personYear = Number.isInteger(person.by)
        ? person.by
        : Number.isInteger(person.birthYear) ? person.birthYear : null;
      const hasBothYears = targetYear != null && personYear != null;
      const yearMatches = hasBothYears && Math.abs(targetYear - personYear) <= 1;

      if (hasBothYears && !yearMatches) {
        rejectedByYear.push({ person, score, targetYear, personYear });
        continue;
      }

      scored.push({ person, score, yearMatches, rank: score + (yearMatches ? 0.035 : 0) });
    }

    scored.sort((a, b) => b.rank - a.rank || b.score - a.score);
    if (!scored.length) {
      rejectedByYear.sort((a, b) => b.score - a.score);
      return {
        match: null,
        ambiguous: false,
        yearMismatch: rejectedByYear[0] || null,
        alternatives: []
      };
    }

    const best = scored[0];
    const alternatives = scored.slice(1).filter((candidate) =>
      best.rank - candidate.rank <= ambiguityGap
    );
    const hasUniqueBirthEvidence = best.yearMatches &&
      !alternatives.some((candidate) => candidate.yearMatches);
    const ambiguous = alternatives.length > 0 && !hasUniqueBirthEvidence;

    return {
      match: [best.score, best.person],
      ambiguous,
      yearMismatch: null,
      alternatives: alternatives.map((candidate) => ({
        score: candidate.score,
        person: candidate.person,
        yearMatches: candidate.yearMatches
      }))
    };
  }

  return Object.freeze({
    canonicalText, relationKind, relationshipType, siblingKind, genderFromName, samePerson, findBestMatch
  });
});
