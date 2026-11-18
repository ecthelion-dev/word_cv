/**
 * 09-pdf-builder-api.js — Lavozimlarni solishtirish (sameJob, setCurrentJob), PDF generatsiya (buildPdf) va SpravkaCore API eksporti
 */
  const se =
    /^[^А-Яа-яA-Za-zЎўҚқҒғҲҳ“"«]*?(?:йй\.|yy\.|й\.|y\.|йил\.|yil\.)\s*(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)?\s*-\s*/i;
  function ie(t) {
    return String(t || "")
      .replace(se, "")
      .split(/[\s,;()]+/)
      .map((t) => I(t))
      .filter((t) => t.length > 2 && !/^(va|ва|bo.?yicha|бўйича)$/.test(t));
  }
  function ae(t, e) {
    const n = ie(t),
      s = ie(e);
    if (!n.length || !s.length) return !1;
    const i = (t, e) =>
        t === e ||
        (Math.min(t.length, e.length) >= 5 &&
          t.slice(0, 3) === e.slice(0, 3) &&
          R(t, e) >= 0.85),
      [a, o] = n.length <= s.length ? [n, s] : [s, n],
      r = a.filter((t) => o.some((e) => i(t, e))).length,
      l =
        /^(кафедр|факулт|булим|булинм|бошкарм|марказ|сектор|лаборатор|деканат|ректорат)/,
      c = (t) => {
        const e = {};
        return (
          t.forEach((n, s) => {
            const i = (n.match(l) || [])[1];
            i && s > 0 && (e[i] = e[i] || []).push(t[s - 1]);
          }),
          e
        );
      },
      h = c(n),
      f = c(s);
    for (const t of Object.keys(h))
      if (f[t] && !h[t].some((e) => f[t].some((t) => i(e, t)))) return !1;
    const p = (t) => {
        let e = -1;
        return (
          t.forEach((t, n) => {
            (l.test(t) || /^(институт|университет|академи|филиал)/.test(t)) &&
              (e = n);
          }),
          e >= 0
            ? t
                .slice(e + 1)
                .map((t) =>
                  t.replace(/(?:си|и|si|i)$/, "").replace(/(?:си|и|si|i)$/, ""),
                )
                .join("")
            : null
        );
      },
      g = p(n),
      d = p(s);
    if (
      g &&
      d &&
      g !== d &&
      !g.endsWith(d) &&
      !d.endsWith(g) &&
      !(Math.min(g.length, d.length) >= 6 && R(g, d) >= 0.9)
    )
      return !1;
    if (r === a.length) return !0;
    if (!i(n[n.length - 1], s[s.length - 1])) return !1;
    const u = n.join(""),
      m = s.join("");
    return u === m || R(u, m) >= 0.93 || (a.length >= 6 && r >= a.length - 1);
  }
  const oe = (t) =>
      /(?:^|[\s(])(?:в\.?\s?б\.|v\.?\s?b\.)|вазифасини\s+бажарувчи|vazifasini\s+bajaruvchi/i.test(
        String(t || ""),
      ),
    re =
      /^(\d{4})\s*-?\s*(?:й\.|y\.|йил\.?|yil\.?)\s*-?\s*(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)\s*-\s*(.*)$/i;
  function pe(t, e) {
    for (let n = e - 1; n >= 0; n--) {
      const e = String(t[n] || "");
      if (/талаба|магистрант|докторант|аспирант|talaba|magistrant|doktorant|aspirant/i.test(e))
        continue;
      const s = e.match(/^(\d{4})(?:\s*-\s*(\d{4}))?/);
      if (s) return +(s[2] || s[1]);
    }
    return 0;
  }
  function le(t, e, n, s) {
    const i = t.S.latin,
      a = i ? "yil." : "йил.",
      o = i ? "yy." : "йй.",
      r = i ? "h.v." : "ҳ.в.";
    if (
      ((e = String(e || "").trim()),
      (n = String(n || "")),
      !e || !/^\d{4}$/.test(n))
    )
      return "empty";
    let l = -1;
    for (let e = t.work.length - 1; e >= 0; e--)
      if (re.test(t.work[e])) {
        l = e;
        break;
      }
    if (l >= 0) {
      const i = t.work[l].match(re),
        c = pe(t.work, l);
      if (ae(i[2], e)) {
        const s = ie(e).length > ie(i[2]).length,
          o = String(Math.max(+i[1], c, +n >= c ? +n : 0)),
          d = s ? e : i[2];
        return oe(i[2]) === oe(e) && !s && i[1] === o
          ? "exists"
          : ((t.work[l] = `${o}-${a} ${r} - ${d}`), "updated");
      }
      if (+i[1] > +n) {
        if (s && s.force) {
          const n = String(Math.max(+i[1], c));
          return ((t.work[l] = `${n}-${a} ${r} - ${e}`), "updated");
        }
        return "older";
      }
      const d = String(Math.max(+n, +i[1]));
      return (
        (t.work[l] =
          i[1] === d
            ? `${i[1]}-${a.replace(/\.$/, "")} - ${i[2]}`
            : `${i[1]}-${d} ${o} - ${i[2]}`),
        t.work.push(`${d}-${a} ${r} - ${e}`),
        "closed"
      );
    }
    const c = (t.work.length ? t.work[t.work.length - 1] : "").match(
      /^(\d{4})\s*-\s*(\d{4})\s*(?:йй\.|yy\.|й\.|y\.)?\s*-\s*(.*)$/,
    );
    if (c && ae(c[3], e) && oe(c[3]) === oe(e)) {
      const n = String(Math.max(+c[1], pe(t.work, t.work.length - 1)));
      return (
        (t.work[t.work.length - 1] =
          `${n}-${a} ${r} - ${ie(e).length > ie(c[3]).length ? e : c[3]}`),
        "reopened"
      );
    }
    if (
      t.work.some(
        (t) => ae(t, e) && oe(t) === oe(e) && !/^\d{4}\s*-\s*\d{4}/.test(t),
      )
    )
      return "exists";
    const d = String(Math.max(+n, pe(t.work, t.work.length)));
    return (t.work.push(`${d}-${a} ${r} - ${e}`), "added");
  }
  const ce =
    "январ|феврал|март|апрел|май|июн|июл|август|сентябр|сентабр|октябр|ноябр|декабр|yanvar|fevral|mart|aprel|may|iyun|iyul|avgust|sentabr|sentyabr|oktabr|oktyabr|noyabr|dekabr";
  function he(t, e) {
    if (!t) return t;
    let n = String(t);
    return (
      (n = n.replace(
        /(^|[^\d])(\d{4})\s*[-–—]?\s*(?:йил(?!лар)|й\.|й(?=\s)|yil(?!lar)|y\.|y(?=\s))/gi,
        (t, n, s) => `${n}${s}-${e ? "yil" : "йил"}`,
      )),
      (n = n.replace(
        new RegExp(`(^|[^\\d.])(\\d{1,2})\\s*[-–—]?\\s*(${ce})`, "gi"),
        (t, e, n, s) => `${e}${+n}-${s}`,
      )),
      n.replace(/\s{2,}/g, " ")
    );
  }
  ((t._docToBlocks = ee),
    (t.SpravkaCore = {
      eduFromGrad: F,
      nameParts: E,
      nameScore: function (t, e) {
        const n = "string" == typeof t ? E(t) : t,
          s = "string" == typeof e ? E(e) : e;
        if (!n.sur || !s.sur) return 0;
        const i = (t, e) =>
          t && e
            ? t === e
              ? 1
              : 1 === t.length || 1 === e.length
                ? t[0] === e[0]
                  ? 0.9
                  : 0
                : t.length >= 4 &&
                    e.length >= 4 &&
                    (t.startsWith(e) || e.startsWith(t))
                  ? 0.92
                  : R(t, e)
            : 0;
        let a = 0;
        for (const [t, e] of [
          [s.sur, s.giv],
          [s.giv, s.sur],
        ]) {
          const o = i(n.sur, t),
            r = n.giv && e ? i(n.giv, e) : 0.85,
            c = n.pat && s.pat ? i(n.pat, s.pat) : 0.9;
          if (o < 0.8 || (r < 0.8 && !(o >= 0.95 && c >= 0.95 && r >= 0.72)))
            continue;
          let l = c;
          (n.pat &&
            s.pat &&
            o >= 0.95 &&
            r >= 0.95 &&
            n.pat.length >= 4 &&
            s.pat.length >= 4 &&
            n.pat.slice(0, 4) === s.pat.slice(0, 4) &&
            (l = Math.max(l, 0.78)),
            (n.pat && s.pat && l < 0.6) ||
              (a = Math.max(
                a,
                (1.1 * o + r + 0.9 * l) / 3 - (t === s.giv ? 0.02 : 0),
              )));
        }
        return Math.min(1, a);
      },
      convertDocx: async function (t, e = {}) {
        const n = await Yt(t, e);
        return { ...n, bytes: await Zt(n.data) };
      },
      analyzeDocx: Yt,
      analyzeDoc: async function (t, e = {}) {
        const n = new Uint8Array(t);
        if (80 === n[0] && 75 === n[1]) return Yt(t, e);
        if (123 === n[0] && 92 === n[1] && 114 === n[2])
          throw new Error(
            "Bu RTF fayl (.doc nomi bilan). Word'da ochib .docx qilib saqlang.",
          );
        const { blocks: s, textParts: i, photo: a } = ee(n);
        a && ut(a);
        const o = Kt(s, i, a, e);
        return (
          o.warnings.unshift(
            "Eski .doc formatidan o‘qildi — natijani asl fayl bilan solishtirib tekshiring.",
          ),
          o
        );
      },
      analyzePdf: async function (t, e, n = {}, s = {}) {
        const {
          blocks: i,
          textParts: a,
          photo: o,
          ocr: r,
        } = await ne(t, new Uint8Array(e), s);
        o && ut(o);
        const l = Kt(i, a, o, n);
        return (
          l.warnings.unshift(
            "PDF'dan o‘qildi — qatorlar va jadval kataklari to‘g‘ri ajratilganini tekshiring.",
          ),
          r &&
            (l.warnings.unshift(
              "Bu PDF skanerlangan (matn rasmdan avtomatik tanilgan) — harflar va raqamlarda xato ko‘p bo‘lishi mumkin. Har bir maydonni asl hujjat bilan solishtiring.",
            ),
            (l.data.ocr = !0)),
          l
        );
      },
      pdfToBlocks: ne,
      analyzeBlocks: Kt,
      buildFromData: async function (t, e) {
        ((t.work = t.work
          .map((e) => d((e || "").trim(), t.S.latin))
          .filter((t) => t)),
          (t.since = he(t.since, t.S.latin)),
          (Ut = !(!e || !e.form)));
        try {
          return await Zt(t);
        } finally {
          Ut = !1;
        }
      },
      buildPdf: async function (t, e) {
        Ut = !(!e || !e.form);
        try {
          return await (async function (t, e) {
            const { PDFLib: s, fontkit: i } = e;
            ((t.work = t.work
              .map((e) => d((e || "").trim(), t.S.latin))
              .filter((t) => t)),
              (t.since = he(t.since, t.S.latin)));
            const a = t.fields,
              r = t.S,
              l = r.labels;
            a.birth_date && (a.birth_date = B(a.birth_date)[0]);
            const c = await s.PDFDocument.create();
            c.registerFontkit(i);
            const h = await c.embedFont(e.fonts.r, { subset: !0 }),
              f = await c.embedFont(e.fonts.b, { subset: !0 });
            (c.setTitle((t.name || r.title) + ""),
              c.setCreator("Ma'lumotnoma tuzatgich"),
              c.setProducer("Ma'lumotnoma tuzatgich"));
            const p = (t) => t / 20,
              g = 595.28,
              u = 841.89,
              m = p(1134),
              w = p(567),
              y = p(851),
              b = p(567),
              x = g - m - w,
              $ = p(Pt),
              k = 1.15,
              v = 0.891,
              S = s.rgb(0, 0, 0),
              z = s.rgb(1, 1, 0),
              j = new RegExp(
                "[" +
                  String.fromCharCode(
                    0,
                    45,
                    9,
                    11,
                    45,
                    31,
                    8203,
                    45,
                    8207,
                    8232,
                    8233,
                    65279,
                    173,
                  ) +
                  "]",
                "g",
              ),
              M = (t) =>
                String(null == t ? "" : t)
                  .replace(/\t/g, " ")
                  .replace(j, ""),
              C = (t) => (t ? f : h),
              T = (t, e, n) => {
                try {
                  return C(n).widthOfTextAtSize(t, e);
                } catch (n) {
                  return t.length * e * 0.5;
                }
              };
            let q, P;
            const A = () => {
              ((q = c.addPage([g, u])), (P = u - y));
            };
            A();
            let O = null;
            if (t.photo && e.image)
              try {
                const n = await e.image(t.photo);
                if (n && n.bytes) {
                  const e =
                      "jpg" === n.type
                        ? await c.embedJpg(n.bytes)
                        : await c.embedPng(n.bytes),
                    s = (t.photo.cx || 1054800) / 12700,
                    i = (t.photo.cy || 1306800) / 12700;
                  O = {
                    img: e,
                    w: s,
                    h: i,
                    x: g - w - s,
                    top: P - 1.95,
                    gap: 9,
                    page: q,
                  };
                }
              } catch (t) {
                O = null;
              }
            if (O) {
              const { img: e, w: n, h: i, x: a, top: o } = O,
                r = t.photo.crop || {},
                l = (+r.l || 0) / 1e5,
                c = (+r.r || 0) / 1e5,
                h = (+r.t || 0) / 1e5,
                f = (+r.b || 0) / 1e5,
                p = n / Math.max(0.01, 1 - l - c),
                g = i / Math.max(0.01, 1 - h - f);
              (q.pushOperators(
                s.pushGraphicsState(),
                s.rectangle(a, o - i, n, i),
                s.clip(),
                s.endPath(),
              ),
                q.drawImage(e, {
                  x: a - p * l,
                  y: o - i - g * f,
                  width: p,
                  height: g,
                }),
                q.pushOperators(s.popGraphicsState()));
            }
            if (!O && Ut) {
              const t = 1054800 / 12700,
                e = 1306800 / 12700;
              ((O = {
                w: t,
                h: e,
                x: g - w - t,
                top: P - 1.95,
                gap: 9,
                page: q,
              }),
                q.drawRectangle({
                  x: O.x,
                  y: O.top - e,
                  width: t,
                  height: e,
                  borderColor: s.rgb(0.45, 0.45, 0.45),
                  borderWidth: 0.6,
                  borderDashArray: [3, 3],
                }));
              const n = "3×4",
                i = 11;
              q.drawText(n, {
                x: O.x + (t - h.widthOfTextAtSize(n, i)) / 2,
                y: O.top - e / 2 - 4,
                size: i,
                font: h,
                color: s.rgb(0.45, 0.45, 0.45),
              });
            }
            const _ = (t, e) =>
              O && q === O.page && t > O.top - O.h && t - e < O.top
                ? x - O.w - O.gap
                : x;
            function U(t, e, n, s) {
              const i = [];
              for (const a of M(t).split("\n")) {
                const t = a
                  .split(/ +/)
                  .filter((t, e, n) => t || 1 === n.length);
                let o = "";
                for (let a of t) {
                  const t = o ? o + " " + a : a;
                  if (T(t, e, n) <= s || (!o && T(a, e, n) <= s)) o = t;
                  else {
                    for (
                      o && i.push(o), o = "";
                      T(a, e, n) > s && a.length > 1;
                    ) {
                      let t = a.length - 1;
                      for (; t > 1 && T(a.slice(0, t), e, n) > s;) t--;
                      (i.push(a.slice(0, t)), (a = a.slice(t)));
                    }
                    o = a;
                  }
                }
                i.push(o);
              }
              return i;
            }
            const L = (t, e, s) =>
              M(t).trim()
                ? { t: M(t), sz: e, b: !!s }
                : Ut
                  ? { t: Lt, sz: e, b: !1 }
                  : { t: n, sz: e, b: !0, hl: !0 };
            function I(t, e, n, s, i, a) {
              if (!t) return;
              const o = n - s * v;
              (a &&
                q.drawRectangle({
                  x: m + e,
                  y: o - 0.22 * s,
                  width: T(t, s, i),
                  height: 1.12 * s,
                  color: z,
                }),
                q.drawText(t, {
                  x: m + e,
                  y: o,
                  size: s,
                  font: C(i),
                  color: S,
                }));
            }
            const N = (t) => {
              P - t < b && P < u - y - 1 && A();
            };
            function D(t, { after: e = 0, before: n = 0, keepH: s = 0 } = {}) {
              P -= n;
              const i = Math.max(...t.map((t) => t.seg.sz)) * k,
                a = t.map((t) =>
                  U(t.seg.t, t.seg.sz, t.seg.b, Math.max(20, t.w(P, i))),
                );
              N(Math.max(...a.map((t) => t.length)) * i + s);
              const o = t.map((t) =>
                M(t.seg.t)
                  .split("\n")
                  .map((t) => t),
              );
              let r = 0;
              for (; o.some((t) => t.length) && r++ < 500;)
                (P - i < b && A(),
                  t.forEach((t, e) => {
                    const n = o[e];
                    if (!n.length) return;
                    const s = Math.max(20, t.w(P, i)),
                      a = U(n[0], t.seg.sz, t.seg.b, s),
                      r = a[0],
                      l = a.slice(1).join(" ");
                    l ? (n[0] = l) : n.shift();
                    let c = t.x;
                    ("center" === t.align &&
                      (c = t.x + (s - T(r, t.seg.sz, t.seg.b)) / 2),
                      I(r, c, P, t.seg.sz, t.seg.b, t.seg.hl));
                  }),
                  (P -= i));
              P -= e;
            }
            const E = (t, e = {}) =>
                D(
                  [
                    {
                      x: e.indent || 0,
                      w: (t, n) => _(t, n) - (e.indent || 0),
                      seg: t,
                      align: e.align,
                    },
                  ],
                  e,
                ),
              F = (t, e = {}) => E(t, { ...e, align: "center" });
            (F({ t: r.title, sz: 14, b: !0 }),
              F(L(t.name, 14, !0), { after: 6, before: 4 }),
              t.since && E({ t: t.since, sz: 12 }));
            t.position
              ? E({ t: t.position, sz: 12, b: !0 }, { after: 6 })
              : (P -= 6);
            const H = (t) => ({ t: l[t] + ":", sz: 12, b: !0 }),
              R = (t) => {
                (E(H(t), { keepH: 12 * k }), E(L(a[t], 12), { after: 6 }));
              },
              Z = (t, e, n) => {
                const s = Math.min($ - 6, x),
                  i = Math.max(
                    $,
                    t.seg.t && !t.wrapLeft
                      ? T(t.seg.t, t.seg.sz, t.seg.b) + 6
                      : $,
                  );
                D(
                  [
                    { x: 0, w: () => (t.wrapLeft ? s : x), seg: t.seg },
                    { x: i, w: (t, e) => _(t, e) - i, seg: e },
                  ],
                  n,
                );
              },
              W = (t, e) => {
                (Z({ seg: H(t), wrapLeft: !0 }, H(e), { keepH: 12 * k }),
                  Z({ seg: L(a[t], 12), wrapLeft: !0 }, L(a[e], 12), {
                    after: 6,
                  }));
              };
            (W("birth_date", "birth_place"),
              W("nationality", "party"),
              W("education", "grad_year"),
              Z({ seg: H("specialty") }, L(a.specialty, 12), { after: 6 }),
              W("degree", "title"),
              W("languages", "military"));
            for (const t of ["awards", "deputy"]) R(t);
            if (
              (F(
                { t: r.work, sz: 14, b: !0 },
                { after: 6, before: 6, keepH: 12 * k },
              ),
              t.work.length)
            ) {
              const e =
                  /^(\d{4}(?:-\d{4})?\s*(?:yy\.|йй\.|y\.|й\.|-yil\.?|-йил\.?)\s*(?:h\.v\.|ҳ\.в\.)?\s*-)\s*(.*)$/,
                n = t.work.map((t) => {
                  const n = M(t).match(e);
                  return n ? [n[1], n[2]] : [null, M(t)];
                }),
                s =
                  Math.max(
                    0,
                    ...n.filter((t) => t[0]).map((t) => T(t[0], 12, !1)),
                  ) + T(" ", 12, !1);
              for (const [t, e] of n)
                t
                  ? D(
                      [
                        { x: 0, w: () => s, seg: { t: t, sz: 12 } },
                        {
                          x: s,
                          w: (t, e) => _(t, e) - s,
                          seg: { t: e, sz: 12 },
                        },
                      ],
                      { after: 4 },
                    )
                  : E({ t: e, sz: 12 }, { after: 4 });
            } else E(L("", 12));
            A();
            const J = t.name || t.relHeadingName;
            (F(L(J ? J + r.relSuffix : "", 14, !0), { after: 6 }),
              F({ t: r.relTitle, sz: 14, b: !0 }, { after: 6 }));
            const V = o.reduce((t, e) => t + e, 0),
              X = o.map((t) => p(t)),
              Y = (x - p(V)) / 2,
              K = p(60),
              tt = p(20) + 1,
              et = { rel: "", name: "", birth: "", work: "", address: "" },
              nt = (t.relatives.length ? t.relatives : [et]).concat(
                Ut ? [et, et] : [],
              );
            function st(t, e) {
              return t.map((t) => {
                const e = t.seg,
                  n = U(e.t, e.sz, e.b, t.w - 2 * K);
                return { ...t, ln: n };
              });
            }
            function it(t) {
              return Math.max(
                Ut ? 34 : 0,
                Math.max(...t.map((t) => t.ln.length * t.seg.sz * k)) + 2 * tt,
              );
            }
            function at(t, e) {
              let n = Y;
              for (const s of t) {
                q.drawRectangle({
                  x: m + n,
                  y: P - e,
                  width: s.w,
                  height: e,
                  borderColor: S,
                  borderWidth: 0.5,
                });
                const t = s.ln.length * s.seg.sz * k;
                let i = P - (e - t) / 2;
                for (const t of s.ln)
                  (I(
                    t,
                    n + (s.w - T(t, s.seg.sz, s.seg.b)) / 2,
                    i,
                    s.seg.sz,
                    s.seg.b,
                    s.seg.hl,
                  ),
                    (i -= s.seg.sz * k));
                n += s.w;
              }
              P -= e;
            }
            const ot = st(
                r.relHeaders.map((t, e) => ({
                  w: X[e],
                  seg: { t: t, sz: 12, b: !0 },
                })),
              ),
              rt = it(ot);
            at(ot, rt);
            for (const t of nt) {
              const e = t.birth ? Q(t.birth, r)[0] : "",
                n = Et(t),
                s = [
                  r.relations[t.rel] || t.rel,
                  t.name,
                  G(e, "birth", r),
                  n ? t.work : G(t.work, "work", r),
                  G(t.address, "address", r),
                ],
                i = [];
              for (let t = 0; t < 5; t++) {
                if (n && 3 === t) {
                  i.push({ w: X[3] + X[4], seg: L(s[3], 12) });
                  break;
                }
                i.push({
                  w: X[t],
                  seg:
                    Ut && !String(s[t] || "").trim()
                      ? { t: "", sz: 12 }
                      : L(s[t], 12, 0 === t),
                });
              }
              const a = st(i),
                o = it(a);
              (P - o < b && (A(), at(ot, rt)), at(a, o));
            }
            return c.save();
          })(t, e);
        } finally {
          Ut = !1;
        }
      },
      fixSinceLine: he,
      convertScript: Xt,
      blankData: function (t) {
        return {
          name: "",
          since: "",
          position: "",
          fields: {},
          work: [],
          relatives: [],
          relHeadingName: "",
          photo: null,
          warnings: [],
          foundRelTable: !1,
          S: t ? O.lat : O.cyr,
        };
      },
      LABEL_KEYS: Object.keys(s),
      RELATIONS: i,
      SCRIPTS: O,
      cyrToLat: Gt,
      latToCyr: Vt,
      fixWorkLine: d,
      tidyWork: h,
      mergeWork: f,
      stripNameNote: g,
      sameJob: ae,
      setCurrentJob: le,
      fixApostrophes: c,
      fixOrgText: $,
      fixTypos: P,
      ratio: R,
      norm: I,
      spellWord: q,
      _ratio: R,
      _norm: I,
    }));
