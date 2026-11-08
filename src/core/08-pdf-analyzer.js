/**
 * 08-pdf-analyzer.js — PDF fayllardan matn qatorlari, jadvallar, 3x4 rasm va OCR holatini ajratib olish (pdfToBlocks)
 */
  async function ne(t, e, n = {}) {
    const s = await t.getDocument({
        data: e,
        disableFontFace: !0,
        isEvalSupported: !1,
        isOffscreenCanvasSupported: !1,
      }).promise,
      a = t.OPS,
      o = [],
      r = [];
    let l = !1;
    try {
      const t = await s.getMetadata(),
        e = (t.info && t.info.Producer + " " + t.info.Creator) || "";
      l = /FineReader|OCR|Tesseract|ScanSoft|OmniPage|Readiris|scan/i.test(e);
    } catch (t) {}
    let c = null,
      h = 0,
      f = null,
      p = !1;
    const g = (t, e, n) => [
        t[0] * e + t[2] * n + t[4],
        t[1] * e + t[3] * n + t[5],
      ],
      d = (t, e) =>
        /[-‐]$/.test(t) && /^[a-zа-яёўқғҳ‘’]/.test(e)
          ? t.replace(/[-‐]$/, "") + e
          : /[A-Za-zА-Яа-яЎўҚқҒғҲҳЁё]{3}$/.test(t) &&
              /^[a-zа-яёўқғҳ]{1,2}$/.test(e) &&
              !/^(?:va|ва|u|у|и|da|да)$/.test(e)
            ? t + e
            : t + " " + e;
    for (let t = 1; t <= s.numPages; t++) {
      const e = await s.getPage(t),
        w = await e.getTextContent({ disableCombineTextItems: !0 }),
        y = [];
      for (const t of w.items) {
        if (!t.str || !t.str.trim()) continue;
        const e = t.transform,
          n = Math.hypot(e[2], e[3]) || t.height || 10;
        (y.push({
          x: e[4],
          y: e[5],
          x1: e[4] + (t.width || 0),
          size: n,
          str: t.str,
        }),
          (h += t.str.trim().length));
      }
      let b = 0.1;
      {
        const t = y.map((t) => t.str.trim().length).sort((t, e) => t - e);
        if (t.length >= 30 && t[t.length >> 1] <= 3) {
          const t = [];
          for (const e of [...y].sort((t, e) => e.y - t.y || t.x - e.x)) {
            const n = t.find((t) => Math.abs(t.y - e.y) <= 0.45 * e.size);
            n ? n.a.push(e) : t.push({ y: e.y, a: [e] });
          }
          const e = [];
          for (const n of t) {
            n.a.sort((t, e) => t.x - e.x);
            for (let t = 1; t < n.a.length; t++) {
              const s = (n.a[t].x - n.a[t - 1].x1) / n.a[t].size;
              s > -0.05 && s < 1.5 && e.push(Math.max(0, s));
            }
          }
          if (e.length >= 20) {
            e.sort((t, e) => t - e);
            let t = e[Math.floor(0.25 * e.length)],
              n = e[Math.floor(0.92 * e.length)];
            for (let s = 0; s < 20; s++) {
              const s = (t + n) / 2,
                i = e.filter((t) => t <= s),
                a = e.filter((t) => t > s);
              if (!i.length || !a.length) break;
              ((t = i.reduce((t, e) => t + e, 0) / i.length),
                (n = a.reduce((t, e) => t + e, 0) / a.length));
            }
            n > 1.8 * t &&
              n - t > 0.12 &&
              ((b = Math.max(0.18, (t + n) / 2)), (l = !0));
          }
        }
      }
      const x = await e.getOperatorList(),
        $ = [],
        k = [],
        v = [];
      let S = [1, 0, 0, 1, 0, 0];
      const z = [];
      for (let t = 0; t < x.fnArray.length; t++) {
        const e = x.fnArray[t],
          n = x.argsArray[t];
        if (e === a.save) z.push(S);
        else if (e === a.restore) S = z.pop() || [1, 0, 0, 1, 0, 0];
        else if (e === a.transform)
          ((m = n),
            (S = [
              (u = S)[0] * m[0] + u[2] * m[1],
              u[1] * m[0] + u[3] * m[1],
              u[0] * m[2] + u[2] * m[3],
              u[1] * m[2] + u[3] * m[3],
              u[0] * m[4] + u[2] * m[5] + u[4],
              u[1] * m[4] + u[3] * m[5] + u[5],
            ]));
        else if (e === a.constructPath) {
          const t = n[0],
            e = n[1];
          let s = 0,
            i = null,
            o = null;
          const r = (t, e) => {
            const n = Math.abs(t[0] - e[0]),
              s = Math.abs(t[1] - e[1]);
            s < 1.5 && n > 8
              ? $.push({
                  y: (t[1] + e[1]) / 2,
                  x0: Math.min(t[0], e[0]),
                  x1: Math.max(t[0], e[0]),
                })
              : n < 1.5 &&
                s > 8 &&
                k.push({
                  x: (t[0] + e[0]) / 2,
                  y0: Math.min(t[1], e[1]),
                  y1: Math.max(t[1], e[1]),
                });
          };
          for (const n of t)
            if (n === a.moveTo) ((i = o = g(S, e[s], e[s + 1])), (s += 2));
            else if (n === a.lineTo) {
              const t = g(S, e[s], e[s + 1]);
              ((s += 2), i && r(i, t), (i = t));
            } else if (n === a.curveTo)
              ((i = g(S, e[s + 4], e[s + 5])), (s += 6));
            else if (n === a.curveTo2 || n === a.curveTo3)
              ((i = g(S, e[s + 2], e[s + 3])), (s += 4));
            else if (n === a.rectangle) {
              const t = e[s],
                n = e[s + 1],
                i = e[s + 2],
                a = e[s + 3];
              s += 4;
              const o = [
                  g(S, t, n),
                  g(S, t + i, n),
                  g(S, t + i, n + a),
                  g(S, t, n + a),
                ],
                l = Math.abs(o[1][0] - o[0][0]),
                c = Math.abs(o[3][1] - o[0][1]);
              c < 2.5
                ? r(
                    [o[0][0], (o[0][1] + o[3][1]) / 2],
                    [o[1][0], (o[0][1] + o[3][1]) / 2],
                  )
                : l < 2.5
                  ? r(
                      [(o[0][0] + o[1][0]) / 2, o[0][1]],
                      [(o[0][0] + o[1][0]) / 2, o[3][1]],
                    )
                  : (l < 400 || c < 400) &&
                    (r(o[0], o[1]),
                    r(o[1], o[2]),
                    r(o[3], o[2]),
                    r(o[0], o[3]));
            } else n === a.closePath && (i && o && r(i, o), (i = o));
        } else if (
          e === a.paintImageXObject ||
          e === a.paintJpegXObject ||
          e === a.paintInlineImageXObject
        ) {
          const t = Math.hypot(S[0], S[1]),
            s = Math.hypot(S[2], S[3]);
          v.push({
            id: "string" == typeof n[0] ? n[0] : null,
            inline: e === a.paintInlineImageXObject ? n[0] : null,
            w: t,
            h: s,
            x: S[4],
            y: S[5],
          });
        }
      }
      if (!c && n.imageToBytes && t <= 2) {
        const t = v
          .filter(
            (t) => t.h > 50 && t.w > 40 && t.h / t.w > 0.9 && t.h / t.w < 2,
          )
          .sort((t, e) => e.w * e.h - t.w * t.h)[0];
        if (t)
          try {
            let s = t.inline;
            !s &&
              t.id &&
              (s = await new Promise((n) => {
                const s = t.id.startsWith("g_") ? e.commonObjs : e.objs;
                try {
                  s.get(t.id, n);
                } catch (t) {
                  n(null);
                }
                setTimeout(() => n(null), 3e3);
              }));
            const i = s ? await n.imageToBytes(s) : null;
            i &&
              (c = {
                bytes: i.bytes,
                ext: i.ext,
                crop: null,
                cx: null,
                cy: null,
              });
          } catch (t) {}
      }
      const j = (t, e) => {
        const n = [...t].sort((t, e) => t - e),
          s = [];
        for (const t of n)
          if (s.length && t - s[s.length - 1].v <= e) {
            const e = s[s.length - 1];
            ((e.v = (e.v * e.n + t) / (e.n + 1)), e.n++);
          } else s.push({ v: t, n: 1 });
        return s.map((t) => t.v);
      };
      let M = [];
      if ($.length >= 3 && k.length >= 3) {
        const t = j(
          $.filter((t) => t.x1 - t.x0 > 60).map((t) => t.y),
          1.5,
        ).sort((t, e) => e - t);
        let e = [];
        const n = () => {
          if (e.length >= 2) {
            const t = e[0],
              n = e[e.length - 1],
              s = j(
                k
                  .filter(
                    (e) =>
                      e.y1 >= n - 2 &&
                      e.y0 <= t + 2 &&
                      Math.min(e.y1, t) - Math.max(e.y0, n) > 4,
                  )
                  .map((t) => t.x),
                2,
              );
            s.length >= 3 && M.push({ top: t, bot: n, ys: e.slice(), xs: s });
          }
          e = [];
        };
        for (const s of t) {
          if (!e.length) {
            e.push(s);
            continue;
          }
          const t = e[e.length - 1];
          (k.some((e) => e.y0 <= s + 2 && e.y1 >= t - 2) || n(), e.push(s));
        }
        n();
      }
      const C = (t) =>
          M.find((e) => {
            const n = t.y + 0.3 * t.size;
            return (
              n <= e.top + 1 &&
              n >= e.bot - 1 &&
              t.x >= e.xs[0] - 3 &&
              t.x <= e.xs[e.xs.length - 1] + 3
            );
          }),
        T = y.filter((t) => !C(t)).sort((t, e) => e.y - t.y || t.x - e.x),
        q = [];
      for (const t of T) {
        const e = q.find(
          (e) => Math.abs(e.y - t.y) <= 0.45 * Math.max(e.size, t.size),
        );
        e
          ? (e.items.push(t), (e.size = Math.max(e.size, t.size)))
          : q.push({ y: t.y, size: t.size, items: [t] });
      }
      const P = (t) => {
          t = [...t].sort((t, e) => t.x - e.x);
          const e = [];
          let n = 0;
          for (; n < t.length;) {
            let s = n + 1,
              i = t[n].x1;
            for (; s < t.length && t[s].x < i - 1;)
              ((i = Math.max(i, t[s].x1)), s++);
            const a = t.slice(n, s),
              o = (t) => t.str.replace(/\s/g, "").length <= 6;
            if (s - n == 1 || a.filter((t) => !o(t)).length > 1)
              (e.push(...a), (n = s));
            else {
              for (const i of t.slice(n, s)) {
                const t = [...i.str],
                  n = t.map((t) => Math.max(1, Tt(t, !1))),
                  s = n.reduce((t, e) => t + e, 0),
                  a = (i.x1 - i.x) / s;
                let o = i.x,
                  r = !1;
                t.forEach((t, s) => {
                  const l = n[s] * a;
                  (t.trim()
                    ? (e.push({
                        x: o,
                        x1: o + l,
                        y: i.y,
                        size: i.size,
                        str: t,
                        src: i,
                        spBefore: r,
                      }),
                      (r = !1))
                    : (r = !0),
                    (o += l));
                });
              }
              n = s;
            }
          }
          return e.sort((t, e) => t.x - e.x);
        },
        A = (t, e) => {
          t = P(t);
          let n = "",
            s = null,
            i = null;
          for (const a of t) {
            if (null !== s) {
              const t = a.x - s;
              e && t > 1.2 * a.size
                ? (n = n.replace(/\s+$/, "") + "\t")
                : (/[A-Za-zА-Яа-яЎўҚқҒғҲҳЁё][-‐]$/.test(n) &&
                    t < 0.5 * a.size) ||
                  /\s$/.test(n) ||
                  /^\s/.test(a.str) ||
                  !(
                    t > a.size * b ||
                    (a.spBefore &&
                      ((i && i.src === a.src) || /[.,;:!?”»)]$/.test(n)))
                  ) ||
                  (n += " ");
            }
            ((n += a.str),
              (s = Math.max(null === s ? -1e9 : s, a.x1)),
              (i = a));
          }
          return n
            .replace(/[  ]+/g, " ")
            .replace(/ ?\t ?/g, "\t")
            .trim();
        };
      for (const t of q)
        ((t.items = P(t.items)),
          (t.x0 = t.items[0].x),
          (t.x1 = Math.max(...t.items.map((t) => t.x1))),
          (t.text = A(t.items, !0)));
      const O = (t, e) => {
        const n = [];
        for (const s of t.items)
          if (s.x < e - 2 && s.x1 > e + 2 && s.str.length > 1) {
            let t = Math.round(
              ((e - s.x) / Math.max(1, s.x1 - s.x)) * s.str.length,
            );
            const i = s.str.lastIndexOf(" ", t + 2),
              a = s.str.indexOf(" ", Math.max(0, t - 2));
            t = i > 0 && (a < 0 || t - i <= a - t) ? i : a > 0 ? a : t;
            const o = s.x + ((s.x1 - s.x) * t) / s.str.length;
            n.push(
              { ...s, str: s.str.slice(0, t), x1: o },
              { ...s, str: s.str.slice(t).replace(/^\s+/, ""), x: e },
            );
          } else n.push(s);
        let s = n.filter((t) => t.x < e - 2 && t.str.trim()),
          i = n.filter((t) => t.x >= e - 2 && t.str.trim());
        const a = (t) => n[t + 1].x - n[t].x1,
          o = s.length && i.length ? s.length - 1 : -1;
        if (!(o >= 0 && a(o) > 0.2 * n[0].size)) {
          let t = -1;
          for (let s = 0; s + 1 < n.length; s++) {
            const i = a(s);
            i <= 0.2 * n[s].size ||
              ((t < 0 ||
                i > 1.15 * a(t) ||
                (i >= 0.87 * a(t) &&
                  Math.abs(n[s + 1].x - e) < Math.abs(n[t + 1].x - e))) &&
                (t = s));
          }
          if (t < 0) return !1;
          ((s = n.slice(0, t + 1)), (i = n.slice(t + 1)));
        }
        return (
          !(!s.length || !i.length) &&
          ((t.text = A(s, !1) + "\t" + A(i, !1)), !0)
        );
      };
      for (const t of q) {
        if (t.text.includes("\t")) continue;
        const e = t.text.match(/^([^:]{2,60}:)(.*?)$/);
        if (!e || !/:/.test(e[2])) continue;
        const n = e[2],
          s = n.indexOf(":"),
          i = n.slice(0, s).split(" ");
        let a = i.length - 1;
        for (; a > 0 && !/^[A-ZА-ЯЎҚҒҲЁ]/.test(i[a]);) a--;
        if (a <= 0 || !i.slice(0, a).join(" ").trim()) continue;
        const o = i.slice(a).join(" ");
        o.length > 45 ||
          (t.text =
            e[1] +
            i.slice(0, a).join(" ").replace(/\s+$/, "") +
            "\t" +
            o +
            n.slice(s));
      }
      const _ = /^([^\t:]{2,70}:)\s*([^\t:]{2,70}:)\s*$/;
      for (let t = 0; t < q.length; t++) {
        const e = q[t],
          n = e.text.replace(/\t/g, " ").match(_);
        if (!n) continue;
        let s = "",
          i = null;
        for (const t of e.items)
          (s.includes(":") && null === i && (i = t.x), (s += t.str));
        if (null === i) {
          const t = e.items.find(
            (t) => t.str.includes(":") && t.str.indexOf(":") < t.str.length - 2,
          );
          t &&
            (i =
              t.x +
              ((t.x1 - t.x) * (t.str.indexOf(":") + 1)) / t.str.length +
              1);
        }
        if (null !== i) {
          ((e.colX = i),
            e.text.includes("\t") ||
              (e.text = n[1].trim() + "\t" + n[2].trim()));
          for (let e = t + 1; e < q.length && e <= t + 6; e++) {
            const n = q[e];
            if (q[e - 1].y - n.y > 2.6 * n.size) break;
            if (/^[^\t:]{2,70}:/.test(n.text) && n.x0 < i - 2) break;
            if (e > t + 1 && n.x0 < i - 2) break;
            ((n.colX = i), !n.text.includes("\t") && n.x0 < i - 2 && O(n, i));
          }
        }
      }
      const U = q.length ? Math.min(...q.map((t) => t.x0)) : 0,
        L = q.length ? Math.max(...q.map((t) => t.x1)) : 0,
        N = (t) => {
          const e = [];
          let n = null;
          for (const s of t.items)
            n && s.x - n.x1 <= 1 * s.size
              ? (n.items.push(s), (n.x1 = Math.max(n.x1, s.x1)))
              : ((n = { x0: s.x, x1: s.x1, items: [s] }), e.push(n));
          return e;
        },
        D = (t) => {
          const e = I(
            String(t || "")
              .trim()
              .split(/\s+/)[0] || "",
          );
          return (
            !(e.length < 3) &&
            i
              .concat([
                "Рафиқаси",
                "Хотини",
                "Эри",
                "Ўғли",
                "Қизи",
                "Бобоси",
                "Бувиси",
              ])
              .some((t) => {
                const n = I(t.split(" ")[0]);
                return (
                  Math.abs(e.length - n.length) <= 2 &&
                  (e === n || R(e, n) >= 0.75)
                );
              })
          );
        },
        E = [];
      if (!M.length) {
        let t = q.findIndex(
            (t) =>
              /(?:қари?н?дош|qari?n?dosh|qaridosh)/i.test(t.text) &&
              /(?:ҳақида|хакида|haqida|xaqida|тўғрисида|тугрисида|to[‘'’`]?g[‘'’`]?risida)/i.test(
                t.text,
              ),
          ),
          e = t >= 0 ? t + 1 : f || p ? 0 : -1;
        if (
          (q[e] &&
            /^(?:МАЪЛУМОТ|MA[’'`ʼ‘]?LUMOT)\s*$/i.test(q[e].text.trim()) &&
            e++,
          (p = t >= 0 && e >= q.length),
          e >= 0 && e < q.length)
        ) {
          const n = [];
          for (let t = e; t < q.length; t++) {
            const e = q[t];
            if (/^(?:МЕҲНАТ|MEHNAT)\s/i.test(e.text)) break;
            if (n.length && n[n.length - 1].y - e.y > 4 * e.size) break;
            n.push(e);
          }
          const s = n.findIndex((t) => {
            const e = N(t);
            return e.length >= 2 && D(A(e[0].items, !1));
          });
          if (s >= 0 && n.slice(s).some((t) => N(t).length >= 3)) {
            const e = [];
            n.slice(s).forEach((t) => N(t).forEach((t) => e.push(t.x0)));
            let i = f && t < 0 ? f : j(e, 6);
            const a = (t) => {
                let e = 0;
                for (let n = 0; n < i.length; n++) t >= i[n] - 4 && (e = n);
                return e;
              },
              o = [];
            let r = null;
            const l = (t, e) => {
              const n = i.map(() => []);
              for (const t of e.items) n[a(t.x)].push(t);
              n.forEach((e, n) => {
                if (e.length) {
                  const s = A(e, !1);
                  t[n] = t[n] ? d(t[n], s) : s;
                }
              });
            };
            if (s > 0) {
              const t = i.map(() => "");
              (n.slice(0, s).forEach((e) => l(t, e)), o.push(t));
            }
            for (const t of n.slice(s)) {
              N(t);
              const e = t.items.filter((t) => 0 === a(t.x));
              (((e.length && D(A(e, !1))) || !r) &&
                ((r = i.map(() => "")), o.push(r)),
                l(r, t));
            }
            const c = o.map((t) => {
              const e = t.map((t) => Z(t));
              return ((e.raw = t.slice()), e);
            });
            (E.push({ y: n[0].y + 1, rows: c, lines: new Set(n) }), (f = i));
          }
        }
      }
      const F = M.map((t) => {
          const e = t.ys,
            n = t.xs,
            s = [],
            i = y.filter((e) => C(e) === t),
            a = [];
          for (let t = 0; t + 1 < e.length; t++) {
            const s = e[t],
              o = e[t + 1],
              r = i.filter((t) => {
                const e = t.y + 0.3 * t.size,
                  i = (t.x + t.x1) / 2;
                return e <= s + 1 && e > o - 1 && i >= n[0] - 1 && i < n[1] + 1;
              }),
              l = [];
            for (const t of r.sort((t, e) => e.y - t.y)) {
              const e = l.find((e) => Math.abs(e.y - t.y) <= 0.45 * t.size);
              e
                ? e.items.push(t)
                : l.push({ y: t.y, size: t.size, items: [t] });
            }
            const c = l.filter((t) => D(A(t.items, !1)));
            if (c.length >= 2) {
              let t = s;
              (c.slice(1).forEach((e) => {
                const n = e.y + 1 * e.size;
                (a.push([t, n]), (t = n));
              }),
                a.push([t, o]));
            } else a.push([s, o]);
          }
          for (const [t, e] of a) {
            const a = [],
              o = (t + e) / 2;
            let r = n.filter(
              (t, e) =>
                0 === e ||
                e === n.length - 1 ||
                k.some(
                  (e) =>
                    Math.abs(e.x - t) <= 2 && e.y0 <= o + 1 && e.y1 >= o - 1,
                ),
            );
            r.length < 2 && (r = n);
            for (let n = 0; n + 1 < r.length; n++) {
              const s = i.filter((s) => {
                  const i = s.y + 0.3 * s.size,
                    a = (s.x + s.x1) / 2;
                  return (
                    i <= t + 1 && i > e - 1 && a >= r[n] - 1 && a < r[n + 1] + 1
                  );
                }),
                o = [];
              for (const t of s.sort((t, e) => e.y - t.y || t.x - e.x)) {
                const e = o.find((e) => Math.abs(e.y - t.y) <= 0.45 * t.size);
                e ? e.items.push(t) : o.push({ y: t.y, items: [t] });
              }
              a.push(
                o
                  .map((t) => A(t.items, !1))
                  .reduce((t, e) => (t ? d(t, e) : e), ""),
              );
            }
            if (a.some((t) => t.trim())) {
              const t = a.map((t) => Z(t));
              ((t.raw = a), s.push(t));
            }
          }
          return { y: t.top, rows: s };
        }),
        H = new Set();
      E.forEach((t) => t.lines.forEach((t) => H.add(t)));
      const B = [
        ...q.filter((t) => !H.has(t)).map((t) => ({ kind: "l", y: t.y, l: t })),
        ...F.map((t) => ({ kind: "t", y: t.y, t: t })),
        ...E.map((t) => ({ kind: "t", y: t.y, t: t })),
      ].sort((t, e) => e.y - t.y);
      let W = null;
      const G = () => {
          W &&
            (o.push({ type: "p", text: W.text }), r.push(W.text), (W = null));
        },
        Q = U + 0.35 * (L - U);
      for (const t of B) {
        if ("t" === t.kind) {
          if ((G(), t.t.rows.length)) {
            o.push({ type: "tbl", rows: t.t.rows });
            for (const e of t.t.rows) r.push(e.join("\n"));
          }
          continue;
        }
        const e = t.l;
        if (W) {
          const t = W.last,
            n = t.y - e.y <= 1.45 * Math.max(t.size, e.size),
            s = t.x1 >= L - 3.2 * Math.max(t.size, e.size),
            i =
              /^\s*(?:\d{1,2}\.)?\d{4}/.test(e.text) ||
              (/:\s*$/.test(t.text.split("\t")[0]) &&
                !t.text.includes("\t") &&
                !1),
            a = e.x0 > U + 2 * e.size && e.x0 < Q - 5 && !i,
            o = e.x0 >= (e.colX || Q) - 5 && W.text.includes("\t"),
            r = W.text.indexOf("\t");
          if (
            n &&
            r > 0 &&
            !W.text.slice(0, r).includes(":") &&
            !e.text.includes("\t") &&
            (/:\s*$/.test(e.text) || /^[a-zа-яёўқғҳ]/.test(e.text)) &&
            e.text.length < 40 &&
            e.x0 < (e.colX || Q) - 5
          ) {
            ((W.text =
              W.text.slice(0, r) + " " + e.text.trim() + W.text.slice(r)),
              (W.last = e));
            continue;
          }
          if (n && o) {
            ((W.text += (s ? " " : "\n") + e.text), (W.last = e));
            continue;
          }
          if (
            n &&
            !i &&
            (s || a) &&
            !e.text.includes("\t") &&
            !W.text.includes("\t")
          ) {
            ((W.text = d(W.text, e.text)), (W.last = e));
            continue;
          }
        }
        (G(), (W = { text: e.text, last: e }));
      }
      G();
    }
    var u, m;
    for (let t = o.length - 1; t > 0; t--) {
      const e = o[t - 1],
        n = o[t];
      "tbl" === e.type &&
        "tbl" === n.type &&
        Math.abs(e.rows[0].length - n.rows[0].length) <= 1 &&
        (e.rows.push(...n.rows), o.splice(t, 1));
    }
    if (h < 40)
      throw new Error(
        "PDF ichida matn yo‘q (skanerlangan rasm). Bunday PDF'ni o‘qib bo‘lmaydi — Word faylini yoki matnli PDF yuboring.",
      );
    return { blocks: o, textParts: r, photo: c, ocr: l };
  }
