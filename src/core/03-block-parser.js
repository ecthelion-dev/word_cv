/**
 * 03-block-parser.js — Hujjat bloklaridan shaxsiy maydonlar, mehnat faoliyati va qarindoshlar jadvalini ajratib olish
 */
  const Y =
      /(?:^|\s)(?:til(?:i|lari)|тил(?:и|лари))(?:\s|$|[,.;])|^(?:ingliz|rus|nemis|fransuz|arab|turk|xitoy|koreys|yapon|tojik|qozoq|ispan|italyan|англиз|инглиз|рус|немис|француз|араб|турк|хитой|корейс|япон|тожик|қозоқ|испан|итальян)/i,
    K =
      /^[A-ZА-ЯЎҚҒҲЁ][^\s\d:]+(?:\s+[A-ZА-ЯЎҚҒҲЁ][^\s\d:]+){1,2}\s+(?:[^\s\d:]+(?:ович|евич|овна|евна|ovich|evich|ovna|evna)|[^\s\d:]+\s+(?:ўғли|қизи|угли|кизи|o[‘'`ʻ’]?g[‘'`ʻ’]?li|qizi))$/,
    tt = {
      w: "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
      a: "http://schemas.openxmlformats.org/drawingml/2006/main",
      r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
      wp: "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing",
    },
    et = (t) => Array.from(t.childNodes).filter((t) => 1 === t.nodeType),
    nt = (t, e, n) => t.namespaceURI === tt[e] && t.localName === n,
    st = new Set([
      "drawing",
      "pict",
      "object",
      "txbxContent",
      "AlternateContent",
      "pPr",
      "rPr",
    ]);
  function it(t) {
    let e = "";
    return (
      (function t(n) {
        for (const s of et(n))
          if (!st.has(s.localName)) {
            if (s.namespaceURI === tt.w) {
              if ("t" === s.localName) {
                e += s.textContent;
                continue;
              }
              if ("tab" === s.localName) {
                e += "\t";
                continue;
              }
              if ("br" === s.localName) {
                const t =
                  s.getAttributeNS(tt.w, "type") || s.getAttribute("w:type");
                "page" !== t && "column" !== t && (e += "\n");
                continue;
              }
              if ("cr" === s.localName) {
                e += "\n";
                continue;
              }
              if ("noBreakHyphen" === s.localName) {
                e += "-";
                continue;
              }
            }
            t(s);
          }
      })(t),
      e
    );
  }
  const at = "http://schemas.openxmlformats.org/markup-compatibility/2006";
  function ot(t) {
    const e = [],
      n = t.getElementsByTagNameNS(tt.w, "txbxContent");
    for (let s = 0; s < n.length; s++) {
      let i = n[s].parentNode,
        a = !1;
      for (; i && i !== t;) {
        if (
          (i.namespaceURI === at && "Fallback" === i.localName) ||
          (i.namespaceURI === tt.w && "txbxContent" === i.localName)
        ) {
          a = !0;
          break;
        }
        i = i.parentNode;
      }
      a || e.push(n[s]);
    }
    return e;
  }
  function rt(t) {
    for (const e of et(t).filter((t) => nt(t, "w", "tr")))
      for (const t of et(e).filter((t) => nt(t, "w", "tc")))
        for (const e of et(t)) {
          if (nt(e, "w", "tbl")) return !0;
          if (nt(e, "w", "p") && ot(e).length) return !0;
        }
    return !1;
  }
  function* lt(t) {
    for (const e of et(t))
      if (nt(e, "w", "p")) {
        yield { type: "p", el: e };
        for (const t of ot(e)) yield* lt(t);
      } else if (nt(e, "w", "tbl"))
        if (rt(e))
          for (const t of et(e).filter((t) => nt(t, "w", "tr")))
            for (const e of et(t).filter((t) => nt(t, "w", "tc"))) yield* lt(e);
        else yield { type: "tbl", el: e };
      else if (nt(e, "w", "sdt"))
        for (const t of et(e)) nt(t, "w", "sdtContent") && (yield* lt(t));
  }
  function ct(t) {
    const e = [];
    let n = [];
    for (const s of et(t).filter((t) => nt(t, "w", "tr"))) {
      const t = [];
      t.raw = [];
      const i = [];
      let a = 0;
      for (const e of et(s).filter((t) => nt(t, "w", "tc"))) {
        const s = et(e).find((t) => nt(t, "w", "tcPr"));
        let o,
          r = 1,
          l = !1;
        if (s)
          for (const t of et(s))
            if (
              (nt(t, "w", "gridSpan") &&
                (r =
                  parseInt(
                    t.getAttributeNS(tt.w, "val") ||
                      t.getAttribute("w:val") ||
                      "1",
                    10,
                  ) || 1),
              nt(t, "w", "vMerge"))
            ) {
              const e =
                t.getAttributeNS(tt.w, "val") || t.getAttribute("w:val");
              (e && "continue" !== e) || (l = !0);
            }
        ((o =
          l && void 0 !== n[a]
            ? n[a]
            : et(e)
                .filter((t) => nt(t, "w", "p"))
                .map(it)
                .join("\n")),
          t.push(Z(o.replace(/\n/g, " "))),
          t.raw.push(o));
        for (let t = 0; t < r; t++) i[a + t] = o;
        a += r;
      }
      ((n = i), e.push(t));
    }
    return e;
  }
  function ht(t) {
    const e = {};
    let n = 0;
    const s = new Set();
    return (
      t.forEach((t, i) => {
        const a = I(t);
        let o = null;
        (a.includes("каринд") || a.startsWith("карин")
          ? (o = "rel")
          : a.includes("фамил") || a.includes("исми")
            ? (o = "name")
            : a.includes("тугилган")
              ? (o = "birth")
              : a.startsWith("иш") ||
                  a.includes("ишжой") ||
                  a.includes("лавозим") ||
                  a.includes("вазифа") ||
                  a.includes("фаолият")
                ? (o = "work")
                : ["турар", "яшаш", "манзил"].some((t) => a.includes(t)) &&
                  (o = "address"),
          o && !s.has(o) && (s.add(o), (e[i] = o), n++));
      }),
      5 === t.length &&
        4 === n &&
        t.forEach((t, i) => {
          if (!e[i]) {
            const t = a.find((t) => !s.has(t));
            t && (s.add(t), (e[i] = t), n++);
          }
        }),
      [e, n]
    );
  }
  function ft(t) {
    const e = I(t);
    if (A[e]) return A[e];
    let n = i[0],
      s = -1;
    for (const t of i) {
      const i = R(e, I(t));
      i > s && ((s = i), (n = t));
    }
    return s >= 0.85 ? n : t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
  }
  function pt(t) {
    if (t.length < 2) return !1;
    const [, e] = ht(t[0]);
    if (e >= 3) return !0;
    let n = 0;
    for (const e of t.slice(0, 8)) {
      if (!e.length) continue;
      const t = I(e[0]);
      (A[t] || i.some((e) => R(t, I(e)) >= 0.85)) && n++;
    }
    return n >= 2;
  }
  function gt(t, e) {
    let n = {},
      s = 0;
    for (let e = 0; e < Math.min(3, t.length); e++) {
      const [i, a] = ht(t[e]);
      if (a >= 3) {
        ((n = i), (s = e + 1));
        break;
      }
    }
    const i = Object.keys(n).length > 0;
    i ||
      e.warnings.push(
        "Qarindoshlar jadvalida sarlavha qatori topilmadi — ustunlar standart tartibda deb olindi.",
      );
    for (const o of t.slice(s)) {
      let t = o;
      if (!t.some((t) => t)) continue;
      const s = { rel: "", name: "", birth: "", work: "", address: "" };
      if (i)
        for (const [e, i] of Object.entries(n)) +e < t.length && (s[i] = t[+e]);
      else
        (6 === t.length && /^\d+\.?$/.test(t[0] || "x") && (t = t.slice(1)),
          a.forEach((e, n) => {
            n < t.length && (s[e] = t[n]);
          }));
      (s.rel && (s.rel = ft(s.rel)), e.relatives.push(s));
    }
  }
  function dt(t) {
    if (137 === t[0] && 80 === t[1])
      return {
        w: ((t[16] << 24) | (t[17] << 16) | (t[18] << 8) | t[19]) >>> 0,
        h: ((t[20] << 24) | (t[21] << 16) | (t[22] << 8) | t[23]) >>> 0,
      };
    if (71 === t[0] && 73 === t[1])
      return { w: t[6] | (t[7] << 8), h: t[8] | (t[9] << 8) };
    if (66 === t[0] && 77 === t[1])
      return {
        w: t[18] | (t[19] << 8),
        h: Math.abs(t[22] | (t[23] << 8) | (t[24] << 16) | (t[25] << 24)),
      };
    if (255 === t[0] && 216 === t[1]) {
      let e = 2;
      for (; e + 9 < t.length;) {
        if (255 !== t[e]) {
          e++;
          continue;
        }
        const n = t[e + 1],
          s = (t[e + 2] << 8) | t[e + 3];
        if (n >= 192 && n <= 207 && 196 !== n && 200 !== n && 204 !== n)
          return {
            w: (t[e + 7] << 8) | t[e + 8],
            h: (t[e + 5] << 8) | t[e + 6],
          };
        e += 2 + s;
      }
    }
    return null;
  }
  function ut(t) {
    const e = dt(t.bytes),
      n = { l: 0, t: 0, r: 0, b: 0 };
    for (const e of Object.keys(n))
      t.crop && t.crop[e] && (n[e] = parseInt(t.crop[e], 10) / 1e5);
    let s, i;
    if (
      (e && e.w && e.h
        ? ((s = e.w * (1 - n.l - n.r)), (i = e.h * (1 - n.t - n.b)))
        : t.cx && t.cy && ((s = t.cx), (i = t.cy)),
      s && i)
    ) {
      const t = 2.82 / 3.5,
        e = s / i;
      if (e > 1.01 * t) {
        const s = (1 - t / e) * (1 - n.l - n.r);
        ((n.l += s / 2), (n.r += s / 2));
      } else if (e < t / 1.01) {
        const s = (1 - e / t) * (1 - n.t - n.b);
        ((n.t += s / 3), (n.b += (2 * s) / 3));
      }
    }
    const a = {};
    for (const [t, e] of Object.entries(n))
      e > 5e-4 && (a[t] = String(Math.round(1e5 * e)));
    return (
      (t.crop = Object.keys(a).length ? a : null),
      (t.cx = 1015200),
      (t.cy = 126e4),
      t
    );
  }
  const mt = new Set(["jpeg", "jpg", "png", "gif", "bmp", "webp"]);
  const wt = {
    birth_place: "birth_date",
    party: "nationality",
    grad_year: "education",
    title: "degree",
    military: "languages",
  };
  function yt(t, e) {
    const n = {
      name: "",
      since: "",
      position: "",
      fields: {},
      work: [],
      relHeadingName: "",
      relatives: [],
      photo: e,
      warnings: [],
      foundRelTable: !1,
    };
    let i = "head",
      a = !1;
    const o = [];
    let r = null,
      l = null,
      c = null;
    const h = [],
      p = [];
    function g(t) {
      if (o.length || !m || m !== l || void 0 === n.fields[l])
        if (((m = null), o.length)) {
          const e = o.shift();
          ((n.fields[e] = ((n.fields[e] || "") + " " + t).trim()),
            (l = e),
            (m = e));
        } else if (
          l &&
          "languages" !== l &&
          Y.test(t) &&
          void 0 !== n.fields.languages
        )
          ((n.fields.languages =
            (n.fields.languages ? n.fields.languages + ", " : "") + t),
            n.warnings.push(
              `«${t}» chet tillari ro‘yxatiga qo‘shildi — tekshiring.`,
            ));
        else if (
          l &&
          wt[l] &&
          n.fields[wt[l]] &&
          (function (t, e, n, s) {
            const i = String(e).trim(),
              a = String(n).trim();
            return (
              !(
                "degree" !== t ||
                !/доктор|номзод|nomzod|doktor|\bPhD\b|\bDSc\b|кандидат|kandidat/i.test(
                  a,
                ) ||
                /доцент|профессор|dotsent|professor|илмий\s+ходим|ilmiy\s+xodim/i.test(
                  a,
                )
              ) ||
              !(
                s ||
                !/(?:бўйича|буйича|bo.?yicha|фанлари|fanlari|ва|va|ҳамда|hamda|[,(-])$/i.test(
                  i,
                )
              )
            );
          })(wt[l], n.fields[wt[l]], t, d)
        ) {
          const e = wt[l];
          ((n.fields[e] = (n.fields[e] + " " + t).trim()),
            n.warnings.push(
              `«${t}» «${{ birth_date: "Tug‘ilgan yili", nationality: "Millati", education: "Ma’lumoti", degree: "Ilmiy darajasi", languages: "Chet tillari" }[e]}» maydonining davomi deb olindi — tekshiring.`,
            ));
        } else
          l
            ? ((n.fields[l] = (n.fields[l] + "\n" + t).trim()),
              n.warnings.push(
                `«${t}» oldingi maydonning davomi deb olindi — tekshiring.`,
              ))
            : p.push(t);
      else n.fields[l] = (n.fields[l] + " " + t).trim();
    }
    let d = !1,
      u = !1,
      m = null;
    function w(t) {
      if (!(t = t.replace(/^\s*(?:[•·▪●\-–—]\s+|\d{1,2}[.)]\s+)/, ""))) return;
      const e = I(t);
      if (
        R(e, "малумот") >= 0.85 ||
        (!/^\d{4}/.test(t) &&
          (/кари?н?д[оа]ш|якин|нинг(?:хак[иы]да|тугрисида|тогрисида|туррисида)/.test(
            e,
          ) &&
            /хак[иы]да|тугрисида|тогрисида|туррисида/.test(e)))
      )
        return void y(t);
      n.work.push(t);
    }
    function y(t) {
      if (t.includes("\n")) {
        for (const e of t.split("\n")) y(e);
        return;
      }
      ((d = /^(?:\t| {3,})/.test(t)), (m = null));
      const e = t
        .split(/\t+| {3,}/)
        .map(Z)
        .filter((t) => t);
      if (!e.length) return;
      const s = Z(e.join(" ")),
        l = s.split(" ");
      if ("head" === i && R(I(s), "намуна") >= 0.85) return;
      if ("head" === i) {
        let t = 0,
          e = 0;
        for (let n = 1; n <= Math.min(l.length, 16); n++) {
          const s = I(l.slice(0, n).join(""));
          if (s.length > 14) break;
          const i = s.length >= 9 ? R(s, "малумотнома") : 0;
          i >= 0.85 && i >= e && ((t = n), (e = i));
        }
        if (
          (!t &&
            1 === l.length &&
            !/:$/.test(s) &&
            R(I(s), "малумот") >= 0.9 &&
            (t = 1),
          t)
        ) {
          a = !0;
          const e = l.slice(t).join(" ");
          return void (e && !n.name && (n.name = e));
        }
      }
      const f =
        l.length >= 4 &&
        l.every((t) => t.replace(/[^\p{L}]/gu, "").length <= 2);
      if ((l.length <= 4 || f) && R(I(s), "мехнатфаолияти") >= 0.8)
        return void (i = "work");
      if ((l.length <= 2 || f) && R(I(s), "мехнат") >= 0.85 && "work" !== i)
        return ((i = "work"), void (u = !0));
      if (u && "work" === i && !n.work.length && R(I(s), "фаолияти") >= 0.8)
        return void (u = !1);
      const p = I(s);
      if (
        (((/кари?н?д[оа]ш/.test(p) ||
          p.includes("якин") ||
          (!/^\d{4}/.test(s) &&
            /нинг(?:хак[иы]да|тугрисида|тогрисида|туррисида)/.test(p))) &&
          /хак[иы]да|тугрисида|тогрисида|туррисида/.test(p)) ||
          (/якинкари?н?д[оа]ш/.test(p) && !/^\d{4}/.test(s))) &&
        l.length <= 20
      ) {
        let t = "";
        if ("work" === i && n.work.length) {
          const e = n.work[n.work.length - 1];
          !/^\d/.test(e) &&
            e.split(" ").length <= 3 &&
            /^[A-ZА-ЯЎҚҒҲЁ]/.test(e) &&
            (t = n.work.pop() + " ");
        }
        i = "rel";
        const e = (t + s).split(
          /\s+(?:яқин|yaqin|қариндош|qarindosh|ҳақида|haqida|тўғрисида|to[‘'`ʻ’]?g[‘'`ʻ’]?risida)/i,
        )[0];
        return void (n.relHeadingName = e
          .replace(
            /^(?:.*?\b(?:кафедраси|бўлими|факультети|институти|университети|маркази|ўқитувчиси|ўқитувчи|доценти|доцент|профессори|профессор|мудири|мудир|бошлиғи|декани|проректори|ректори|kafedrasi|bo‘limi|fakulteti|instituti|universiteti|markazi|o‘qituvchisi|o‘qituvchi|dotsenti|dotsent|professori|professor|mudiri|mudir|boshlig‘i|dekani|prorektori|rektori)\s+)?(?:(?:в\.?\s*б\.?|v\.?\s*b\.?)\s*)?(?:(?:доцент|профессор|dotsent|professor)\s*)?(?:(?:в\.?\s*б\.?|v\.?\s*b\.?)\s*)?/i,
            "",
          )
          .replace(/(?:нинг|ning)$/i, "")
          .trim());
      }
      if ("work" === i && l.length <= 2 && R(p, "малумот") >= 0.85) {
        if (n.work.length) {
          const t = n.work[n.work.length - 1];
          !/^\d/.test(t) &&
            t.split(" ").length <= 4 &&
            /^[A-ZА-ЯЎҚҒҲЁ]/.test(t) &&
            (n.relHeadingName = n.work
              .pop()
              .replace(/(?:нинг|ning)$/i, "")
              .trim());
        }
        return void (i = "rel");
      }
      if ("rel" === i) {
        if (R(p, "малумот") >= 0.85) return;
        return void n.warnings.push(
          `Qarindoshlar bo‘limida jadvaldan tashqari matn: «${s}»`,
        );
      }
      if ("work" === i) return void w(s);
      let b = !0,
        x = !1,
        $ = !1;
      for (const t of e) {
        if (r) {
          const [e, n] = r,
            s = n + I(t);
          if (R(s, e.slice(0, s.length)) >= 0.86) {
            ((r = s.length >= 0.9 * e.length ? null : [e, s]), ($ = !0));
            continue;
          }
          r = null;
        }
        const e = t
            .replace(/:+$/, "")
            .split(" ")
            .filter((t) => t),
          n = e.length ? X(e) : null;
        if (n) {
          const [t, s, a] = n;
          (b && "value" === c && (o.length = 0),
            (b = !1),
            (i = "fields"),
            o.push(t),
            ($ = !0),
            a && (r = a));
          const l = e.slice(s).join(" ").replace(/^:+/, "").trim();
          l && (g(l), (x = !0));
        } else "head" === i ? h.push(t) : (g(t), (x = !0));
      }
      c = x ? "value" : $ ? "label" : c;
    }
    for (const e of t)
      if ("tbl" !== e.type) e.text.trim() && y(e.text);
      else {
        const t = e.rows;
        if (pt(t)) {
          (gt(t, n), (n.foundRelTable = !0), (i = "rel"));
          continue;
        }
        for (const e of t)
          if ("work" === i) {
            const t = (e.raw || []).map((t) =>
                t
                  .split("\n")
                  .map(Z)
                  .filter((t) => t),
              ),
              s = t.filter((t) => t.length > 1);
            if (
              t.length >= 2 &&
              s.length >= 2 &&
              s.length === t.filter((t) => t.length).length
            ) {
              const e = Math.max(...t.map((t) => t.length));
              for (let n = 0; n < e; n++) {
                const s = t
                  .map((t) => (n < t.length ? t[n] : ""))
                  .filter((t) => t);
                if (n === e - 1)
                  for (const n of t) n.length > e && s.push(...n.slice(e));
                w(s.join(" - "));
              }
              t.some((t) => t.length !== e) &&
                n.warnings.push(
                  "Mehnat faoliyati jadvalida ustunlardagi qatorlar soni teng emas — qatorlar juftlanishini tekshiring.",
                );
            } else {
              const t = e.filter((t) => t).join(" - ");
              t && w(t);
            }
          } else {
            for (const t of e.raw || e) y(t);
            o.length && e.some((t) => !t) && ((o.length = 0), (c = null));
          }
      }
    const b = h.filter((t) => t);
    if (b.length && !n.name) {
      const t = b.findIndex((t) => K.test(t));
      n.name = t >= 0 ? b.splice(t, 1)[0] : b.shift();
    }
    const x = [],
      $ = [];
    for (const t of b) {
      const e = t.match(
        /^(.{0,40}?\d{4}.{0,40}?(?:дан|dan|бери|beri|буён|buyon|бошлаб|boshlab)\s*:)\s*(\S.*)$/i,
      );
      if (e) {
        (x.push(e[1]), $.push(e[2]));
        continue;
      }
      const n =
        !x.length &&
        t.match(/^(\d{4})\s*-?\s*(йил|yil|й\.|y\.)\s+(?![0-9])(\S.{5,})$/i);
      if (
        !n ||
        /:\s*$/.test(n[3]) ||
        /^(?:январ|феврал|март|апрел|май|июн|июл|август|сент|окт|ноябр|декабр|yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sent|okt|noyabr|dekabr|\d)/i.test(
          n[3],
        ) ||
        /(?:дан|dan|буён|buyon|бери|beri)\b/i.test(
          n[3].split(/\s+/).slice(0, 3).join(" "),
        )
      )
        t.endsWith(":") || /\d{4}\s*(?:-?\s*)(?:йил|yil).*(?:дан|dan)$/i.test(t)
          ? x.push(t)
          : $.push(t);
      else {
        const t = /[a-z]/i.test(n[2]);
        (x.push(`${n[1]}-${t ? "yildan" : "йилдан"}:`), $.push(n[3]));
      }
    }
    ((n.since = x.join(" ")),
      (n.position = $.join(" ")),
      n.since && !n.since.endsWith(":") && (n.since += ":"),
      n.work.length && (n.work = f(n.work)));
    for (const t of Object.keys(n.fields)) {
      const e = n.fields[t] || "";
      K.test(e) &&
        (n.name
          ? n.warnings.push(
              `Maydonda ism-sharifga o‘xshash matn bor: «${e}» — tekshiring.`,
            )
          : ((n.name = e),
            (n.fields[t] = ""),
            n.warnings.push(
              `F.I.Sh. «${e}» noto‘g‘ri joyda turgan edi — sarlavhaga ko‘chirildi. Tekshiring.`,
            )));
    }
    if (!n.name) {
      const t = p.findIndex((t) => K.test(t));
      t >= 0 &&
        ((n.name = p.splice(t, 1)[0]),
        n.warnings.push(`F.I.Sh. «${n.name}» deb olindi — tekshiring.`));
    }
    const k = Object.keys(s).filter((t) => !n.fields[t]).length;
    k >= 6 &&
      n.warnings.unshift(
        `Diqqat: ${k} ta maydon topilmadi — asl hujjat tuzilishi noodatiy (matn rasm ko‘rinishida yoki PDF’dan o‘girilgan bo‘lishi mumkin). Natijani asl fayl bilan solishtiring.`,
      );
    for (const t of p) n.warnings.push(`Tushunilmagan matn: «${t}»`);
    return n;
  }
  const bt = (t) => (/[аa]$/i.test(t) ? t.slice(0, -1) : t),
    xt = (t) => ["угли", "кизи"].includes(I(t));
