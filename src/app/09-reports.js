/**
 * 09-reports.js — Yakuniy hisobot, Rahbarlar maʼlumoti (Word jadval) va Yoʻqlama (Excel davomat solishtiruvi)
 */
var coiRan = coiRan || !1;
function openReport() {
  (draft && commitDraft(), buildReport());
  const e = $("rep");
  e.showModal ? e.showModal() : e.setAttribute("open", "");
}
function buildReport() {
  const e = $("repBody");
  e.textContent = "";
  const t = items.filter((e) => !e.excluded),
    a = t.filter((e) => e.P),
    n = new Date();
  e.append(
    el(
      "p",
      "rmeta",
      `Sana: ${n.toLocaleDateString("ru-RU")} ${n.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}` +
        (xl.rows && xl.rows.length
          ? ` · Excel: «${xl.fileName || "kadrlar bazasi"}» (${xl.rows.length} ta qator)`
          : " · Excel ulanmagan"),
    ),
  );
  const i = el("div", "rtiles"),
    o = (e, t, a) => {
      const n = el("div", a || "");
      (n.append(el("span", "", e), el("b", "", String(t))), i.append(n));
    },
    l = [...new Set(items.filter((e) => e.dup).map((e) => e.dup))];
  (o("Jami fayl", items.length),
    o("Xodimlar", a.length),
    o("Tayyor", t.filter((e) => "ok" === e.state).length, "ok"),
    o("Tasdiqlangan", t.filter((e) => e.approved).length, "ok"),
    o("Jiddiy", t.filter((e) => "serious" === sevOf(e)).length, "err"),
    o("Kichik", t.filter((e) => "minor" === sevOf(e)).length, "warn"),
    o("Xato", t.filter((e) => "err" === e.state).length, "err"),
    o("Chiqarilgan takror", items.length - t.length),
    e.append(i));
  const s = (t, a, n, i, o = {}) => {
    const l = el("details", "rsec " + (a.length ? "bad" : "good"));
    o.open && a.length && (l.open = !0);
    const s = el("summary");
    if (
      (s.append(el("span", "", t), el("em", "", String(a.length))),
      l.append(s),
      !a.length)
    )
      return (l.append(el("p", "", i)), e.append(l), l);
    const r = el("ol");
    for (const e of a.slice(0, 300)) {
      const t = e.it || e,
        a = el("li"),
        i = el("button", "", (t.P && t.P.name) || t.name);
      ((i.type = "button"),
        (i.onclick = () => {
          ($("rep").close(), selectItem(t), showView("review"));
        }),
        a.append(i));
      const o = n(e);
      (o && a.append(el("small", "", " — " + o)), r.append(a));
    }
    return (
      a.length > 300 &&
        r.append(el("li", "", `… va yana ${a.length - 300} ta`)),
      l.append(r),
      e.append(l),
      l
    );
  };
  if (
    (s(
      "Jiddiy — asosiy ma’lumot yo‘q",
      t.filter((e) => "serious" === sevOf(e)),
      (e) => e.reasons.map(reasonTxt).join("; "),
      "Jiddiy holat qolmadi ✓",
      { open: !0 },
    ),
    s(
      "Kichik — rasm yo‘q yoki imlo",
      t.filter((e) => "minor" === sevOf(e)),
      (e) => e.reasons.map(reasonTxt).join("; "),
      "Kichik kamchilik qolmadi ✓",
    ),
    s(
      "Asosiy maydonlari bo'sh",
      a.filter((e) => !isGone(e) && emptyKeys(e.P, !1, e).length),
      (e) =>
        emptyKeys(e.P, !1, e)
          .map((e) => UI_LBL[e])
          .join(", "),
      "Bo'sh asosiy maydon yo'q ✓",
    ),
    s(
      "Rasm yo'q",
      a.filter((e) => !e.P.photo),
      () => "",
      "Hammasida rasm bor ✓",
    ),
    s(
      "Takror fayllar (hal qilinmagan)",
      l.filter((e) => !e.some((e) => e.excluded)).map((e) => e[0]),
      (e) => `${e.dup.length} ta fayl: ` + e.dup.map((e) => e.name).join(", "),
      "Hal qilinmagan takror yo‘q ✓",
    ),
    xl.rows && xl.rows.length && ensureCompared(),
    xl.ran &&
      (s(
        "Ishdan ketganlar — Excel'da yo'q",
        a.filter(isGone),
        (e) =>
          (e.folder ? e.folder + " / " : "") +
          e.name +
          " · ZIP'da «Ishdan_ketganlar» papkasiga tushadi (ism boshqacha yozilgan bo'lsa — kartochkada Excel'dagi xodimni qo'lda tanlang)",
        "Hammasi Excel'da topildi ✓",
      ),
      newStaffSec(e),
      s(
        "Excel bilan farq qoldi (qo'llanmagan)",
        a.filter((e) => e.xlChanges && e.xlChanges.length),
        (e) => e.xlChanges.map((e) => e.label).join(", "),
        "Farq yo'q ✓",
      )),
    coiRan)
  ) {
    const e = (e) => coiEval(e);
    (s(
      "Manfaatlar to'qnashuvi — mavjud, hal qilinmagan",
      coiRows.filter((t) => "actual" === e(t).k && coiOpenSt(t)),
      (t) =>
        `${t.rel}: ${t.relName} — ${e(t).reasons.join("; ")}. Asos: ${e(t)
          .arts.filter((e) => "3-modda" !== e.a)
          .map((e) => e.a)
          .join(", ")}; muddat 1 ish kuni.`,
      "Hal qilinmagan mavjud to'qnashuv yo'q ✓",
      { open: !0 },
    ),
      s(
        "Manfaatlar to'qnashuvi — faktni aniqlashtirish kerak",
        coiRows.filter((t) => "clarify" === e(t).k),
        (t) =>
          `${t.rel}: ${t.relName} — ${e(t)
            .need.map((e) => e.t)
            .join("; ")}`,
        "Aniqlashtiriladigan holat yo'q ✓",
      ),
      s(
        "Manfaatlar to'qnashuvi — ehtimoliy (17–18-moddalar, deklaratsiyaga)",
        coiRows.filter((t) => "potential" === e(t).k),
        (e) => `${e.rel}: ${e.relName} — ${e.relWork || e.relPos || ""}`,
        "Ehtimoliy to'qnashuv yo'q ✓",
      ));
  } else {
    const t = el("div", "rsec"),
      a = el(
        "p",
        "",
        "Manfaatlar to'qnashuvi (O'RQ-931) hali tekshirilmagan. ",
      ),
      n = el("button", "btn2", "Hozir tekshirish");
    ((n.type = "button"),
      (n.onclick = async () => {
        ((n.disabled = !0),
          (n.textContent = "Tekshirilmoqda…"),
          await runCoi(),
          buildReport());
      }),
      a.append(n),
      t.append(a),
      e.append(t));
  }
  s(
    "Xato fayllar (o‘qib bo‘lmadi)",
    t.filter((e) => "err" === e.state),
    (e) => e.reasons.join(" ").slice(0, 120),
    "Xato fayl yo'q ✓",
  );
}
function newStaffSec(e) {
  xl.unmatched || calcUnmatched();
  const t = xl.unmatched.slice(),
    a = el("details", "rsec " + (t.length ? "bad" : "good"));
  a.id = "repNew";
  const n = el("summary"),
    i = el("em", "", String(t.length));
  if (
    (n.append(
      el("span", "", "Yangi xodimlar — ma'lumotnomasi yo'q (Excel'da bor)"),
      i,
    ),
    a.append(n),
    !t.length)
  )
    return (
      a.append(el("p", "", "Excel'dagi hamma xodimning ma'lumotnomasi bor ✓")),
      void e.append(a)
    );
  a.append(
    el(
      "p",
      "",
      "«Yangi ma'lumotnoma yaratish» — Excel'dagi ma'lumotlar (F.I.Sh., tug'ilgan sana va joy, lavozim, ma'lumoti, ilmiy daraja…) bilan ma'lumotnoma yaratiladi va darhol ochiladi. Mehnat faoliyati, qarindoshlar va rasmni keyin qo'shasiz.",
    ),
  );
  const o = el("input");
  ((o.type = "search"),
    (o.className = "rq"),
    (o.placeholder = "Familiya, lavozim yoki bo'lim bo'yicha qidirish…"),
    (o.autocomplete = "off"));
  const l = el("ol"),
    s = el("button", "btn2", "");
  s.type = "button";
  const r = (e, t) =>
    void 0 !== xl.map[t]
      ? String(e[xl.map[t]] || "")
          .trim()
          .replace(/\s+/g, " ")
      : "";
  let d = 50;
  const c = () => {
    l.textContent = "";
    const e = SpravkaCore.norm(toCyr(o.value)),
      t = SpravkaCore.norm(o.value),
      a = xl.unmatched.filter((a) => {
        if (!e) return !0;
        const n = SpravkaCore.norm(
          toCyr(
            [
              rowName(xl.rows[a]),
              r(xl.rows[a], "dept"),
              r(xl.rows[a], "position"),
            ].join(" "),
          ),
        );
        return n.includes(e) || n.includes(t);
      });
    i.textContent = String(xl.unmatched.length);
    const n = "lat" === scriptNow();
    for (const e of a.slice(0, d)) {
      const t = xl.rows[e],
        a = el("li", "newrow");
      a.append(el("b", "", rowName(t)));
      const i = [r(t, "dept"), r(t, "position")].filter(Boolean).join(" · ");
      i &&
        a.append(
          el("small", "", " — " + (i.length > 120 ? i.slice(0, 120) + "…" : i)),
        );
      const o = el("button", "mk", "Yangi ma'lumotnoma yaratish");
      ((o.type = "button"),
        (o.onclick = () => {
          const a = createFromExcel(e, n);
          (store.dirty.add(a),
            store.schedule(),
            store.saveXl(),
            toast(`Yaratildi: ${rowName(t)}`),
            $("rep").close(),
            selectItem(a),
            showView("review"));
        }),
        a.append(o),
        l.append(a));
    }
    (a.length || l.append(el("li", "", "Hech kim topilmadi.")),
      (s.hidden = a.length <= d),
      (s.textContent = `Yana ko'rsatish (${a.length - d} ta qoldi)`));
  };
  let p;
  ((s.onclick = () => {
    ((d += 100), c());
  }),
    o.addEventListener("input", () => {
      (clearTimeout(p),
        (p = setTimeout(() => {
          ((d = 50), c());
        }, 150)));
    }),
    a.append(o, l, s),
    e.append(a),
    c());
}
($("repBtn").addEventListener("click", openReport),
  $("repHist").addEventListener("click", async () => {
    const e = $("repHist");
    e.disabled = !0;
    try {
      await save(
        e,
        $("repNote"),
        "ozgarishlar_tarixi.xlsx",
        await xlsxBuild([
          {
            name: "Tarix",
            rows: histCsv(),
            head: 1,
            freeze: !0,
            filter: !0,
            widths: [26, 30, 20, 18, 22, 30, 30],
          },
        ]),
      );
    } finally {
      e.disabled = !1;
    }
  }),
  $("rRep").addEventListener("click", openReport),
  $("repX").addEventListener("click", () => $("rep").close()),
  $("rep").addEventListener("click", (e) => {
    e.target === $("rep") && $("rep").close();
  }),
  $("repPrint").addEventListener("click", () => {
    const e = [...$("repBody").querySelectorAll("details")],
      t = e.map((e) => e.open);
    (e.forEach((e) => {
      e.open = !0;
    }),
      document.body.classList.add("printing"));
    const a = () => {
      (document.body.classList.remove("printing"),
        e.forEach((e, a) => {
          e.open = t[a];
        }),
        window.removeEventListener("afterprint", a));
    };
    (window.addEventListener("afterprint", a),
      window.print(),
      setTimeout(a, 1500));
  }),
  $("repZip").addEventListener("click", () => {
    ($("rep").close(), showView("list"), zipAll($("zipAll")));
  }));
var lead = { list: null, phone: !0, sortMode: "excel" };
const toCyr = (e) => toScript(String(e || ""), !1),
  L_ = "[а-яёўқғҳ]",
  NOT_LEAD_RE =
    /ёрдамчи|ердамчи|маслаҳатчи|маслахатчи|котиб|кабинет|лаборатор|навбатчи|методист|инспектор|мутахассис|ходими(?:\s|$)|ўқитувчи|укитувчи|доцент|профессор|ассистент|мураббий|ўринбосар|уринбосар/;
function isCenterSubDeptHead(e, t) {
  const a = toCyr(String(e || ""))
      .replace(/\s+/g, " ")
      .trim(),
    n = toCyr(String(t || ""))
      .replace(/\s+/g, " ")
      .trim();
  return (
    (/марказ(?:и)?(?![\p{L}])/iu.test(n) &&
      /(?:бўлим(?:и)?|булим(?:и)?|сектор(?:и)?)\s+(?:бошлиғи|бошлиги|бошлиқ|бошлик|раҳбари|рахбари|мудири)/iu.test(
        a,
      )) ||
    /марказ(?:и)?\s+.+?\s+(?:бўлим(?:и)?|булим(?:и)?|сектор(?:и)?)\s+(?:бошлиғи|бошлиги|бошлиқ|бошлик|раҳбари|рахбари|мудири)/iu.test(
      a,
    )
  );
}
function leadRank(e) {
  if (isCenterSubDeptHead(e, "")) return 0;
  const t =
    " " +
    toCyr(e)
      .toLowerCase()
      .replace(/[(),.;:«»"]/g, " ")
      .replace(/\s+/g, " ")
      .trim() +
    " ";
  return / декан(?:и|нинг)? ўринбосар| декан(?:и|нинг)? уринбосар/.test(t)
    ? 6
    : / биринчи проректор/.test(t) && !/ёрдамчи|маслаҳатчи|маслахатчи/.test(t)
      ? 2
      : / проректор(?:и)? /.test(t) &&
          !/ёрдамчи|маслаҳатчи|маслахатчи|котиб/.test(t)
        ? 3
        : NOT_LEAD_RE.test(t)
          ? / кафедра(?:си)? мудири? /.test(t) &&
            !/кабинет|лаборатор|ўринбосар|уринбосар/.test(t)
            ? 7
            : 0
          : / ректор(?:и)? /.test(t)
            ? 1
            : / декан(?:и)? /.test(t)
              ? 5
              : / кафедра(?:си)? мудири? /.test(t) || /^ мудири? $/.test(t)
                ? 7
                : / бош бухгалтер(?:и)? /.test(t) ||
                    / (?:бошлиғи|бошлиги|бошлиқ|бошлик|раҳбари|рахбари|директори|директор|бошқарувчиси|бошкарувчиси) /.test(
                      t,
                    )
                  ? 4
                  : 0;
}
const LEAD_CAT_RE =
    /раҳбар\s*кадр|рахбар\s*кадр|rahbar\s*kadr|раҳбар\s*ходим|рахбар\s*ходим|rahbar\s*xodim|раҳбарлар|рахбарлар|rahbarlar|руководящ/i,
  CAT_RE = {
    test: (e) => (
      (e = String(e || "").trim()),
      /(?:ходимлар|xodimlar|кадрлар|kadrlar|таркиби?|tarkibi?|персонал)$/i.test(
        e,
      ) &&
        !/бўлим|булим|bo.?lim|бошқарма|бошкарма|boshqarma|кафедра|kafedra|факультет|fakultet|марказ|markaz|сектор|sektor/i.test(
          e,
        )
    ),
  };
function leadRankRow(e, t) {
  if (isCenterSubDeptHead(e, t)) return 0;
  const a = leadRank(e);
  if (a) return a;
  const n = toCyr(e).trim();
  return n.split(/\s+/).length <= 2 && !CAT_RE.test(t || "")
    ? leadRank(toCyr(t) + " " + n)
    : 0;
}
const RANK_LBL = {
  1: "Rektor",
  2: "Birinchi prorektor",
  3: "Prorektor",
  4: "Bo'lim rahbari",
  5: "Dekan",
  6: "Dekan o'rinbosari",
  7: "Kafedra mudiri",
  9: "Boshqa",
};
function cleanDeptPos(e) {
  return toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .replace(/Front\s+Offi(?:cc|ss)/gi, "Front Office")
    .replace(/Back\s+Offi(?:cc|ss)/gi, "Back Office")
    .replace(eduWbRe("инноватсиялар|иннотвасиялар"), "инновациялар")
    .replace(eduWbRe("Илмий-инновасион"), "Илмий-инновацион")
    .replace(eduWbRe("инновасион"), "инновацион")
    .replace(eduWbRe("Коррупсияга"), "Коррупцияга")
    .replace(eduWbRe("коррупсияга"), "коррупцияга")
    .replace(eduWbRe("жорий\\s+етиш"), "жорий этиш")
    .replace(
      /рақамли\s+таълим\s+технологиялар\s+маркази/giu,
      "Рақамли таълим технологиялари маркази",
    )
    .trim();
}
function leadPosText(e, t, a) {
  const n = cleanDeptPos(e),
    i = CAT_RE.test(n) || LEAD_CAT_RE.test(n) ? "" : n,
    o = cleanDeptPos(t),
    r = o
      .replace(
        /\s+(?:бошлиғи|бошлиги|бошлиқ|бошлик|раҳбари|рахбари|декани|декан|мудири|директори|бошқарувчиси)(?:\s+в\.?\s*б\.?)?\s*$/i,
        "",
      )
      .trim();
  let l;
  if (a >= 1 && a <= 3) l = o || i;
  else if (4 === a || 5 === a)
    l = i && !/^(?:ректорат|раҳбарият|рахбарият)$/i.test(i) ? i : r;
  else if (
    7 === a &&
    i &&
    /^кафедра(?:си)?\s+мудири?(?:\s+в\.?\s*б\.?)?$/i.test(o)
  ) {
    const e = /в\.?\s*б\.?$/i.test(o) ? " в.б." : "",
      t = /кафедра/i.test(i) ? i : `${i} кафедраси`;
    l = `${t} мудири${e}`;
  } else
    l =
      i && o && !SpravkaCore.norm(o).includes(SpravkaCore.norm(i))
        ? `${i} ${o[0].toLowerCase() + o.slice(1)}`
        : o || i;
  const s = orgOf(l);
  return (
    s &&
      l.toLowerCase().startsWith(s.toLowerCase()) &&
      l.length > s.length &&
      (l = l.slice(s.length).trim()),
    a >= 1 && a <= 3 && (l = l.replace(/(ректор|директор)и$/i, "$1")),
    (4 !== a && 5 !== a) ||
      (l = l.replace(
        /\s+(?:бошлиғи|бошлиги|бошлиқ|бошлик|раҳбари|рахбари|декани|мудири|директори|бошқарувчиси)\s*$/i,
        "",
      )),
    7 === a && /мудир$/i.test(l) && (l += "и"),
    l ? l[0].toUpperCase() + l.slice(1) : ""
  );
}
const fmtD = (e) =>
  e && e.y ? (e.d ? `${p2(e.d)}.${p2(e.m)}.${e.y}` : `${e.y}`) : "";
const EDU_WB = "(?<![\\p{L}])",
  EDU_WE = "(?![\\p{L}])",
  eduWbRe = (e, t = "giu") => new RegExp(EDU_WB + "(?:" + e + ")" + EDU_WE, t);
function fmtPhone(e) {
  const t = String(e || "").trim();
  if (!t) return "";
  const a = t.replace(/\D/g, "");
  if (12 === a.length && a.startsWith("998"))
    return `+998 (${a.slice(3, 5)}) ${a.slice(5, 8)}-${a.slice(8, 10)}-${a.slice(10, 12)}`;
  if (9 === a.length)
    return `+998 (${a.slice(0, 2)}) ${a.slice(2, 5)}-${a.slice(5, 7)}-${a.slice(7, 9)}`;
  if (10 === a.length && /^[08]/.test(a))
    return `+998 (${a.slice(1, 3)}) ${a.slice(3, 6)}-${a.slice(6, 8)}-${a.slice(8, 10)}`;
  const n = [];
  for (const e of t.matchAll(
    /(?:998)?[\s().-]*(\d{2})[\s().-]*(\d{3})[\s.-]*(\d{2})[\s.-]*(\d{2})/g,
  ))
    n.push(`+998 (${e[1]}) ${e[2]}-${e[3]}-${e[4]}`);
  return n.length ? [...new Set(n)].join(", ") : t;
}
function cleanOtm(e) {
  return (
    (e = toCyr(String(e || ""))
      .replace(/\s+/g, " ")
      .replace(/^[1-9]\s*[.)]\s*/, "")
      .replace(/^(?:олий|ўрта махсус|тугалланмаган олий)\s+/iu, "")
      .replace(
        eduWbRe(
          "унверситети|унверстети|унивйерситети|унивеситети|уневерститут",
        ),
        "университети",
      )
      .replace(
        eduWbRe("унверситет|унверстет|унивйерситет|унивеситет"),
        "университет",
      )
      .replace(eduWbRe("инстиути|инсутути"), "институти")
      .replace(eduWbRe("педагокика|пидагогика|педогогика"), "педагогика")
      .replace(eduWbRe("техналогиялар|технологиялар"), "технологиялари")
      .replace(eduWbRe("техналогиялари"), "технологиялари")
      .replace(eduWbRe("техналогия"), "технология")
      .replace(eduWbRe("инноватцион"), "инновацион")
      .replace(eduWbRe("инноватсиялар|иннотвасиялар"), "инновациялар")
      .replace(eduWbRe("архитектура\\s+қурилиш"), "архитектура-қурилиш")
      .replace(/касб\s*-\s*[хҳ]унар/giu, "касб-ҳунар")
      .replace(eduWbRe("кхк"), "касб-ҳунар коллежи")
      .replace(eduWbRe("жахон"), "жаҳон")
      .replace(eduWbRe("киме"), "кимё")
      .replace(eduWbRe("алфраганус|афлраганус"), "Alfraganus")
      .replace(/\bALFRAGANUS\b/gi, "Alfraganus")
      .replace(eduWbRe("Беруний\\s+номли"), "Беруний номидаги")
      .replace(/И\.?\s*Каримов\s+номидаги/giu, "Ислом Каримов номидаги")
      .replace(/М\.?\s*Улу[гғ]бек\s+номидаги/giu, "Мирзо Улуғбек номидаги")
      .replace(eduWbRe("ТДПУ"), "Тошкент давлат педагогика университети")
      .replace(eduWbRe("ТерДУ"), "Термиз давлат университети")
      .replace(
        /Ўзбекистон\s+миллий\s+университети/giu,
        "Ўзбекистон Миллий университети",
      )
      .replace(
        /Тошкент\s+давлат\s+кимё[\s-]+технология\s+институти/giu,
        "Тошкент давлат кимё-технология институти",
      )
      .replace(
        /Тошкент\s+ахборот\s+технологиялари(?!\s+университети)/giu,
        "Тошкент ахборот технологиялари университети",
      )
      .replace(/^[.,;:\s-]+|[.,;:\s-]+$/g, "")
      .trim())
      ? e[0].toUpperCase() + e.slice(1)
      : ""
  );
}
function otmKey(e) {
  return SpravkaCore.norm(
    cleanOtm(e)
      .replace(
        /(?:мирзо улуғбек|низомий|ислом каримов|беруний|абдулла қодирий|абу али ибн сино)\s+номидаги\s+/giu,
        "",
      )
      .replace(/\s+талабаси$/iu, ""),
  );
}
function parseEduEntry(e) {
  let t = toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return null;
  t = t
    .replace(/^[1-9]\s*[.)]\s*/, "")
    .replace(/^(?:олий|ўрта махсус)\s*,?\s*/iu, "")
    .trim();
  let a = null;
  const n = t.match(
    /^(\d{4})\s*[-–—]\s*(\d{4})\s*-?\s*(?:йил|й\.|й)?\s*[,;.]?\s*(.*)$/iu,
  );
  if (n) ((a = +n[2]), (t = n[3]));
  else {
    const e = t.match(/^(\d{4})\s*-?\s*(?:йил|й\.|й)?\s*[,;.]?\s*(.*)$/iu);
    e && ((a = +e[1]), (t = e[2]));
  }
  let i = "",
    o = "",
    l = !1,
    s = !1;
  (/магистратура\s+талабаси/iu.test(t) && a
    ? (i = "bak")
    : /аспирант|докторант/iu.test(t)
      ? (i = "asp")
      : /магистр|магистратура|магистрантура|магистрант|қўшма\s+дастур/iu.test(t)
        ? (i = "mag")
        : /бакалавр|бакалавриат|бакалвр/iu.test(t)
          ? (i = "bak")
          : /2-от|иккинчи\s+мутахассис|қайта\s+тайёрлаш/iu.test(t) &&
            (i = "sec"),
    /қўшма\s+дастур/iu.test(t) && (s = !0),
    /кундузги/iu.test(t)
      ? (o = "кундузги")
      : /сирт[қк]и/iu.test(t)
        ? (o = "сиртқи")
        : /кечки/iu.test(t) && (o = "кечки"),
    /талабаси\s*\)?$/iu.test(t) && !a && (l = !0));
  let r = t
    .replace(/\([^)]*\)/g, " ")
    .replace(
      eduWbRe(
        "(?:бакалавриат|бакалавр|бакалвр|магистратура|магистрантура|магистри?|аспирантура|кундузги|сиртқи|сиртки)(?:\\s+(?:бўлими|босқичи|талабаси))?",
      ),
      " ",
    )
    .replace(/\s+қўшма\s+дастур\s+битирувчиси/giu, "")
    .replace(/\s+талабаси$/iu, "")
    .replace(/\s+/g, " ")
    .trim();
  if (((r = cleanOtm(r)), !r)) return null;
  return (
    /коллеж|техникум|билим\s+юрти|лицей|мактаб/iu.test(r) && !i && (i = "col"),
    { year: a, otm: r, level: i, mode: o, student: l, joint: s }
  );
}
const toCyrLines = (e) =>
  String(e || "")
    .split(/\r?\n+/)
    .map((e) => toCyr(e).trim())
    .filter(Boolean)
    .join("\n");
function splitDocGrad(e) {
  if (!e) return [];
  let t = toCyrLines(e);
  t = t.replace(
    /([)\wа-яёўқғҳ.,;])\s+(?=(?:[12]\s*[.)]\s*)?(?:\d{4}\s*[-–—]\s*)?(?:19\d\d|20\d\d)\s*(?:-?\s*(?:йил|й\.|yil|y\.)|\s+[А-ЯЁЎҚҒҲA-Z]))/giu,
    "$1\n",
  );
  const a = t
      .split(/\n+/)
      .map((e) => e.trim())
      .filter(Boolean),
    n = [];
  for (const e of a) {
    const t = /^(?:[1-9]\s*[.)]\s*)?(?:олий\s+)?(?:\d{4})/iu.test(e),
      a = n[n.length - 1] || "",
      i =
        /(?:университет[а-я]*|институт[а-я]*|академия[а-я]*|коллеж[а-я]*|техникум[а-я]*|юрти|\))[,;.]?$/iu.test(
          a,
        ),
      o =
        /университет|институт|академи|коллеж|техникум|билим\s+юрти/iu.test(e) &&
        !/^(?:педагогика\s+университети|университети|институти)/iu.test(e);
    !n.length || t || (i && o)
      ? n.push(e.replace(/[,;]+$/, ""))
      : (n[n.length - 1] = a + " " + e.replace(/[,;]+$/, ""));
  }
  const i = [];
  for (const e of n)
    for (const t of e.split(/;\s*|,\s*(?=(?:[1-9]\s*[.)]\s*)?\d{4})/)) {
      const e = parseEduEntry(t);
      e && i.push(e);
    }
  return i;
}
function splitXlGrad(e, t) {
  const a = (String(e || "").match(/\b(?:19\d\d|20\d\d)\b/g) || []).map(Number);
  let n = toCyrLines(t);
  if (!a.length && !n) return [];
  n = n.replace(
    /(\((?:бакалавр|бакалавриат)[^)]*\))\s+(?=[А-ЯЁЎҚҒҲA-Z])/giu,
    "$1\n",
  );
  const i = n
      .split(/\n+/)
      .map((e) => e.trim())
      .filter(Boolean),
    o = [];
  for (const e of i) {
    const t = o[o.length - 1] || "",
      a = /[,;]$/.test(t),
      n =
        /(?:университет[а-я]*|институт[а-я]*|академия[а-я]*|коллеж[а-я]*|техникум[а-я]*|юрти|\))$/iu.test(
          t,
        ),
      i = /^(?:университети|институти|педагогика\s+университети|\()/iu.test(e);
    !o.length || ((a || n) && !i)
      ? o.push(e)
      : (o[o.length - 1] = t + " " + e);
  }
  const l = [];
  for (const e of o)
    for (const t of e.split(/,\s*(?!\()|;\s*/)) {
      const e = t.trim();
      e && l.push(e);
    }
  const s = [];
  if (a.length && l.length)
    if (a.length === l.length)
      for (let e = 0; e < a.length; e++) {
        const t = parseEduEntry(a[e] + " й. " + l[e]);
        t && s.push(t);
      }
    else if (a.length > 1 && 1 === l.length)
      for (const e of a) {
        const t = parseEduEntry(e + " й. " + l[0]);
        t && s.push(t);
      }
    else
      for (let e = 0; e < Math.max(a.length, l.length); e++) {
        const t = a[e] || "",
          n = l[Math.min(e, l.length - 1)] || "",
          i = parseEduEntry((t ? t + " й. " : "") + n);
        i && s.push(i);
      }
  else if (l.length)
    for (const e of l) {
      const t = parseEduEntry(e);
      t && s.push(t);
    }
  return s;
}
function parseWorkGrad(e) {
  const t = [];
  for (const a of e || []) {
    const e = toCyr(String(a)).match(
      /^\s*(\d{4})\s*[-–—]\s*(\d{4})\s*(?:йй\.|yy\.|й\.|y\.)?\s*-\s*(?:\.\s*-\s*)?(.*)$/iu,
    );
    if (!e) continue;
    const n = +e[1],
      i = +e[2],
      o = e[3].trim();
    if (i <= n || i - n > 7) continue;
    if (
      /бошли|мудир|ўринбосар|ўқитувчи|котиб|лаборант|ходим|инспектор|мутахассис|услубчи|тарбиячи|директор|декан|проректор|ректор/iu.test(
        o,
      )
    )
      continue;
    if (!/(?:талабаси|магистранти|магистри)(?:\s*\([^)]*\))?\.?$/iu.test(o))
      continue;
    if (!/университет|институт|академи/iu.test(o)) continue;
    const l = /магистр/iu.test(o);
    let s = o
      .replace(
        /\s*(?:бакалавриат|бакалавр|магистратура)\s*(?:бўлими|босқичи)?\s*(?:талабаси|магистранти|магистри).*$/iu,
        "",
      )
      .replace(/\s*(?:талабаси|магистранти|магистри).*$/iu, "")
      .replace(
        /\s+[“"«]?[А-Яа-яЁёЎўҚқҒғҲҳ\s-]+(?:факультети|факултети|бўлими|кафедраси|йўналиши).*$/iu,
        "",
      )
      .trim();
    ((s = cleanOtm(s)),
      s &&
        t.push({
          year: i,
          startYear: n,
          otm: s,
          level: l ? "mag" : "bak",
          mode: "",
          fromWork: !0,
        }));
  }
  return t;
}
function leadEdu(e, t, a, n, i, o) {
  const l = splitDocGrad(e),
    s = i ? splitDocGrad(i) : splitXlGrad(a, n),
    r = parseWorkGrad(t),
    d = l.map((e) => ({ ...e }));
  for (const e of d) {
    if (!e.year) {
      const t = s.find(
        (t) =>
          t.year &&
          (otmKey(t.otm) === otmKey(e.otm) ||
            ("mag" === e.level && t.year >= 2015)),
      );
      t && (e.year = t.year);
    }
    s.some((t) => t.student && otmKey(t.otm) === otmKey(e.otm)) &&
      !e.year &&
      (e.student = !0);
  }
  const c = d.filter((e) => "col" !== e.level && "asp" !== e.level).length;
  for (const e of s) {
    if (!e.year && d.length) continue;
    const t = d.find((t) => t.year === e.year);
    if (t) {
      (!t.level && e.level && (t.level = e.level),
        !t.mode && e.mode && (t.mode = e.mode),
        e.otm.length > t.otm.length &&
          (otmKey(e.otm) === otmKey(t.otm) ||
            otmKey(e.otm).startsWith(otmKey(t.otm))) &&
          (t.otm = e.otm));
      continue;
    }
    if (1 === s.length && c >= 2) continue;
    if (
      1 === s.length &&
      d.some(
        (t) =>
          t.year &&
          t.year - e.year >= 4 &&
          t.year - e.year <= 5 &&
          otmKey(t.otm) === otmKey(e.otm) &&
          "mag" !== t.level,
      ) &&
      !r.some((t) => t.year === e.year)
    )
      continue;
    d.push({ ...e });
  }
  for (const e of r)
    d.some(
      (t) =>
        t.year === e.year ||
        (t.year &&
          Math.abs(t.year - e.year) <= 1 &&
          otmKey(t.otm) === otmKey(e.otm)),
    ) || d.push({ ...e });
  for (let e = 0; e < d.length; e++)
    for (let t = e + 1; t < d.length; t++)
      if (otmKey(d[e].otm) === otmKey(d[t].otm)) {
        const a = d[e].otm.length >= d[t].otm.length ? d[e].otm : d[t].otm;
        d[e].otm = d[t].otm = a;
      }
  d.sort(
    (e, t) =>
      (e.year || ("bak" === e.level ? 0 : 9999)) -
      (t.year || ("bak" === t.level ? 0 : 9999)),
  );
  const p = d.filter(
    (e) =>
      "col" !== e.level &&
      "asp" !== e.level &&
      "sec" !== e.level &&
      !e.student,
  );
  if (p.length >= 2) {
    ("mag" === p[0].level &&
      "asp" !== p[1].level &&
      "sec" !== p[1].level &&
      ((p[0].level = "bak"), (p[p.length - 1].level = "mag")),
      p[0].level || (p[0].level = "bak"));
    const e = p[p.length - 1];
    !e.level && "сиртқи" !== e.mode && (e.level = "mag");
  } else
    1 === p.length &&
      !p[0].level &&
      /магистратура/iu.test(String(o || "")) &&
      (p[0].level = "mag");
  const m = d.filter((e) => "asp" !== e.level && "sec" !== e.level);
  return (m.length ? m : d)
    .map((e) => {
      if (e.student && !e.year) return `${e.otm} (талаба)`;
      const t = [];
      return (
        e.joint && t.push("қўшма дастур"),
        "bak" === e.level
          ? t.push("бакалавр")
          : "mag" === e.level
            ? t.push("магистратура")
            : "asp" === e.level && t.push("аспирантура"),
        e.mode && (!t.length || "сиртқи" === e.mode) && t.push(e.mode),
        (e.year ? `${e.year} й. ` : "") +
          e.otm +
          (t.length ? ` (${t.join(", ")})` : "")
      );
    })
    .join("\n");
}
function cleanSpec(e) {
  e = toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .replace(/\b[12]\s*\.\s*/g, ", ")
    .replace(/^,\s*/, "")
    .replace(/\s*\((?:магистратура|бакалавр|кундузги|сиртқи)\)/giu, "")
    .replace(/["“”«»]/g, "")
    .replace(/\s*-\s*эколог/giu, "-эколог")
    .replace(eduWbRe("ўфитиш"), "ўқитиш")
    .replace(eduWbRe("адабиёцҳунос"), "адабиётшунос")
    .replace(eduWbRe("менжменти"), "менежменти")
    .replace(eduWbRe("диференсиал"), "дифференциал")
    .replace(eduWbRe("електр"), "электр")
    .replace(eduWbRe("енергетика"), "энергетика")
    .replace(eduWbRe("инжинириги"), "инжиниринги")
    .replace(eduWbRe("кампютер|компютер"), "компьютер")
    .replace(eduWbRe("курилиши"), "қурилиши")
    .replace(eduWbRe("тармоклар"), "тармоқлар")
    .replace(eduWbRe("композисион"), "композицион")
    .replace(/бухгалтерия$/iu, "бухгалтери")
    .replace(eduWbRe("Ўқитувчиси"), "ўқитувчиси")
    .replace(/:\s*([А-ЯЁЎҚҒҲ])(?=[а-яёўқғҳ])/gu, (e, t) => ": " + t.toLowerCase())
    .replace(/\s*,\s*/g, ", ")
    .replace(/[.;,\s]+$/g, "")
    .trim();
  const t = e
      .split(/,\s*/)
      .filter(Boolean)
      .map((e) =>
        /^[A-ZА-ЯЁЎҚҒҲ]{2,}$/u.test(e) ? e : e[0].toLowerCase() + e.slice(1),
      ),
    a = [];
  for (const e of t) {
    const t = SpravkaCore.norm(e);
    a.some((a) => {
      const n = SpravkaCore.norm(a);
      return n === t || (a.includes(":") && n.startsWith(t + " "));
    }) || a.push(e);
  }
  return a.join(", ");
}
function leadSpec(e, t) {
  const a = cleanSpec(e),
    n = cleanSpec(t);
  if (!a) return n;
  if (!n) return a;
  if (SpravkaCore.norm(a) === SpravkaCore.norm(n)) return a;
  const i = a.split(/,\s*/).filter(Boolean),
    o = n.split(/,\s*/).filter(Boolean);
  return o.length > i.length
    ? n
    : i.length > o.length
      ? a
      : a.length >= n.length
        ? a
        : n;
}
function phoneOf(e, t) {
  if (!t || !e) return "";
  const a = e.findIndex((e) =>
    /телефон|telefon|тел\.?\s*(?:рақами|raqami)?$|phone|мобил|mobil/i.test(
      String(e || ""),
    ),
  );
  return a >= 0 ? fmtPhone(t[a]) : "";
}
function leadSource() {
  if (xl.lead && !xl.lead.same && xl.lead.rows && xl.lead.rows.length)
    return {
      kind: "sheet",
      name: xl.lead.name,
      headers: xl.lead.headers,
      map: xl.lead.map,
      rows: xl.lead.rows,
    };
  if (xl.rows && xl.rows.length) {
    const e = Math.max(0, ...xl.rows.slice(0, 2e3).map((e) => e.length));
    for (let t = 0; t < e; t++) {
      if (t === xl.map.name || t === xl.map.position) continue;
      let e = 0;
      for (const a of xl.rows) {
        const n = String(a[t] || "");
        n.length < 60 && LEAD_CAT_RE.test(n) && e++;
      }
      if (e)
        return {
          kind: "cat",
          name: `«${xl.headers[t] || t + 1 + "-ustun"}» ustunida «Раҳбар кадрлар» deb belgilanganlar`,
          headers: xl.headers,
          map: xl.map,
          rows: xl.rows,
          cat: (e) => LEAD_CAT_RE.test(String(e[t] || "")),
        };
    }
    let t = !1;
    const a = new Set();
    if (
      (xl.rows.forEach((e, n) => {
        isHeadRow(e) ? (t = LEAD_CAT_RE.test(e.join(" "))) : t && a.add(n);
      }),
      a.size)
    )
      return {
        kind: "cat",
        name: "«Раҳбар кадрлар» bo‘limidagilar",
        headers: xl.headers,
        map: xl.map,
        rows: xl.rows,
        cat: (e, t) => a.has(t),
      };
  }
  return xl.rows && xl.rows.length
    ? {
        kind: "main",
        name: xl.lead && xl.lead.same ? xl.lead.name : "asosiy ro‘yxat",
        headers: xl.headers,
        map: xl.map,
        rows: xl.rows,
      }
    : null;
}
function isHeadRow(e) {
  const t = (e || []).map((e) => String(e || "").trim()).filter(Boolean);
  return (
    t.length > 0 &&
    t.length <= 2 &&
    t.join(" ").length < 120 &&
    t.every((e) => !/\d{4}/.test(e))
  );
}
function findDoc(e) {
  const t = SpravkaCore.nameParts(e);
  if (!t.sur) return null;
  let a = null;
  for (const e of items) {
    if (!e.P || e.excluded || !e.P.name) continue;
    const n = SpravkaCore.nameScore(t, SpravkaCore.nameParts(e.P.name));
    n >= 0.9 && (!a || n > a[0]) && (a = [n, e]);
  }
  return a ? a[1] : null;
}
function cleanLeadName(e) {
  let t = toCyr(String(e || ""))
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "";
  if (/^вакант$/iu.test(t)) return "Вакант";
  return (
    (t = t
      .replace(eduWbRe("Елдор"), "Элдор")
      .replace(eduWbRe("Пардайев"), "Пардаев")),
    niceName(cleanPersonName(t) || t)
  );
}
function cleanLeadBp(e) {
  let t = toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!t) return "";
  return (
    (t = t
      .replace(eduWbRe("Қумқурғон"), "Қумқўрғон")
      .replace(eduWbRe("Жарқурғон"), "Жарқўрғон")
      .replace(eduWbRe("Шерабод"), "Шеробод")
      .replace(eduWbRe("Шурчи"), "Шўрчи")
      .replace(eduWbRe("тумаги"), "тумани")
      .replace(eduWbRe("Сурхандарё|Сурҳондарё|Cурхондарё"), "Сурхондарё")
      .replace(
        /(Тошкент|Термиз)\s+шаҳар(?![\p{L}])/giu,
        (e, t) => `${t} шаҳри`,
      )
      .replace(/(вилояти|Республикаси)\s+(?=[А-ЯЁЎҚҒҲ])/gu, "$1, ")
      .replace(/\s*,\s*/g, ", ")
      .replace(/[,.\s]+$/g, "")
      .trim()),
    t ? t[0].toUpperCase() + t.slice(1) : ""
  );
}
const LEAD_EMPTY_RE = /^(?:йўқ|yo['‘’`]?q|[-—?]+)$/iu;
function cleanLeadDeg(e) {
  let t = toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!t || LEAD_EMPTY_RE.test(t)) return "";
  return (
    (t = t
      .replace(eduWbRe("буйича"), "бўйича")
      .replace(/фанлар\s+бўйича/giu, "фанлари бўйича")
      .replace(/Фалсафа\s+доктори/gu, "фалсафа доктори")
      .replace(eduWbRe("Иқтисод(?=\\s+фанлари)"), "Иқтисодиёт")
      .replace(/[.;,\s]+$/g, "")
      .trim()),
    t ? t[0].toUpperCase() + t.slice(1) : ""
  );
}
function cleanLeadTitle(e) {
  let t = toCyr(String(e || ""))
    .replace(/\s+/g, " ")
    .trim();
  if (!t || LEAD_EMPTY_RE.test(t)) return "";
  return (
    (t = t
      .replace(eduWbRe("Дотцент|дотцент"), "Доцент")
      .replace(/(?<=\s)в\.?\s*б\.?$/iu, "в.б.")
      .replace(/[;,\s]+$/g, "")
      .trim()),
    t ? t[0].toUpperCase() + t.slice(1) : ""
  );
}
function leadRec(e) {
  const t = e.it,
    a = t && t.P,
    n = a ? a.fields : {};
  if (!e.row) {
    const e = leadRank(a.position),
      t = parseDate(a.since || "");
    return {
      name: cleanLeadName(a.name),
      pos: leadPosText("", a.position, e),
      since: fmtD(t),
      bd: n.birth_date,
      bp: cleanLeadBp(n.birth_place),
      grad: leadEdu(n.grad_year, a.work, "", "", "", n.specialty),
      spec: leadSpec(n.specialty, ""),
      deg: cleanLeadDeg(n.degree),
      title: cleanLeadTitle(n.title),
      photo: a.photo,
      phone: "",
    };
  }
  const i = e.src,
    oRaw = (t) =>
      void 0 !== i.map[t] ? String(e.row[i.map[t]] || "").trim() : "",
    o = (e) => oRaw(e).replace(/\s+/g, " "),
    l = (
      o("name") ||
      [o("surname"), o("first"), o("patr")].filter(Boolean).join(" ")
    ).trim(),
    s = (e) =>
      String(e || "").trim() &&
      !/^(?:йўқ|yo‘q|yo'q|-|—|\?+)$/i.test(String(e).trim());
  let r = o("since_date");
  if (!r) {
    const t = e.row.find((e) => /№/.test(String(e || "")) && parseDate(e));
    t && (r = String(t));
  }
  const d = parseDate(r) || (a ? parseDate(a.since || "") : null),
    c = parseDate(o("birth_date")),
    p = leadEdu(
      s(n.grad_year) ? n.grad_year : "",
      a ? a.work : [],
      oRaw("grad_years"),
      oRaw("otm"),
      oRaw("grad_year"),
      s(n.specialty) ? n.specialty : oRaw("specialty"),
    );
  return {
    name: cleanLeadName(l) || (a && cleanLeadName(a.name)) || "",
    pos: leadPosText(o("dept"), o("position") || (a ? a.position : ""), e.rk),
    since: fmtD(d),
    bd: c ? fmtD(c) : n.birth_date,
    bp: cleanLeadBp(o("birth_place") || n.birth_place),
    grad: p,
    spec: leadSpec(
      s(n.specialty) ? n.specialty : "",
      s(oRaw("specialty")) ? oRaw("specialty") : "",
    ),
    deg: cleanLeadDeg(s(o("degree")) ? o("degree") : n.degree),
    title: cleanLeadTitle(s(o("title")) ? o("title") : n.title),
    photo: a ? a.photo : null,
    phone: phoneOf(i.headers, e.row),
  };
}
function leadInit() {
  const e = leadSource(),
    t = [];
  if (e)
    e.rows.forEach((a, n) => {
      const i = (t) =>
          void 0 !== e.map[t] ? String(a[e.map[t]] || "").trim() : "",
        o = (
          i("name") ||
          [i("surname"), i("first"), i("patr")].filter(Boolean).join(" ")
        ).trim();
      if (!o) return;
      if (e.cat && !e.cat(a, n)) return;
      if (isHeadRow(a)) return;
      if (isCenterSubDeptHead(i("position"), i("dept"))) return;
      const l = leadRankRow(i("position"), i("dept"));
      ("main" !== e.kind || e.cat || l) &&
        t.push({ row: a, src: e, idx: n, rk: l || 9, it: findDoc(o), on: !0 });
    });
  else
    for (const e of items) {
      if (!e.P || e.excluded || !(e.P.name || "").trim()) continue;
      const a = leadRank(e.P.position || "");
      a && t.push({ it: e, rk: a, idx: items.indexOf(e), on: !0 });
    }
  "rank" === lead.sortMode && t.sort((e, t) => e.rk - t.rk || e.idx - t.idx);
  {
    const e = (e) =>
        toCyr(
          e.row && e.src
            ? (e.row[e.src.map.dept] || "") +
                " " +
                (e.row[e.src.map.position] || "")
            : (e.it && e.it.P && e.it.P.position) || "",
        ),
      a = t.findIndex((t) => /техник\s+фойдаланиш.*хўжалик\s+бўлим/i.test(e(t))),
      n = t.findIndex((t) => /фуқаро.*меҳнат\s+муҳофаза.*бўлим/i.test(e(t)));
    if (a >= 0 && n >= 0 && a > n) {
      const [e] = t.splice(a, 1);
      t.splice(n, 0, e);
    }
  }
  const a = new Map((lead.list || []).map((e) => [e.row || e.it, e.on]));
  for (const e of t) a.has(e.row || e.it) && (e.on = a.get(e.row || e.it));
  ((lead.list = t),
    (lead.srcKind = e ? e.kind : "docs"),
    (lead.srcName = e ? e.name : ""));
}
function renderLead(e) {
  (lead.list && !e) || leadInit();
  const t = items.filter((e) => e.P && !e.excluded),
    a = new Map();
  for (const e of t) {
    const t = orgOf(toCyr(e.P.position));
    t && a.set(t, (a.get(t) || 0) + 1);
  }
  if (xl.rows && xl.map && void 0 !== xl.map.org)
    for (const e of xl.rows.slice(0, 300)) {
      const t = toCyr(String(e[xl.map.org] || "").trim());
      t && a.set(t, (a.get(t) || 0) + 1);
    }
  const n = [...a.entries()].sort((e, t) => t[1] - e[1])[0];
  if (
    (!$("ldOrg").value && n && ($("ldOrg").value = n[0]),
    $("ldTitle").value ||
      ($("ldTitle").value =
        `${$("ldOrg").value || "Ташкилот"} раҳбарлари тўғрисида`),
    !$("ldDate").value)
  ) {
    const e = new Date();
    $("ldDate").value =
      `${e.getFullYear()}-${p2(e.getMonth() + 1)}-${p2(e.getDate())}`;
  }
  if (
    (($("ldSrc").textContent =
      "cat" === lead.srcKind
        ? `Manba: Excel — ${lead.srcName}. Tartib Excel'dagidek.`
        : "sheet" === lead.srcKind
          ? `Manba: Excel — «${lead.srcName}» varag'i (rahbar kadrlar jadvali). Tartib Excel'dagidek.`
          : "main" === lead.srcKind
            ? `Manba: Excel — ${lead.srcName}dan rahbar lavozimidagilar (rektor, prorektorlar, bo'lim boshliqlari, dekanlar, dekan o'rinbosarlari, kafedra mudirlari).`
            : "Excel ulanmagan — ro'yxat vaqtincha ma'lumotnomalardagi lavozim bo'yicha tuzildi. Rahbarlar jadvali Excel'dagi ro'yxat bo'yicha tuzilishi uchun kadrlar bazasi Excel'ini yuklang."),
    ($("ldSrc").className =
      "hint" + ("docs" === lead.srcKind ? " warnline" : "")),
    "docs" === lead.srcKind)
  ) {
    const e = el("button", "linkbtn", " Excel faylni tanlash →");
    ((e.type = "button"),
      (e.onclick = () => {
        (showView("excel"), $("xlFile").click());
      }),
      $("ldSrc").append(e));
  }
  const i = $("ldList");
  if (
    ((i.textContent = ""),
    lead.list.forEach((e, t) => {
      const a = leadRec(e),
        n = el("tr", e.on ? "" : "off"),
        o = el("td", "c-cb"),
        l = el("input");
      ((l.type = "checkbox"),
        (l.checked = e.on),
        l.setAttribute("aria-label", "Jadvalga kiritish: " + a.name),
        (l.onchange = () => {
          ((e.on = l.checked), (n.className = e.on ? "" : "off"), leadInfo());
        }),
        o.append(l));
      const s = el("td");
      s.append(el("b", "", a.name), el("small", "", RANK_LBL[e.rk] || ""));
      const r = el("td");
      r.append(
        el("span", "", a.pos || "—"),
        el("small", "", a.since ? a.since + " й." : "tayinlangan sana yo‘q"),
      );
      const d = [];
      (e.it ? a.photo || d.push("rasm") : d.push("ma’lumotnoma"),
        a.bd || d.push("tug‘ilgan sana"),
        a.grad || d.push("OTM"),
        lead.phone && !a.phone && d.push("telefon"));
      const c = el(
          "td",
          d.length ? "miss" : "okc",
          d.length ? "Yo‘q: " + d.join(", ") : "To‘liq ✓",
        ),
        p = el("td", "acts"),
        m = el("div", "ra"),
        u = el("button", "btn2", "↑"),
        h = el("button", "btn2", "↓");
      if (
        ((u.type = h.type = "button"),
        u.setAttribute("aria-label", "Yuqoriga"),
        h.setAttribute("aria-label", "Pastga"),
        (u.disabled = 0 === t),
        (h.disabled = t === lead.list.length - 1),
        (u.onclick = () => {
          (([lead.list[t - 1], lead.list[t]] = [
            lead.list[t],
            lead.list[t - 1],
          ]),
            renderLead());
        }),
        (h.onclick = () => {
          (([lead.list[t + 1], lead.list[t]] = [
            lead.list[t],
            lead.list[t + 1],
          ]),
            renderLead());
        }),
        m.append(u, h),
        e.it)
      ) {
        const t = el("button", "btn2", "Ko'rish");
        ((t.type = "button"),
          (t.onclick = () => {
            (selectItem(e.it), showView("review"));
          }),
          m.append(t));
      }
      (p.append(m),
        n.append(o, el("td", "n", String(t + 1)), s, r, c, p),
        i.append(n));
    }),
    !lead.list.length)
  ) {
    const e = el("tr", "empty"),
      t = el(
        "td",
        "",
        xl.rows && xl.rows.length
          ? "Excel'da rahbar lavozimidagi xodim topilmadi — «Lavozimi» ustuni to'g'ri bog'langanini tekshiring."
          : "Kadrlar bazasi Excel'ini yuklang.",
      );
    ((t.colSpan = 6), e.append(t), i.append(e));
  }
  leadInfo();
}
function leadInfo() {
  const e = (lead.list || []).filter((e) => e.on),
    t = e.filter((e) => !e.it).length;
  (($("ldInfo").textContent =
    `${e.length} ta rahbar jadvalga kiradi.${t ? ` ${t} tasining ma'lumotnomasi yuklanmagan — rasm va ta'lim ma'lumoti faqat Excel'dan.` : ""}`),
    ($("ldGo").disabled = !e.length));
}
async function leadImg(e) {
  try {
    const t = await pdfPhoto(e);
    if (!t) return null;
    const a = await createImageBitmap(new Blob([t.bytes]));
    let n = a.width,
      i = a.height;
    const o = e.crop || {},
      l = (+o.l || 0) / 1e5,
      s = (+o.r || 0) / 1e5,
      r = (+o.t || 0) / 1e5,
      d = (+o.b || 0) / 1e5;
    return (
      (n *= Math.max(0.05, 1 - l - s)),
      (i *= Math.max(0.05, 1 - r - d)),
      {
        bytes: t.bytes,
        ext: "jpg" === t.type ? "jpeg" : "png",
        w: n,
        h: i,
        crop: e.crop || null,
      }
    );
  } catch (e) {
    return null;
  }
}
async function leadDocx() {
  const e = "lat" === $("ldScr").value,
    t = (t) => (e ? SpravkaCore.cyrToLat(String(t || "")) : toCyr(t)),
    a = DX.esc,
    n = "Times New Roman",
    i = (e, t = {}) =>
      `<w:r><w:rPr><w:rFonts w:ascii="${n}" w:hAnsi="${n}" w:cs="${n}"/>${t.b ? "<w:b/>" : ""}${t.i ? "<w:i/>" : ""}${t.c ? `<w:color w:val="${t.c}"/>` : ""}<w:sz w:val="${t.s || 24}"/><w:szCs w:val="${t.s || 24}"/></w:rPr><w:t xml:space="preserve">${a(e)}</w:t></w:r>`,
    o = "<w:r><w:br/></w:r>",
    l = (e, t = {}) =>
      `<w:p><w:pPr><w:spacing w:before="${t.bf || 0}" w:after="${t.a || 0}" w:line="240" w:lineRule="auto"/><w:jc w:val="${t.j || "center"}"/></w:pPr>${e}</w:p>`,
    s = [704, 2301, 2268, 2099, 4714, 2345],
    r = ["top", "left", "bottom", "right", "insideH", "insideV"]
      .map(
        (e) => `<w:${e} w:val="single" w:sz="4" w:space="0" w:color="000000"/>`,
      )
      .join(""),
    d = (e, t, a, n) =>
      `<w:tc><w:tcPr><w:tcW w:w="${e}" w:type="dxa"/>${n ? `<w:gridSpan w:val="${n}"/>` : ""}${a ? `<w:shd w:val="clear" w:color="auto" w:fill="${a}"/>` : ""}<w:vAlign w:val="center"/></w:tcPr>${t}</w:tc>`,
    c = [];
  c.push(
    `<w:tr><w:trPr><w:tblHeader/></w:trPr>${["т/р", "Лавозими, тайинланган санаси", "Ф.И.О., туғилган йили ва жойи,", "Фотосурат", "Тамомлаган ОТМ (лари), мутахассислиги, илмий даражаси ва илмий унвони", "Телефон номер"].map((e, a) => d(s[a], l(i(t(e), { b: !0 })), "DEEAF6")).join("")}</w:tr>`,
  );
  const p = $("ldOrg").value.trim();
  p &&
    c.push(
      `<w:tr>${d(
        s.reduce((e, t) => e + t, 0),
        l(i(t(p), { b: !0 })),
        "8EAADB",
        6,
      )}</w:tr>`,
    );
  const m = [],
    u = lead.list.filter((e) => e.on),
    h = (e) =>
      !String(e || "").trim() ||
      /^(?:йўқ|yo‘q|yo'q|-|—|\?+)$/i.test(String(e).trim());
  let f = 0,
    g = 0;
  for (const e of u) {
    const a = leadRec(e),
      n = l(
        i(t(a.pos) + (1 === e.rk ? "," : ""), { b: !0 }) +
          (a.since ? o + i("(" + t(a.since) + " й.)", { c: "002060" }) : ""),
      ),
      r = toCyr(a.name).trim().split(/\s+/),
      p = r.shift() || "",
      u = r.join(" "),
      y = u.match(/^(\S+)\s+(.+)$/),
      k = String(a.bd || "").trim(),
      x = /^\d{2}\.\d{2}\.\d{4}$/.test(k)
        ? k
        : (k.match(/\d{4}/) || [])[0]
          ? k.match(/\d{4}/)[0] + "-йил"
          : "";
    let b = i(t(p.toUpperCase()), { b: !0, c: "0070C0" });
    (y
      ? (b += o + i(t(y[1]), { b: !0 }) + o + i(t(y[2]), { b: !0 }))
      : u && (b += o + i(t(u), { b: !0 })),
      x && (b += o + i(t(x) + ",", { b: !0, c: "C00000" })));
    for (const e of toCyr(a.bp || "")
      .replace(/,\s*/g, ",\n")
      .split("\n")
      .filter(Boolean))
      b += o + i(t(e.trim()));
    let v = l("");
    if (a.photo && a.photo.bytes) {
      const e = await leadImg(a.photo);
      if (e) {
        const t = m.length + 1,
          a = "rIdImg" + t;
        m.push({ id: t, rid: a, im: e });
        const n = 122e4,
          i = 15e5;
        let o = n,
          s = Math.round((n * e.h) / e.w);
        s > i && ((s = i), (o = Math.round((i * e.w) / e.h)));
        const r = e.crop
          ? `<a:srcRect ${Object.entries(e.crop)
              .map(([e, t]) => `${e}="${t}"`)
              .join(" ")}/>`
          : "";
        v = l(
          `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${o}" cy="${s}"/><wp:docPr id="${t}" name="Rasm ${t}"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="${t}" name="photo${t}"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${a}"/>${r}<a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${o}" cy="${s}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>`,
        );
      } else g++;
    } else g++;
    const w = String(a.grad || "")
      .split(/\n|;|,\s*(?=\d{4})/)
      .map((e) =>
        toCyr(
          e
            .trim()
            .replace(
              /^(?:(?:тугалланмаган\s+)?(?:олий|oliy)(?:\s+маълумот(?:ли)?)?)[\s,.;:()-]*/iu,
              "",
            )
            .replace(/[,.]$/, ""),
        ),
      )
      .filter(Boolean);
    let $ = w
      .map((e, n) => i(t(e) + (n < w.length - 1 || !h(a.spec) ? "," : "")))
      .join(o);
    if (
      (h(a.spec) || ($ += ($ ? o : "") + i(t(toCyr(a.spec)), { i: !0 })),
      !h(a.deg))
    ) {
      const e = toCyr(a.deg);
      $ +=
        ($ ? o : "") +
        i(t(e[0].toUpperCase() + e.slice(1)), { b: !0, c: "002060" });
    }
    if (!h(a.title)) {
      const e = toCyr(a.title);
      $ +=
        ($ ? o : "") +
        i(t(e[0].toUpperCase() + e.slice(1)), { b: !0, c: "002060" });
    }
    const S = l(i(lead.phone ? a.phone : ""));
    c.push(
      `<w:tr><w:trPr><w:cantSplit/></w:trPr>${d(s[0], l(i(++f + ".", { b: !0 })))}${d(s[1], n)}${d(s[2], l(b))}${d(s[3], v)}${d(s[4], l($))}${d(s[5], S)}</w:tr>`,
    );
  }
  const y = $("ldDate").value
      ? $("ldDate").value.split("-").reverse().join(".")
      : "",
    k =
      l(i(t($("ldTitle").value.trim()), { b: !0, c: "0070C0", s: 28 }), {
        a: 60,
      }) +
      l(i(t("МАЪЛУМОТ"), { b: !0, c: "C00000", s: 28 }), { a: 120 }) +
      (y
        ? l(i(t(`${y} йил ҳолатига`), { i: !0 }), { j: "right", a: 120 })
        : "") +
      `<w:tbl><w:tblPr><w:tblW w:w="${s.reduce((e, t) => e + t, 0)}" w:type="dxa"/><w:jc w:val="center"/><w:tblBorders>${r}</w:tblBorders><w:tblLayout w:type="fixed"/><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${s.map((e) => `<w:gridCol w:w="${e}"/>`).join("")}</w:tblGrid>${c.join("")}</w:tbl>` +
      l(""),
    x = new JSZip();
  (x.file(
    "[Content_Types].xml",
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  ),
    x.file(
      "_rels/.rels",
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
    ),
    x.file(
      "word/_rels/document.xml.rels",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${m.map((e) => `<Relationship Id="${e.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/img${e.id}.${e.im.ext}"/>`).join("")}</Relationships>`,
    ));
  for (const e of m) x.file(`word/media/img${e.id}.${e.im.ext}`, e.im.bytes);
  return (
    x.file(
      "word/document.xml",
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${k}<w:sectPr><w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/><w:pgMar w:top="993" w:right="851" w:bottom="851" w:left="851" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`,
    ),
    {
      bytes: await x.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
      }),
      n: f,
      noPh: g,
    }
  );
}
($("ldPhone").addEventListener("change", () => {
  ((lead.phone = $("ldPhone").checked), renderLead());
}),
  $("ldSort").addEventListener("change", () => {
    ((lead.sortMode = $("ldSort").value), renderLead(!0));
  }),
  $("ldOrg").addEventListener("change", () => {
    $("ldTitle").value = `${$("ldOrg").value} раҳбарлари тўғрисида`;
  }),
  $("ldGo").addEventListener("click", async () => {
    const e = $("ldGo");
    e.disabled = !0;
    try {
      const t = await leadDocx(),
        a = $("ldDate").value
          ? $("ldDate").value.split("-").reverse().join(".")
          : "";
      (await save(
        e,
        $("ldNote"),
        `Rahbarlar to'g'risida ma'lumot${a ? " (" + a + ")" : ""}.docx`,
        t.bytes,
      )) &&
        toast(
          `Jadval tayyor: ${t.n} ta rahbar${t.noPh ? `, ${t.noPh} tasida rasm yo'q` : ""} ✓`,
        );
    } catch (e) {
      (($("ldNote").className = "msg err"),
        ($("ldNote").textContent =
          "Jadvalni tayyorlab bo‘lmadi: " + ((e && e.message) || e)));
    } finally {
      e.disabled = !1;
    }
  }));
var ck = { tab: "miss", page: 0 };
const ckG = (e, t) =>
  void 0 !== xl.map[t]
    ? String(e[xl.map[t]] || "")
        .trim()
        .replace(/\s+/g, " ")
    : "";
function ckData() {
  if (!xl.rows || !xl.rows.length) return null;
  (void 0 === xl.map.name && void 0 === xl.map.surname) ||
    !items.some((e) => e.P && !e.fromExcel && !e.xlStatus) ||
    runCompare();
  const e = new Map();
  for (const t of items)
    t.P &&
      !t.excluded &&
      void 0 !== t.xlRow &&
      null !== t.xlRow &&
      (e.has(t.xlRow) || e.set(t.xlRow, []), e.get(t.xlRow).push(t));
  const t = [];
  xl.rows.forEach((a, n) => {
    const i = rowName(a);
    if (!i || isHeadRow(a)) return;
    const o = e.get(n) || [],
      l = o.length
        ? o.some((e) => !e.xlFuzzy || e.fromExcel || void 0 !== e.xlManual)
          ? "have"
          : "fuzzy"
        : "miss";
    t.push({
      i: n,
      row: a,
      nm: i,
      its: o,
      st: l,
      dept: ckG(a, "dept"),
      pos: ckG(a, "position"),
    });
  });
  const a = t
    .filter((e) => "miss" !== e.st)
    .map((e) => [e, SpravkaCore.nameParts(toCyr(e.nm))]);
  for (const e of t)
    if ("miss" === e.st) {
      const t = SpravkaCore.nameParts(toCyr(e.nm)),
        n = a.find(([, e]) => SpravkaCore.nameScore(t, e) >= 0.93);
      n && (e.dupOf = n[0]);
    }
  const n = items.filter(
    (e) =>
      e.P &&
      !e.excluded &&
      !e.fromExcel &&
      (void 0 === e.xlRow || null === e.xlRow),
  );
  return { rows: t, extra: n };
}
function renderCheck(e) {
  const t = ckData();
  if (
    (($("ckEmpty").hidden = !!t),
    ($("ckBody").hidden = !t),
    ($("ckCsv").disabled = !t),
    ($("ckCsv").hidden = !t),
    !t)
  )
    return void emptyBox(
      $("ckEmpty"),
      "Kadrlar bazasi Excel'i kerak",
      "Excel yuklangach, undagi har bir xodimning ma'lumotnomasi ZIP'da bor-yo'qligi shu yerda ko'rinadi.",
      [
        [
          "Excel faylni tanlash",
          () => {
            (showView("excel"), $("xlFile").click());
          },
          "btn",
        ],
        ["Excel bazasi bo'limi", () => showView("excel"), "btn2"],
      ],
    );
  const a = { have: 0, miss: 0, fuzzy: 0 };
  for (const e of t.rows) a[e.st]++;
  const n = items.filter((e) => e.P && !e.excluded && !e.fromExcel).length;
  (($("ckAll").textContent = t.rows.length),
    ($("ckAllS").textContent = `yuklangan fayllar: ${n} ta`),
    ($("ckHave").textContent = a.have),
    ($("ckHaveS").textContent = t.rows.length
      ? Math.round((100 * (a.have + a.fuzzy)) / t.rows.length) +
        "% qamrab olindi"
      : ""),
    ($("ckMiss").textContent = a.miss),
    ($("ckFuz").textContent = a.fuzzy),
    ($("ckExtra").textContent = t.extra.length),
    document
      .querySelectorAll("#ckKpis [data-t]")
      .forEach((e) =>
        e.setAttribute("aria-pressed", String(e.dataset.t === ck.tab)),
      ));
  const i = $("ckDept"),
    o = i.value,
    l = [...new Set(t.rows.map((e) => e.dept).filter(Boolean))].sort((e, t) =>
      e.localeCompare(t),
    );
  if (i.options.length - 1 !== l.length) {
    ((i.textContent = ""), i.append(new Option("Hammasi", "")));
    for (const e of l)
      i.append(new Option(e.length > 60 ? e.slice(0, 60) + "…" : e, e));
    i.value = l.includes(o) ? o : "";
  }
  ((i.closest("label").hidden = !l.length || "extra" === ck.tab),
    e && (ck.page = 0));
  const s = SpravkaCore.norm(toCyr($("ckQ").value)),
    r = SpravkaCore.norm($("ckQ").value),
    d = (e) =>
      !s ||
      SpravkaCore.norm(toCyr(e)).includes(s) ||
      SpravkaCore.norm(e).includes(r);
  let c;
  ((c =
    "extra" === ck.tab
      ? t.extra.filter((e) => d(e.P.name || e.name)).map((e) => ({ it: e }))
      : t.rows.filter(
          (e) => e.st === ck.tab && (!i.value || e.dept === i.value) && d(e.nm),
        )),
    (ck.list = c),
    (ck.D = t),
    ($("ckH4").textContent =
      "extra" === ck.tab
        ? "Fayl"
        : "miss" === ck.tab
          ? "Holat"
          : "Topilgan fayl"));
  const p = Math.max(1, Math.ceil(c.length / 20));
  ck.page >= p && (ck.page = p - 1);
  const m = $("ckList");
  if (
    ((m.textContent = ""),
    c.slice(20 * ck.page, 20 * ck.page + 20).forEach((e, t) => {
      const a = el("tr"),
        n = 20 * ck.page + t + 1;
      if (e.it) {
        const t = e.it,
          i = t.P,
          o = el("td");
        o.append(el("b", "", i.name || "(ism aniqlanmadi)"));
        const l = el("td");
        l.append(el("span", "", i.position || "—"));
        const s = el("td");
        s.append(el("span", "", t.name || ""), el("small", "", t.folder || ""));
        const r = el("td", "acts"),
          d = el("button", "btn2", "Ko'rish");
        ((d.type = "button"),
          (d.onclick = () => {
            (selectItem(t), showView("review"));
          }),
          r.append(d),
          a.append(el("td", "n", String(n)), o, l, s, r));
      } else {
        const t = el("td");
        t.append(el("b", "", e.nm));
        const i = parseDate(ckG(e.row, "birth_date"));
        i &&
          t.append(
            el(
              "small",
              "",
              "tug‘ilgan: " + (i.d ? `${p2(i.d)}.${p2(i.m)}.${i.y}` : i.y),
            ),
          );
        const o = el("td");
        (o.append(el("span", "", e.pos || "—")),
          e.dept &&
            !SpravkaCore.norm(e.pos).includes(SpravkaCore.norm(e.dept)) &&
            o.append(el("small", "", e.dept)));
        const l = el("td"),
          s = el("td", "acts"),
          r = el("div", "ra");
        if ("miss" === e.st) {
          (l.append(el("span", "st-miss", "Ma'lumotnoma yo'q")),
            e.dupOf &&
              l.append(
                el(
                  "small",
                  "",
                  `Excel'da takror qator bo'lishi mumkin: ${e.dupOf.nm} (ma'lumotnomasi bor)`,
                ),
              ));
          const t = el("button", "btn2", "Excel'dan yaratish");
          ((t.type = "button"),
            (t.onclick = () => {
              (createFromExcel(e.i, "lat" === scriptNow()),
                toast(`${e.nm} — Excel'dan ma'lumotnoma yaratildi ✓`),
                renderCheck());
            }),
            r.append(t));
        } else {
          for (const t of e.its) {
            const a = el(
              "span",
              "fuzzy" === e.st ? "st-fz" : "st-ok",
              ("fuzzy" === e.st ? "≈ " : "✓ ") + (t.P.name || t.name),
            );
            (l.append(a),
              l.append(
                el(
                  "small",
                  "",
                  t.fromExcel ? "Excel'dan yaratilgan" : t.name || "",
                ),
              ));
          }
          const t = el("button", "btn2", "Ko'rish");
          ((t.type = "button"),
            (t.onclick = () => {
              (selectItem(e.its[0]), showView("review"));
            }),
            r.append(t));
        }
        (s.append(r), a.append(el("td", "n", String(n)), t, o, l, s));
      }
      m.append(a);
    }),
    !c.length)
  ) {
    const e = el("tr", "empty"),
      t = el(
        "td",
        "",
        "miss" === ck.tab
          ? a.miss
            ? "Qidiruvga mos xodim yo‘q."
            : "Excel'dagi hamma xodimning ma'lumotnomasi bor ✓"
          : "Ro‘yxat bo‘sh.",
      );
    ((t.colSpan = 5), e.append(t), m.append(e));
  }
  $("ckInfo").textContent = `${c.length} ta`;
  const u = $("ckPager");
  if (((u.textContent = ""), (u.hidden = p <= 1), p > 1))
    for (let e = 0; e < p; e++) {
      if (p > 9 && e > 1 && e < p - 2 && Math.abs(e - ck.page) > 1) {
        (u.lastChild && "gap" === u.lastChild.className) ||
          u.append(el("span", "gap", "…"));
        continue;
      }
      const t = el(
        "button",
        "pg" + (e === ck.page ? " on" : ""),
        String(e + 1),
      );
      ((t.type = "button"),
        e === ck.page && t.setAttribute("aria-current", "page"),
        (t.onclick = () => {
          ((ck.page = e), renderCheck());
        }),
        u.append(t));
    }
  const h = $("nChk");
  h && (h.textContent = a.miss ? String(a.miss) : "");
}
(document.querySelectorAll("#ckKpis [data-t]").forEach((e) =>
  e.addEventListener("click", () => {
    ((ck.tab = e.dataset.t), renderCheck(!0));
  }),
),
  $("ckQ").addEventListener("input", () => renderCheck(!0)),
  $("ckDept").addEventListener("change", () => renderCheck(!0)),
  $("ckCsv").addEventListener("click", async () => {
    const e = ckData();
    if (!e) return;
    const t = (e) => '"' + String(null == e ? "" : e).replace(/"/g, '""') + '"',
      a = {
        miss: "Ma'lumotnoma yo'q",
        fuzzy: "Ism taxminan mos — tekshiring",
        have: "Bor",
      },
      n = [["№", "F.I.Sh.", "Bo'linma", "Lavozimi", "Holat", "Fayl"]],
      i = { miss: 0, fuzzy: 1, have: 2 };
    [...e.rows]
      .sort(
        (e, t) =>
          i[e.st] - i[t.st] ||
          e.dept.localeCompare(t.dept) ||
          e.nm.localeCompare(t.nm),
      )
      .forEach((e, t) =>
        n.push([
          t + 1,
          e.nm,
          e.dept,
          e.pos,
          a[e.st] + (e.dupOf ? ` (Excel'da takror: ${e.dupOf.nm})` : ""),
          e.its.map((e) => e.name).join("; "),
        ]),
      );
    for (const t of e.extra)
      n.push([
        n.length,
        t.P.name || "",
        "",
        t.P.position || "",
        "Excel'da yo'q",
        t.name || "",
      ]);
    const l = new Date(),
      s = `${p2(l.getDate())}.${p2(l.getMonth() + 1)}.${l.getFullYear()}`;
    (await save(
      $("ckCsv"),
      $("ckEmpty"),
      `Yoqlama_malumotnomalar_${s}.xlsx`,
      await xlsxBuild([
        {
          name: "Yoqlama",
          rows: n,
          head: 1,
          freeze: !0,
          filter: !0,
          widths: [5, 28, 26, 30, 42, 34],
        },
      ]),
    )) && toast("Yo'qlama ro'yxati yuklandi ✓");
  }),
  updateStats());

