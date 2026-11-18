/**
 * 02-matching-fields.js — Shablonlar (SCRIPTS), normallashtirish (norm), oʻxshashlik (ratio), ism qismlari (nameParts) va maydon formatlash
 */
  const A = {
      рафикаси: "Турмуш ўртоғи",
      хотини: "Турмуш ўртоғи",
      хотиним: "Турмуш ўртоғи",
      турмушуртогим: "Турмуш ўртоғи",
      эрим: "Турмуш ўртоғи",
      эри: "Турмуш ўртоғи",
      турмушурток: "Турмуш ўртоғи",
      турмушуртоги: "Турмуш ўртоғи",
      каиногаси: "Қайноғаси",
      каинога: "Қайноғаси",
      каиниакаси: "Қайни акаси",
      каиниукаси: "Қайни укаси",
      каиниопаси: "Қайни опаси",
      каинсингили: "Қайнсингили",
      каинисинглиси: "Қайнсингили",
      божаси: "Божаси",
      божа: "Божаси",
      поччаси: "Поччаси",
      почча: "Поччаси",
    },
    O = {
      cyr: {
        latin: !1,
        dateSuffix: "й",
        year: "йил",
        labels: Object.fromEntries(
          Object.entries(s).map(([t, e]) => [t, e[0]]),
        ),
        title: "МАЪЛУМОТНОМА",
        work: "МЕҲНАТ ФАОЛИЯТИ",
        relTitle: "МАЪЛУМОТ",
        relSuffix: "нинг яқин қариндошлари ҳақида",
        relHeaders: [
          "Қариндош-лиги",
          "Фамилияси, исми ва отасининг исми",
          "Туғилган йили ва жойи",
          "Иш жойи ва лавозими",
          "Турар жойи",
        ],
        relations: Object.fromEntries(i.map((t) => [t, t])),
      },
      lat: {
        latin: !0,
        dateSuffix: "y",
        year: "yil",
        labels: {
          birth_date: "Tug‘ilgan yili",
          birth_place: "Tug‘ilgan joyi",
          nationality: "Millati",
          party: "Partiyaviyligi",
          education: "Ma’lumoti",
          grad_year: "Tamomlagan",
          specialty: "Ma’lumoti bo‘yicha mutaxassisligi",
          degree: "Ilmiy darajasi",
          title: "Ilmiy unvoni",
          languages: "Qaysi chet tillarini biladi",
          military: "Harbiy (maxsus) unvoni",
          awards: "Davlat mukofotlari bilan taqdirlanganmi (qanaqa)",
          deputy:
            "Xalq deputatlari, respublika, viloyat, shahar va tuman Kengashi deputatimi yoki boshqa saylanadigan organlarning a’zosimi (to‘liq ko‘rsatilishi lozim)",
        },
        title: "MA’LUMOTNOMA",
        work: "MEHNAT FAOLIYATI",
        relTitle: "MA’LUMOT",
        relSuffix: "ning yaqin qarindoshlari haqida",
        relHeaders: [
          "Qarindosh-ligi",
          "Familiyasi, ismi va otasining ismi",
          "Tug‘ilgan yili va joyi",
          "Ish joyi va lavozimi",
          "Turar joyi",
        ],
        relations: {
          Отаси: "Otasi",
          Онаси: "Onasi",
          Акаси: "Akasi",
          Укаси: "Ukasi",
          Опаси: "Opasi",
          Синглиси: "Singlisi",
          "Турмуш ўртоғи": "Turmush o‘rtog‘i",
          Ўғли: "O‘g‘li",
          Қизи: "Qizi",
          Қайнотаси: "Qaynotasi",
          Қайнонаси: "Qaynonasi",
          Қайноғаси: "Qaynog‘asi",
          "Қайни акаси": "Qayni akasi",
          "Қайни укаси": "Qayni ukasi",
          "Қайни опаси": "Qayni opasi",
          Қайнсингили: "Qaynsingili",
          Божаси: "Bojasi",
          Поччаси: "Pochchasi",
        },
      },
    },
    _ = new Map(
      Object.entries({
        ў: "у",
        қ: "к",
        ғ: "г",
        ҳ: "х",
        ё: "е",
        э: "е",
        й: "и",
        ъ: "",
        ь: "",
        ʻ: "",
        ʼ: "",
        "'": "",
        "’": "",
        "`": "",
        "‘": "",
        a: "а",
        c: "с",
        e: "е",
        o: "о",
        p: "р",
        x: "х",
        y: "у",
        k: "к",
        m: "м",
        t: "т",
        h: "н",
        b: "в",
      }),
    ),
    U = [
      ["o'", "ў"],
      ["g'", "ғ"],
      ["sh", "ш"],
      ["ch", "ч"],
      ["ng", "нг"],
      ["yo", "ё"],
      ["ya", "я"],
      ["yu", "ю"],
      ["ye", "е"],
    ],
    L = {
      a: "а",
      b: "б",
      c: "с",
      d: "д",
      e: "е",
      f: "ф",
      g: "г",
      h: "х",
      i: "и",
      j: "ж",
      k: "к",
      l: "л",
      m: "м",
      n: "н",
      o: "о",
      p: "п",
      q: "қ",
      r: "р",
      s: "с",
      t: "т",
      u: "у",
      v: "в",
      x: "х",
      y: "й",
      z: "з",
      "'": "",
    };
  function I(t) {
    let e = t.toLowerCase();
    (e.match(/[a-z]/g) || []).length > (e.match(/[а-яёўқғҳ]/g) || []).length &&
      (e = (function (t) {
        const e = t.replace(/[‘’ʻʼ`´]/g, "'");
        let n = "";
        for (let t = 0; t < e.length;) {
          let s = !1;
          for (const [i, a] of U)
            if (e.startsWith(i, t)) {
              ((n += a), (t += i.length), (s = !0));
              break;
            }
          if (s) continue;
          const i = e[t++];
          n += Object.prototype.hasOwnProperty.call(L, i) ? L[i] : i;
        }
        return n;
      })(e));
    let n = "";
    for (const t of e) n += _.has(t) ? _.get(t) : t;
    return n.replace(/[^0-9a-zа-я]/g, "");
  }
  const N = /^(?:угли|огли|кизи|киз|ули|оглу|улы|кизи|х{2,}|x{2,})$/;
  function D(t) {
    return I(t)
      .replace(/дж/g, "ж")
      .replace(/ц/g, "с")
      .replace(/щ/g, "ш")
      .replace(/я/g, "иа")
      .replace(/ю/g, "иу")
      .replace(/([аеиоу])ие/g, "$1е")
      .replace(/боев/g, "баев")
      .replace(/^[оу]гул/g, "угил")
      .replace(/(.)\1+/g, "$1");
  }
  function E(t) {
    const e = String(t || "")
      .replace(/\([^)]*\)/g, " ")
      .replace(/[_]+/g, " ")
      .replace(/\d+/g, " ")
      .split(/[\s,.;:]+|(?<=\S)-(?=\S)/)
      .filter(Boolean)
      .map(D)
      .filter((t) => t && !N.test(t));
    return {
      sur: e[0] || "",
      giv: e[1] || "",
      pat: e[2]
        ? ((n = e[2]),
          n.replace(/(?:овна|евна|ична|овна|ович|евич|ич|вна|на)$/, ""))
        : "",
      n: e.length,
    };
    var n;
  }
  function F(t, e) {
    const n = I(String(t || "")).replace(/академиклице/g, "лице");
    return n
      ? /университет|институт|академи|консерватор|олийтаълим|олийтаьлим|магистр|бакалавр|тдпу|тдиу|тату|тошдау|узму|самду|бухду|терду|тердпи|тдту|тдю|отм/.test(
          n,
        )
        ? e
          ? "oliy"
          : "олий"
        : /коллеж|колледж|колеж|лице|техникум|билимюрти|касбхунар|мактаб/.test(
              n,
            )
          ? e
            ? "o‘rta maxsus"
            : "ўрта махсус"
          : ""
      : "";
  }
  function H(t, e, n, s, i, a) {
    if (e >= n || i >= a) return 0;
    let o = 0,
      r = e,
      l = i,
      c = new Int32Array(a - i + 1);
    for (let h = e; h < n; h++) {
      const e = new Int32Array(a - i + 1);
      for (let n = i; n < a; n++)
        if (t[h] === s[n]) {
          const t = c[n - i] + 1;
          ((e[n - i + 1] = t),
            t > o && ((o = t), (r = h - t + 1), (l = n - t + 1)));
        }
      c = e;
    }
    return 0 === o ? 0 : o + H(t, e, r, s, i, l) + H(t, r + o, n, s, l + o, a);
  }
  function R(t, e) {
    return t.length || e.length
      ? (2 * H(t, 0, t.length, e, 0, e.length)) / (t.length + e.length)
      : 1;
  }
  function Z(t) {
    return (function (t) {
      t = t.replace(/[«»„“”‟]/g, '"');
      let e = "",
        n = !1;
      for (const s of t)
        '"' === s ? ((e += n ? "”" : "“"), (n = !n)) : (e += s);
      return e;
    })(
      (t = (t = (t = (t = (t = t.replace(/ /g, " ").replace(/​/g, ""))
        .replace(/\s+/g, " ")
        .trim()).replace(/\s+([,.;:)])/g, "$1")).replace(
        /\(\s+/g,
        "(",
      )).replace(/,(?=[^\s\d])/g, ", ")),
    );
  }
  function B(t, e) {
    const n = t.match(/(\d{1,2})[./\-](\d{1,2})[./\-](\d{4})/);
    if (!n) return [t, !1];
    const s = (t) => String(parseInt(t, 10)).padStart(2, "0");
    return +n[2] > 12 && +n[1] <= 12
      ? [`${s(n[2])}.${s(n[1])}.${n[3]}`, !0, !0]
      : [`${s(n[1])}.${s(n[2])}.${n[3]}`, !0];
  }
  const W =
    /(?<![А-Яа-яЁёЎўҚқҒғҲҳA-Za-z‘’'])(вилояти|тумани|шаҳри|шаҳар|шахри|шахар|viloyati|tumani|shahri|shahar)(,?)[ \t]+(?=[^\s)])/gi;
  function G(t, e, n) {
    let s = String(t || "")
      .replace(/\s*\n\s*/g, " ")
      .trim();
    if (!s) return s;
    if ("birth" === e) {
      const t = n && n.latin;
      ((s = s.replace(
        /^\d{1,2}\.\d{1,2}\.(\d{4})(?=\s*-?\s*(?:йил|йили|yil|yili|й\.|y\.)?(?![\d.]))/i,
        "$1",
      )),
        (s = s
          .replace(
            /^(\d{4})\s*[-–]?\s*(?:йили|йил|й\.|y\s?ili|y\s?il|y\.)(?![A-Za-zА-Яа-яЎўҚқҒғҲҳ])\s*(,?)\s*/i,
            (e, n, s) => `${n}-${t ? "yil" : "йил"}${s || ","}\n`,
          )
          .replace(/\n$/, "")
          .replace(/,\n?$/, "")));
    }
    return s.replace(W, "$1$2\n");
  }
  function Q(t, e) {
    const n = (t = String(t || "").replace(
      /^\d{1,2}\.\d{1,2}\.(\d{4})(?=\s*-?\s*(?:йил|йили|yil|yili|й\.|y\.)?(?![\d.]))/i,
      "$1",
    )).match(
      /^(\d{4})\s*[-–]?\s*(?:йили|йил|йй?\.?|г\.?|yili|yil|yy?\.?)?\s*[,;.]?\s*(.*)$/i,
    );
    return n
      ? [`${n[1]} ${e ? e.year : "йил"}` + (n[2] ? `, ${n[2]}` : ""), !0]
      : [t, !1];
  }
  const J = [];
  for (const [t, e] of Object.entries(s))
    for (const n of e) J.push([t, n, I(n)]);
  const V = 0.86;
  function X(t) {
    let e = null,
      n = null;
    const s = Math.min(t.length, 40);
    for (
      let i = 1;
      i <= s &&
      !(
        i > 1 &&
        (/:$/.test(t[i - 2]) ||
          (/\)$/.test(t[i - 2]) && e && e[1] === i - 1 && e[0] >= 0.9))
      );
      i++
    ) {
      const s = I(t.slice(0, i).join(" "));
      if (s)
        for (const [t, , a] of J) {
          if (Math.abs(s.length - a.length) > 0.35 * a.length + 3) continue;
          const o = R(s, a);
          o < V ||
            ((null === e || o > e[0] || (o === e[0] && i > e[1])) &&
              (e = [o, i, t]),
            o >= 0.9 &&
              (null === n || i > n[1] || (i === n[1] && o > n[0])) &&
              (n = [o, i, t]));
        }
    }
    const i = n || e;
    if (i) return [i[2], i[1], null];
    const a = I(t.slice(0, 40).join(" ")),
      o = a.length;
    if (o >= 10)
      for (const [e, , n] of J)
        if (n.length > 25 && o < 0.9 * n.length && R(a, n.slice(0, o)) >= 0.88)
          return [e, t.length, [n, a]];
    return null;
  }
