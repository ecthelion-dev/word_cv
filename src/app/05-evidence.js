/**
 * 05-evidence.js — Dalillar toʻplami (komissiya uchun faktlar va xronologiya), 17-modda Deklaratsiya va 14-modda Xabarnoma
 */
let evF = "all",
  evLim = 30;
const EV_HEAD = (e) =>
  COI_ORGHEAD.test(e || "") || COI_UHEAD.test(e || "") || COI_DEP.test(e || "");
function evLines(e, t) {
  const a = e.P,
    n = [],
    i = new Date().getFullYear();
  (a.work || []).forEach((o, l) => {
    const s =
      /^\s*(\d{4})\s*(?:-\s*(\d{4}))?\s*(?:йй\.|yy\.|й\.|y\.|-йил\.|-yil\.|йил|yil)?\s*(ҳ\.?\s*в\.?|h\.?\s*v\.?)?/i.exec(
        o,
      );
    if (!s) return;
    const r = +s[1],
      d = !!s[3] || (!s[2] && l === a.work.length - 1);
    n.push({
      a: r,
      b: s[2] ? +s[2] : d ? i : r,
      open: d,
      txt: o.replace(WORK_PFX, "$2") || o,
      who: t,
      src: `«${e.name}» — mehnat faoliyati, ${l + 1}-qator`,
    });
  });
  const o = /(\d{4})/.exec(a.since || "");
  return (
    o &&
      a.position &&
      !n.some((e) => e.open && e.a === +o[1]) &&
      n.push({
        a: +o[1],
        b: i,
        open: !0,
        txt: a.position,
        who: t,
        src: `«${e.name}» — tepadagi lavozim satri (${a.since.replace(/:\s*$/, "")})`,
      }),
    n.sort((e, t) => e.a - t.a)
  );
}
function evCase(e) {
  const t = coiEval(e),
    a = (coiReg[e.key] || {}).d || {},
    n = e.org || coiOrg,
    i = n ? orgKeys(n) : [],
    o = (e) => !!i.length && textHasOrg(e, i),
    l = [],
    s = t.need.map((e) => e.t),
    r = [],
    d = {
      emp: `«${e.it.name}» — F.I.Sh. va lavozim`,
      rel: `«${e.it.name}» — qarindoshlar jadvali, ${e.relIdx >= 0 ? e.relIdx + 1 + "-qator" : ""}`.replace(
        /, $/,
        "",
      ),
    };
  (l.push({
    ok: !!e.F.close,
    t: `${e.rel}: ${e.relName} — ${e.F.close ? "yaqin qarindosh (O‘RQ-931, 3-modda)" : "yaqin qarindoshlar ro‘yxatiga kirmaydi"}`,
    s: d.rel,
  }),
    e.relWork &&
      l.push({
        ok: !0,
        t: `Qarindoshning ish joyi (xodim ko‘rsatgan): «${String(e.relWork).replace(/\s+/g, " ").slice(0, 140)}»`,
        s: d.rel,
      }),
    e.other &&
      l.push({
        ok: !0,
        t: "Qarindoshning o‘z ma’lumotnomasi ham yuklangan",
        s: `«${e.other.name}»`,
      }),
    null != e.relRow &&
      l.push({
        ok: !0,
        t:
          "Kadrlar bazasida bor" +
          (e.relPos ? ": " + e.relPos.slice(0, 120) : ""),
        s: `Excel «${xl.fileName || "kadrlar bazasi"}», ${e.relRow + 1}-qator`,
      }));
  for (const e of t.facts)
    /bo‘ysunish|Bir shaxs|tasdiqlan|qarorlar|shartnoma/.test(e.t) &&
      l.push({
        ok: e.ok,
        t: e.t,
        s: /mas’ul xodim/.test(e.t)
          ? "mas’ul xodim belgisi"
          : "lavozim nomlari bo‘yicha (dastur)",
      });
  const c = evLines(e.it, "emp");
  let p = e.other ? evLines(e.other, "rel") : [];
  if (!p.length && e.relHire) {
    const t = byOf(e.relHire);
    t &&
      (p = [
        {
          a: t,
          b: new Date().getFullYear(),
          open: !0,
          txt: e.relPos || e.relWork,
          who: "rel",
          src: `Excel «${xl.fileName || "kadrlar bazasi"}», ${e.relRow + 1}-qator — «Lavozimga tayinlangan sana»: ${e.relHire}`,
        },
      ]);
  }
  for (const t of c)
    r.push({
      ...t,
      at: o(t.txt) || (t.src.includes("tepadagi") && o(e.empPos)),
    });
  for (const t of p) r.push({ ...t, at: o(t.txt) || (!e.other && e.relHire) });
  r.sort((e, t) => e.a - t.a || ("emp" === e.who ? -1 : 1));
  const m = (e, t) =>
    e.filter((e) => !1 !== e.at && e.a <= t && t <= e.b).pop();
  let u = null;
  const h = r.filter((e) => "rel" === e.who && e.at)[0],
    f = r.filter((e) => "emp" === e.who && e.at)[0];
  if (h) {
    const e = m(
      r.filter((e) => "emp" === e.who && e.at),
      h.a,
    );
    e && EV_HEAD(e.txt)
      ? ((u = { y: h.a, head: "emp", role: e.txt, rel: h.txt }),
        l.unshift({
          ok: !0,
          strong: !0,
          t: `Qarindosh ${h.a}-yilda shu tashkilotga ishga kirgan («${h.txt.slice(0, 90)}»). O‘sha yili xodim shu tashkilotda rahbarlik lavozimida edi: «${e.txt.slice(0, 90)}»`,
          s: `${h.src}; ${e.src}`,
        }))
      : e
        ? l.push({
            ok: !1,
            t: `Qarindosh ${h.a}-yilda ishga kirgan; o‘sha yili xodim shu tashkilotda rahbarlik bo‘lmagan lavozimda edi`,
            s: `${h.src}; ${e.src}`,
          })
        : l.push({
            ok: !1,
            t: `Qarindosh ${h.a}-yilda ishga kirgan; o‘sha yili xodim bu tashkilotda ishlamagan (ma’lumotnomasiga ko‘ra)`,
            s: h.src,
          });
  } else
    s.push(
      "Qarindoshning shu tashkilotga ishga kirgan sanasi aniqlanmadi — ishga qabul buyrug‘i bo‘yicha aniqlang (kim imzolagan, kim tavsiya qilgan)",
    );
  if (f && !u) {
    const e = m(
      r.filter((e) => "rel" === e.who && e.at),
      f.a,
    );
    e &&
      EV_HEAD(e.txt) &&
      ((u = { y: f.a, head: "rel", role: e.txt }),
      l.unshift({
        ok: !0,
        strong: !0,
        t: `Xodim ${f.a}-yilda shu tashkilotga ishga kirgan. O‘sha yili qarindoshi shu tashkilotda rahbarlik lavozimida edi: «${e.txt.slice(0, 90)}»`,
        s: `${f.src}; ${e.src}`,
      }));
  }
  u &&
    s.push(
      `Ishga qabul buyrug‘ini kim imzolagan va ${"emp" === u.head ? "xodim" : "qarindoshi"} tanlov/qabul jarayonida ishtirok etganmi — aniqlang`,
    );
  ("actual" === t.k &&
    ("no" === a.xab
      ? l.push({
          ok: !0,
          t: "Mavjud to‘qnashuv bo‘yicha xabarnoma topshirilmagan (15-modda: bilgan kundan 1 ish kuni ichida)",
          s: "mas’ul xodim belgisi",
        })
      : "yes" === a.xab
        ? l.push({
            ok: !1,
            t: "Xabarnoma topshirilgan" + (a.xabD ? " — " + a.xabD : ""),
            s: "mas’ul xodim belgisi",
          })
        : s.push("Xabarnoma (14–15-moddalar) topshirilganmi — belgilang")),
    e.F.close &&
      "none" !== t.k &&
      "info" !== t.k &&
      ("no" === a.dek
        ? l.push({
            ok: !0,
            t: "Deklaratsiyada bu qarindosh ko‘rsatilmagan / deklaratsiya topshirilmagan (17–18-moddalar)",
            s: "mas’ul xodim belgisi",
          })
        : "yes" === a.dek
          ? l.push({
              ok: !1,
              t: "Deklaratsiyada ko‘rsatilgan" + (a.dekD ? " — " + a.dekD : ""),
              s: "mas’ul xodim belgisi",
            })
          : s.push("Deklaratsiyada bu qarindosh ko‘rsatilganmi — belgilang")));
  const g = "no" === a.xab || "no" === a.dek;
  return {
    x: e,
    e: t,
    facts: l,
    need: [...new Set(s)],
    tl: r,
    hire: u,
    nodoc: g,
    DOC_L: { yes: "topshirilgan", no: "topshirilmagan", na: "talab etilmaydi" },
  };
}
function evCases() {
  return coiRows
    .filter((e) => e.F.close)
    .map(evCase)
    .filter((e) => "none" !== e.e.k)
    .sort(
      (e, t) =>
        !!t.hire - !!e.hire ||
        t.nodoc - e.nodoc ||
        COI_K[t.e.k].n - COI_K[e.e.k].n ||
        e.x.emp.localeCompare(t.x.emp),
    );
}
async function renderEvid(e) {
  const t = $("evList");
  if (!items.some((e) => e.P))
    return ((t.textContent = ""), void ($("evMsg").textContent = ""));
  e && (($("evMsg").textContent = "Holatlar yig‘ilmoqda…"), await runCoi());
  const a = evCases(),
    n = SpravkaCore.norm(SpravkaCore.latToCyr($("evSearch").value || "")),
    i = [
      a.length,
      a.filter((e) => e.hire).length,
      a.filter((e) => e.nodoc).length,
      a.filter((e) => e.need.length).length,
    ];
  (["evN0", "evN1", "evN2", "evN3"].forEach((e, t) => {
    $(e).textContent = i[t];
  }),
    ($("nEv").textContent = i[1] || ""));
  let o = a.filter(
    (e) =>
      "all" === evF ||
      ("hire" === evF && e.hire) ||
      ("nodoc" === evF && e.nodoc) ||
      ("need" === evF && e.need.length),
  );
  (n &&
    (o = o.filter((e) =>
      SpravkaCore.norm(
        SpravkaCore.latToCyr(e.x.emp + " " + e.x.relName),
      ).includes(n),
    )),
    ($("evAll").disabled = !a.length),
    ($("evMsg").textContent = a.length
      ? `${a.length} ta holat${i[1] ? `, shundan ${i[1]} tasida qarindosh rahbarlik davrida ishga kirgan` : ""}. Har bir faktning yonida manbasi yozilgan.`
      : "Yaqin qarindoshi shu tashkilotda ishlaydigan holat topilmadi. (Manba: ma'lumotnomalardagi qarindoshlar jadvali va Excel.)"),
    (t.textContent = ""));
  for (const e of o.slice(0, evLim)) t.append(evCard(e));
  if (o.length > evLim) {
    const e = el("button", "btn2", `Yana ko'rsatish (${o.length - evLim} ta)`);
    ((e.type = "button"),
      (e.onclick = () => {
        ((evLim += 30), renderEvid());
      }),
      t.append(e));
  }
}
function evCard(e) {
  const { x: t, e: a } = e,
    n = coiRec(t);
  n.d = n.d || {};
  const i = el("article", "evc" + (e.hire ? " strong" : "")),
    o = el("div", "evh"),
    l = el("div", "evw"),
    s = el("button", "linkbtn", t.emp);
  ((s.type = "button"),
    (s.onclick = () => {
      (selectItem(t.it), showView("review"));
    }),
    l.append(el("small", "", "Xodim"), s, el("span", "", t.empPos || "—")));
  const r = el("div", "evw");
  if (
    (r.append(
      el("small", "", t.rel),
      el("b", "", t.relName),
      el("span", "", t.relPos || t.relWork || "—"),
    ),
    o.append(
      l,
      el("span", "evarr", "↔"),
      r,
      el("span", "risk " + COI_K[a.k].c, COI_K[a.k].l),
    ),
    i.append(o),
    e.hire &&
      i.append(el("p", "evkey", "● " + e.facts.find((e) => e.strong).t)),
    e.tl.length)
  ) {
    const a = el("table", "rtable evtl"),
      n = el("tr");
    (["Yil", "Kim", "Lavozim / ish joyi", "Manba"].forEach((e) =>
      n.append(el("th", "", e)),
    ),
      a.append(n));
    for (const n of e.tl) {
      const i = el(
        "tr",
        (n.at ? "at" : "out") +
          (e.hire &&
          (("rel" === n.who && n.a === e.hire.y && "emp" === e.hire.head) ||
            ("emp" === n.who && n.txt === e.hire.role))
            ? " hl"
            : ""),
      );
      (i.append(
        el(
          "td",
          "y",
          n.a === n.b ? String(n.a) : `${n.a}–${n.open ? "h.v." : n.b}`,
        ),
        el("td", "", "emp" === n.who ? "Xodim" : t.rel),
        el(
          "td",
          "",
          n.txt.slice(0, 160) + (n.at ? "" : "  (boshqa tashkilot)"),
        ),
        el("td", "src", n.src),
      ),
        a.append(i));
    }
    const o = el("div", "twrap");
    o.append(a);
    const l = el("details", "evsec");
    ((l.open = !!e.hire),
      l.append(el("summary", "", `Vaqt chizig'i (${e.tl.length})`), o),
      i.append(l));
  }
  const d = el("details", "evsec");
  ((d.open = !0),
    d.append(el("summary", "", `Faktlar va manbalar (${e.facts.length})`)));
  const c = el("ul", "evf2");
  for (const t of e.facts) {
    const e = el("li", !0 === t.ok ? "y" : !1 === t.ok ? "n" : "q");
    (e.append(
      el("i", "", !0 === t.ok ? "✓" : !1 === t.ok ? "✗" : "?"),
      el("span", "", t.t),
      el("small", "", "Manba: " + t.s),
    ),
      c.append(e));
  }
  (d.append(
    c,
    el(
      "p",
      "evleg",
      "✓ — holatni tasdiqlovchi fakt · ✗ — unga qarshi fakt · ? — aniqlanmagan",
    ),
  ),
    i.append(d));
  const p = el("div", "evdocs"),
    m = (e, t, a) => {
      const i = el("label");
      i.append(el("span", "", e));
      const o = el("select");
      ([
        ["", "aniqlanmagan"],
        ["yes", "topshirilgan"],
        ["no", "topshirilmagan"],
        ["na", "talab etilmaydi"],
      ].forEach(([e, t]) =>
        o.append(Object.assign(el("option", "", t), { value: e })),
      ),
        (o.value = n.d[t] || ""),
        (o.onchange = () => {
          ((n.d[t] = o.value), coiSave(), renderEvid());
        }));
      const l = el("input");
      return (
        (l.type = "date"),
        (l.value = n.d[a] || ""),
        (l.title = "Topshirilgan sana"),
        (l.hidden = "yes" !== n.d[t]),
        (l.onchange = () => {
          ((n.d[a] = l.value), coiSave());
        }),
        i.append(o, l),
        i
      );
    };
  if (
    ("actual" === a.k && p.append(m("Xabarnoma (15-modda)", "xab", "xabD")),
    p.append(m("Deklaratsiya (17–18-moddalar)", "dek", "dekD")),
    i.append(p),
    e.need.length)
  ) {
    const t = el("div", "evneed");
    t.append(el("b", "", "Aniqlanishi kerak:"));
    const a = el("ul");
    (e.need.forEach((e) => a.append(el("li", "", e))),
      t.append(a),
      i.append(t));
  }
  if (a.arts.length) {
    const e = el("p", "evarts");
    (e.append(
      el("b", "", "Faktlar tasdiqlansa — tegishli normalar: "),
      a.arts
        .filter((e) => "3-modda" !== e.a)
        .map((e) => e.a)
        .join(", ") || "—",
    ),
      i.append(e));
  }
  const u = el("div", "acts"),
    h = el("button", "btn2", "Dalillar varag'i (Word)");
  ((h.type = "button"),
    (h.onclick = async () => {
      h.disabled = !0;
      try {
        await save(h, $("evMsg"), evName(e), await DX.docx(evBody(e)));
      } finally {
        h.disabled = !1;
      }
    }));
  const f = el("button", "linkbtn", "Manfaatlar to'qnashuvi bo'limida ochish");
  return (
    (f.type = "button"),
    (f.onclick = () => showView("coi")),
    u.append(h, f),
    i.append(u),
    i
  );
}
const evName = (e) =>
  `Dalillar — ${e.x.emp} va ${e.x.relName}.docx`.replace(/[\\/:*?"<>|]/g, "");
function evBody(e) {
  const { x: t, e: a } = e,
    n = !!t.it.P.S.latin,
    i = (e) => (n ? e : SpravkaCore.latToCyr(e)),
    o = new Date(),
    l = coiRec(t).d || {},
    s = (e, t) => [e.map(i), ...t];
  return [
    DX.p(i("Manfaatlar to'qnashuvi holati bo'yicha"), {
      b: !0,
      c: !0,
      a: 0,
      s: 28,
    }),
    DX.p(i("DALILLAR VARAG'I"), { b: !0, c: !0, s: 28, a: 60 }),
    DX.p(i("(faktlar va ularning manbalari jamlanmasi — xulosa emas)"), {
      i: !0,
      c: !0,
      s: 20,
      a: 200,
    }),
    DX.p(
      i("Tuzilgan sana: ") +
        `${o.toLocaleDateString("ru-RU")}` +
        (coiOrg ? i(". Tashkilot: ") + coiOrg : ""),
      { s: 22 },
    ),
    DX.p(i("1. Shaxslar"), { b: !0, bf: 120 }),
    DX.tbl(
      [1500, 2900, 3330, 1900],
      s(
        ["Kim", "F.I.Sh.", "Lavozimi / ish joyi", "Manba"],
        [
          [
            i("Xodim"),
            t.emp,
            (t.empPos || "").replace(/\s+/g, " "),
            `«${t.it.name}»`,
          ],
          [
            t.rel,
            t.relName,
            (t.relPos || t.relWork || "").replace(/\s+/g, " "),
            null != t.relRow
              ? `Excel, ${t.relRow + 1}-${i("qator")}`
              : `«${t.it.name}»`,
          ],
        ],
      ),
    ),
    DX.p(i("2. Vaqt chizig'i (mehnat faoliyati)"), { b: !0, bf: 200 }),
    e.tl.length
      ? DX.tbl(
          [1100, 1500, 4430, 2600],
          s(
            ["Yil", "Kim", "Lavozim / ish joyi", "Manba"],
            e.tl.map((e) => [
              e.a === e.b ? String(e.a) : `${e.a}–${e.open ? i("h.v.") : e.b}`,
              "emp" === e.who ? i("Xodim") : t.rel,
              e.txt + (e.at ? "" : i(" (boshqa tashkilot)")),
              e.src,
            ]),
          ),
        )
      : DX.p(i("Ma’lumot yo‘q."), { i: !0 }),
    DX.p(i("3. Aniqlangan faktlar"), { b: !0, bf: 200 }),
    DX.tbl(
      [500, 5830, 3300],
      s(
        ["", "Fakt", "Manba"],
        e.facts.map((e) => [
          !0 === e.ok ? "✓" : !1 === e.ok ? "✗" : "?",
          i(e.t),
          i(e.s),
        ]),
      ),
    ),
    DX.p(
      i(
        "✓ — holatni tasdiqlovchi fakt; ✗ — unga qarshi (oqlovchi) fakt; ? — aniqlanmagan.",
      ),
      { i: !0, s: 18, bf: 60 },
    ),
    DX.p(i("4. Hujjatlar holati"), { b: !0, bf: 200 }),
    DX.p(
      i("Xabarnoma (14–15-moddalar): ") +
        i(e.DOC_L[l.xab] || "aniqlanmagan") +
        (l.xabD ? ` (${l.xabD})` : ""),
    ),
    DX.p(
      i("Deklaratsiya (17–18-moddalar): ") +
        i(e.DOC_L[l.dek] || "aniqlanmagan") +
        (l.dekD ? ` (${l.dekD})` : ""),
    ),
    DX.p(i("5. Aniqlanishi kerak"), { b: !0, bf: 200 }),
    ...(e.need.length
      ? e.need.map((e, t) => DX.p(`${t + 1}. ${i(e)}`))
      : [DX.p(i("—"))]),
    DX.p(
      i("6. Faktlar tasdiqlansa — tegishli bo‘lishi mumkin bo‘lgan normalar"),
      { b: !0, bf: 200 },
    ),
    ...a.arts.map((e) => DX.p(`${i(e.a)} — ${i(e.t)}`, { j: !0 })),
    DX.p(
      i(
        "Izoh: varaq dastur yordamida ma'lumotnomalar va kadrlar bazasidan avtomatik jamlangan. Faktlar asl hujjatlar (buyruqlar, shaxsiy ish) bilan tekshirilishi kerak. Qonunbuzarlik bor-yo'qligi to'g'risidagi qaror maxsus bo'linma, odob-axloq komissiyasi yoki vakolatli organ tomonidan qabul qilinadi.",
      ),
      { i: !0, s: 20, bf: 240, j: !0 },
    ),
    DX.p(
      i("Tuzdi: ") + "______________________   " + i("Imzo: ") + "__________",
      { bf: 240 },
    ),
  ].join("");
}
($("evFilt").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-e]");
  t &&
    ((evF = t.dataset.e),
    (evLim = 30),
    $("evFilt")
      .querySelectorAll("button")
      .forEach((e) => e.setAttribute("aria-pressed", String(e === t))),
    renderEvid());
}),
  $("evSearch").addEventListener("input", () => {
    ((evLim = 30), renderEvid());
  }),
  $("evAll").addEventListener("click", async (e) => {
    const t = e.currentTarget,
      a = evCases();
    if (a.length) {
      t.disabled = !0;
      try {
        const e = new JSZip(),
          n = new Set();
        for (const t of a) {
          let a = evName(t),
            i = 2;
          for (; n.has(a);) a = evName(t).replace(/\.docx$/, ` (${i++}).docx`);
          (n.add(a), e.file(a, await DX.docx(evBody(t))));
        }
        await save(
          t,
          $("evMsg"),
          "Dalillar_toplami.zip",
          await e.generateAsync({ type: "uint8array", compression: "DEFLATE" }),
        );
      } finally {
        t.disabled = !1;
      }
    }
  }));
const declName = (e) =>
  `Deklaratsiya — ${(e.P.name || e.name).replace(/[\\/:*?"<>|]/g, "")}.docx`;
async function declOne(e, t, a) {
  if (e && e.P) {
    t && (t.disabled = !0);
    try {
      await save(
        t || $("coiCsv"),
        a || $("coiMsg"),
        declName(e),
        await DX.docx(declBody(e)),
      );
    } finally {
      t && (t.disabled = !1);
    }
  }
}
async function declAll(e) {
  const t = items.filter((e) => e.P && !e.excluded && (e.P.name || "").trim());
  if (!t.length)
    return void ($("coiMsg").textContent = "Avval ma'lumotnomalarni yuklang.");
  e.disabled = !0;
  const a = $("coiMsg");
  try {
    const n = new JSZip(),
      i = new Set();
    let o = 0;
    for (const e of t) {
      let l = declName(e),
        s = l.replace(/\.docx$/, ""),
        r = 2;
      for (; i.has(l.toLowerCase());) l = `${s} (${r++}).docx`;
      (i.add(l.toLowerCase()),
        n.file(
          (e.folder ? e.folder.replace(/[\\:*?"<>|]/g, "") + "/" : "") + l,
          await DX.docx(declBody(e)),
        ),
        ++o % 25 == 0 &&
          ((a.className = "msg"),
          (a.textContent = `Deklaratsiyalar tayyorlanmoqda: ${o} / ${t.length}`),
          await new Promise((e) => setTimeout(e, 0))));
    }
    const l = await n.generateAsync({
      type: "uint8array",
      compression: "STORE",
    });
    (await save(e, a, "Deklaratsiyalar (17-modda).zip", l)) &&
      toast(`${t.length} ta deklaratsiya loyihasi yuklab olindi ✓`);
  } finally {
    e.disabled = !1;
  }
}
async function coiNotice(e, t) {
  const a = e.it.P.S.latin,
    n = (e) => (a ? e : SpravkaCore.latToCyr(e)),
    i = coiRec(e),
    o = (e, t = {}) => {
      return `<w:p><w:pPr>${t.c ? '<w:jc w:val="center"/>' : ""}<w:spacing w:after="${null == t.a ? 120 : t.a}"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${t.b ? "<w:b/>" : ""}${t.i ? "<w:i/>" : ""}<w:sz w:val="${t.s || 24}"/></w:rPr><w:t xml:space="preserve">${
        ((a = e),
        String(a || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;"))
      }</w:t></w:r></w:p>`;
      var a;
    },
    l = "________________________",
    s = [
      o(
        n(
          "LOYIHA — Korrupsiyaga qarshi kurashish agentligi tasdiqlagan namunaviy shakl bo'yicha rasmiylashtiring",
        ),
        { i: !0, s: 20, c: !0 },
      ),
      o(n("Mavjud manfaatlar to'qnashuvi to'g'risida"), {
        b: !0,
        c: !0,
        a: 0,
        s: 28,
      }),
      o(n("XABARNOMA"), { b: !0, c: !0, s: 28 }),
      o(
        n(
          "(«Manfaatlar to'qnashuvi to'g'risida»gi O'RQ-931-son Qonunning 14, 15-moddalari)",
        ),
        { i: !0, c: !0, s: 20, a: 240 },
      ),
      o(n("1. Xodim haqida ma’lumot"), { b: !0 }),
      o(n("F.I.Sh.: ") + e.emp),
      o(n("Lavozimi: ") + (e.empPos || l)),
      o(n("JShShIR: ") + l),
      o(n("2. Yaqin qarindosh (aloqador shaxs) haqida ma’lumot"), { b: !0 }),
      o(n("Qarindoshligi: ") + e.rel),
      o(n("F.I.Sh.: ") + e.relName),
      o(n("Tug‘ilgan yili: ") + (e.relBirth || l)),
      o(
        n("Ish joyi va lavozimi: ") +
          ([e.relWork, e.relPos && e.relPos !== e.relWork ? e.relPos : ""]
            .filter(Boolean)
            .join("; ") || l),
      ),
      o(n("3. Manfaatlar to‘qnashuvi haqida ma’lumot"), { b: !0 }),
      o(
        n(
          coiEval(e)
            .reasons.map((e) => e[0].toUpperCase() + e.slice(1))
            .join(". ") + ".",
        ),
      ),
      o(
        n("Huquqiy asos: Qonunning ") +
          coiEval(e)
            .arts.filter((e) => "3-modda" !== e.a)
            .map((e) => e.a)
            .join(", ") +
          ".",
        { i: !0, s: 22 },
      ),
      o(n("4. Ko‘rilgan (taklif etilayotgan) choralar"), { b: !0 }),
      o("measures" === i.st && i.note ? n(i.note) : l + l),
      o(l + l),
      o(""),
      o(n("Sana: ") + "«____» ____________ 20____ " + n("y.")),
      o(n("Xodim imzosi: ") + l),
      o(n("Bevosita rahbar imzosi: ") + l),
    ].join(""),
    r = new JSZip();
  (r.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  ),
    r.file(
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    r.file(
      "word/document.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${s}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="850" w:bottom="1134" w:left="1418" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    ),
    (t.disabled = !0));
  try {
    await save(
      t,
      $("coiMsg"),
      `Xabarnoma (loyiha) — ${e.emp.replace(/[\\/:*?"<>|]/g, "")}.docx`,
      await r.generateAsync({ type: "uint8array" }),
    );
  } finally {
    t.disabled = !1;
  }
}
function coiCsv() {
  const t = [
    [
      "№",
      "Xodim",
      "Xodimning lavozimi",
      "Qarindoshligi",
      "Qarindoshning F.I.Sh.",
      "Qarindoshning ish joyi (ma’lumotnomada)",
      "Qarindoshning lavozimi (ro‘yxatda)",
      "Aniqlangan faktlar",
      "Aniqlanmagan faktlar",
      "Baho",
      "Huquqiy asos (moddalar va sabab)",
      "Manba",
      "Holat",
      "Chora / izoh",
      "Holat sanasi",
    ],
  ];
  return (
    coiRows.forEach((e, a) => {
      const n = coiReg[e.key] || {},
        i = coiEval(e);
      t.push([
        a + 1,
        e.emp,
        e.empPos,
        e.rel,
        e.relName,
        e.relWork,
        e.relPos,
        i.facts
          .map((e) => (!0 === e.ok ? "✓ " : !1 === e.ok ? "✗ " : "? ") + e.t)
          .join("\n"),
        i.need.map((e) => e.t).join("\n"),
        COI_K[i.k].l,
        i.arts.map((e) => e.a + " — " + e.t).join("\n"),
        e.evid,
        COI_ST[n.st || "new"],
        n.note || "",
        n.date || "",
      ]);
    }),
    t
  );
}
function createFromExcel(e, t) {
  const a = xl.rows[e],
    n = SpravkaCore.blankData(t);
  n.name = toScript(rowName(a), t);
  const i = diffRow(n, a),
    o = {
      file: { name: n.name + ".docx" },
      name: n.name + " (Excel)",
      state: "warn",
      P: n,
      warnings: [],
      reasons: [],
      fromExcel: !0,
      xlChanges: i,
      xlRow: e,
    };
  return (
    (o.li = el("tr", "item")),
    (o.fi = el("li")),
    items.push(o),
    list.prepend(o.li),
    flist.prepend(o.fi),
    applyChanges(o, i),
    (n.work = n.work.filter((e) => e)),
    (o.reasons = reviewReasons(n)),
    (o.state = o.reasons.length ? "warn" : "ok"),
    (o.warnings = [
      "Excel'dan yaratildi: mehnat faoliyati, qarindoshlar va rasm qo'lda to'ldirilishi kerak.",
    ]),
    (xl.unmatched = xl.unmatched.filter((t) => t !== e)),
    renderCard(o),
    updateStats(),
    o
  );
}
function excelBlock(e) {
  if (!e.xlStatus && !e.xlApplied) return null;
  const t = el("div");
  if (void 0 !== e.xlRow && xl.rows[e.xlRow]) {
    const a = xl.rows[e.xlRow],
      n = (e) =>
        void 0 !== xl.map[e]
          ? String(a[xl.map[e]] || "")
              .trim()
              .replace(/\s+/g, " ")
          : "",
      i = el("div", "facts");
    i.append(fact("Excel'da", rowName(a)));
    const o = [n("org"), n("dept"), n("position")].filter(Boolean).join(" · ");
    (o && i.append(fact("Lavozim", o)),
      n("since_date") && i.append(fact("Tayinlangan", n("since_date"))),
      t.append(i));
  }
  if ("notfound" === e.xlStatus) {
    t.append(
      el(
        "p",
        "msg",
        "Excel'da avtomatik topilmadi. Familiyani yozib, Excel'dagi xodimni o'zingiz tanlang:",
      ),
    );
    const a = el("input");
    ((a.type = "search"),
      (a.placeholder = "Familiya yoki ism…"),
      (a.className = "xlpick"),
      (a.autocomplete = "off"),
      (a.value = ((e.P && e.P.name) || "").split(/\s+/)[0] || ""));
    const n = el("div", "newlist"),
      i = () => {
        if (((n.textContent = ""), !a.value.trim())) return;
        const t = xl.unmatched;
        xl.unmatched = xl.rows
          .map((e, t) => t)
          .filter((t) => !items.some((a) => a !== e && a.xlRow === t));
        const i = searchRows(a.value);
        if (((xl.unmatched = t), i.length))
          for (const t of i.slice(0, 6)) {
            const a = el("div"),
              i = el("button", "btn2", "Shu xodim");
            ((i.type = "button"),
              i.addEventListener("click", () => {
                ((e.xlManual = t),
                  (e.xlManualName = rowName(xl.rows[t])),
                  (e.xlRow = t),
                  (e.xlFuzzy = !1),
                  (e.xlChanges = diffRow(e.P, xl.rows[t])),
                  (e.xlStatus = e.xlChanges.length ? "changed" : "same"),
                  xl.used && xl.used.add(t),
                  calcUnmatched(),
                  drawNew(),
                  renderCard(e),
                  updateStats(),
                  toast("Excel'dagi xodim bog'landi"));
              }),
              a.append(el("b", "", rowName(xl.rows[t])), i),
              n.append(a));
          }
        else n.append(el("p", "msg", "Hech kim topilmadi."));
      };
    let o;
    return (
      a.addEventListener("input", () => {
        (clearTimeout(o), (o = setTimeout(i, 120)));
      }),
      t.append(a, n),
      i(),
      t
    );
  }
  if (e.xlApplied && (!e.xlChanges || !e.xlChanges.length))
    return (
      t.append(
        el("p", "msg", `Excel'dan ${e.xlApplied} ta o'zgarish qo'llandi.`),
      ),
      t
    );
  if (!e.xlChanges || !e.xlChanges.length)
    return (t.append(el("p", "msg", "Excel bilan bir xil.")), t);
  const a = el("details", "more");
  ((a.open = !0),
    a.append(
      el(
        "summary",
        "",
        `Excel: ${e.xlChanges.length} ta o'zgarish${e.xlFuzzy ? " (ism taxminan mos keldi — tekshiring)" : ""}`,
      ),
    ));
  const n = el("table", "diff"),
    i = el("tr");
  (["", "Maydon", "Hozir", "Excel bo‘yicha"].forEach((e) =>
    i.append(el("th", "", e)),
  ),
    n.append(i));
  for (const t of e.xlChanges) {
    const e = el("tr"),
      a = el("input");
    ((a.type = "checkbox"),
      (a.checked = t.on),
      a.addEventListener("change", () => {
        t.on = a.checked;
      }));
    const i = el("td");
    (i.append(a),
      e.append(
        i,
        el("td", "", t.label),
        el("td", "old", t.old || "—"),
        el("td", "new", t.val),
      ),
      n.append(e));
  }
  const o = el("button", "btn2", "Belgilanganlarni qo'llash");
  return (
    (o.type = "button"),
    o.addEventListener("click", () =>
      applyChanges(
        e,
        e.xlChanges.filter((e) => e.on),
      ),
    ),
    a.append(n, o),
    t.append(a),
    t
  );
}
function reportCsv() {
  const t = [
    [
      "№",
      "Papka",
      "Fayl",
      "F.I.Sh.",
      "Holat",
      "Sabab",
      "Excel",
      "Eslatmalar soni",
      "Eslatmalar",
    ],
  ];
  return (
    items.forEach((e, a) =>
      t.push([
        a + 1,
        e.folder || "",
        e.name,
        e.P ? e.P.name : "",
        "ok" === e.state
          ? "Tayyor"
          : "warn" === e.state
            ? "Tekshirish kerak"
            : "err" === e.state
              ? "Xato"
              : "Navbatda",
        e.reasons.map(reasonTxt).join("; "),
        e.fromExcel
          ? "Excel'dan yaratildi"
          : "notfound" === e.xlStatus
            ? "Excel'da yo'q"
            : e.xlApplied
              ? `${e.xlApplied} ta o'zgarish qo'llandi` +
                (e.xlChanges && e.xlChanges.length
                  ? `, ${e.xlChanges.length} ta qo'llanmagan`
                  : "")
              : e.xlChanges && e.xlChanges.length
                ? `${e.xlChanges.length} ta o'zgarish qo'llanmagan`
                : "same" === e.xlStatus
                  ? "Bir xil"
                  : "",
        e.warnings.length,
        e.warnings.join(" | "),
      ]),
    ),
    t
  );
}
