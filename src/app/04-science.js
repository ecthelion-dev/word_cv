/**
 * 04-science.js — Ilmiy salohiyat (DSc, PhD, fan nomzodi, professor, dotsent) tahlili, kafedralar reytingi va XLSX eksport
 */
const SCI_DEG = [
    ["dsc", "Fan doktori (DSc)"],
    ["phd", "Falsafa doktori (PhD)"],
    ["nomzod", "Fan nomzodi"],
    ["oth", "Boshqa daraja"],
  ],
  SCI_TIT = [
    ["prof", "Professor"],
    ["dots", "Dotsent"],
    ["kix", "Katta ilmiy xodim"],
    ["oth", "Boshqa unvon"],
  ],
  sciNone = (e) =>
    isEmptyV(e) ||
    /^(?:йўқ|йук|yo[‘'’`ʻ]?q|нет|не имеет|mavjud emas|мавжуд эмас|-+|—)$/i.test(
      String(e)
        .trim()
        .replace(/[.\s]+$/, ""),
    );
function sciDeg(e) {
  if (sciNone(e)) return null;
  const t = SpravkaCore.cyrToLat(String(e)).toLowerCase();
  return /falsafa|phd|filosof/.test(t)
    ? "phd"
    : /dsc|fan(?:lar)?i?\s+doktor|doktor\s+\S+\s+nauk|\bd\.\s*\S{1,4}\.\s*n\./.test(
          t,
        )
      ? "dsc"
      : /nomzod|kandidat|\bk\.\s*\S{1,4}\.\s*n\./.test(t)
        ? "nomzod"
        : "oth";
}
const SCI_ACT =
    /(?:^|[\s(,;])(?:в\.\s*б\.?|v\.\s*b\.?|и\.\s*о\.?|i\.\s*o\.?)(?=$|[\s),;])|\s(?:вб|vb)\.?\s*$|вазифасини\s*бажарувчи|vazifasini\s*bajaruvchi|исполняющ/i,
  sciNoTit = (e) => sciNone(e) || SCI_ACT.test(String(e));
function sciTit(e) {
  if (sciNoTit(e)) return null;
  const t = SpravkaCore.cyrToLat(String(e)).toLowerCase();
  return /professor/.test(t)
    ? "prof"
    : /dotsent|dotsen|docent|dozent/.test(t)
      ? "dots"
      : /katta\s+ilmiy|starsh\S*\s+nauch/.test(t)
        ? "kix"
        : "oth";
}
function sciField(e) {
  const t = /([A-Za-zА-Яа-яЎўҚқҒғҲҳЁё‘’'ʻ-]+)\s+(?:фанлари|fanlari|наук)/i.exec(
    String(e || ""),
  );
  return t ? t[1].toLowerCase() : "";
}
function sciFieldKey(e) {
  return SpravkaCore.norm(SpravkaCore.cyrToLat(sciField(e) || ""));
}
let sciF = "any",
  sciPage = 0,
  sciPageSize = 20;
const SCI_PED =
    /профессор|professor|доцент|dotsent|ўқитувчи|укитувчи|o['‘’`ʻ]?qituvchi|ассистент|assistent|стажёр|stajyor|кафедра мудир|kafedra mudir|преподавател|заведующ\S* кафедр/i,
  SCI_PEDCAT =
    /ппс|pps|профессор|professor|ўқитувчи|o['‘’`ʻ]?qituvchi|педагог|pedagog|преподав/i,
  SCI_OTHCAT =
    /ауп|aup|увп|моп|маъмур|ma['‘’`ʻ]?mur|хўжалик|xo['‘’`ʻ]?jalik|ёрдамчи|yordamchi|техник|texnik|обслуж|административ/i;
function sciGrp(e, t) {
  const a = String(e || "");
  return a && SCI_PEDCAT.test(a) && !SCI_OTHCAT.test(a)
    ? "ped"
    : a && SCI_OTHCAT.test(a)
      ? "oth"
      : t.some((e) => SCI_PED.test(e || ""))
        ? "ped"
        : "oth";
}
const EXT_RE =
    /ташқи\s*ўриндош|ташки\s*уриндош|tashqi\s*o['‘’`ʻ]?rindosh|внешн\S*\s*совмест/i,
  rowExt = (e) => (e || []).some((e) => EXT_RE.test(String(e || "")));
let sciExtN = 0;
function sciRows() {
  const e = (e, t) =>
      xl.map && void 0 !== xl.map[t]
        ? String(e[xl.map[t]] || "")
            .trim()
            .replace(/\s+/g, " ")
        : "",
    t = !!(xl.rows && xl.rows.length && xl.map),
    a = [],
    n = new Set(),
    i = new Map(),
    o = (e) => {
      const t = SpravkaCore.nameParts(SpravkaCore.latToCyr(e || ""));
      return (
        SpravkaCore.norm(t.sur || "") + "|" + SpravkaCore.norm(t.giv || "")
      );
    };
  for (const l of items) {
    if (!l.P || l.excluded) continue;
    const s =
      null != l.xlRow && t && xl.rows[l.xlRow] ? xl.rows[l.xlRow] : null;
    s && n.add(l.xlRow);
    let r = l.P.fields.degree || "",
      d = l.P.fields.title || "",
      c = `«${l.name}»`,
      p = c;
    const docDeg = r,
      docTit = d,
      excelDeg = s ? e(s, "degree") : "",
      excelTit = s ? e(s, "title") : "",
      issues = [];
    (s &&
      !sciNone(docDeg) &&
      !sciNone(excelDeg) &&
      ScienceEngine.sourceConflict(
        docDeg,
        excelDeg,
        sciDeg,
        sciNone,
        SpravkaCore,
      ) &&
      issues.push("Ilmiy darajasi ma’lumotnoma va Excel’da farq qiladi"),
      s &&
        !sciNone(docDeg) &&
        !sciNone(excelDeg) &&
        sciField(docDeg) &&
        sciField(excelDeg) &&
        sciFieldKey(docDeg) !== sciFieldKey(excelDeg) &&
        issues.push("Ilmiy daraja sohasi ma’lumotnoma va Excel’da farq qiladi"),
      s &&
        !sciNoTit(docTit) &&
        !sciNoTit(excelTit) &&
        ScienceEngine.sourceConflict(
          docTit,
          excelTit,
          sciTit,
          sciNoTit,
          SpravkaCore,
        ) &&
        issues.push("Ilmiy unvoni ma’lumotnoma va Excel’da farq qiladi"),
      s &&
        sciNone(r) &&
        !sciNone(excelDeg) &&
        ((r = excelDeg), (c = `Excel, ${l.xlRow + 1}-qator`)),
      s &&
        sciNoTit(d) &&
        !sciNoTit(excelTit) &&
        ((d = excelTit), (p = `Excel, ${l.xlRow + 1}-qator`)));
    const m = {
      it: l,
      ext: rowExt(s) || EXT_RE.test(l.P.position || ""),
      name: l.P.name || l.name,
      pos: (l.P.position || (s && e(s, "position")) || "").replace(/\s+/g, " "),
      poss: [l.P.position, s ? e(s, "position") : ""],
      cat: s ? e(s, "staff_cat") : "",
      dept: deptOf(l) || (s ? e(s, "dept") : ""),
      deg: r,
      tit: d,
      docDeg,
      docTit,
      excelDeg,
      excelTit,
      issues,
      src: c === p ? c : `${c}; unvon: ${p}`,
      extra: [],
    };
    (a.push(m), i.set(o(m.name), m));
  }
  t &&
    xl.rows.forEach((t, l) => {
      if (n.has(l)) return;
      const s = rowName(t);
      if (!s || ("function" == typeof isHeadRow && isHeadRow(t))) return;
      const r = e(t, "degree"),
        d = e(t, "title"),
        c = e(t, "position"),
        p = o(s),
        m = i.get(p);
      if (m)
        return (
          (m.ext = m.ext || rowExt(t)),
          c && c !== m.pos && !m.extra.includes(c) && m.extra.push(c),
          m.poss.push(c),
          m.cat || (m.cat = e(t, "staff_cat")),
          m.dept || (m.dept = e(t, "dept")),
          m.pos || (m.pos = c),
          (m.issues = m.issues || []),
          !sciNone(m.docDeg) &&
            !sciNone(r) &&
            ScienceEngine.sourceConflict(
              m.docDeg,
              r,
              sciDeg,
              sciNone,
              SpravkaCore,
            ) &&
            !m.issues.includes(
              "Ilmiy darajasi ma’lumotnoma va Excel’da farq qiladi",
            ) &&
            m.issues.push(
              "Ilmiy darajasi ma’lumotnoma va Excel’da farq qiladi",
            ),
          !sciNone(m.docDeg) &&
            !sciNone(r) &&
            sciField(m.docDeg) &&
            sciField(r) &&
            sciFieldKey(m.docDeg) !== sciFieldKey(r) &&
            !m.issues.includes(
              "Ilmiy daraja sohasi ma’lumotnoma va Excel’da farq qiladi",
            ) &&
            m.issues.push(
              "Ilmiy daraja sohasi ma’lumotnoma va Excel’da farq qiladi",
            ),
          !sciNoTit(m.docTit) &&
            !sciNoTit(d) &&
            ScienceEngine.sourceConflict(
              m.docTit,
              d,
              sciTit,
              sciNoTit,
              SpravkaCore,
            ) &&
            !m.issues.includes(
              "Ilmiy unvoni ma’lumotnoma va Excel’da farq qiladi",
            ) &&
            m.issues.push("Ilmiy unvoni ma’lumotnoma va Excel’da farq qiladi"),
          sciNone(m.deg) &&
            !sciNone(r) &&
            ((m.deg = r),
            (m.excelDeg = r),
            (m.src += `; daraja: Excel, ${l + 1}-qator`)),
          sciNoTit(m.tit) &&
            !sciNoTit(d) &&
            ((m.tit = d),
            (m.excelTit = d),
            (m.src += `; unvon: Excel, ${l + 1}-qator`)),
          void 0
        );
      const u = {
        it: null,
        ext: rowExt(t),
        name: s,
        pos: c,
        poss: [c],
        cat: e(t, "staff_cat"),
        dept: e(t, "dept"),
        deg: r,
        tit: d,
        src: `Excel, ${l + 1}-qator${items.some((e) => e.P) ? " (ma'lumotnomasi yo'q)" : ""}`,
        extra: [],
      };
      (a.push(u), i.set(p, u));
    });
  for (const e of a)
    ((e.dk = sciDeg(e.deg)),
      (e.tk = sciTit(e.tit)),
      (e.grp = sciGrp(e.cat, e.poss)));
  return ((sciExtN = a.filter((e) => e.ext).length), a.filter((e) => !e.ext));
}
let sciG = "ped";
const SCI_GL = {
  ped: "Professor-o'qituvchilar",
  oth: "Boshqa xodimlar",
  all: "Barcha xodimlar",
};
function sciQuality(e) {
  return ScienceEngine.quality(e);
}
function sciStats(e) {
  const t = {
    all: e.length,
    any: 0,
    missingDeg: 0,
    missingTit: 0,
    review: 0,
    conflicts: 0,
    unknown: 0,
  };
  for (const [e] of SCI_DEG) t["d_" + e] = 0;
  for (const [e] of SCI_TIT) t["t_" + e] = 0;
  for (const a of e) {
    ((a.dk || a.tk) && t.any++,
      a.dk && t["d_" + a.dk]++,
      a.tk && t["t_" + a.tk]++);
    const q = sciQuality(a);
    (!a.dk && t.missingDeg++,
      !a.tk && t.missingTit++,
      q.needsReview && t.review++,
      q.sourceConflict && t.conflicts++,
      q.unknownDegree || q.unknownTitle ? t.unknown++ : 0);
  }
  return ((t.deg = e.filter((e) => e.dk).length), t);
}
const sciPct = (e, t) => (t ? Math.round((1e3 * e) / t) / 10 : 0);
function sciFilterMatch(e) {
  if ("all" === sciF) return !0;
  if ("any" === sciF) return !!(e.dk || e.tk);
  if ("none" === sciF) return !(e.dk || e.tk);
  if ("review" === sciF) return sciQuality(e).needsReview;
  if ("conflict" === sciF) return !!(e.issues && e.issues.length);
  if ("missing-degree" === sciF) return !e.dk;
  if ("missing-title" === sciF) return !e.tk;
  if (sciF.startsWith("d_")) return e.dk === sciF.slice(2);
  return e.tk === sciF.slice(2);
}
function sciFilter(e) {
  const dept = $("sciDept").value,
    query = $("sciSearch").value;
  return e
    .filter(sciFilterMatch)
    .filter((row) => !dept || row.dept === dept)
    .filter((row) =>
      ScienceEngine.matches(
        [
          row.name,
          row.pos,
          row.poss,
          row.extra,
          row.dept,
          row.cat,
          row.deg,
          row.tit,
          row.src,
          row.issues,
        ],
        query,
        SpravkaCore,
      ),
    )
    .sort((a, b) => {
      const sort = $("sciSort").value;
      if (sort === "name") return a.name.localeCompare(b.name, "uz");
      if (sort === "dept")
        return (
          (a.dept || "").localeCompare(b.dept || "", "uz") ||
          a.name.localeCompare(b.name, "uz")
        );
      if (sort === "degree")
        return (
          (SCI_ORD[a.dk] ?? 9) - (SCI_ORD[b.dk] ?? 9) ||
          a.name.localeCompare(b.name, "uz")
        );
      if (sort === "title")
        return (
          (SCI_ORDT[a.tk] ?? 9) - (SCI_ORDT[b.tk] ?? 9) ||
          a.name.localeCompare(b.name, "uz")
        );
      return (
        (SCI_ORD[a.dk] ?? 9) - (SCI_ORD[b.dk] ?? 9) ||
        (SCI_ORDT[a.tk] ?? 9) - (SCI_ORDT[b.tk] ?? 9) ||
        a.name.localeCompare(b.name, "uz")
      );
    });
}
const SCI_ORD = { dsc: 0, phd: 1, nomzod: 2, oth: 3 },
  SCI_ORDT = { prof: 0, dots: 1, kix: 2, oth: 3 };
function renderSciAnalytics(rows) {
  const panel = $("sciAnalytics");
  panel.hidden = sciG !== "ped";
  if (panel.hidden) return;
  const report = ScienceEngine.departmentRanking(rows, SpravkaCore, 5);
  const stats = $("sciRankStats");
  stats.textContent = "";
  const tiles = [
    [
      report.total,
      "Professor-o‘qituvchilar",
      "Tashqi o‘rindoshlar chiqarib tashlangan",
      "",
    ],
    [
      report.degreeHolders,
      "Ilmiy darajali xodimlar",
      sciPct(report.degreeHolders, report.total) +
        "% — barcha professor-o‘qituvchilardan",
      "accent",
    ],
    [
      report.departmentCount,
      "Kafedralar",
      report.ratedDepartmentCount + " tasi 5 yoki undan ko‘p xodim bilan",
      "",
    ],
    [
      report.unassigned,
      "Bo‘limi aniqlanmagan",
      report.unassignedDegreeHolders + " nafarida ilmiy daraja bor",
      "",
    ],
  ];
  for (const [value, label, detail, cls] of tiles) {
    const card = el("div", "sci-rank-kpi " + cls);
    card.append(
      el("b", "", String(value)),
      el("span", "", label),
      el("small", "", detail),
    );
    stats.append(card);
  }
  const leaders = $("sciRankLeaders");
  leaders.textContent = "";
  const top = report.departments.slice(0, 5);
  if (!top.length) {
    leaders.append(
      el(
        "div",
        "sci-rank-empty",
        "Kafedra nomlari aniqlanmadi. Ma’lumotnomalar yoki Excel’da bo‘lim ustunini tekshiring.",
      ),
    );
  } else {
    for (const group of top) {
      const item = el("div", "sci-leader");
      item.append(el("span", "sci-leader-rank", group.rank + "."));
      const main = el("div", "sci-leader-main");
      const choose = el("button", "", group.department);
      choose.type = "button";
      choose.title = "Ushbu kafedra xodimlarini jadvalda ko‘rish";
      choose.addEventListener("click", () => {
        const dept = $("sciDept");
        dept.value = group.department;
        sciPage = 0;
        renderSci();
        $("sciBody")
          .closest(".card")
          .scrollIntoView({ block: "start", behavior: "smooth" });
      });
      const progress = el("progress");
      progress.max = 100;
      progress.value = group.degreeRate;
      progress.setAttribute(
        "aria-label",
        group.department + " ilmiy darajali xodimlar ulushi",
      );
      main.append(choose, progress);
      item.append(
        main,
        el("span", "sci-leader-value", group.degreeRate.toFixed(1) + "%"),
      );
      leaders.append(item);
    }
  }
  const body = $("sciRankBody");
  body.textContent = "";
  for (const group of report.departments) {
    const tr = el("tr", group.smallSample ? "sci-small-sample" : "");
    tr.append(el("td", "num", String(group.rank)));
    const deptCell = el("td");
    const deptBtn = el("button", "sci-rank-dept", group.department);
    deptBtn.type = "button";
    deptBtn.addEventListener("click", () => {
      const dept = $("sciDept");
      dept.value = group.department;
      sciPage = 0;
      renderSci();
      $("sciBody")
        .closest(".card")
        .scrollIntoView({ block: "start", behavior: "smooth" });
    });
    deptCell.append(deptBtn);
    if (group.smallSample)
      deptCell.append(el("small", "sci-sample-badge", "Kam sonli tanlanma"));
    tr.append(deptCell);
    tr.append(el("td", "num", String(group.staff)));
    tr.append(el("td", "num", String(group.degreeHolders)));
    tr.append(el("td", "sci-rank-rate", group.degreeRate.toFixed(1) + "%"));
    tr.append(el("td", "num", String(group.dsc)));
    tr.append(el("td", "num", String(group.phd)));
    tr.append(el("td", "num", String(group.candidate)));
    tr.append(el("td", "num", String(group.professors)));
    tr.append(el("td", "num", String(group.docents)));
    tr.append(el("td", "num", String(group.review)));
    const action = el("td");
    const open = el("button", "btn2", "Xodimlar");
    open.type = "button";
    open.addEventListener("click", () => {
      const dept = $("sciDept");
      dept.value = group.department;
      sciPage = 0;
      renderSci();
      $("sciBody")
        .closest(".card")
        .scrollIntoView({ block: "start", behavior: "smooth" });
    });
    action.append(open);
    tr.append(action);
    body.append(tr);
  }
  if (!report.departments.length) {
    const tr = el("tr", "empty");
    const cell = el(
      "td",
      "",
      "Kafedralar bo‘yicha reyting tuzish uchun bo‘lim ma’lumoti topilmadi.",
    );
    cell.colSpan = 12;
    tr.append(cell);
    body.append(tr);
  }
  $("sciRankCaption").textContent =
    report.departmentCount +
    " ta kafedra · reyting ilmiy darajalilar ulushi bo‘yicha";
  $("sciRankNote").textContent =
    "Umumiy hisob: " +
    report.total +
    " nafar professor-o‘qituvchi, ulardan " +
    report.degreeHolders +
    " nafarida tan olingan ilmiy daraja bor (" +
    sciPct(report.degreeHolders, report.total) +
    "%). " +
    report.unassigned +
    " nafar xodimning bo‘limi aniqlanmagan va kafedralar reytingiga kiritilmadi; ular umumiy ko‘rsatkichda hisobga olingan. " +
    (report.departments.length - report.ratedDepartmentCount) +
    " ta kafedrada xodimlar soni 5 nafardan kam — ularning foizi kichik tanlanma sababli ehtiyotkor talqin qilinadi. Reyting rasmiy attestatsiya yoki qonuniy baholash o‘rnini bosmaydi.";
}
function renderSci() {
  try {
    xlStatus();
  } catch (e) {}
  const e = sciRows();
  renderSciAnalytics(e);
  const t = "all" === sciG ? e : e.filter((e) => e.grp === sciG),
    a = sciStats(t);
  (($("nSci").textContent = sciStats(e).any || ""),
    ($("sciGp").textContent = e.filter((e) => "ped" === e.grp).length),
    ($("sciGo").textContent = e.filter((e) => "oth" === e.grp).length),
    ($("sciGa").textContent = e.length),
    $("sciG")
      .querySelectorAll("button")
      .forEach((e) =>
        e.setAttribute("aria-selected", String(e.dataset.g === sciG)),
      ));
  const n = !(!xl.rows || !xl.rows.length),
    i = n && xl.map && (void 0 !== xl.map.degree || void 0 !== xl.map.title),
    o = items.filter((e) => e.P && !e.excluded).length;
  (($("sciSrc").className = "msg" + (n && !i ? " err" : "")),
    ($("sciSrc").textContent = n
      ? i
        ? `Manba: ${o ? o + " ta ma'lumotnoma va " : ""}«${xl.fileName || "Excel"}» (${xl.rows.length} ta qator).${sciExtN ? ` Tashqi o'rindoshlar (${sciExtN} ta) hisobga olinmadi.` : ""} Guruh lavozim bo'yicha aniqlanadi${void 0 !== xl.map.staff_cat ? " (Excel'dagi «xodim toifasi» ustuni ustuvor)" : ": professor, dotsent, o'qituvchi, assistent, kafedra mudiri — professor-o'qituvchilar"}.`
        : `«${xl.fileName || "Excel"}» yuklangan, lekin unda «Ilmiy darajasi» / «Ilmiy unvoni» ustuni topilmadi — «Excel bazasi» bo'limida «Ustunlar moslashuvi»ni tekshiring.`
      : `Manba: ${o} ta ma'lumotnoma. Kadrlar bazasi Excel'ini yuklasangiz, ma'lumotnomasi yo'q xodimlar ham qo'shiladi.`));
  const l = $("sciK");
  l.textContent = "";
  const s = (e, t, a, n) => {
    const i = el("div", "sk " + (n || ""));
    (i.append(el("b", "", String(e)), el("span", "", t), el("small", "", a)),
      l.append(i));
  };
  (s(
    a.all,
    "all" === sciG ? "Jami xodim" : SCI_GL[sciG],
    "ped" === sciG
      ? "ilmiy salohiyat shular bo‘yicha"
      : "oth" === sciG
        ? "ma'muriy, xo'jalik va boshqa"
        : "ma'lumotnoma + Excel",
  ),
    s(
      a.deg,
      "Ilmiy darajali",
      `${sciPct(a.deg, a.all)}% — ${a.all} tadan${a.d_oth ? ` · shundan «boshqa daraja»: ${a.d_oth}` : ""}`,
      "acc",
    ),
    s(a.d_dsc, "Fan doktori (DSc)", `${sciPct(a.d_dsc, a.all)}%`),
    s(
      a.d_phd + a.d_nomzod,
      "PhD va fan nomzodi",
      `PhD: ${a.d_phd} · nomzod: ${a.d_nomzod}`,
    ),
    s(a.t_prof, "Professor", "ilmiy unvon"),
    s(a.t_dots, "Dotsent", "ilmiy unvon"),
    s(
      a.review,
      "Tekshirish kerak",
      a.conflicts + " ta manba tafovuti · " + a.unknown + " ta noaniq toifa",
      "warn",
    ));
  const r = $("sciF");
  r.textContent = "";
  const d = (e, t, a) => {
    const n = el("button", "", t);
    ((n.type = "button"),
      n.setAttribute("aria-pressed", String(sciF === e)),
      n.append(el("em", "", String(a))),
      (n.onclick = () => {
        ((sciF = e), (sciPage = 0), renderSci());
      }),
      r.append(n));
  };
  d("any", "Daraja yoki unvoni bor", a.any);
  for (const [e, t] of SCI_DEG)
    (a["d_" + e] || "oth" !== e) && d("d_" + e, t, a["d_" + e]);
  for (const [e, t] of SCI_TIT)
    (a["t_" + e] || "oth" !== e) && d("t_" + e, t, a["t_" + e]);
  (d("review", "Tekshirish kerak", a.review),
    d("conflict", "Manbalar farqi", a.conflicts),
    d("missing-degree", "Darajasi yo‘q", a.missingDeg),
    d("missing-title", "Unvoni yo‘q", a.missingTit),
    d("none", "Daraja/unvoni yo‘q", a.all - a.any),
    d("all", "Hammasi", a.all));
  const c = [...new Set(t.map((e) => e.dept).filter(Boolean))].sort((e, t) =>
      e.localeCompare(t, "uz"),
    ),
    p = $("sciDept"),
    m = p.value;
  if (p.dataset.sig !== c.join("|")) {
    ((p.dataset.sig = c.join("|")),
      (p.textContent = ""),
      p.append(Object.assign(el("option", "", "Hammasi"), { value: "" })));
    for (const e of c)
      p.append(
        Object.assign(
          el("option", "", e.length > 50 ? e.slice(0, 50) + "…" : e),
          { value: e },
        ),
      );
    p.value = c.includes(m) ? m : "";
  }
  p.closest("label").hidden = !c.length;
  const u = sciFilter(t),
    h = $("sciBody");
  h.textContent = "";
  const f = Math.max(1, Math.ceil(u.length / sciPageSize));
  sciPage > f - 1 && (sciPage = f - 1);
  const g = sciPage * sciPageSize;
  if (
    (u.slice(g, g + sciPageSize).forEach((e, t) => {
      const a = g + t,
        n = el("tr"),
        i = el("td");
      if (e.it) {
        const t = el("button", "linkbtn", e.name);
        ((t.type = "button"),
          (t.onclick = () => {
            (selectItem(e.it), showView("review"));
          }),
          i.append(t));
      } else i.append(el("b", "", e.name));
      (e.dept && i.append(el("small", "", e.dept)),
        e.extra.length &&
          i.append(
            el(
              "small",
              "orin",
              "ham: " + e.extra.filter(Boolean).join("; ").slice(0, 90),
            ),
          ),
        "all" === sciG &&
          i.append(
            el(
              "small",
              "",
              "ped" === e.grp ? "professor-o'qituvchi" : "boshqa xodim",
            ),
          ));
      const o = el("td");
      e.dk
        ? (o.append(
            el("span", "stg d-" + e.dk, SCI_DEG.find((t) => t[0] === e.dk)[1]),
          ),
          o.append(el("small", "", e.deg)),
          sciQuality(e).unknownDegree &&
            o.append(el("small", "sci-issue", "Toifasi aniqlashtirilsin")))
        : o.append(el("span", "faint", "—"));
      const l = el("td");
      e.tk
        ? (l.append(
            el("span", "stg t-" + e.tk, SCI_TIT.find((t) => t[0] === e.tk)[1]),
          ),
          SpravkaCore.norm(e.tit) !==
            SpravkaCore.norm(SCI_TIT.find((t) => t[0] === e.tk)[1]) &&
            l.append(el("small", "", e.tit)),
          sciQuality(e).unknownTitle &&
            l.append(el("small", "sci-issue", "Unvoni aniqlashtirilsin")))
        : l.append(el("span", "faint", "—"));
      const src = el("td", "src", e.src);
      e.issues &&
        e.issues.length &&
        src.append(el("small", "sci-issue", e.issues.join("; ")));
      (n.append(
        el("td", "num", String(a + 1)),
        i,
        el("td", "pos", e.pos.length > 140 ? e.pos.slice(0, 140) + "…" : e.pos),
        o,
        l,
        src,
      ),
        h.append(n));
    }),
    !u.length)
  ) {
    const e = el("tr", "empty"),
      a = el(
        "td",
        "",
        t.length
          ? "Tanlangan toifada xodim yo‘q."
          : "Ma'lumotnomalar yuklanmagan.",
      );
    ((a.colSpan = 6), e.append(a), h.append(e));
  }
  (($("sciPageSize").value = String(sciPageSize)),
    ($("sciInfo").textContent = u.length
      ? u.length +
        " ta yozuv · " +
        (g + 1) +
        "–" +
        Math.min(g + sciPageSize, u.length) +
        " ko‘rsatilmoqda"
      : ""),
    pagerInto($("sciPager"), f, sciPage, (e) => {
      ((sciPage = e), renderSci());
      const t = $("sciBody").closest(".card");
      t && t.scrollIntoView({ block: "start", behavior: "smooth" });
    }),
    ($("sciXlsx").disabled = !t.length));
}
function xlsxBuild(e) {
  const t = (e) =>
      String(null == e ? "" : e)
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;"),
    a = (e) => {
      let t = "";
      for (e++; e;) {
        const a = (e - 1) % 26;
        ((t = String.fromCharCode(65 + a) + t), (e = Math.floor((e - 1) / 26)));
      }
      return t;
    },
    n = new JSZip(),
    i = e.map((e, i) => {
      const o = e.rows
          .map(
            (n, i) =>
              `<row r="${i + 1}">${n
                .map((n, o) => {
                  const l = a(o) + (i + 1),
                    s = i < (e.head || 1) ? 1 : e.bold && e.bold(i) ? 4 : 2;
                  return "number" == typeof n && isFinite(n)
                    ? `<c r="${l}" s="${1 === s ? 1 : 3}"><v>${n}</v></c>`
                    : `<c r="${l}" t="inlineStr" s="${s}"><is><t xml:space="preserve">${t(n)}</t></is></c>`;
                })
                .join("")}</row>`,
          )
          .join(""),
        l = Math.max(1, ...e.rows.map((e) => e.length)),
        s = `<cols>${Array.from({ length: l }, (t, a) => `<col min="${a + 1}" max="${a + 1}" width="${(e.widths && e.widths[a]) || 14}" customWidth="1"/>`).join("")}</cols>`,
        r =
          e.filter && e.rows.length > 1
            ? `<autoFilter ref="A${e.head || 1}:${a(l - 1)}${e.rows.length}"/>`
            : "",
        d = e.freeze
          ? `<sheetViews><sheetView workbookViewId="0"${i ? "" : ' tabSelected="1"'}><pane ySplit="${e.head || 1}" topLeftCell="A${(e.head || 1) + 1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`
          : "";
      return (
        n.file(
          `xl/worksheets/sheet${i + 1}.xml`,
          `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${d}${s}<sheetData>${o}</sheetData>${r}<pageSetup orientation="landscape" paperSize="9"/></worksheet>`,
        ),
        e.name.replace(/[\[\]:*?/\\]/g, " ").slice(0, 31)
      );
    });
  return (
    n.file(
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${i.map((e, t) => `<Override PartName="/xl/worksheets/sheet${t + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
    ),
    n.file(
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    ),
    n.file(
      "xl/workbook.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${i.map((e, a) => `<sheet name="${t(e)}" sheetId="${a + 1}" r:id="rId${a + 1}"/>`).join("")}</sheets></workbook>`,
    ),
    n.file(
      "xl/_rels/workbook.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${i.map((e, t) => `<Relationship Id="rId${t + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${t + 1}.xml"/>`).join("")}<Relationship Id="rId${i.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    ),
    n.file(
      "xl/styles.xml",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Times New Roman"/></font><font><b/><sz val="11"/><name val="Times New Roman"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDCEEED"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FF9AA5A4"/></left><right style="thin"><color rgb="FF9AA5A4"/></right><top style="thin"><color rgb="FF9AA5A4"/></top><bottom style="thin"><color rgb="FF9AA5A4"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="center" horizontal="center"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" horizontal="center"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyFont="1" applyBorder="1" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    ),
    n.generateAsync({ type: "uint8array", compression: "DEFLATE" })
  );
}
($("sciSearch").addEventListener("input", () => {
  ((sciPage = 0), renderSci());
}),
  $("sciG").addEventListener("click", (e) => {
    const t = e.target.closest("button[data-g]");
    t && ((sciG = t.dataset.g), (sciPage = 0), renderSci());
  }),
  $("sciXlIn").addEventListener("click", () => {
    ((xl.afterLoad = () => {
      (ensureCompared(), showView("sci"));
    }),
      $("xlFile").click());
  }),
  $("sciDept").addEventListener("change", () => {
    ((sciPage = 0), renderSci());
  }),
  $("sciSort").addEventListener("change", () => {
    ((sciPage = 0), renderSci());
  }),
  $("sciPageSize").addEventListener("change", (e) => {
    const n = Number(e.currentTarget.value);
    ((sciPageSize = [20, 50, 100].includes(n) ? n : 20),
      (sciPage = 0),
      renderSci());
  }),
  $("sciRankExport").addEventListener("click", () => {
    $("sciXlsx").click();
  }),
  $("sciXlsx").addEventListener("click", async (e) => {
    const t = e.currentTarget,
      a = sciRows(),
      n = Object.fromEntries(SCI_DEG),
      i = Object.fromEntries(SCI_TIT),
      o = $("sciF").querySelector('[aria-pressed="true"]'),
      l = o ? o.firstChild.textContent : "",
      s = [
        "№",
        "F.I.Sh.",
        "Lavozimi",
        "Bo'lim (Excel)",
        "Ilmiy darajasi (toifa)",
        "Ilmiy darajasi (hujjatdagi matn)",
        "Fan sohasi",
        "Ilmiy unvoni (toifa)",
        "Ilmiy unvoni (hujjatdagi matn)",
        "Boshqa lavozimi (o‘rindosh)",
        "Manba",
        "Tekshirish kerak",
        "Manba tafovuti",
      ],
      r = (e) => {
        const t = sciFilter(a.filter((t) => t.grp === e));
        return [
          s,
          ...t.map((e, t) => [
            t + 1,
            e.name,
            e.pos,
            e.dept,
            e.dk ? n[e.dk] : "",
            sciNone(e.deg) ? "" : e.deg,
            sciField(e.deg),
            e.tk ? i[e.tk] : "",
            e.tk ? e.tit : "",
            e.extra.filter(Boolean).join("; "),
            e.src,
            sciQuality(e).needsReview ? "Tekshirish kerak" : "",
            e.issues && e.issues.length ? e.issues.join("; ") : "",
          ]),
        ];
      },
      d = {
        ped: sciStats(a.filter((e) => "ped" === e.grp)),
        oth: sciStats(a.filter((e) => "oth" === e.grp)),
        all: sciStats(a),
      },
      c = (e, t) => [
        e,
        ...["ped", "oth", "all"].flatMap((e) => [
          t(d[e]),
          sciPct(t(d[e]), d[e].all),
        ]),
      ],
      p = [
        [
          "Ko‘rsatkich",
          "Professor-o'qituvchilar",
          "%",
          "Boshqa xodimlar",
          "%",
          "Jami",
          "%",
        ],
        ["Xodimlar soni", d.ped.all, 100, d.oth.all, 100, d.all.all, 100],
        c("Ilmiy darajali (jami)", (e) => e.deg),
        ...SCI_DEG.map(([e, t]) => c(t, (t) => t["d_" + e])),
        ...SCI_TIT.map(([e, t]) => c(t, (t) => t["t_" + e])),
        c("Daraja yoki unvoni bor", (e) => e.any),
        c("Tekshirish kerak", (e) => e.review),
        c("Manbalar tafovuti", (e) => e.conflicts),
        [],
        [
          `Tuzilgan: ${new Date().toLocaleDateString("ru-RU")} ${fmtTime(Date.now())}. Ro'yxat varaqlarida: ${l || "tanlangan toifa"}${$("sciDept").value ? ", bo‘lim: " + $("sciDept").value : ""}${$("sciSearch").value ? ", qidiruv: «" + $("sciSearch").value + "»" : ""}. Guruh lavozim${xl.map && void 0 !== xl.map.staff_cat ? " va Excel’dagi xodim toifasi" : ""} bo‘yicha aniqlangan.${sciExtN ? ` Tashqi o‘rindoshlar (${sciExtN} ta) hisobga olinmagan.` : ""}`,
        ],
      ],
      m = new Map();
    for (const e of a.filter((e) => "ped" === e.grp)) {
      const t = e.dept || "(bo‘lim ko‘rsatilmagan)",
        a = m.get(t) || {
          n: 0,
          deg: 0,
          dsc: 0,
          phd: 0,
          nom: 0,
          oth: 0,
          prof: 0,
          dots: 0,
        };
      (a.n++,
        ["dsc", "phd", "nomzod"].includes(e.dk) && a.deg++,
        "oth" === e.dk && a.oth++,
        "dsc" === e.dk && a.dsc++,
        "phd" === e.dk && a.phd++,
        "nomzod" === e.dk && a.nom++,
        "prof" === e.tk && a.prof++,
        "dots" === e.tk && a.dots++,
        m.set(t, a));
    }
    const u = [
      [
        "Bo'lim (kafedra)",
        "Professor-o'qituvchilar",
        "Ilmiy darajali",
        "Ulushi, %",
        "DSc",
        "PhD",
        "Fan nomzodi",
        "Boshqa/noaniq",
        "Professor",
        "Dotsent",
      ],
    ];
    [...m.entries()]
      .sort((e, t) => sciPct(t[1].deg, t[1].n) - sciPct(e[1].deg, e[1].n))
      .forEach(([e, t]) =>
        u.push([
          e,
          t.n,
          t.deg,
          sciPct(t.deg, t.n),
          t.dsc,
          t.phd,
          t.nom,
          t.oth,
          t.prof,
          t.dots,
        ]),
      );
    const h = [5, 34, 42, 30, 20, 34, 16, 18, 22, 30, 28, 24, 46],
      f = [
        {
          name: "Professor-o'qituvchilar",
          rows: r("ped"),
          widths: h,
          filter: !0,
          freeze: !0,
        },
        {
          name: "Boshqa xodimlar",
          rows: r("oth"),
          widths: h,
          filter: !0,
          freeze: !0,
        },
        { name: "Statistika", rows: p, widths: [32, 18, 8, 16, 8, 10, 8] },
      ];
    (m.size > 1 &&
      f.push({
        name: "Kafedralar kesimida",
        rows: u,
        widths: [44, 14, 13, 11, 8, 8, 12, 14, 11, 10],
        filter: !0,
        freeze: !0,
      }),
      f.push(
        (() => {
          const q = ScienceEngine.departmentRanking(a, SpravkaCore, 5),
            rows = [
              [
                "O‘rin",
                "Kafedra",
                "Professor-o‘qituvchilar",
                "Ilmiy darajali",
                "Ulushi, %",
                "DSc",
                "PhD",
                "Fan nomzodi",
                "Professor",
                "Dotsent",
                "Tekshirish kerak",
                "Tanlanma holati",
              ],
              ...q.departments.map((g) => [
                g.rank,
                g.department,
                g.staff,
                g.degreeHolders,
                g.degreeRate,
                g.dsc,
                g.phd,
                g.candidate,
                g.professors,
                g.docents,
                g.review,
                g.smallSample ? "Kam sonli (<5)" : "Yetarli",
              ]),
            ];
          rows.push(
            [],
            [
              "Metodika",
              "(DSc + PhD + fan nomzodi) / professor-o‘qituvchilar × 100%",
            ],
            [
              "Izoh",
              "Professor va dotsent unvonlari reyting foiziga kiritilmaydi.",
            ],
            ["Bo‘limi aniqlanmagan xodimlar", q.unassigned],
            ["Bo‘limi aniqlanmagan, ilmiy darajali", q.unassignedDegreeHolders],
            ["Jami professor-o‘qituvchilar", q.total],
            ["Jami ilmiy darajali", q.degreeHolders],
            ["Umumiy ulush, %", q.degreeRate],
          );
          return {
            name: "Kafedralar reytingi",
            rows,
            widths: [8, 42, 18, 15, 12, 8, 8, 14, 12, 12, 16, 18],
            filter: true,
            freeze: true,
          };
        })(),
      ),
      (t.disabled = !0));
    try {
      await save(
        t,
        $("sciInfo"),
        `Ilmiy salohiyat ${new Date().toLocaleDateString("ru-RU")}.xlsx`,
        await xlsxBuild(f),
      );
    } finally {
      t.disabled = !1;
    }
  }));
