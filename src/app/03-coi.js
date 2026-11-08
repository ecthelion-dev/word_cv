/**
 * 03-coi.js — Manfaatlar toʻqnashuvi (OʻRQ-931 va MK 121-modda) tahlili va xavf darajalarini baholash
 */
const ORG_END =
    /^(?:институти|университети|академияси|филиали|консерваторияси|маркази|бошқармаси|ҳокимлиги|вазирлиги|instituti|universiteti|akademiyasi|filiali|konservatoriyasi|markazi|boshqarmasi|hokimligi|vazirligi)[,.]?$/i,
  UNIT_END =
    /^(?:кафедраси|бўлими|бўлинмаси|факультети|деканати|сектори|лабораторияси|бошқармаси|маркази|kafedrasi|bo‘limi|bo'limi|bo‘linmasi|fakulteti|dekanati|sektori|laboratoriyasi|boshqarmasi|markazi)[,.]?$/i;
function orgOf(e) {
  const t = String(e || "")
      .replace(/[«»“”"]/g, "")
      .split(/\s+/)
      .filter(Boolean),
    a = t.findIndex((e) => ORG_END.test(e));
  return a >= 1 ? t.slice(0, a + 1).join(" ") : "";
}
function unitOf(e) {
  const t = String(e || "")
      .replace(/[«»“”"]/g, "")
      .split(/\s+/)
      .filter(Boolean),
    a = t.findIndex((e) => ORG_END.test(e));
  let n = -1;
  if (
    (t.forEach((e, t) => {
      t > a && UNIT_END.test(e) && (n = t);
    }),
    n < 0)
  )
    return "";
  let i = n - 1;
  for (
    ;
    i > a + 1 &&
    n - i < 4 &&
    !/^(?:ва|va)$/i.test(t[i - 1] || "") &&
    !UNIT_END.test(t[i - 1] || "");
  )
    i--;
  return (
    /^(?:ва|va)$/i.test(t[i - 1] || "") && i - 2 > a && (i -= 2),
    t.slice(Math.max(a + 1, i), n + 1).join(" ")
  );
}
function orgKeys(e) {
  const t = e
    .split(/\s+/)
    .map((e) => SpravkaCore.norm(e))
    .filter(Boolean);
  if (!t.length) return [];
  const a = t.map((e) => e[0]).join(""),
    n = new Set([t.join("")]);
  return (
    a.length >= 3 && (n.add(a), n.add(t[0].slice(0, 3) + a.slice(1))),
    t.length >= 3 && n.add(t.slice(0, -1).join("")),
    [...n]
  );
}
function textHasOrg(e, t) {
  const a = SpravkaCore.norm(e || ""),
    n = String(e || "")
      .split(/[\s,.;:()«»“”"-]+/)
      .map((e) => SpravkaCore.norm(e))
      .filter(Boolean);
  return t.some((e) =>
    e.length >= 10
      ? a.includes(e)
      : n.some((t) => t === e || (t.startsWith(e) && t.length <= e.length + 3)),
  );
}
var coiRows = [],
  coiReg = {},
  coiLvl = "all",
  coiOpen = !1,
  coiOrg = "",
  coiSkipped = 0;
function relKind(e) {
  return CoiEngine.relationKind(e, SpravkaCore);
}
const COI_ORGHEAD =
    /(?<![А-Яа-яЁёЎўҚқҒғҲҳA-Za-z])(?:ректор|rektor|директор|direktor)/i,
  COI_DEP =
    /проректор|prorektor|ўринбосар|уринбосар|o‘rinbosar|o'rinbosar|orinbosar/i,
  COI_UHEAD =
    /мудир|бошлиғ|бошлиг|декан|раҳбар|рахбар|бошқарувчи|бошкарувчи|mudir|boshlig|dekan|rahbar|boshqaruvchi/i,
  UNIT_STEM =
    /^(кафедра|булинма|булим|факултет|деканат|сектор|лаборатор|бошкарма|марказ|kafedra|bolinma|bolim|fakultet|dekanat|sektor|laborator|boshqarma|markaz)/;
function unitKey(e) {
  const t = String(e || "")
      .replace(/[«»“”"()]/g, " ")
      .split(/[\s,;]+/)
      .filter(Boolean),
    a = t.map((e) => SpravkaCore.norm(SpravkaCore.latToCyr(e)));
  let n = -1;
  if (
    (a.forEach((e, a) => {
      const i = SpravkaCore.norm(t[a]);
      (UNIT_STEM.test(e) || UNIT_STEM.test(i)) && (n = a);
    }),
    n < 0)
  )
    return "";
  const i = (UNIT_STEM.exec(a[n]) ||
      UNIT_STEM.exec(SpravkaCore.norm(t[n])))[1].slice(0, 5),
    o = [];
  for (let e = n - 1; e >= 0 && o.length < 3; e--) {
    const n = t[e].replace(/[,.]$/, "");
    if (
      ORG_END.test(n) ||
      /^(?:ва|va|да|da|ning|нинг)$/i.test(n) ||
      (n.length > 1 && n === n.toUpperCase() && /\p{L}/u.test(n)) ||
      (/(?:да|da)$/i.test(n) &&
        /(?:институти|университети|institut|universitet)/i.test(n))
    )
      break;
    o.unshift(a[e]);
  }
  return o.length
    ? o.join("") + "|" + SpravkaCore.norm(SpravkaCore.latToCyr(i)).slice(0, 4)
    : "";
}
const byOf = (e) => {
  const t = String(e || "").match(/(?:^|\D)(19\d\d|20\d\d)(?:\D|$)/);
  return t ? +t[1] : null;
};
function coiKey(e, t) {
  return (
    SpravkaCore.norm(SpravkaCore.cyrToLat(e)) +
    "|" +
    SpravkaCore.norm(SpravkaCore.cyrToLat(t))
  );
}
const COI_ST = {
  new: "Ko‘rib chiqilmagan",
  notified: "Xabarnoma topshirildi",
  measures: "Chora ko‘rildi",
  not: "To‘qnashuv emas",
};
async function runCoi() {
  (($("coiRun").disabled = !0),
    ($("coiMsg").className = "msg"),
    ($("coiMsg").textContent = "Tekshirilmoqda…"));
  try {
    await runCoiInner();
  } finally {
    $("coiRun").disabled = !1;
  }
}
async function runCoiInner() {
  coiRan = !0;
  const e = !(
    !(xl.rows && xl.rows.length && xl.map) ||
    (void 0 === xl.map.name && void 0 === xl.map.surname)
  );
  if (e)
    try {
      ensureCompared();
    } catch (e) {}
  const t = items.filter((e) => e.P && !e.excluded && (e.P.name || "").trim()),
    a = e
      ? t.filter(
          (e) =>
            null != e.xlRow &&
            xl.rows[e.xlRow] &&
            !("function" == typeof isGone && isGone(e)),
        )
      : t;
  coiSkipped = t.length - a.length;
  const n = new Map();
  for (const e of a) {
    const t = orgOf(e.P.position);
    if (t) {
      const e = SpravkaCore.norm(t);
      n.set(e, [(n.get(e) || [0])[0] + 1, t]);
    }
  }
  const i = [...n.values()].sort((e, t) => t[0] - e[0])[0],
    o = (e, t) =>
      xl.map && void 0 !== xl.map[t]
        ? String(e[xl.map[t]] || "")
            .trim()
            .replace(/\s+/g, " ")
        : "",
    l = a.map((e) => ({
      name: e.P.name,
      parts: SpravkaCore.nameParts(e.P.name),
      pos: e.P.position || "",
      unit: unitKey(e.P.position),
      by: byOf(e.P.fields.birth_date),
      it: e,
    })),
    s = new Map(l.map((e) => [e.parts.sur + "|" + e.parts.giv, e]));
  for (const [e, t] of (xl.rows || []).entries()) {
    const a = rowName(t);
    if (!a) continue;
    const n = SpravkaCore.nameParts(a),
      i = [o(t, "org"), o(t, "dept"), o(t, "position")]
        .filter(Boolean)
        .join(" "),
      r = s.get(n.sur + "|" + n.giv);
    r
      ? (null == r.row && ((r.row = e), (r.hire = o(t, "since_date"))),
        r.unit || (r.unit = unitKey(o(t, "dept") + " " + o(t, "position"))),
        r.by || (r.by = byOf(o(t, "birth_date"))),
        r.pos || (r.pos = i))
      : l.push({
          name: a,
          parts: n,
          pos: i,
          unit: unitKey(o(t, "dept") + " " + o(t, "position")) || unitKey(i),
          by: byOf(o(t, "birth_date")),
          excel: !0,
          row: e,
          hire: o(t, "since_date"),
        });
  }
  const r = new Map(),
    d = (e, t) => {
      e && (r.has(e) || r.set(e, new Set()), r.get(e).add(t));
    };
  for (const e of l)
    (d((e.parts.sur || "")[0], e), d((e.parts.giv || "")[0], e));
  const c = [],
    p = new Set(),
    links = new Map(),
    relIdx = new Map(),
    addShared = (t2, a2) => {
      const rp = SpravkaCore.nameParts(a2.name),
        bk =
          (SpravkaCore.norm(rp.sur)[0] || "") +
          (SpravkaCore.norm(rp.giv)[0] || ""),
        rBy = byOf(a2.birth),
        arr = relIdx.get(bk) || [],
        matched = CoiEngine.findSharedRelative(rp, rBy, arr, SpravkaCore);
      let rc = matched.group;
      (rc ||
        ((rc = { birth: rBy, parts: rp, links: [] }),
        arr.push(rc),
        relIdx.set(bk, arr)),
        null == rc.birth && (rc.birth = rBy),
        rc.links.push({
          by: t2,
          rel: a2.rel,
          relName: a2.name,
          birth: a2.birth || "",
          work: a2.work || "",
        }));
    };
  let m = 0;
  for (const t of a) {
    ++m % 40 == 0 &&
      (($("coiMsg").textContent = `Tekshirilmoqda… ${m} / ${a.length}`),
      await new Promise((e) => setTimeout(e, 0)));
    const n = t.P,
      o = orgOf(n.position) || (i ? i[1] : ""),
      l = o ? orgKeys(o) : [],
      s = SpravkaCore.nameParts(n.name),
      d = unitKey(n.position);
    for (const a of n.relatives || []) {
      if (!a.name || /вафот|vafot/i.test(a.work || "")) continue;
      const i = SpravkaCore.nameParts(a.name);
      "close" === relKind(a.rel) && addShared(t, a);
      const u = new Set([
          ...(r.get((i.sur || "")[0]) || []),
          ...(r.get((i.giv || "")[0]) || []),
        ]),
        f = byOf(a.birth);
      for (const candidate of [...u])
        if (
          candidate.it === t ||
          SpravkaCore.nameScore(s, candidate.parts) >= 0.97
        )
          u.delete(candidate);
      const matchResult = CoiEngine.findBestMatch(i, u, {
          core: SpravkaCore,
          birthYear: f,
        }),
        m = matchResult.match,
        matchAmbiguous = matchResult.ambiguous,
        g = m
          ? m[1].by
          : matchResult.yearMismatch && matchResult.yearMismatch.person.by,
        y = !!matchResult.yearMismatch,
        h = l.length && textHasOrg(a.work, l);
      if (!h && !m) continue;
      if (e && !m) continue;
      if (y && !h) continue;
      const k = relKind(a.rel),
        x = m && !y && !matchAmbiguous ? m[1].pos : "",
        b = [a.work, x].filter(Boolean).join(" "),
        v = (m && !y && !matchAmbiguous && m[1].unit) || unitKey(a.work),
        w = {
          close: "close" === k,
          ident: matchAmbiguous
            ? "ambiguous"
            : h
              ? "own"
              : m[0] >= 0.97 && f && g
                ? "confirmed"
                : m[0] >= 0.97
                  ? "name"
                  : "fuzzy",
          orgSrc: h ? "text" : "list",
          listed: !(!m || y || matchAmbiguous),
          sameUnit: d && v ? d === v : null,
          empOrgHead:
            COI_ORGHEAD.test(n.position || "") &&
            !COI_DEP.test(n.position || ""),
          relOrgHead: COI_ORGHEAD.test(b) && !COI_DEP.test(b),
          empHead:
            COI_UHEAD.test(n.position || "") && !COI_DEP.test(n.position || ""),
          relHead: COI_UHEAD.test(b) && !COI_DEP.test(b),
          empDep: COI_DEP.test(n.position || ""),
          relDep: COI_DEP.test(b),
        },
        $ = [
          h
            ? "ish joyi (ma’lumotnomada): «" + String(a.work).slice(0, 90) + "»"
            : "",
          matchAmbiguous
            ? matchResult.alternatives.length +
              1 +
              " ta o‘xshash xodim topildi — aniq shaxs tasdiqlanmadi"
            : "",
          m && !y
            ? (m[1].excel ? "Excel'da" : "ma'lumotnomasi bor") +
              ": " +
              m[1].name +
              (m[1].pos ? " — " + m[1].pos.slice(0, 80) : "")
            : "",
          y
            ? "ro‘yxatdagi adashi bilan tug‘ilgan yili farq qiladi (" +
              f +
              " / " +
              g +
              ") — hisobga olinmadi"
            : "",
        ]
          .filter(Boolean)
          .join("; "),
        S = coiKey(n.name, a.name);
      if (p.has(S)) continue;
      p.add(S);
      const q = m && !y && !matchAmbiguous ? m[1] : null;
      (c.push({
        key: S,
        it: t,
        emp: n.name,
        empPos: n.position || "",
        rel: n.S.relations[a.rel] || a.rel,
        kind: k,
        relName: a.name,
        relBirth: a.birth || "",
        relWork: a.work || "",
        relPos: x,
        F: w,
        evid: $,
        other: q && q.it,
        relIdx: (n.relatives || []).indexOf(a),
        relRow: q && null != q.row ? q.row : null,
        relHire: (q && q.hire) || "",
        org: o,
      }),
        "close" === k &&
          m &&
          !y &&
          !matchAmbiguous &&
          m[1].it &&
          m[1].it !== t &&
          (links.has(m[1]) || links.set(m[1], []),
          links.get(m[1]).push({ by: t, rel: a.rel, relName: a.name })));
    }
  }
  const coiType = (e) => CoiEngine.relationshipType(e, SpravkaCore),
    coiSib = (e) => CoiEngine.siblingKind(e, SpravkaCore),
    coiGen = (e) => CoiEngine.genderFromName(e, SpravkaCore),
    coiPair = (L1, L2) => {
      const t1 = coiType(L1.rel),
        t2 = coiType(L2.rel);
      if ("other" === t1 || "other" === t2) return [];
      const out = [],
        P2 = (f2, t3, l2, c2) =>
          out.push({ from: f2, to: t3, label: l2, close: c2 }),
        k2 = [t1, t2].sort().join("|");
      if ("sibling|spouse" === k2) {
        const spS = "spouse" === t1 ? L1 : L2,
          sbS = "spouse" === t1 ? L2 : L1,
          sb = coiSib(sbS.rel),
          bG = coiGen(sbS.by.P.name),
          aG = coiGen(spS.by.P.name);
        P2(
          spS,
          sbS,
          (bG === "f"
            ? sb.o
              ? "Қайнсингили"
              : "Қайни опаси"
            : sb.o
              ? "Қайни укаси"
              : "Қайни акаси") + " (bilvosita)",
          !0,
        );
        P2(
          sbS,
          spS,
          !sb.m && aG === "m"
            ? "Божаси (bilvosita)"
            : sb.m && aG === "f"
              ? "Келиной (bilvosita)"
              : "Ака-ука/опа-сингилнинг турмуш ўртоғи (bilvosita)",
          !1,
        );
      } else if ("child|spouse" === k2) {
        const chS = "child" === t1 ? L1 : L2,
          spS = "child" === t1 ? L2 : L1,
          pG = coiGen(chS.by.P.name);
        P2(
          spS,
          chS,
          (pG === "f" ? "Қайнонаси" : "Қайнотаси") + " (bilvosita)",
          !0,
        );
        P2(chS, spS, "Фарзандининг турмуш ўртоғи (bilvosita)", !1);
      } else if ("parent|spouse" === k2) {
        const paS = "parent" === t1 ? L1 : L2,
          spS = "parent" === t1 ? L2 : L1;
        P2(spS, paS, "Турмуш ўртоғининг фарзанди (bilvosita)", !1);
        P2(paS, spS, "Ота-онасининг турмуш ўртоғи (bilvosita)", !1);
      } else if ("parent|sibling" === k2) {
        const paS = "parent" === t1 ? L1 : L2,
          sbS = "parent" === t1 ? L2 : L1;
        P2(paS, sbS, "Амаки/тоға/хола (bilvosita)", !1);
        P2(sbS, paS, "Жияни (bilvosita)", !1);
      } else if ("child|sibling" === k2) {
        const chS = "child" === t1 ? L1 : L2,
          sbS = "child" === t1 ? L2 : L1,
          pG = coiGen(chS.by.P.name);
        P2(sbS, chS, (pG === "f" ? "Онаси" : "Отаси") + " (bilvosita)", !0);
        P2(chS, sbS, "Фарзанди (bilvosita)", !0);
      } else if ("sibling|sibling" === k2) {
        P2(L1, L2, "Ака-ука/опа-сингил (bilvosita)", !0);
        P2(L2, L1, "Ака-ука/опа-сингил (bilvosita)", !0);
      } else if ("parent|parent" === k2) {
        P2(L1, L2, "Турмуш ўртоғи (umumiy фарзанд — bilvosita)", !0);
        P2(L2, L1, "Турмуш ўртоғи (umumiy фарзанд — bilvosita)", !0);
      } else if ("child|child" === k2) {
        P2(L1, L2, "Ака-ука/опа-сингил (umumiy ota-ona — bilvosita)", !0);
        P2(L2, L1, "Ака-ука/опа-сингил (umumiy ota-ona — bilvosita)", !0);
      } else if ("child|parent" === k2) {
        const paS = "parent" === t1 ? L1 : L2,
          chS = "parent" === t1 ? L2 : L1,
          gp = coiGen(chS.by.P.name);
        P2(paS, chS, (gp === "f" ? "Бувиси" : "Буваси") + " (bilvosita)", !1);
        P2(chS, paS, "Набираси (bilvosita)", !1);
      } else if ("spouse|spouse" === k2) {
        P2(L1, L2, "Бир шахс икки ходимга «турмуш ўртоғи» — tekshiring", !1);
        P2(L2, L1, "Бир шахс икки ходимга «турмуш ўртоғи» — tekshiring", !1);
      }
      return out;
    };
  const sameEmployee = (first, second) =>
      !!(
        first &&
        second &&
        CoiEngine.samePerson(
          first.P && first.P.name,
          second.P && second.P.name,
          SpravkaCore,
          byOf(first.P && first.P.fields && first.P.fields.birth_date),
          byOf(second.P && second.P.fields && second.P.fields.birth_date),
        )
      ),
    seenI = new Set(),
    shared = [];
  for (const [, arr] of relIdx)
    for (const g of arr)
      if (new Set(g.links.map((l) => l.by)).size > 1)
        shared.push({ links: g.links, relName: g.links[0].relName });
  for (const [emp, ls] of links) shared.push({ links: ls, relName: emp.name });
  for (const grp of shared) {
    const ls = grp.links;
    for (let i1 = 0; i1 < ls.length; i1++)
      for (let j1 = i1 + 1; j1 < ls.length; j1++) {
        const L1 = ls[i1],
          L2 = ls[j1];
        if (L1.by === L2.by || sameEmployee(L1.by, L2.by)) continue;
        for (const ir of coiPair(L1, L2)) {
          const A1 = ir.from,
            B1 = ir.to;
          if (!A1 || !B1 || A1.by === B1.by || sameEmployee(A1.by, B1.by))
            continue;
          const kk = "bilvosita|" + coiKey(A1.by.P.name, B1.by.P.name);
          if (
            seenI.has(kk) ||
            c.some(
              (e2) =>
                e2.it === A1.by &&
                SpravkaCore.nameScore(
                  SpravkaCore.nameParts(e2.relName),
                  SpravkaCore.nameParts(B1.by.P.name),
                ) >= 0.97,
            )
          )
            continue;
          seenI.add(kk);
          const aPos = A1.by.P.position || "",
            bPos = B1.by.P.position || "",
            uA = unitKey(aPos),
            uB = unitKey(bPos),
            sharedBirthA = byOf(L1.birth),
            sharedBirthB = byOf(L2.birth),
            sharedYearGap =
              null != sharedBirthA && null != sharedBirthB
                ? Math.abs(sharedBirthA - sharedBirthB)
                : null,
            sharedYearMismatch = null != sharedYearGap && sharedYearGap > 1;
          c.push({
            key: kk,
            it: A1.by,
            emp: A1.by.P.name,
            empPos: aPos,
            rel: ir.label,
            kind: ir.close ? "close" : "other",
            relName: B1.by.P.name,
            relBirth: (B1.by.P.fields || {}).birth_date || "",
            relWork: bPos,
            relPos: bPos,
            F: {
              close: ir.close,
              ident: "shared",
              sharedYearMismatch,
              sharedYearGap,
              orgSrc: "list",
              listed: !0,
              sameUnit: uA && uB ? uA === uB : null,
              empOrgHead: COI_ORGHEAD.test(aPos) && !COI_DEP.test(aPos),
              relOrgHead: COI_ORGHEAD.test(bPos) && !COI_DEP.test(bPos),
              empHead: COI_UHEAD.test(aPos) && !COI_DEP.test(aPos),
              relHead: COI_UHEAD.test(bPos) && !COI_DEP.test(bPos),
              empDep: COI_DEP.test(aPos),
              relDep: COI_DEP.test(bPos),
            },
            evid: `bilvosita: «${grp.relName}» — ${A1.by.P.name} учун «${A1.rel}», ${B1.by.P.name} учун «${B1.rel}»${sharedYearMismatch ? "; umumiy shaxsning tug‘ilgan yillari " + sharedBirthA + " va " + sharedBirthB + " (farq " + sharedYearGap + " yil) — aniqlashtirish kerak" : ""}`,
            other: B1.by,
            relIdx: -1,
            relRow: null,
            relHire: "",
            org: orgOf(aPos) || orgOf(bPos) || "",
          });
        }
      }
  }
  for (const e of c)
    e.other &&
      c.some(
        (t) =>
          t.it === e.other &&
          SpravkaCore.nameScore(
            SpravkaCore.nameParts(t.relName),
            SpravkaCore.nameParts(e.emp),
          ) >= 0.9,
      ) &&
      (e.evid += "; ikkala ma’lumotnomada ham ko‘rsatilgan");
  ((coiRows = c),
    (coiOrg = (i && i[1]) || ""),
    coiSort(),
    renderCoi(a.length, i));
}
const PED_RE =
    /o['‘’`ʻ]qituvchi|ўқитувчи|dotsent|доцент|professor|профессор|assistent|ассистент|stajyor|стажёр|pedagog|педагог|kutubxona|кутубхона|bibliograf|библиограф|tarbiyachi|тарбиячи|murabbiy|мураббий|kafedra|кафедра/i,
  COI_K = {
    actual: { n: 4, l: "Mavjud to‘qnashuv", c: "r3" },
    clarify: { n: 3, l: "Aniqlashtirish kerak", c: "rq" },
    potential: { n: 2, l: "Ehtimoliy", c: "r2" },
    info: { n: 1, l: "Ma'lumot uchun", c: "r1" },
    none: { n: 0, l: "To‘qnashuv yo‘q", c: "r0" },
  };
function coiEval(e) {
  const t = e.F,
    a = (coiReg[e.key] || {}).f || {},
    n = [],
    i = [],
    o = [];
  if (!t.close)
    return (
      n.push({
        ok: !1,
        t: `«${e.rel}» — 3-moddadagi yaqin qarindoshlar ro‘yxatiga kirmaydi`,
      }),
      {
        k: "info",
        why: "Yaqin qarindosh emas: Qonun talablari bu munosabatga tatbiq etilmaydi.",
        facts: n,
        arts: [
          {
            a: "3-modda",
            t: "yaqin qarindoshlar ro‘yxati — bu qarindoshlik unga kirmaydi",
          },
        ],
        need: o,
        reasons: [],
      }
    );
  if (
    (n.push({ ok: !0, t: `«${e.rel}» — yaqin qarindosh (3-modda)` }),
    i.push({
      a: "3-modda",
      t: `«${e.rel}» yaqin qarindoshlar qatoriga kiradi`,
    }),
    "no" === a.same)
  )
    return (
      n.push({ ok: !1, t: "Boshqa shaxs — mas’ul xodim belgiladi" }),
      {
        k: "none",
        why: "Ro‘yxatdagi xodim bu qarindosh emas — to‘qnashuv yo‘q.",
        facts: n,
        arts: [],
        need: o,
        reasons: [],
      }
    );
  if ("no" === a.works)
    return (
      n.push({
        ok: !1,
        t: "Qarindoshi bu tashkilotda ishlamaydi — mas’ul xodim belgiladi",
      }),
      {
        k: "none",
        why: "Qarindoshi hozir tashkilotda ishlamaydi — to‘qnashuv yo‘q.",
        facts: n,
        arts: [],
        need: o,
        reasons: [],
      }
    );
  const l =
    "own" === t.ident ||
    "confirmed" === t.ident ||
    ("shared" === t.ident && !t.sharedYearMismatch) ||
    "yes" === a.same;
  (n.push({
    ok: !!l || null,
    t:
      "ambiguous" === t.ident
        ? "Bir nechta o‘xshash xodim topildi; aniq shaxs hali tasdiqlanmagan"
        : "own" === t.ident
          ? "Qarindosh xodimning o‘z ma’lumotnomasida ko‘rsatilgan"
          : "confirmed" === t.ident
            ? "Ism va tug‘ilgan yili xodimlar ro‘yxatidagi bilan mos"
            : "yes" === a.same
              ? "Bir shaxs ekani tasdiqlandi"
              : "shared" === t.ident && t.sharedYearMismatch
                ? "Umumiy F.I.Sh. mos, lekin tug‘ilgan yillar farqi bor — shaxs tasdiqlanmagan"
                : "shared" === t.ident
                  ? "Bilvosita bog‘liqlik: umumiy qarindosh orqali aniqlandi"
                  : "name" === t.ident
                    ? "Ism ro‘yxatdagi xodim bilan mos, tug‘ilgan yil bilan tasdiqlanmagan"
                    : "Ism ro‘yxatdagi xodim bilan taxminan mos",
  }),
    l ||
      o.push({
        f: "same",
        t: "Ro‘yxatdagi xodim aynan shu qarindosh ekanini tasdiqlang",
      }),
    "shared" === t.ident &&
      o.push({
        f: "same",
        t: "Bilvosita qarindoshlikni umumiy shaxs bo‘yicha tekshirib tasdiqlang",
      }),
    n.push({
      ok: "ambiguous" === t.ident || t.sharedYearMismatch ? null : !0,
      t: t.sharedYearMismatch
        ? "Xodimlar ma’lumotnomalarida bir xil F.I.Sh. topildi, ammo tug‘ilgan yillar farq qiladi — aynan bir shaxs ekanini tasdiqlang"
        : "ambiguous" === t.ident
          ? "Bir nechta ehtimoliy nomzod ro‘yxatda topildi; aniq xodim belgilanmagan"
          : t.listed
            ? "Tashkilot xodimlari ro‘yxatida bor"
            : "Xodimning ma’lumotnomasiga ko‘ra shu tashkilotda ishlaydi" +
              ("yes" === a.works ? " (tasdiqlandi)" : ""),
    }));
  let s = null,
    r = "",
    d = "";
  ("yes" === a.sub
    ? ((s = !0), (r = "mas’ul xodim tasdiqladi"), (d = "rel"))
    : "no" === a.sub
      ? ((s = !1), (r = "yo‘qligi mas’ul xodim tomonidan tasdiqlandi"))
      : t.empOrgHead
        ? ((s = !0),
          (r =
            "xodim — tashkilot rahbari, tashkilot xodimlari unga bo‘ysunadi"),
          (d = "rel"))
        : t.relOrgHead
          ? ((s = !0),
            (r = "qarindoshi — tashkilot rahbari, xodim unga bo‘ysunadi"),
            (d = "emp"))
          : !0 === t.sameUnit && t.empHead
            ? ((s = !0),
              (r = "xodim — qarindoshi ishlaydigan bo‘linma rahbari"),
              (d = "rel"))
            : !0 === t.sameUnit && t.relHead
              ? ((s = !0),
                (r = "qarindoshi — xodim ishlaydigan bo‘linma rahbari"),
                (d = "emp"))
              : t.empDep || t.relDep
                ? o.push({
                    f: "sub",
                    t:
                      (t.empDep ? "Xodim" : "Qarindoshi") +
                      " o‘rinbosar lavozimida: ikkinchisi uning bevosita bo‘ysunuvidami — tasdiqlang",
                  })
                : !0 === t.sameUnit
                  ? o.push({
                      f: "sub",
                      t: "Bir bo‘linmada ishlaydi: ular o‘rtasida rahbar va bo‘ysunuvchi munosabati bormi — tasdiqlang",
                    })
                  : null === t.sameUnit
                    ? o.push({
                        f: "sub",
                        t: "Bo‘linmasi aniqlanmadi: bevosita bo‘ysunish bor-yo‘qligini tasdiqlang",
                      })
                    : ((s = !1), (r = "boshqa-boshqa bo‘linmalarda ishlaydi")),
    n.push({
      ok: s,
      t:
        null === s
          ? "Bevosita bo‘ysunish: aniqlanmagan"
          : s
            ? "Bevosita bo‘ysunish bor: " + r
            : "Bevosita bo‘ysunish yo‘q: " + r,
    }),
    a.dec &&
      n.push({
        ok: !0,
        t: "Yaqin qarindoshiga oid qarorlar qabul qilishda ishtirok etadi (mas’ul xodim belgiladi)",
      }),
    a.con &&
      n.push({
        ok: !0,
        t: "Yaqin qarindoshi bilan uning ishi bo‘yicha fuqarolik-huquqiy shartnoma tuzilgan (mas’ul xodim belgiladi)",
      }));
  const c = [
      !0 === s
        ? "emp" === d
          ? "xodim yaqin qarindoshining bevosita bo‘ysunuvida ishlaydi"
          : "yaqin qarindoshi xodimning bevosita bo‘ysunuvida ishlaydi"
        : "",
      a.dec
        ? "xodim yaqin qarindoshiga oid qarorlar qabul qilishda ishtirok etadi"
        : "",
      a.con
        ? "yaqin qarindoshi xodimning ishi bo‘yicha fuqarolik-huquqiy shartnoma asosida jalb qilingan"
        : "",
    ].filter(Boolean),
    p =
      PED_RE.test(e.empPos || "") ||
      PED_RE.test([e.relWork, e.relPos].join(" "));
  !0 === s &&
    l &&
    ("yes" === a.exc
      ? n.push({
          ok: !1,
          t: "Vazirlar Mahkamasi belgilagan istisno qo‘llanadi (mas’ul xodim belgiladi)",
        })
      : "no" === a.exc
        ? n.push({
            ok: !0,
            t: "VM istisnosi qo‘llanmaydi (mas’ul xodim belgiladi)",
          })
        : p &&
          (n.push({
            ok: null,
            t: "Pedagog / kutubxona xodimi: VM belgilagan istisno qo‘llanishi mumkin",
          }),
          o.push({
            f: "exc",
            t: "Mehnat kodeksi 121-modda: VM belgilagan istisno (pedagog xodimlar, kutubxonachilar va b.) bu holatga tegishlimi — amaldagi VM qarori matni bo‘yicha belgilang",
          })));
  return c.length && l
    ? (!0 === s &&
        l &&
        i.push({
          a: "Mehnat kodeksi 121-modda",
          t:
            "yes" === a.exc
              ? "yaqin qarindoshlarning bitta davlat tashkilotida biri ikkinchisiga bevosita bo‘ysunib (nazorati ostida) birga xizmat qilishi taqiqlanadi, lekin bu holatga Vazirlar Mahkamasi belgilagan istisno qo‘llanadi (mas’ul xodim belgiladi)"
              : "yaqin qarindoshlarning bitta davlat tashkilotida birga xizmat qilishi, agar biri ikkinchisiga bevosita bo‘ysunsa yoki uning nazorati ostida bo‘lsa, taqiqlanadi" +
                ("no" === a.exc
                  ? " — VM istisnosi qo‘llanmasligi belgilangan: bo‘ysunuvni o‘zgartirish (boshqa bo‘linmaga o‘tkazish va h.k.) masalasi ko‘riladi"
                  : p
                    ? " — VM istisnosi (pedagog xodimlar, kutubxonachilar) qo‘llanishi mumkin, tekshiring"
                    : ""),
        }),
      i.push({
        a: "15-modda",
        t: `mavjud to‘qnashuv holati — ${c.join("; ")}. Xodim bilgan kundan boshlab 1 ish kuni ichida bevosita rahbariga yoki maxsus bo‘linmaga xabarnoma topshiradi`,
      }),
      a.dec &&
        i.push({
          a: "6-modda",
          t: "masala bo‘yicha qaror qabul qilinguniga qadar bevosita rahbarini yoki maxsus bo‘linmani xabardor qiladi",
        }),
      i.push({
        a: "14-modda",
        t: "xabarnomada xodim, aloqador shaxs, to‘qnashuv va ko‘rilgan choralar ko‘rsatiladi",
      }),
      i.push({
        a: "16-modda",
        t: "bo‘linma rahbari choralar haqida 1 ish kuni ichida maxsus bo‘linmaga ma’lum qiladi; maxsus bo‘linma 3 ish kuni ichida odob-axloq komissiyasiga xulosa beradi",
      }),
      {
        k: "actual",
        why:
          "Mavjud to‘qnashuv: " +
          c.join("; ") +
          "." +
          (!0 === s && "yes" !== a.exc
            ? " Bevosita bo‘ysunish Mehnat kodeksining 121-moddasi bo‘yicha ham ko‘rib chiqiladi."
            : ""),
        facts: n,
        arts: i,
        need: o.filter((e) => "sub" !== e.f),
        reasons: c,
      })
    : c.length || o.length
      ? {
          k: "clarify",
          why: "Huquqiy asos hali tanlanmadi — quyidagi fakt aniqlangach belgilanadi (15-modda yoki 17–18-moddalar).",
          facts: n,
          arts: i,
          need: o,
          reasons: c,
        }
      : (i.push({
          a: "17-modda",
          t: "ehtimoliy to‘qnashuv: yaqin qarindoshning ish joyi va lavozimi deklaratsiyada ko‘rsatiladi",
        }),
        i.push({
          a: "18-modda",
          t: "deklaratsiya har yili 15-yanvargacha, shaxsiy ma’lumotlar o‘zgarganda va ishga qabul qilinganda topshiriladi",
        }),
        {
          k: "potential",
          why: "Ehtimoliy to‘qnashuv: bir tashkilotda, bevosita bo‘ysunish yo‘q.",
          facts: n,
          arts: i,
          need: o,
          reasons: c,
        });
}
function coiSort() {
  coiRows.sort(
    (e, t) =>
      COI_K[coiEval(t).k].n - COI_K[coiEval(e).k].n ||
      e.emp.localeCompare(t.emp),
  );
}
function coiRec(e) {
  return (
    coiReg[e.key] || (coiReg[e.key] = { st: "new", note: "", date: "", f: {} })
  );
}
const coiOpenSt = (e) =>
  ["new", "notified"].includes((coiReg[e.key] || {}).st || "new");
var coiLast = [0, null],
  coiSearchTerm = "",
  coiPage = 1,
  coiPageSize = 25;
function coiSearchTokens(value) {
  return CoiEngine.searchTokens(value, SpravkaCore);
}
function coiSearchRow(row, result, tokens) {
  if (!tokens.length) return !0;
  const record = coiReg[row.key] || {},
    fields = [
      row.emp,
      row.empPos,
      row.relName,
      row.rel,
      row.relWork,
      row.relPos,
      row.evid,
      row.org,
      record.note,
      COI_ST[record.st || "new"],
      result.why,
      ...result.facts.map((e) => e.t),
      ...result.arts.map((e) => e.a + " " + e.t),
      ...result.need.map((e) => e.t),
    ];
  return CoiEngine.matchesSearch(fields, coiSearchTerm, SpravkaCore);
}
function coiStatusMatch(row, result) {
  return "all" === coiLvl
    ? ["actual", "clarify", "potential"].includes(result.k)
    : "open" === coiLvl
      ? "clarify" === result.k || ("actual" === result.k && coiOpenSt(row))
      : "info" === coiLvl
        ? ["info", "none"].includes(result.k)
        : result.k === coiLvl;
}
function coiFilteredRows() {
  const tokens = coiSearchTokens(coiSearchTerm);
  return coiRows.filter((row) => {
    const result = coiEval(row);
    return coiStatusMatch(row, result) && coiSearchRow(row, result, tokens);
  });
}
function renderCoi(e, t) {
  void 0 !== e ? (coiLast = [e, t]) : ([e, t] = coiLast);
  const a = $("coiList");
  a.textContent = "";
  const n = new Map(coiRows.map((e) => [e, coiEval(e)])),
    i = { actual: 0, clarify: 0, potential: 0, info: 0, none: 0 };
  let o = 0;
  for (const [e, t] of n) (i[t.k]++, "actual" === t.k && coiOpenSt(e) && o++);
  (($("coiF3").textContent = i.actual),
    ($("coiFq").textContent = i.clarify),
    ($("coiF2").textContent = i.potential),
    ($("coiF1").textContent = i.info + i.none),
    document
      .querySelectorAll("#coiFilt button")
      .forEach((e) =>
        e.setAttribute("aria-pressed", String(e.dataset.l === coiLvl)),
      ));
  const filtered = coiFilteredRows(),
    pageCount = Math.max(1, Math.ceil(filtered.length / coiPageSize));
  coiPage = Math.min(coiPage, pageCount);
  const pageStart = (coiPage - 1) * coiPageSize,
    pageRows = filtered.slice(pageStart, pageStart + coiPageSize);
  (($("coiTools").hidden = !coiRows.length),
    ($("coiPagination").hidden =
      !coiRows.length || filtered.length <= coiPageSize),
    $("coiSearch").value !== coiSearchTerm &&
      document.activeElement !== $("coiSearch") &&
      ($("coiSearch").value = coiSearchTerm),
    ($("coiPageSize").value = String(coiPageSize)),
    ($("coiSearchCount").textContent = coiSearchTerm.trim()
      ? filtered.length + " ta natija"
      : filtered.length + " ta yozuv"),
    ($("coiPageInfo").textContent = filtered.length
      ? pageStart +
        1 +
        "–" +
        Math.min(pageStart + coiPageSize, filtered.length) +
        " / " +
        filtered.length +
        " ta · " +
        coiPage +
        " / " +
        pageCount +
        "-sahifa"
      : "Natija topilmadi"),
    ($("coiPrev").disabled = coiPage <= 1),
    ($("coiNext").disabled = coiPage >= pageCount));
  let s = 0;
  for (const e of pageRows) {
    const t = n.get(e);
    const i = coiRec(e);
    i.f = i.f || {};
    const o = el("tr", "coir k-" + t.k),
      r = el("td"),
      d = el("button", "linkbtn", e.emp);
    ((d.type = "button"),
      (d.onclick = () => {
        (selectItem(e.it), showView("review"));
      }),
      r.append(d, el("small", "", e.empPos || "")));
    const c = el("td");
    (c.append(
      el("b", "", e.relName),
      el("small", "", e.rel),
      el("small", "", e.relWork || "—"),
    ),
      e.relPos &&
        SpravkaCore.norm(e.relPos) !== SpravkaCore.norm(e.relWork) &&
        c.append(el("small", "", "Ro‘yxatda: " + e.relPos)));
    const p = el("td", "facts2"),
      m = el("ul");
    for (const e of t.facts) {
      const t = el("li", !0 === e.ok ? "y" : !1 === e.ok ? "n" : "q");
      (t.append(el("i", "", !0 === e.ok ? "✓" : !1 === e.ok ? "✗" : "?"), e.t),
        m.append(t));
    }
    (p.append(m), e.evid && p.append(el("small", "ev", "Manba: " + e.evid)));
    const u = el("details", "fx2");
    ((u.open = "clarify" === t.k),
      u.append(
        el(
          "summary",
          "",
          t.need.length
            ? `Faktni aniqlashtirish (${t.need.length})`
            : "Faktlarni o‘zgartirish",
        ),
      ));
    for (const e of t.need) u.append(el("p", "need", "• " + e.t));
    const h = (e, t, a) => {
        const n = el("label");
        n.append(el("span", "", e));
        const o = el("select");
        for (const [e, t] of a)
          o.append(Object.assign(el("option", "", t), { value: e }));
        return (
          (o.value = i.f[t] || ""),
          (o.onchange = () => {
            ((i.f[t] = o.value), coiSave(), renderCoi());
          }),
          n.append(o),
          n
        );
      },
      f = (e, t) => {
        const a = el("label", "chk"),
          n = el("input");
        return (
          (n.type = "checkbox"),
          (n.checked = !!i.f[t]),
          (n.onchange = () => {
            ((i.f[t] = n.checked), coiSave(), renderCoi());
          }),
          a.append(n, " " + e),
          a
        );
      };
    ("own" !== e.F.ident &&
      u.append(
        h("Shaxs", "same", [
          ["", "tasdiqlanmagan"],
          ["yes", "aynan shu qarindosh"],
          ["no", "boshqa shaxs"],
        ]),
      ),
      u.append(
        h("Bevosita bo‘ysunish yoki nazorat", "sub", [
          ["", "avtomatik / aniqlanmagan"],
          ["yes", "bor"],
          ["no", "yo‘q"],
        ]),
      ),
      (t.facts.some((e) => /bo‘ysunish bor/.test(e.t)) || i.f.exc) &&
        u.append(
          h("VM istisnosi (MK 121-modda)", "exc", [
            ["", "aniqlanmagan"],
            ["yes", "qo‘llanadi"],
            ["no", "qo‘llanmaydi"],
          ]),
        ),
      u.append(
        h("Hozir shu tashkilotda ishlaydi", "works", [
          ["", "ma’lumotnoma bo‘yicha"],
          ["yes", "ha, tasdiqlandi"],
          ["no", "yo‘q (ketgan)"],
        ]),
      ),
      u.append(
        f(
          "Qarindoshiga oid qarorlarda ishtirok etadi (attestatsiya, mukofot, ishga olish…)",
          "dec",
        ),
      ),
      u.append(f("Qarindoshi bilan fuqarolik-huquqiy shartnoma bor", "con")),
      F_ANY(i.f) &&
        u.append(
          el(
            "small",
            "ev",
            "Mas’ul xodim belgilagan faktlar qayd daftarida saqlanadi.",
          ),
        ),
      p.append(u));
    const g = el("td", "basis");
    g.append(
      el("span", "risk " + COI_K[t.k].c, COI_K[t.k].l),
      el("small", "why", t.why),
    );
    const y = el("ul", "arts");
    for (const e of t.arts) {
      const t = el("li");
      (t.append(el("b", "", e.a), " — " + e.t), y.append(t));
    }
    t.arts.length && g.append(y);
    const k = el("td", "cst"),
      x = el("select");
    x.setAttribute("aria-label", "Holat: " + e.emp + " — " + e.relName);
    for (const [e, t] of Object.entries(COI_ST))
      x.append(Object.assign(el("option", "", t), { value: e }));
    x.value = i.st;
    const b = el("input");
    ((b.type = "text"),
      (b.placeholder =
        "measures" === i.st
          ? "Qanday chora: rotatsiya, vakolat qayta taqsimlandi…"
          : "not" === i.st
            ? "Sabab"
            : "Izoh, mas’ul shaxs"),
      (b.value = i.note || ""),
      b.setAttribute("aria-label", "Izoh"));
    const v = el("small", "dt", i.date ? "Sana: " + i.date : "");
    if (
      ((x.onchange = () => {
        ((i.st = x.value),
          (i.date = new Date().toLocaleDateString("ru-RU")),
          coiSave(),
          renderCoi());
      }),
      (b.onchange = () => {
        ((i.note = b.value.trim()), coiSave());
      }),
      k.append(x, b, v),
      "actual" === t.k)
    ) {
      const t = el("button", "btn2", "Xabarnoma (14-modda)");
      ((t.type = "button"),
        (t.title =
          "Mavjud to‘qnashuv: 14-modda mazmuni bo‘yicha xabarnoma loyihasi (Word)"),
        (t.onclick = () => coiNotice(e, t)),
        k.append(t));
    }
    if ("none" !== t.k) {
      const t = el("button", "btn2", "Deklaratsiya (17-modda)");
      ((t.type = "button"),
        (t.title =
          "Xodimning ehtimoliy to‘qnashuv deklaratsiyasi loyihasi: barcha yaqin qarindoshlari, ish joyi va lavozimi (Word)"),
        (t.onclick = () => declOne(e.it, t, $("coiMsg"))),
        k.append(t));
    }
    (o.append(el("td", "n", String(pageStart + ++s)), r, c, p, g, k),
      a.append(o));
  }
  (($("coiWrap").hidden = !coiRows.length),
    ($("coiCsv").hidden = !coiRows.length),
    ($("coiFilt").hidden = !coiRows.length));
  const r = new Set(
    coiRows
      .filter((e) => ["actual", "clarify", "potential"].includes(n.get(e).k))
      .map((e) => e.it),
  ).size;
  if (
    (($("coiMsg").className = "msg"),
    ($("coiMsg").textContent = e
      ? coiRows.length
        ? (coiSkipped
            ? `Excel bo'yicha hozir ishlayotgan ${e} ta xodim tekshirildi (${coiSkipped} ta ma'lumotnoma Excel'da yo'q — ishdan ketgan, hisobga olinmadi); qarindosh ham Excel'da bo'lsagina hisoblanadi. `
            : `${e} ta ma'lumotnoma tekshirildi. `) +
          `${r} ta xodimning yaqin qarindoshi shu tashkilotda ishlaydi. Mavjud to'qnashuv: ${i.actual} (hal qilinmagan: ${o}), aniqlashtirish kerak: ${i.clarify}, ehtimoliy: ${i.potential}. Huquqiy asos har bir holatda aniqlangan faktlarga qarab tanlanadi; qarorni maxsus bo'linma va odob-axloq komissiyasi qabul qiladi.`
        : `${coiSkipped ? `Excel bo'yicha hozir ishlayotgan ${e} ta xodim tekshirildi (${coiSkipped} ta ma'lumotnoma Excel'da yo'q — hisobga olinmadi)` : `${e} ta ma'lumotnoma tekshirildi`} — tashkilotda ishlaydigan qarindosh topilmadi.${t ? " Tashkilot: " + t[1] + "." : ""}${xl.rows && xl.rows.length ? "" : " Excel yuklansa, ism va bo'linma bo'yicha ham tekshiriladi."}`
      : "Avval ma'lumotnomalarni yuklang."),
    !s && coiRows.length)
  ) {
    const e = el("tr", "empty"),
      t = el("td", "", "Bu filtrda yozuv yo‘q.");
    ((t.colSpan = 6), e.append(t), a.append(e));
  }
}
const F_ANY = (e) => e && Object.values(e).some(Boolean);
function coiSave() {
  ((store.coiDirty = !0), store.schedule());
}
$("coiFilt").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-l]");
  t && ((coiLvl = t.dataset.l), (coiPage = 1), renderCoi());
});
$("coiSearch").addEventListener("input", (e) => {
  ((coiSearchTerm = e.currentTarget.value), (coiPage = 1), renderCoi());
});
$("coiPageSize").addEventListener("change", (e) => {
  const size = Number(e.currentTarget.value);
  ((coiPageSize = [25, 50, 100].includes(size) ? size : 25),
    (coiPage = 1),
    renderCoi());
});
$("coiPrev").addEventListener("click", () => {
  if (coiPage > 1) {
    (coiPage--, renderCoi());
  }
});
$("coiNext").addEventListener("click", () => {
  const total = Math.max(1, Math.ceil(coiFilteredRows().length / coiPageSize));
  if (coiPage < total) {
    (coiPage++, renderCoi());
  }
});
const DX = {
  esc: (e) =>
    String(null == e ? "" : e)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;"),
  run: (e, t = {}) =>
    `<w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${t.b ? "<w:b/>" : ""}${t.i ? "<w:i/>" : ""}<w:sz w:val="${t.s || 24}"/></w:rPr><w:t xml:space="preserve">${DX.esc(e)}</w:t></w:r>`,
  p: (e, t = {}) =>
    `<w:p><w:pPr>${t.c ? '<w:jc w:val="center"/>' : t.j ? '<w:jc w:val="both"/>' : ""}<w:spacing w:before="${t.bf || 0}" w:after="${null == t.a ? 120 : t.a}"/>${t.ind ? `<w:ind w:firstLine="${t.ind}"/>` : ""}</w:pPr>${Array.isArray(e) ? e.map((e) => ("string" == typeof e ? DX.run(e, t) : DX.run(e.t, { ...t, ...e }))).join("") : DX.run(e, t)}</w:p>`,
  tbl(e, t, a = {}) {
    const n = ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map(
        (e) => `<w:${e} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`,
      )
      .join("");
    return `<w:tbl><w:tblPr><w:tblW w:w="${e.reduce((e, t) => e + t, 0)}" w:type="dxa"/><w:tblBorders>${n}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${e.map((e) => `<w:gridCol w:w="${e}"/>`).join("")}</w:tblGrid>${t
      .map((t, n) => {
        return (
          (i = t),
          `<w:tr>${(o = 0 === n) ? "<w:trPr><w:tblHeader/></w:trPr>" : a.h ? `<w:trPr><w:trHeight w:val="${a.h}"/></w:trPr>` : ""}${i.map((t, n) => `<w:tc><w:tcPr><w:tcW w:w="${e[n]}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${DX.p(t, { s: a.s || 22, b: o, c: o || 0 === n, a: 0 })}</w:tc>`).join("")}</w:tr>`
        );
        var i, o;
      })
      .join("")}</w:tbl>`;
  },
  async docx(e) {
    const t = new JSZip();
    return (
      t.file(
        "[Content_Types].xml",
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      ),
      t.file(
        "_rels/.rels",
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      ),
      t.file(
        "word/document.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${e}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`,
      ),
      t.generateAsync({ type: "uint8array", compression: "DEFLATE" })
    );
  },
};
function declBody(e) {
  const t = e.P,
    a = !!t.S.latin,
    n = (e) => (a ? e : SpravkaCore.latToCyr(e)),
    i = "______________________________",
    o = (t.relatives || []).filter((e) => e.name || e.rel),
    l = o.filter(
      (e) =>
        "close" === relKind(e.rel) &&
        !((e) => /вафот|vafot/i.test(e.work || ""))(e),
    ),
    s = o.length - l.length,
    r = [
      [
        n("№"),
        n("Qarindoshligi"),
        n("Familiyasi, ismi va otasining ismi"),
        n("JShShIR (mavjud bo‘lgan taqdirda)"),
        n("Ish joyi va lavozimi"),
      ],
    ];
  l.forEach((e, a) =>
    r.push([
      String(a + 1),
      t.S.relations[e.rel] || e.rel,
      e.name || "",
      "",
      String(e.work || "").replace(/\s*\n\s*/g, " "),
    ]),
  );
  for (let e = 0; e < 2; e++)
    r.push([String(l.length + e + 1), "", "", "", ""]);
  const d = [
      [
        n("№"),
        n("Kim (xodim yoki yaqin qarindoshi F.I.Sh.)"),
        n("Aksiyadorlik jamiyatining rasmiy nomi"),
        n("Soliq to‘lovchining identifikatsiya raqami (STIR)"),
      ],
      ["1", "", "", ""],
      ["2", "", "", ""],
      ["3", "", "", ""],
    ],
    c = [
      [
        n("№"),
        n("Kim (xodim yoki yaqin qarindoshi F.I.Sh.)"),
        n("Yuridik shaxsning rasmiy nomi"),
        n("Ishtiroki (muassis, ishtirokchi, boshqaruv organi a’zosi)"),
        n("STIR"),
      ],
      ["1", "", "", "", ""],
      ["2", "", "", "", ""],
      ["3", "", "", "", ""],
    ],
    p =
      new Date().getMonth() >= 10
        ? new Date().getFullYear() + 1
        : new Date().getFullYear();
  return [
    DX.p(
      n(
        "LOYIHA — Korrupsiyaga qarshi kurashish agentligi tasdiqlagan namunaviy shakl bo'yicha rasmiylashtiring",
      ),
      { i: !0, s: 20, c: !0 },
    ),
    DX.p(n("Ehtimoliy manfaatlar to'qnashuvi to'g'risida"), {
      b: !0,
      c: !0,
      a: 0,
      s: 28,
    }),
    DX.p(n("DEKLARATSIYA"), { b: !0, c: !0, s: 28, a: 60 }),
    DX.p(
      n(
        "(«Manfaatlar to'qnashuvi to'g'risida»gi O'RQ-931-son Qonunning 17, 18-moddalari)",
      ),
      { i: !0, c: !0, s: 20, a: 240 },
    ),
    DX.p(
      n("1. Xodimning lavozimi, familiyasi, ismi, otasining ismi va JShShIR"),
      { b: !0 },
    ),
    DX.p([
      n("Familiyasi, ismi va otasining ismi: "),
      { t: t.name || i, b: !0 },
    ]),
    DX.p([n("Lavozimi: "), (t.position || i).replace(/\s*\n\s*/g, " ")]),
    DX.p(
      n("Jismoniy shaxsning shaxsiy identifikatsiya raqami (JShShIR): ") +
        "□□□□□□□□□□□□□□",
      { a: 200 },
    ),
    DX.p(
      n(
        "2. Yaqin qarindoshlarining familiyasi, ismi va otasining ismi, JShShIR (mavjud bo‘lgan taqdirda), ish joyi va lavozimi",
      ),
      { b: !0 },
    ),
    DX.tbl([450, 1800, 2500, 1550, 3330], r, { h: 420 }),
    DX.p(
      n(
        "Yaqin qarindoshlar (Qonunning 3-moddasi): ota-ona, aka-uka, opa-singil, o‘g‘il, qiz, er-xotin, shuningdek er (xotin)ning ota-onasi, aka-ukasi, opa-singillari va farzandlari." +
          (s
            ? ` Ma’lumotnomadagi ${s} nafar qarindosh (ro‘yxatga kirmaydigan yoki vafot etgan) kiritilmadi.`
            : ""),
      ),
      { i: !0, s: 18, bf: 60, a: 200 },
    ),
    DX.p(
      n(
        "3. Xodim yoki uning yaqin qarindoshlari aksiyador bo‘lgan aksiyadorlik jamiyatlari",
      ),
      { b: !0 },
    ),
    DX.tbl([500, 3e3, 3730, 2400], d, { h: 380 }),
    DX.p(n("Bunday jamiyat bo‘lmasa, «yo‘q» deb yoziladi."), {
      i: !0,
      s: 18,
      bf: 60,
      a: 200,
    }),
    DX.p(
      n(
        "4. Xodim yoki uning yaqin qarindoshlari muassisi (ishtirokchisi), boshqaruv organi a’zosi bo‘lgan yuridik shaxslar",
      ),
      { b: !0 },
    ),
    DX.tbl([500, 2500, 2900, 2200, 1530], c, { h: 380 }),
    DX.p(n("Bunday yuridik shaxs bo‘lmasa, «yo‘q» deb yoziladi."), {
      i: !0,
      s: 18,
      bf: 60,
      a: 240,
    }),
    DX.p(
      n(
        "Deklaratsiyada ko‘rsatilgan ma’lumotlarning to‘g‘ri va to‘liqligini tasdiqlayman. Ma’lumotlar o‘zgarganda deklaratsiyani yangilayman.",
      ),
      { j: !0 },
    ),
    DX.p(n("Sana: ") + "«____» ____________ 20____ " + n("y."), { bf: 120 }),
    DX.p(n("Imzo (o‘z qo‘li bilan yoki elektron raqamli imzo): ") + i),
    DX.p(
      n(
        `Taqdim etiladi: maxsus bo‘linmaga — har yili 15-yanvargacha (${p}-yil 15-yanvar), shaxsiy ma’lumotlar o‘zgarganda, shuningdek ishga qabul qilinishda yoki boshqa ishga o‘tkazilishda (18-modda).`,
      ),
      { i: !0, s: 18, bf: 240 },
    ),
  ].join("");
}
