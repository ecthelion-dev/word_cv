/**
 * 08-tools.js — Excel avto-qoʻllash, Takrorlarni aniqlash, Ommaviy tuzatish (Bulk Edit) va Boʻsh maydonlar jadvali
 */
function noteManual(e, t, a) {
  if (!t || !a) return;
  const n = e.manualKeys || (e.manualKeys = new Set());
  for (const e of ["name", "since", "position"])
    (t[e] || "") !== (a[e] || "") && n.add(e);
  for (const e of new Set([
    ...Object.keys(t.fields || {}),
    ...Object.keys(a.fields || {}),
  ]))
    ((t.fields || {})[e] || "") !== ((a.fields || {})[e] || "") && n.add(e);
}
function niceName(e) {
  return String(e || "")
    .split(/(\s+)/)
    .map((e) =>
      /\S/.test(e) && e === e.toUpperCase() && e.length > 1 && /\p{L}/u.test(e)
        ? e
            .toLowerCase()
            .replace(/(^|[-‘’'ʻ])(\p{L})/gu, (e, t, a) => t + a.toUpperCase())
        : e,
    )
    .join("")
    .trim();
}
function applyPrimary(e, t, a) {
  const n = e.P,
    i = n.S.latin,
    o = e.manualKeys || new Set(),
    l = [],
    s = new Set(["grad_year", "specialty", "awards", "deputy"]),
    r = (e.xlChanges || []).filter((e) => {
      return !(
        "field" !== e.kind ||
        o.has(e.key) ||
        (s.has(e.key) &&
          ((t = n.fields[e.key]),
          String(t || "").trim() &&
            !/^(?:йўқ|yo‘q|\?+)$/i.test(String(t).trim())))
      );
      var t;
    });
  for (const e of r)
    l.push(
      e.label +
        (e.old
          ? ` («${String(e.old).slice(0, 40)}» → «${String(e.val).slice(0, 40)}»)`
          : ""),
    );
  if (
    (r.length && applyChanges(e, r, !0),
    a >= 0.97 && !o.has("name") && xl.rows[t])
  ) {
    const e = niceName(toScript(rowName(xl.rows[t]), i)),
      a = (e) =>
        String(e || "")
          .trim()
          .split(/\s+/).length;
    e &&
      n.name &&
      a(e) >= a(n.name) &&
      SpravkaCore.norm(e) !== SpravkaCore.norm(n.name) &&
      (l.push(`F.I.Sh. («${n.name}» → «${e}»)`), (n.name = e));
  }
  return l.length
    ? ((e.warnings = (e.warnings || []).filter(
        (e) => !/^Excel'dan olindi:/.test(e),
      )),
      e.warnings.push("Excel'dan olindi: " + l.join(", ")),
      (e.reasons = reviewReasons(n)),
      e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
      renderCard(e),
      l.length)
    : 0;
}
(["pointerdown", "keydown", "wheel", "touchstart", "dragover"].forEach((e) =>
  document.addEventListener(
    e,
    () => {
      shared.cd || idleReset();
    },
    { passive: !0, capture: !0 },
  ),
),
  $("idleStay").addEventListener("click", idleCancel),
  $("idleBkp").addEventListener("click", async (e) => {
    (clearInterval(shared.cd), (shared.cd = null));
    try {
      await backupExport(e.currentTarget);
    } finally {
      sharedWipe();
    }
  }),
  $("sharedPc").addEventListener("change", () => {
    ((shared.on = $("sharedPc").checked),
      kvPut("sharedPc", shared.on),
      idleReset(),
      toast(
        shared.on
          ? "30 daqiqa ishlatilmasa, ish avtomatik tozalanadi"
          : "Umumiy kompyuter rejimi o‘chirildi",
      ));
  }),
  setInterval(idleTick, 15e3),
  (async () => {
    ((shared.on = !!(await kvGet("sharedPc"))),
      ($("sharedPc").checked = shared.on));
    const e = await dbGet("meta", "info");
    if (!e || !e.n || items.length) return;
    if (shared.on && Date.now() - (e.ts || 0) > 18e5) {
      await store.clear();
      try {
        await idb("del");
      } catch (e) {}
      return void toast(
        "Umumiy kompyuter rejimi: oldingi ish 30 daqiqadan oldin qolgan edi — o'chirildi",
      );
    }
    store.pending = !0;
    const t = new Date(e.ts || Date.now());
    (($("restoreTxt").textContent =
      `${e.n} ta ma'lumotnoma${e.approved ? `, ${e.approved} tasi tasdiqlangan` : ""} — oxirgi o'zgarish: ${t.toLocaleDateString("ru-RU")} ${t.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}. Shu ishni davom ettirasizmi?`),
      ($("restore").hidden = !1));
  })());
const KEEP_DOC = new Set(["grad_year", "specialty", "awards", "deputy"]);
function nameSpellBetter(e, t) {
  const a = (e) =>
    SpravkaCore.latToCyr(String(e || ""))
      .toLowerCase()
      .replace(/ў/g, "у")
      .replace(/ғ/g, "г")
      .replace(/қ/g, "к")
      .replace(/ҳ/g, "х")
      .replace(/[ёэ]/g, "е")
      .replace(/[ъ‘’'`ʻ]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  if (a(e) !== a(t)) return 0;
  const n = (e) =>
    (SpravkaCore.latToCyr(String(e || "")).match(/[ЎўҒғҚқҲҳЁёЭэЪъ]/g) || [])
      .length;
  return n(t) > n(e) ? 1 : -1;
}
function proposeName(e, t, a) {
  const n = e.P,
    i = e.manualKeys || new Set();
  if (!(a >= 0.97) || i.has("name") || !xl.rows[t]) return;
  const o = niceName(toScript(rowName(xl.rows[t]), n.S.latin)),
    l = (e) =>
      String(e || "")
        .trim()
        .split(/\s+/).length,
    s = o && n.name ? nameSpellBetter(n.name, o) : 0;
  -1 !== s &&
    o &&
    n.name &&
    l(o) >= l(n.name) &&
    (1 === s || SpravkaCore.norm(o) !== SpravkaCore.norm(n.name)) &&
    o !== n.name &&
    e.xlChanges.unshift({
      spell: 1 === s,
      kind: "name",
      key: "name",
      label: n.S.latin ? "F.I.Sh." : "Ф.И.Ш.",
      old: n.name,
      val: o,
      on: !0,
    });
}
function xlAutoApply(e, t) {
  if (!e.xlChanges || !e.xlChanges.length || e.xlFuzzy) return 0;
  const a = e.manualKeys || new Set(),
    n = $("xlPrimary").checked,
    i = e.xlChanges.filter(
      (t) =>
        !a.has(t.key) &&
        (n
          ? "field" === t.kind ||
            ("name" === t.kind && (t.spell || !e.xlManualName)) ||
            ("position" === t.kind && t.minor)
          : t.auto || ("name" === t.kind && t.spell && !e.xlManualName)),
    );
  if (!i.length) return 0;
  if (t) for (const [a, n] of undoSnap([e])) t.set(a, n);
  return (
    applyChanges(
      e,
      i,
      !0,
      n ? "Avtomatik: Excel bo'yicha" : "Avtomatik: Excel'da to'liqroq",
    ),
    (e.reasons = reviewReasons(e.P)),
    e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
    store.dirty.add(e),
    i.length
  );
}
function setDefaults(e) {
  const t = $("xlPrimary").checked,
    a = e.manualKeys || new Set();
  if (e.xlFuzzy) for (const t of e.xlChanges || []) t.on = !1;
  else
    for (const n of e.xlChanges || []) {
      if ("name" === n.kind) {
        n.on = t && !e.xlManualName;
        continue;
      }
      const i = isEmptyV("position" === n.kind ? e.P.position : n.old);
      n.on = !!i || (t && !a.has(n.key) && !KEEP_DOC.has(n.key));
    }
}
let confF = "all",
  confQ = "",
  confLim = 100,
  fzLim = 30;
function fuzzyConfirm(e, t) {
  if (t) {
    ((e.xlManual = e.xlRow),
      (e.xlManualName = rowName(xl.rows[e.xlRow])),
      (e.xlFuzzy = !1),
      hist(
        e,
        "Excel",
        "Excel'dagi xodim",
        "",
        `tasdiqlandi: ${e.xlManualName}`,
      ),
      (e.xlChanges = diffRow(e.P, xl.rows[e.xlRow])),
      proposeName(e, e.xlRow, 2),
      setDefaults(e));
    const t = new Map(),
      a = xlAutoApply(e, t);
    (a && pushUndo(`${e.P.name}: Excel bo'yicha (${a} ta)`, t),
      (e.xlStatus = e.xlChanges.length ? "changed" : "same"));
  } else
    ((e.xlReject = e.xlReject || []).push(rowName(xl.rows[e.xlRow])),
      hist(
        e,
        "Excel",
        "Excel'dagi xodim",
        rowName(xl.rows[e.xlRow]),
        "boshqa odam deb rad etildi",
      ),
      (e.xlRow = void 0),
      (e.xlFuzzy = !1),
      (e.xlChanges = null),
      (e.xlStatus = "notfound"));
  (store.dirty.add(e), store.schedule(), renderCard(e));
}
function fuzzyBlock(e) {
  const t = items.filter(
    (e) =>
      e.P &&
      !e.excluded &&
      !e.fromExcel &&
      e.xlFuzzy &&
      void 0 !== e.xlRow &&
      xl.rows[e.xlRow],
  );
  if (!t.length) return 0;
  const a = el("div", "xc-fuzzy");
  (a.append(
    el(
      "h4",
      "",
      `Ism taxminan mos — ${t.length} ta. Avval to'g'ri odam ekanini tasdiqlang`,
    ),
  ),
    a.append(
      el(
        "p",
        "msg",
        "Bu xodimlarning ismi Excel'da biroz boshqacha yozilgan. Noto'g'ri bog'lansa, boshqa odamning ma'lumoti yozilib qoladi — shuning uchun ularning farqlari tasdiqlamaguningizcha belgilanmaydi. «Boshqa odam» — bog'lanish uziladi, xodim «Excel'da yo'q» ro'yxatiga o'tadi (kartochkada boshqasini tanlash mumkin).",
      ),
    ));
  const n = (e, t) =>
      void 0 !== xl.map[t]
        ? String(e[xl.map[t]] || "")
            .trim()
            .replace(/\s+/g, " ")
        : "",
    i = el("div", "twrap"),
    o = el("table", "rtable xct"),
    l = el("tbody"),
    s = el("tr");
  ["Ma'lumotnomada", "Excel'da", "Tekshirish uchun", ""].forEach((e) =>
    s.append(el("th", "", e)),
  );
  const r = el("thead");
  r.append(s);
  const d = (e) => {
    const t = parseDate(e);
    return t && t.y ? (t.d ? `${p2(t.d)}.${p2(t.m)}.${t.y}` : String(t.y)) : "";
  };
  for (const e of t.slice(0, fzLim)) {
    const t = xl.rows[e.xlRow],
      a = el("tr"),
      i = el("button", "xc-name", e.P.name || e.name);
    ((i.type = "button"),
      (i.onclick = () => {
        (selectItem(e), showView("review"));
      }));
    const o = el("td");
    o.append(i);
    const s = el("td");
    s.append(el("b", "", rowName(t)));
    const r = d(e.P.fields.birth_date),
      c = d(n(t, "birth_date")),
      p = [];
    (r || c) &&
      p.push(
        `tug'ilgan: ${r || "—"} / ${c || "—"}${r && c ? (r === c ? " ✓" : r.slice(-4) === c.slice(-4) ? " (yili bir xil)" : " ✗ farq") : ""}`,
      );
    const m = [n(t, "dept"), n(t, "position")].filter(Boolean).join(" · ");
    m && p.push("Excel'da: " + (m.length > 90 ? m.slice(0, 90) + "…" : m));
    const u = el("td", "xc-old", p.join(" — ")),
      h = el("td", "xc-acts"),
      f = el("button", "btn2", "To'g'ri");
    ((f.type = "button"),
      (f.onclick = () => {
        (fuzzyConfirm(e, !0), updateStats(), renderConf());
      }));
    const g = el("button", "btn2 danger", "Boshqa odam");
    ((g.type = "button"),
      (g.onclick = () => {
        (fuzzyConfirm(e, !1),
          calcUnmatched(),
          drawNew(),
          updateStats(),
          renderConf());
      }),
      h.append(f, g),
      a.append(o, s, u, h),
      l.append(a));
  }
  (o.append(r, l), i.append(o), a.append(i));
  const c = el("div", "xc-foot"),
    p = t.filter((e) => {
      const t = xl.rows[e.xlRow],
        a = d(e.P.fields.birth_date),
        i = d(n(t, "birth_date"));
      return a && i && a === i;
    });
  if (p.length) {
    const e = el(
      "button",
      "btn2",
      `Tug'ilgan sanasi bir xil bo'lganlarni tasdiqlash (${p.length})`,
    );
    ((e.type = "button"),
      (e.onclick = () => {
        (p.forEach((e) => fuzzyConfirm(e, !0)),
          updateStats(),
          renderConf(),
          toast(`${p.length} ta xodim tasdiqlandi`));
      }),
      c.append(e));
  }
  if (t.length > fzLim) {
    const e = el("button", "btn2", `Yana ko'rsatish (${t.length - fzLim} ta)`);
    ((e.type = "button"),
      (e.onclick = () => {
        ((fzLim += 50), renderConf());
      }),
      c.append(e));
  }
  return (c.childNodes.length && a.append(c), e.append(a), t.length);
}
function confRows() {
  const e = [];
  for (const t of items)
    if (t.P && !t.excluded && t.xlChanges && !t.xlFuzzy)
      for (const a of t.xlChanges) e.push([t, a]);
  return e;
}
const confKind = (e, t) =>
  isEmptyV("position" === t.kind ? e.P.position : t.old) ? "fill" : "diff";
function renderConf() {
  const e = $("xlConf");
  if (!e) return;
  if (!xl.ran || !xl.rows.length) return void (e.hidden = !0);
  ((e.hidden = !1), (e.textContent = ""));
  const t = confRows(),
    a = t.filter(([e, t]) => "fill" === confKind(e, t)).length,
    n = t.length - a,
    i = el("div", "xc-head"),
    o = $("xlPrimary").checked;
  (i.append(
    el(
      "h3",
      "",
      o
        ? "Lavozim va bo'limdagi nomutanosiblik"
        : "Excel bilan farqlar — tasdiqlang",
    ),
  ),
    i.append(
      el(
        "p",
        "msg",
        o
          ? "Qolgan farqlar Excel bo'yicha avtomatik tuzatildi. Bu yerda faqat lavozim, bo'lim yoki tayinlangan sanasi Excel'dan farq qiladiganlar — qaysi biri to'g'ri ekanini tekshiring. Belgilangan qatorlar «Qo'llash» bosilganda Excel'dagidek qilinadi. Xodim nomini bossangiz, uning ma'lumotnomasi ochiladi."
          : "Ma'lumotnomalar o'zi o'zgarmaydi. Belgilangan qatorlar «Qo'llash» bosilgandan keyingina ma'lumotnomaga yoziladi. Xodim nomini bossangiz, uning ma'lumotnomasi ochiladi.",
      ),
    ));
  const l = el("button", "btn2", "");
  ((l.type = "button"),
    (l.id = "xcUndo"),
    (l.onclick = undoLast),
    i.append(l),
    e.append(i),
    syncUndo());
  const s = XL_FIELDS.filter(
    ([e]) =>
      void 0 !== xl.map[e] && !["name", "surname", "first", "patr"].includes(e),
  ).map(([, e]) => e);
  if (s.length < 6) {
    const t = el(
      "p",
      "xc-warn",
      `Excel'dan faqat ${s.length} ta maydon solishtirilmoqda (${s.join(", ") || "—"}). Tug'ilgan sana, millat, ma'lumoti, ilmiy daraja kabi ustunlar bog'lanmagan bo'lsa, ular tekshirilmaydi — yuqoridagi «Ustunlar moslashuvi»ni oching va kerakli ustunlarni tanlang.`,
    );
    e.append(t);
  }
  const r = fuzzyBlock(e);
  if (!t.length && r)
    return void e.append(
      el(
        "p",
        "msg",
        "Boshqa xodimlarda farq yo'q. Yuqoridagilarning farqlari ism tasdiqlangandan keyin shu yerda chiqadi.",
      ),
    );
  if (!t.length)
    return void e.append(
      el(
        "p",
        "xc-ok",
        "✓ Farq ham, to'ldiriladigan bo'sh joy ham yo'q — bog'langan ustunlar bo'yicha ma'lumotnomalar Excel bilan bir xil.",
      ),
    );
  const d = el("div", "xc-tabs");
  for (const [e, i, o] of [
    ["all", "Hammasi", t.length],
    ["fill", "Bo'sh joyni to'ldirish", a],
    ["diff", "Farq bor", n],
  ]) {
    const t = el("button", "xc-tab", `${i} · ${o}`);
    ((t.type = "button"),
      t.setAttribute("aria-pressed", String(confF === e)),
      (t.onclick = () => {
        ((confF = e), (confLim = 100), renderConf());
      }),
      d.append(t));
  }
  const c = el("input");
  let p;
  ((c.type = "search"),
    (c.placeholder = "Xodim yoki maydon bo'yicha qidirish…"),
    (c.value = confQ),
    (c.autocomplete = "off"),
    (c.className = "xc-q"),
    c.addEventListener("input", () => {
      (clearTimeout(p),
        (p = setTimeout(() => {
          ((confQ = c.value), (confLim = 100), renderConf());
          const e = $("xlConf").querySelector(".xc-q");
          e && (e.focus(), e.setSelectionRange(e.value.length, e.value.length));
        }, 200)));
    }));
  const m = el("div", "xc-bar");
  (m.append(d, c), e.append(m));
  const u = SpravkaCore.norm(toScript(confQ, !1)),
    h = SpravkaCore.norm(confQ),
    f = t.filter(([e, t]) => {
      return (
        ("all" === confF || confKind(e, t) === confF) &&
        (!u ||
          (a = SpravkaCore.norm(
            toScript([e.P.name, t.label].join(" "), !1),
          )).includes(u) ||
          a.includes(h))
      );
      var a;
    }),
    g = el("span", "xc-cnt"),
    y = () => {
      const e = f.filter(([, e]) => e.on).length;
      ((g.textContent = `Belgilangan: ${e} / ${f.length}`),
        (z.disabled = !e),
        (z.textContent = `Belgilanganlarni qo'llash (${e})`));
    },
    k = el("div", "twrap"),
    x = el("table", "rtable xct"),
    b = el("thead"),
    v = el("tbody"),
    w = el("tr"),
    S = el("input");
  ((S.type = "checkbox"),
    S.setAttribute("aria-label", "Ko'rinib turganlarning hammasini belgilash"));
  const q = el("th", "c-cb");
  (q.append(S),
    w.append(
      q,
      el("th", "", "Xodim / maydon"),
      el("th", "", "Ma'lumotnomada"),
      el("th", "", "Excel'da (taklif)"),
    ),
    b.append(w));
  const C = (e) =>
      (e = String(e || "")).length > 180 ? e.slice(0, 180) + "…" : e,
    E = f.slice(0, confLim),
    P = [],
    _ = [],
    T = () => {
      for (const [e, t] of _) {
        const a = P.filter(([, , e]) => e === t);
        ((e.checked = a.length && a.every(([e]) => e.checked)),
          (e.indeterminate = !e.checked && a.some(([e]) => e.checked)));
      }
    };
  let L = null;
  for (const [e, t] of E) {
    if (e !== L) {
      L = e;
      const t = E.filter(([t]) => t === e).length,
        a = el("tr", "xc-grp"),
        n = el("td", "c-cb"),
        i = el("input");
      ((i.type = "checkbox"),
        i.setAttribute(
          "aria-label",
          `${e.P.name || e.name}: hammasini belgilash`,
        ),
        (i.onchange = () => {
          for (const [t, a, n] of P)
            n === e && ((t.checked = i.checked), (a.on = i.checked));
          (y(), T());
        }),
        n.append(i),
        _.push([i, e]));
      const o = el("td");
      o.colSpan = 3;
      const l = el("button", "xc-name", e.P.name || e.name);
      ((l.type = "button"),
        (l.onclick = () => {
          (selectItem(e), showView("review"));
        }),
        o.append(l, el("small", "xc-n", ` · ${t} ta`)),
        e.xlFuzzy &&
          o.append(el("small", "xc-fz", "ism taxminan mos — tekshiring")),
        a.append(n, o),
        v.append(a));
    }
    const a = el("tr", "fill" === confKind(e, t) ? "k-fill" : "k-diff"),
      n = el("td", "c-cb"),
      i = el("input");
    ((i.type = "checkbox"),
      (i.checked = !!t.on),
      (i.onchange = () => {
        ((t.on = i.checked), y(), T());
      }),
      P.push([i, t, e]),
      n.append(i));
    const o = (t.kind, t.old),
      l = el("td", "xc-old");
    isEmptyV(o)
      ? l.append(el("em", "", "bo'sh"))
      : ((l.textContent = C(o)), (l.title = o));
    const s = el("td", "xc-new", C(t.val));
    ((s.title = t.val),
      a.append(n, el("td", "xc-fld", t.label), l, s),
      v.append(a));
  }
  ((S.checked = E.length && E.every(([, e]) => e.on)),
    (S.onchange = () => {
      for (const [e, t] of P) ((e.checked = S.checked), (t.on = S.checked));
      (y(), T());
    }),
    T(),
    x.append(b, v),
    k.append(x),
    e.append(k));
  const D = el("div", "xc-foot"),
    z = el("button", "btn", "");
  z.type = "button";
  const R = el("button", "btn2", "Hammasini belgilash");
  ((R.type = "button"),
    (R.onclick = () => {
      for (const [, e] of f) e.on = !0;
      renderConf();
    }));
  const I = el("button", "btn2", "Belgini olib tashlash");
  if (
    ((I.type = "button"),
    (I.onclick = () => {
      for (const [, e] of f) e.on = !1;
      renderConf();
    }),
    (z.onclick = () => {
      const e = new Map();
      for (const [t, a] of f)
        a.on && (e.has(t) || e.set(t, []), e.get(t).push(a));
      const t = undoSnap([...e.keys()]);
      let a = 0;
      for (const [t, n] of e)
        ((a += applyChanges(t, n, !0)),
          (t.reasons = reviewReasons(t.P)),
          t.approved || (t.state = t.reasons.length ? "warn" : "ok"),
          t.xlChanges.length || (t.xlStatus = "same"),
          store.dirty.add(t));
      (store.schedule(),
        store.saveXl(),
        updateStats(),
        a && pushUndo(`Excel'dan ${a} ta o'zgarish`, t),
        ($("xlMsg").className = "msg"),
        ($("xlMsg").textContent =
          `✓ ${e.size} ta ma'lumotnomaga ${a} ta o'zgarish qo'llandi. Belgilanmaganlari jadvalda qoldi.`),
        toast(`${a} ta o'zgarish qo'llandi`),
        renderConf());
    }),
    v.addEventListener("keydown", (e) => {
      const t = P.findIndex(([t]) => t === e.target);
      if (!(t < 0))
        if ("ArrowDown" === e.key || "ArrowUp" === e.key) {
          e.preventDefault();
          const a = t + ("ArrowDown" === e.key ? 1 : -1);
          P[a] &&
            (P[a][0].focus(),
            P[a][0].closest("tr").scrollIntoView({ block: "nearest" }));
        } else
          (e.ctrlKey || e.metaKey) &&
            "Enter" === e.key &&
            (e.preventDefault(), z.disabled || z.click());
    }),
    v.addEventListener("focusin", (e) => {
      const t = e.target.closest && e.target.closest("tr");
      (v.querySelectorAll("tr.kf").forEach((e) => e.classList.remove("kf")),
        t && t.classList.add("kf"));
    }),
    D.append(g, R, I, z),
    E.length &&
      D.append(
        el(
          "small",
          "xc-keys",
          "Klaviatura: ↑ ↓ — qator, Probel — belgilash, Ctrl+Enter — qo'llash",
        ),
      ),
    f.length > confLim)
  ) {
    const e = el(
      "button",
      "btn2",
      `Yana ko'rsatish (${f.length - confLim} ta qoldi)`,
    );
    ((e.type = "button"),
      (e.onclick = () => {
        ((confLim += 200), renderConf());
      }),
      D.append(e));
  }
  (e.append(D),
    y(),
    f.length > confLim &&
      e.append(
        el(
          "p",
          "msg",
          `«Qo'llash» faqat ko'rinib turgan emas, shu bo'limdagi barcha ${f.length} ta qatordan belgilanganlarini qo'llaydi.`,
        ),
      ));
}
var dupSig = "";
function calcDups() {
  const e = items.map((e) => (e.P && e.P.name) || "").join("|");
  if (e === dupSig) return;
  dupSig = e;
  const t = new Map(items.map((e) => [e, e.dup ? e.dup.length : 0]));
  for (const e of items) e.dup = null;
  const a = new Map(),
    n = new Map();
  for (const e of items) {
    if (!e.P || !e.P.name) continue;
    const t = SpravkaCore.nameParts(e.P.name);
    if (!t.sur || !t.giv || t.n < 2) continue;
    n.set(e, t);
    const i = t.sur.slice(0, 2) + "|" + t.giv[0];
    (a.has(i) || a.set(i, []), a.get(i).push(e));
  }
  const i = new Map(),
    o = (e) => {
      for (; i.get(e) !== e;) e = i.get(e);
      return e;
    };
  for (const e of a.values())
    if (!(e.length < 2)) {
      for (const t of e) i.has(t) || i.set(t, t);
      for (let t = 0; t < e.length; t++)
        for (let a = t + 1; a < e.length; a++) {
          const l = n.get(e[t]),
            s = n.get(e[a]);
          (l.pat && s.pat && l.pat[0] !== s.pat[0]) ||
            (SpravkaCore.nameScore(l, s) >= 0.95 && i.set(o(e[t]), o(e[a])));
        }
    }
  const l = new Map();
  for (const e of i.keys()) {
    const t = o(e);
    (l.has(t) || l.set(t, []), l.get(t).push(e));
  }
  for (const e of l.values())
    if (e.length > 1) {
      e.sort((e, t) => items.indexOf(e) - items.indexOf(t));
      for (const t of e) t.dup = e;
    }
  for (const e of items)
    (e.dup ? e.dup.length : 0) !== t.get(e) && renderCard(e);
}
const filledCount = (e) =>
  FIELD_ORDER.filter(
    (t) => String(e.fields[t] || "").trim() && "???" !== e.fields[t],
  ).length +
  (e.name ? 1 : 0) +
  (e.position ? 1 : 0);
function dupScore(e) {
  return e.P
    ? filledCount(e.P) +
        e.P.work.length +
        e.P.relatives.length +
        (e.P.photo ? 3 : 0) +
        (e.approved ? 2 : 0)
    : -1;
}
function keepOnly(e, t) {
  for (const t of e.dup || [])
    ((t.excluded = t !== e), renderCard(t), store.dirty.add(t));
  (store.schedule(),
    t ||
      (updateStats(),
      renderDetail(),
      "dup" === curView && renderDups(),
      toast("Qoldirildi. Qolgan fayllar ZIP'ga tushmaydi.")));
}
function renderDups() {
  calcDups();
  const e = $("dupList");
  e.textContent = "";
  const t = [...new Set(items.filter((e) => e.dup).map((e) => e.dup))],
    a = t.filter((e) => !(1 === e.filter((e) => !e.excluded).length));
  (($("dupInfo").textContent = items.some((e) => e.P)
    ? t.length
      ? `${t.length} ta xodimning bir nechta fayli bor: ${a.length} tasi hal qilinmagan, ${t.length - a.length} tasida bittasi qoldirilgan.`
      : "Takror fayl yo'q ✓ — har bir xodimning bitta ma'lumotnomasi bor."
    : "Hali ma'lumotnoma yuklanmagan."),
    ($("dupAuto").hidden = !a.length),
    t.sort((e, t) => (a.includes(e) ? 0 : 1) - (a.includes(t) ? 0 : 1)));
  for (const n of t) {
    const t = n.reduce((e, t) => (dupScore(t) > dupScore(e) ? t : e)),
      i = !a.includes(n),
      o = el("div", "dupg" + (i ? " done" : "")),
      l = el("div", "dupgh");
    (l.append(
      el("b", "", (t.P && t.P.name) || t.name),
      el(
        "span",
        "chip " + (i ? "ok" : "warn"),
        i ? "hal qilingan" : `${n.length} ta fayl — bittasini tanlang`,
      ),
    ),
      o.append(l));
    const s = el("ul");
    for (const e of n) {
      const a = el("li", e.excluded ? "out" : ""),
        i = el("div", "dupi"),
        o = el("span", "dn", (e.P && e.P.name) || e.name);
      (e === t && o.append(el("span", "best", "eng to'liq")),
        i.append(
          o,
          el(
            "span",
            "ds",
            [
              (e.folder ? e.folder + " / " : "") + e.name,
              e.P
                ? `${filledCount(e.P)} ta maydon, ${e.P.work.length} ish joyi, ${e.P.relatives.length} qarindosh, rasm ${e.P.photo ? "bor" : "yo'q"}`
                : "",
              e.excluded ? "chiqarilgan" : e.approved ? "tasdiqlangan" : "",
            ]
              .filter(Boolean)
              .join(" · "),
          ),
        ));
      const l = el("div", "acts"),
        r = el("button", "btn2", "Ochish");
      if (
        ((r.type = "button"),
        (r.onclick = () => {
          (selectItem(e), showView("review"));
        }),
        l.append(r),
        e.excluded)
      ) {
        const t = el("button", "btn2", "Qaytarish");
        ((t.type = "button"),
          (t.onclick = () => {
            ((e.excluded = !1),
              renderCard(e),
              store.dirty.add(e),
              store.schedule(),
              updateStats(),
              renderDups());
          }),
          l.append(t));
      } else if (n.some((t) => t !== e && !t.excluded)) {
        const a = el(
          "button",
          e === t ? "btn" : "btn2",
          "Faqat shunisini qoldirish",
        );
        ((a.type = "button"), (a.onclick = () => keepOnly(e)), l.append(a));
      }
      (a.append(i, l), s.append(a));
    }
    (o.append(s), e.append(o));
  }
}
function renderDupCard(e) {
  const t = $("rDup");
  t.textContent = "";
  const a = e && e.dup;
  if ((($("rDupC").hidden = !a), !a)) return;
  const n = a.reduce((e, t) => (dupScore(t) > dupScore(e) ? t : e));
  for (const i of a) {
    const o = el("li", (i === e ? "cur" : "") + (i.excluded ? " out" : "")),
      l = el("span", "dn", (i.P && i.P.name) || i.name);
    (i === n && l.append(el("span", "best", "eng to'liq")),
      o.append(
        l,
        el(
          "span",
          "ds",
          [
            (i.folder ? i.folder + " / " : "") + i.name,
            i.P
              ? `${filledCount(i.P)} ta maydon, ${i.P.work.length} ish joyi, ${i.P.relatives.length} qarindosh, rasm ${i.P.photo ? "bor" : "yo'q"}`
              : "",
            i.excluded ? "chiqarilgan" : i.approved ? "tasdiqlangan" : "",
          ]
            .filter(Boolean)
            .join(" · "),
        ),
      ));
    const s = el("div", "acts");
    if (i !== e) {
      const e = el("button", "btn2", "Ochish");
      ((e.type = "button"), (e.onclick = () => selectItem(i)), s.append(e));
    }
    if (i.excluded) {
      const e = el("button", "btn2", "Qaytarish");
      ((e.type = "button"),
        (e.onclick = () => {
          ((i.excluded = !1), renderCard(i), updateStats(), renderDetail());
        }),
        s.append(e));
    } else if (a.some((e) => e !== i && !e.excluded)) {
      const e = el(
        "button",
        i === n ? "btn" : "btn2",
        "Faqat shunisini qoldirish",
      );
      ((e.type = "button"), (e.onclick = () => keepOnly(i)), s.append(e));
    }
    (o.append(s), t.append(o));
  }
}
$("dupAuto").addEventListener("click", () => {
  const e = [...new Set(items.filter((e) => e.dup).map((e) => e.dup))].filter(
    (e) => 1 !== e.filter((e) => !e.excluded).length,
  );
  for (const t of e)
    keepOnly(
      t.reduce((e, t) => (dupScore(t) > dupScore(e) ? t : e)),
      !0,
    );
  (updateStats(),
    renderDetail(),
    renderDups(),
    toast(`${e.length} ta xodimda eng to'liq fayl qoldirildi`));
});
var bulkUndo = null;
const undoStack = [];
function undoSnap(e) {
  const t = new Map();
  for (const a of e)
    a &&
      a.P &&
      !t.has(a) &&
      t.set(a, {
        P: cloneP(a.P),
        wl: (a.warnings || []).length,
        mk: a.manualKeys ? new Set(a.manualKeys) : null,
        state: a.state,
        approved: a.approved,
        xlChanges: a.xlChanges ? a.xlChanges.slice() : a.xlChanges,
        xlStatus: a.xlStatus,
        xlApplied: a.xlApplied,
        hl: (a.hist || []).length,
      });
  return t;
}
function pushUndo(e, t) {
  (undoStack.push({ label: e, snap: t }),
    undoStack.length > 15 && undoStack.shift(),
    syncUndo());
}
function syncUndo() {
  const e = undoStack[undoStack.length - 1];
  for (const t of ["bkUndo", "xcUndo"]) {
    const a = $(t);
    a &&
      ((a.hidden = !e),
      e &&
        (a.textContent = `Bekor qilish: ${e.label}${undoStack.length > 1 ? ` (yana ${undoStack.length - 1} qadam)` : ""}`));
  }
}
function undoLast() {
  const e = undoStack.pop();
  if (e) {
    draft && commitDraft();
    for (const [t, a] of e.snap)
      ((t.P = a.P),
        (t.warnings.length = Math.min(t.warnings.length, a.wl)),
        (t.manualKeys = a.mk),
        (t.state = a.state),
        (t.approved = a.approved),
        (t.xlChanges = a.xlChanges),
        (t.xlStatus = a.xlStatus),
        (t.xlApplied = a.xlApplied),
        hist(t, "Bekor qilish", e.label, "", "qaytarildi"),
        (t.reasons = reviewReasons(t.P)),
        renderCard(t),
        store.dirty.add(t));
    (store.schedule(),
      updateStats(),
      sel && renderDetail(),
      syncUndo(),
      xl.ran && renderConf(),
      toast(`Bekor qilindi: ${e.label}`));
  }
}
function bulkPairs(e, t) {
  const a = [[e, t]],
    n = /[А-Яа-яЎўҚқҒғҲҳЁё]/.test(e),
    i = /[A-Za-z]/.test(e);
  return (
    n && !i
      ? a.push([SpravkaCore.cyrToLat(e), SpravkaCore.cyrToLat(t)])
      : i && !n && a.push([SpravkaCore.latToCyr(e), SpravkaCore.latToCyr(t)]),
    a
  );
}
function bulkRe(e, t) {
  const a = e
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[‘’'`ʻʼ]/g, "[‘’'`ʻʼ]")
    .replace(/\s+/g, "\\s+");
  return new RegExp(t ? `(?<![\\p{L}\\d])${a}(?![\\p{L}\\d])` : a, "giu");
}
function bulkTargets(e, t) {
  const a = [];
  if ("all" === t || "pos" === t || "cur" === t) {
    a.push(
      [
        "since",
        () => e.since,
        (t) => {
          e.since = t;
        },
      ],
      [
        "position",
        () => e.position,
        (t) => {
          e.position = t;
        },
      ],
    );
    const n = /(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)/i;
    e.work.forEach((i, o) => {
      ("cur" !== t || n.test(i)) &&
        a.push([
          "work",
          () => e.work[o],
          (t) => {
            e.work[o] = t;
          },
        ]);
    });
  }
  if ("all" === t || "fields" === t)
    for (const t of Object.keys(e.fields))
      a.push([
        t,
        () => e.fields[t],
        (a) => {
          e.fields[t] = a;
        },
      ]);
  return (
    ("all" !== t && "rel" !== t) ||
      e.relatives.forEach((e) =>
        ("rel" === t
          ? ["name", "birth", "work", "address"]
          : ["birth", "work", "address"]
        ).forEach((t) =>
          a.push([
            "rel",
            () => e[t],
            (a) => {
              e[t] = a;
            },
          ]),
        ),
      ),
    a
  );
}
const WORK_PFX =
    /^(\d{4}(?:\s*-\s*\d{4})?\s*(?:йй\.|yy\.|й\.|y\.|-йил\.|-yil\.)?\s*(?:ҳ\.в\.|h\.v\.)?\s*-\s*)(.*)$/,
  bulkTidy = (e) =>
    String(e)
      .replace(/[ \t\u00a0]{2,}/g, " ")
      .replace(/\s+([,.;:])/g, "$1")
      .trim(),
  capFirst = (e) => (e ? e[0].toUpperCase() + e.slice(1) : e);
function bulkPlan() {
  const e = $("bkFind").value,
    t = $("bkRepl").value,
    a = $("bkWord").checked,
    n = $("bkScope").value;
  if (!e.trim()) return null;
  const i = bulkPairs(e, t).map(([e, t]) => [bulkRe(e, a), t, e]),
    o = [];
  for (const t of items)
    if (t.P)
      for (const [a, l, s] of bulkTargets(t.P, n)) {
        const n = l();
        if (!n || "string" != typeof n) continue;
        const r = (e) => {
          let t = e;
          for (const [e, a, n] of i)
            t = t.replace(e, (e) =>
              n[0] &&
              a[0] &&
              n[0] === n[0].toLowerCase() &&
              a[0] === a[0].toLowerCase() &&
              e[0] !== e[0].toLowerCase()
                ? a[0].toUpperCase() + a.slice(1)
                : a,
            );
          return t;
        };
        let d;
        if ("work" === a) {
          const a = n.match(WORK_PFX),
            i = t.P.S.latin;
          if (a && !/\d/.test(e)) {
            const e = bulkTidy(r(a[2]));
            if (e === bulkTidy(a[2])) continue;
            d = a[1].replace(/\s+$/, " ") + capFirst(e);
          } else d = r(n);
          if (d === n) continue;
          d = SpravkaCore.fixWorkLine(bulkTidy(d), i);
        } else if ("since" === a) {
          if (((d = r(n)), d === n)) continue;
          d = bulkTidy(SpravkaCore.fixSinceLine(d, t.P.S.latin));
        } else {
          if (((d = r(n)), d === n)) continue;
          d = bulkTidy(d);
        }
        ((d !== n && d !== bulkTidy(n)) || d !== n) &&
          o.push({ it: t, key: a, set: s, before: n, after: d });
      }
  return { f: e, r: t, plan: o };
}
function snippet(e, t) {
  let a = 0;
  for (; a < e.length && a < t.length && e[a] === t[a];) a++;
  let n = e.length,
    i = t.length;
  for (; n > a && i > a && e[n - 1] === t[i - 1];) (n--, i--);
  const o = /[\p{L}\d‘’'ʻ-]/u;
  for (; a > 0 && o.test(e[a - 1]);) a--;
  for (; n < e.length && o.test(e[n]);) (n++, i++);
  const l = Math.max(0, a - 30),
    s = (l ? "…" : "") + e.slice(l, a),
    r = e.slice(n, n + 30) + (n + 30 < e.length ? "…" : "");
  return [s, e.slice(a, n), t.slice(a, i), r];
}
function bulkPreview() {
  const e = bulkPlan(),
    t = $("bkList");
  if (((t.textContent = ""), ($("bkApply").disabled = !0), !e))
    return (
      ($("bkMsg").className = "msg err"),
      ($("bkMsg").textContent = "«Nimani topish» maydoniga matn yozing."),
      null
    );
  const a = new Set(e.plan.map((e) => e.it)).size;
  (($("bkMsg").className = "msg"),
    ($("bkMsg").textContent = e.plan.length
      ? `${a} ta ma'lumotnomada ${e.plan.length} ta joy topildi. Quyida nima o'zgarishini ko'ring va «Almashtirish»ni bosing.`
      : "Hech narsa topilmadi."));
  for (const a of e.plan.slice(0, 40)) {
    const e = el("div", "bi");
    e.append(el("b", "", a.it.P.name || a.it.name));
    const [n, i, o, l] = snippet(a.before, a.after),
      s = el("span");
    (s.append(n, el("del", "", i), el("ins", "", o), l),
      e.append(s),
      t.append(e));
  }
  return (
    e.plan.length > 40 &&
      t.append(el("p", "msg", `… va yana ${e.plan.length - 40} ta joy.`)),
    ($("bkApply").disabled = !e.plan.length),
    e
  );
}
function bulkDo(e) {
  for (const t of e.plan) t.set(t.after);
  for (const t of e.plan)
    hist(t.it, "Ommaviy tuzatish", FLD_LBL(t.it.P, t.key), t.before, t.after);
  const t = new Map();
  for (const a of e.plan) t.set(a.it, (t.get(a.it) || 0) + 1);
  for (const [a, n] of t) {
    a.warnings.push(
      `Ommaviy tuzatish: «${e.f}» → «${e.r}» almashtirildi (${n} ta joyda)`,
    );
    const t = a.manualKeys || (a.manualKeys = new Set());
    for (const n of e.plan)
      n.it === a && "work" !== n.key && "rel" !== n.key && t.add(n.key);
    ((a.reasons = reviewReasons(a.P)),
      a.approved || (a.state = a.reasons.length ? "warn" : "ok"),
      renderCard(a));
  }
  for (const e of t.keys()) store.dirty.add(e);
  return (
    store.schedule(),
    updateStats(),
    sel && t.has(sel) && renderDetail(),
    t
  );
}
($("bkPrev").addEventListener("click", bulkPreview),
  ["bkFind", "bkRepl"].forEach((e) =>
    $(e).addEventListener("keydown", (e) => {
      "Enter" === e.key && (e.preventDefault(), bulkPreview());
    }),
  ),
  ["bkFind", "bkRepl", "bkScope", "bkWord"].forEach((e) =>
    $(e).addEventListener("input", () => {
      $("bkApply").disabled = !0;
    }),
  ),
  $("bkApply").addEventListener("click", () => {
    const e = bulkPlan();
    if (!e || !e.plan.length) return;
    draft && commitDraft();
    const t = undoSnap(e.plan.map((e) => e.it));
    (bulkDo(e),
      pushUndo(`«${e.f}» → «${e.r}»`, t),
      rulesAdd({
        f: e.f,
        r: e.r,
        scope: $("bkScope").value,
        word: $("bkWord").checked,
      }),
      syncUndo(),
      ($("bkApply").disabled = !0),
      ($("bkList").textContent = ""));
    const a = new Set(e.plan.map((e) => e.it));
    (($("bkMsg").className = "msg"),
      ($("bkMsg").textContent =
        `Almashtirildi: ${a.size} ta ma'lumotnomada ${e.plan.length} ta joy. Qoida saqlandi.`),
      toast("Ommaviy tuzatish qo‘llandi ✓"));
  }));
let bulkRules = [];
function kvRules(e) {
  return openDB().then(
    (t) =>
      new Promise((a) => {
        if (!t) return a(null);
        try {
          const n = t
              .transaction("kv", e ? "readwrite" : "readonly")
              .objectStore("kv"),
            i = e ? n.put(e, "bulkRules") : n.get("bulkRules");
          ((i.onsuccess = () => a(!!e || i.result)),
            (i.onerror = () => a(null)));
        } catch (e) {
          a(null);
        }
      }),
  );
}
const SCOPE_LBL = {
  all: "hamma joyda",
  cur: "hozirgi lavozim",
  pos: "lavozim va mehnat",
  fields: "shaxsiy ma'lumotlar",
  rel: "qarindoshlar",
};
function rulesAdd(e) {
  ((bulkRules = bulkRules.filter((t) => !(t.f === e.f && t.scope === e.scope))),
    bulkRules.push(e),
    bulkRules.length > 60 && bulkRules.shift(),
    kvRules(bulkRules.slice()),
    rulesDraw());
}
function rulesDraw() {
  const e = $("bkRules"),
    t = $("bkRuleList");
  ((e.hidden = !bulkRules.length),
    (t.textContent = ""),
    bulkRules.forEach((e, a) => {
      const n = el("li"),
        i = el("span", "bkr");
      i.append(
        el("del", "", e.f),
        " → ",
        el("ins", "", e.r || "(o‘chirish)"),
        el(
          "small",
          "",
          ` · ${SCOPE_LBL[e.scope] || e.scope}${e.word ? "" : " · so‘z ichida ham"}`,
        ),
      );
      const o = el("button", "btn2", "Topish");
      ((o.type = "button"),
        (o.title = "Maydonlarga qo‘yib, nima o‘zgarishini ko‘rsatish"),
        (o.onclick = () => {
          (($("bkFind").value = e.f),
            ($("bkRepl").value = e.r),
            ($("bkScope").value = e.scope),
            ($("bkWord").checked = !1 !== e.word),
            bulkPreview(),
            $("bkMsg").scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            }));
        }));
      const l = el("button", "btn2 bkdel", "×");
      ((l.type = "button"),
        (l.title = "Qoidani o‘chirish"),
        l.setAttribute("aria-label", `«${e.f}» qoidasini o‘chirish`),
        (l.onclick = () => {
          (bulkRules.splice(a, 1), kvRules(bulkRules.slice()), rulesDraw());
        }),
        n.append(i, o, l),
        t.append(n));
    }));
}
($("bkRunAll").addEventListener("click", () => {
  if (!bulkRules.length || !items.some((e) => e.P))
    return void toast("Avval ma'lumotnomalarni yuklang");
  draft && commitDraft();
  const e = [
      $("bkFind").value,
      $("bkRepl").value,
      $("bkScope").value,
      $("bkWord").checked,
    ],
    t = undoSnap(items.filter((e) => e.P));
  let a = 0,
    n = 0;
  const i = new Set();
  for (const e of bulkRules) {
    (($("bkFind").value = e.f),
      ($("bkRepl").value = e.r),
      ($("bkScope").value = e.scope),
      ($("bkWord").checked = !1 !== e.word));
    const t = bulkPlan();
    if (t && t.plan.length) {
      for (const e of bulkDo(t).keys()) i.add(e);
      ((a += t.plan.length), n++);
    }
  }
  (([
    $("bkFind").value,
    $("bkRepl").value,
    $("bkScope").value,
    $("bkWord").checked,
  ] = e),
    ($("bkApply").disabled = !0),
    ($("bkList").textContent = ""),
    a && (pushUndo(`${n} ta saqlangan qoida`, t), syncUndo()),
    ($("bkMsg").className = "msg"),
    ($("bkMsg").textContent = a
      ? `${n} ta qoida qo'llandi: ${i.size} ta ma'lumotnomada ${a} ta joy almashtirildi. «Bekor qilish» bilan qaytarish mumkin.`
      : "Saqlangan qoidalarga mos joy topilmadi — hammasi allaqachon to'g'ri."),
    toast(a ? `${a} ta joy almashtirildi ✓` : "O‘zgarish yo‘q"));
}),
  kvRules().then((e) => {
    Array.isArray(e) && ((bulkRules = e), rulesDraw());
  }),
  $("bkUndo").addEventListener("click", undoLast));
const CRIT_K = [
    "name",
    "position",
    "birth_date",
    "birth_place",
    "nationality",
    "party",
    "education",
    "grad_year",
    "specialty",
  ],
  OPT_K = ["degree", "title", "languages", "military", "awards", "deputy"],
  UI_LBL = {
    name: "F.I.Sh.",
    position: "Hozirgi lavozimi",
    birth_date: "Tug'ilgan sana",
    birth_place: "Tug'ilgan joyi",
    nationality: "Millati",
    party: "Partiyaviyligi",
    education: "Ma'lumoti",
    grad_year: "Tamomlagan",
    specialty: "Mutaxassisligi",
    degree: "Ilmiy darajasi",
    title: "Ilmiy unvoni",
    languages: "Chet tillari",
    military: "Harbiy unvoni",
    awards: "Mukofotlari",
    deputy: "Deputatlik",
  },
  isEmptyV = (e) => !String(e || "").trim() || /^\?+$/.test(String(e).trim()),
  getK = (e, t) =>
    "name" === t ? e.name : "position" === t ? e.position : e.fields[t];
function setK(e, t, a) {
  "name" === t
    ? (e.name = a)
    : "position" === t
      ? (e.position = a)
      : (e.fields[t] = a);
}
function emptyKeys(e, t, a) {
  return (t ? CRIT_K.concat(OPT_K) : CRIT_K).filter(
    (t) => isEmptyV(getK(e, t)) && !(a && xlBlank(a, t)),
  );
}
var fillShown = 100;
function fillRows() {
  const e = $("fillAll").checked,
    t = $("fillSearch")
      .value.split(/\s+/)
      .map((e) => SpravkaCore.norm(e))
      .filter(Boolean);
  return items.filter(
    (a) =>
      a.P &&
      !a.excluded &&
      !isGone(a) &&
      emptyKeys(a.P, e, a).length &&
      (!t.length ||
        t.every((e) =>
          SpravkaCore.norm((a.P.name || "") + " " + a.name).includes(e),
        )),
  );
}
function fillControl(e, t) {
  const a = e.P,
    n = a.S.latin;
  let i;
  if ("party" === t) {
    ((i = el("select")),
      i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" })));
    for (const e of PARTIES)
      i.append(
        Object.assign(el("option", "", e.full[n ? 0 : 1]), {
          value: e.val[n ? 0 : 1],
        }),
      );
  } else if ("title" === t) {
    ((i = el("select")),
      i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" })));
    for (const e of TITLES)
      i.append(
        Object.assign(el("option", "", e.lbl), { value: n ? e.l : e.c }),
      );
  } else if ("education" === t) {
    ((i = el("select")),
      i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" })));
    for (const e of n ? ["oliy", "o‘rta maxsus"] : ["олий", "ўрта махсус"])
      i.append(Object.assign(el("option", "", e), { value: e }));
  } else
    ((i = el("input")),
      (i.type = "text"),
      (i.autocomplete = "off"),
      "birth_date" === t
        ? ((i.placeholder = "kk.oo.yyyy"),
          (i.inputMode = "numeric"),
          (i.maxLength = 10),
          i.addEventListener("input", () => {
            const e = i.value.replace(/\D/g, "").slice(0, 8);
            i.value = [e.slice(0, 2), e.slice(2, 4), e.slice(4)]
              .filter(Boolean)
              .join(".");
          }))
        : (i.placeholder = UI_LBL[t]));
  return (
    (i.dataset.k = t),
    i.setAttribute("aria-label", `${UI_LBL[t]}: ${a.name || e.name}`),
    i.addEventListener("change", () => {
      let o = i.value.trim();
      if (o) {
        if ("birth_date" === t && !/^\d{2}\.\d{2}\.\d{4}$/.test(o))
          return (
            i.setCustomValidity("Sana kk.oo.yyyy ko'rinishida bo'lsin"),
            void i.reportValidity()
          );
        const l = getK(a, t) || "";
        if (
          (i.setCustomValidity(""),
          "INPUT" === i.tagName && "birth_date" !== t && (o = toScript(o, n)),
          "name" === t && (o = niceName(o)),
          setK(a, t, o),
          l !== o && hist(e, "Bo'sh maydonlar", FLD_LBL(a, t), l, o),
          "grad_year" === t && isEmptyV(a.fields.education))
        ) {
          const s = SpravkaCore.eduFromGrad(o, n);
          if (s) {
            const r = a.fields.education || "";
            ((a.fields.education = s),
              r !== s &&
                hist(e, "Bo'sh maydonlar", FLD_LBL(a, "education"), r, s));
            const t = i.closest("tr").querySelector('[data-k="education"]');
            t && ((t.value = s), t.classList.add("done"));
          }
        }
        ((e.manualKeys || (e.manualKeys = new Set())).add(t),
          (unsaved = !0),
          (e.reasons = reviewReasons(a)),
          e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
          i.classList.add("done"),
          renderCard(e),
          statsSoon());
      }
    }),
    i.addEventListener("keydown", (e) => {
      if ("Enter" !== e.key) return;
      (e.preventDefault(), i.dispatchEvent(new Event("change")));
      const t = [...$("fillBody").querySelectorAll("input,select")],
        a = t[t.indexOf(i) + 1];
      a && a.focus();
    }),
    i
  );
}
function renderFill(e) {
  e && (fillShown = 100);
  const t = fillRows(),
    a = ($("fillAll").checked ? CRIT_K.concat(OPT_K) : CRIT_K).filter(
      (e) => "name" !== e && t.some((t) => isEmptyV(getK(t.P, e))),
    ),
    n = $("fillHead"),
    i = $("fillBody");
  ((n.textContent = ""), (i.textContent = ""));
  const o = el("tr");
  o.append(el("th", "", "#"), el("th", "", "F.I.Sh."));
  for (const e of a) o.append(el("th", "", UI_LBL[e]));
  if (
    (o.append(el("th", "", "")),
    n.append(o),
    t.slice(0, fillShown).forEach((e, t) => {
      const n = el("tr"),
        o = el("td", "nm");
      (isEmptyV(e.P.name)
        ? o.append(fillControl(e, "name"))
        : o.append(el("span", "who", e.P.name)),
        o.append(el("small", "", (e.folder ? e.folder + " / " : "") + e.name)),
        n.append(el("td", "n", String(t + 1)), o));
      for (const t of a) {
        const a = getK(e.P, t);
        if (isEmptyV(a)) {
          const a = el("td");
          (a.append(fillControl(e, t)), n.append(a));
        } else {
          const e = String(a);
          n.append(el("td", "v", e.length > 60 ? e.slice(0, 60) + "…" : e));
        }
      }
      const l = el("td"),
        s = el("div", "rowbtn"),
        r = el("button", "btn2", "Ochish");
      ((r.type = "button"),
        (r.onclick = () => {
          (selectItem(e), showView("review"));
        }));
      const d = el("button", "btn2", "Varaq");
      ((d.type = "button"),
        (d.title = "Xodimga to'ldirish uchun PDF varaq"),
        (d.onclick = async () => {
          d.disabled = !0;
          try {
            await save(
              d,
              $("fillNote"),
              outNameOf(e.P, e.file, "").replace(/\.$/, "") +
                " — to'ldirish uchun.pdf",
              await buildOut(e.P, "pdf", !0),
            );
          } catch (e) {
            (($("fillNote").className = "msg err"),
              ($("fillNote").textContent = String((e && e.message) || e)));
          } finally {
            d.disabled = !1;
          }
        }),
        s.append(r, d),
        l.append(s),
        n.append(l),
        i.append(n));
    }),
    !t.length)
  ) {
    const e = el("tr", "empty"),
      t = el(
        "td",
        "",
        items.some((e) => e.P)
          ? "Bo'sh maydon qolmadi ✓"
          : "Avval ma'lumotnomalarni yuklang.",
      );
    ((t.colSpan = a.length + 3), e.append(t), i.append(e));
  }
  (($("fillInfo").textContent = t.length
    ? `${t.length} ta ma'lumotnomada bo'sh maydon bor${t.length > fillShown ? ` — ${fillShown} tasi ko'rsatilmoqda` : ""}. Yozib, Enter bosing — keyingi katakka o'tadi.`
    : ""),
    ($("fillMore").hidden = t.length <= fillShown),
    ($("fillForms").disabled = !t.length));
}
let fillT;
($("fillSearch").addEventListener("input", () => {
  (clearTimeout(fillT), (fillT = setTimeout(() => renderFill(!0), 150)));
}),
  $("fillAll").addEventListener("change", () => renderFill(!0)),
  $("fillMore").addEventListener("click", () => {
    ((fillShown += 100), renderFill());
  }),
  $("fillForms").addEventListener("click", async (e) => {
    const t = e.currentTarget,
      a = $("fillNote"),
      n = await pickFormat(t, "form");
    if (!n) return;
    const i = fillRows();
    if (i.length) {
      t.disabled = !0;
      try {
        const e = new JSZip(),
          o = new Set();
        let l = 0;
        for (const t of i) {
          let s =
              outNameOf(t.P, t.file, "").replace(/\.$/, "") +
              " — to'ldirish uchun",
            r = s,
            d = 2;
          for (; o.has(s.toLowerCase());) s = `${r} (${d++})`;
          (o.add(s.toLowerCase()),
            e.file(
              (t.folder ? t.folder.replace(/[\\:*?"<>|]/g, "") + "/" : "") +
                s +
                "." +
                n,
              await buildOut(t.P, n, !0),
            ),
            ++l % 5 == 0 &&
              ((a.className = "msg"),
              (a.textContent = `Varaqlar tayyorlanmoqda: ${l} / ${i.length}`),
              await new Promise((e) => setTimeout(e, 0))));
        }
        const s = await e.generateAsync({
          type: "uint8array",
          compression: "STORE",
        });
        ((a.textContent = ""),
          (await save(t, a, "toldirish_varaqlari.zip", s)) &&
            toast(`${i.length} ta to'ldirish varag'i yuklab olindi ✓`));
      } catch (e) {
        ((a.className = "msg err"),
          (a.textContent =
            "Varaqlarni tayyorlab bo‘lmadi: " + ((e && e.message) || e)));
      } finally {
        t.disabled = !1;
      }
    }
  }));
