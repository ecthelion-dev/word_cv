/**
 * 07-doc-binary.js — Eski binary .doc (OLE2 / Word 97-2003) formatini brauzerda oʻqish va rasmni ajratish
 */
  const te = {
    128: 8364,
    130: 8218,
    131: 402,
    132: 8222,
    133: 8230,
    134: 8224,
    135: 8225,
    136: 710,
    137: 8240,
    138: 352,
    139: 8249,
    140: 338,
    142: 381,
    145: 8216,
    146: 8217,
    147: 8220,
    148: 8221,
    149: 8226,
    150: 8211,
    151: 8212,
    152: 732,
    153: 8482,
    154: 353,
    155: 8250,
    156: 339,
    158: 382,
    159: 376,
  };
  function ee(t) {
    const e = (function (t) {
      const e = new DataView(t.buffer, t.byteOffset, t.byteLength);
      if (![208, 207, 17, 224, 161, 177, 26, 225].every((e, n) => t[n] === e))
        throw new Error("Бу эски Word (.doc) файл эмас.");
      const n = 1 << e.getUint16(30, !0),
        s = 1 << e.getUint16(32, !0),
        i = e.getUint32(44, !0),
        a = e.getUint32(48, !0),
        o = e.getUint32(56, !0),
        r = e.getUint32(60, !0),
        l = e.getUint32(68, !0),
        c = e.getUint32(72, !0),
        h = 4294967295,
        f = (t) => (t + 1) * n,
        p = [];
      for (let t = 0; t < 109 && p.length < i; t++) {
        const n = e.getUint32(76 + 4 * t, !0);
        n !== h && p.push(n);
      }
      let g = l;
      for (let t = 0; t < c && 4294967294 !== g && g !== h; t++) {
        const t = f(g),
          s = n / 4 - 1;
        for (let n = 0; n < s && p.length < i; n++) {
          const s = e.getUint32(t + 4 * n, !0);
          s !== h && p.push(s);
        }
        g = e.getUint32(t + 4 * s, !0);
      }
      const d = new Uint32Array((p.length * n) / 4);
      p.forEach((s, i) => {
        const a = f(s);
        for (let s = 0; s < n / 4; s++)
          a + 4 * s + 4 <= t.length &&
            (d[(i * n) / 4 + s] = e.getUint32(a + 4 * s, !0));
      });
      const u = (t, e) => {
          const n = [];
          let s = t;
          const i = new Set();
          for (; s < 4294967290 && !i.has(s) && s < e.length;)
            (i.add(s), n.push(s), (s = e[s]));
          return n;
        },
        m = (e, s) => {
          const i = new Uint8Array(s);
          let a = 0;
          for (const o of u(e, d)) {
            const e = f(o),
              r = Math.min(n, s - a);
            if (r <= 0) break;
            (i.set(t.subarray(e, Math.min(e + r, t.length)), a), (a += r));
          }
          return i;
        },
        w = m(a, u(a, d).length * n),
        y = new DataView(w.buffer),
        b = [];
      for (let t = 0; t + 128 <= w.length; t += 128) {
        const e = y.getUint16(t + 64, !0);
        let n = "";
        for (let s = 0; s + 2 < e; s += 2)
          n += String.fromCharCode(y.getUint16(t + s, !0));
        b.push({
          name: n,
          type: w[t + 66],
          start: y.getUint32(t + 116, !0),
          size: y.getUint32(t + 120, !0),
        });
      }
      const x = b[0],
        $ = x ? m(x.start, x.size) : new Uint8Array(0),
        k = r < 4294967290 ? m(r, u(r, d).length * n) : new Uint8Array(0),
        v = new Uint32Array(k.buffer, 0, k.length >> 2),
        S = (t) => {
          if (t.size >= o) return m(t.start, t.size);
          const e = new Uint8Array(t.size);
          let n = 0;
          for (const i of u(t.start, v)) {
            const a = Math.min(s, t.size - n);
            if (a <= 0) break;
            (e.set($.subarray(i * s, i * s + a), n), (n += a));
          }
          return e;
        },
        z = {};
      for (const t of b) 2 === t.type && t.name && (z[t.name] = () => S(t));
      return z;
    })(t);
    if (!e.WordDocument)
      throw new Error(
        "«WordDocument» oqimi yo‘q — fayl buzilgan yoki .doc emas.",
      );
    const n = e.WordDocument(),
      s = new DataView(n.buffer, n.byteOffset, n.byteLength);
    if (42476 !== s.getUint16(0, !0))
      throw new Error("Word 97–2003 formatidagi fayl emas.");
    if (s.getUint16(2, !0) < 193)
      throw new Error(
        "Juda eski Word (6.0/95) formati. Word'da ochib .docx qilib saqlang.",
      );
    const i = s.getUint16(10, !0);
    if (256 & i) throw new Error("Fayl parol bilan himoyalangan.");
    const a = 512 & i ? "1Table" : "0Table";
    if (!e[a]) throw new Error("Jadval oqimi (" + a + ") topilmadi.");
    const o = e[a](),
      r = new DataView(o.buffer, o.byteOffset, o.byteLength);
    let l = 32;
    l += 2 + 2 * s.getUint16(l, !0);
    const c = s.getUint16(l, !0),
      h = l + 2;
    l += 2 + 4 * c;
    const f = l + 2,
      p = (t) => s.getInt32(h + 4 * t, !0),
      g = (t) => s.getUint32(f + 8 * t, !0),
      d = (t) => s.getUint32(f + 8 * t + 4, !0);
    let u = g(33);
    const m = u + d(33);
    for (; u < m && 1 === o[u];) u += 3 + r.getInt16(u + 1, !0);
    if (2 !== o[u]) throw new Error("Matn jadvali (piece table) o‘qilmadi.");
    const w = u + 5,
      y = (r.getUint32(u + 1, !0) - 4) / 12,
      b = [];
    for (let t = 0; t < y; t++) {
      const e = r.getUint32(w + 4 * t, !0),
        n = r.getUint32(w + 4 * (t + 1), !0),
        s = r.getUint32(w + 4 * (y + 1) + 8 * t + 2, !0),
        i = !!(1073741824 & s),
        a = 1073741823 & s;
      b.push({ a: e, b: n, comp: i, fc: i ? a / 2 : a });
    }
    const x = (t, e) => {
        const i = [],
          a = [];
        for (const o of b) {
          const r = Math.max(t, o.a),
            l = Math.min(e, o.b);
          for (let t = r; t < l; t++) {
            const e = t - o.a;
            if (o.comp) {
              const t = n[o.fc + e];
              (i.push(String.fromCharCode(te[t] || t)), a.push(o.fc + e));
            } else
              (i.push(String.fromCharCode(s.getUint16(o.fc + 2 * e, !0))),
                a.push(o.fc + 2 * e));
          }
        }
        return { chars: i, fcs: a };
      },
      $ = (function (t, e, n, s) {
        const i = [];
        if (!s) return i;
        const a = new DataView(e.buffer, e.byteOffset, e.byteLength),
          o = new DataView(t.buffer, t.byteOffset, t.byteLength),
          r = (s - 4) / 8;
        for (let e = 0; e < r; e++) {
          const s = 512 * (4194303 & a.getUint32(n + 4 * (r + 1) + 4 * e, !0));
          if (s + 512 > t.length) continue;
          const l = t[s + 511];
          for (let e = 0; e < l; e++) {
            const n = o.getUint32(s + 4 * e, !0),
              a = o.getUint32(s + 4 * (e + 1), !0),
              r = 2 * t[s + 4 * (l + 1) + 13 * e],
              c = {
                fa: n,
                fb: a,
                inTable: !1,
                ttp: !1,
                itap: 0,
                innerCell: !1,
                innerTtp: !1,
              };
            if (r) {
              let e,
                n = s + r,
                i = t[n++];
              e = 0 === i ? 2 * t[n++] : 2 * i - 1;
              let a = n + 2;
              const l = Math.min(n + e, s + 511);
              for (; a + 2 <= l;) {
                const e = o.getUint16(a, !0);
                a += 2;
                const n = e >> 13;
                let s;
                s =
                  6 === n
                    ? 54792 === e || 54790 === e
                      ? o.getUint16(a, !0) + 1
                      : t[a] + 1
                    : [1, 1, 2, 4, 2, 2, 0, 3][n];
                const i = t[a];
                (9238 === e
                  ? (c.inTable = !!i)
                  : 9239 === e
                    ? (c.ttp = !!i)
                    : 26185 === e
                      ? (c.itap = o.getUint32(a, !0))
                      : 9291 === e
                        ? (c.innerCell = !!i)
                        : 9292 === e && (c.innerTtp = !!i),
                  (a += s));
              }
            }
            (c.inTable && !c.itap && (c.itap = 1), i.push(c));
          }
        }
        return i.sort((t, e) => t.fa - e.fa);
      })(n, o, g(13), d(13)),
      k = (t) => {
        let e = 0,
          n = $.length - 1;
        for (; e <= n;) {
          const s = (e + n) >> 1;
          if (t < $[s].fa) n = s - 1;
          else {
            if (!(t >= $[s].fb)) return $[s];
            e = s + 1;
          }
        }
        return null;
      },
      v = ({ chars: t, fcs: e }, n) => {
        const s = [];
        let i = "";
        const a = [];
        for (let o = 0; o < t.length; o++) {
          const r = t[o],
            l = r.charCodeAt(0);
          if ((n && n(o, s.length), 19 !== l))
            if (20 !== l)
              if (21 !== l) {
                if (!a.some((t) => t) || 13 === l || 7 === l)
                  if (13 !== l && 7 !== l)
                    11 !== l
                      ? 9 !== l
                        ? 30 !== l
                          ? 160 !== l
                            ? l < 32 || (i += r)
                            : (i += " ")
                          : (i += "-")
                        : (i += "\t")
                      : (i += "\n");
                  else {
                    const t = k(e[o]) || {};
                    (s.push({
                      text: i,
                      end: l,
                      itap: t.itap || 0,
                      ttp: !!t.ttp,
                      innerCell: !!t.innerCell,
                      innerTtp: !!t.innerTtp,
                    }),
                      (i = ""));
                  }
              } else a.pop();
            else a.length && (a[a.length - 1] = !1);
          else a.push(!0);
        }
        return (i.trim() && s.push({ text: i, end: 13, itap: 0 }), s);
      },
      S = p(3),
      z = p(3) + p(4) + p(5) + p(6) + p(7) + p(8),
      j = new Map(),
      M = [];
    if (p(9) > 0) {
      const t = new Map();
      try {
        const e = g(40),
          n = (d(40) - 4) / 30;
        for (let s = 0; s < n; s++)
          t.set(
            r.getInt32(e + 4 * (n + 1) + 26 * s, !0),
            r.getUint32(e + 4 * s, !0),
          );
        const s = g(56),
          i = (d(56) - 4) / 26;
        for (let e = 0; e < i; e++) {
          const n = r.getUint32(s + 4 * e, !0),
            a = r.getUint32(s + 4 * (e + 1), !0),
            o = r.getInt32(s + 4 * (i + 1) + 22 * e + 14, !0);
          if (a <= n || n >= p(9)) continue;
          const l = v(x(z + n, z + Math.min(a, p(9))));
          if (!l.some((t) => t.text.trim())) continue;
          const c = t.get(o);
          void 0 !== c && c < S
            ? (j.has(c) || j.set(c, []), j.get(c).push(...l))
            : M.push(...l);
        }
      } catch (t) {
        M.push(...v(x(z, z + p(9))));
      }
      j.size || M.length || M.push(...v(x(z, z + p(9))));
    }
    const C = new Map(),
      T = v(x(0, S), (t, e) => {
        j.has(t) && (C.has(e) || C.set(e, []), C.get(e).push(...j.get(t)));
      }),
      q = [];
    if (
      (T.forEach((t, e) => {
        (q.push(t), C.has(e) && q.push(...C.get(e)));
      }),
      C.has(T.length) && q.push(...C.get(T.length)),
      q.push(...M),
      !$.length)
    ) {
      let t = !1;
      for (let e = 0; e < q.length; e++) {
        const n = q[e];
        7 === n.end
          ? ((n.itap = 1),
            t && "" === n.text && q[e - 1] && 7 === q[e - 1].end
              ? ((n.ttp = !0), (t = !1))
              : (t = !0))
          : t && (n.itap = 1);
      }
    }
    const P = [],
      A = [],
      O = (t) => {
        (P.push({ type: "p", text: t }), A.push(t));
      },
      _ = (t) => {
        if (t.length) {
          P.push({ type: "tbl", rows: t });
          for (const e of t) A.push(e.join("\n"));
        }
      },
      U = (t) => {
        const e = t.map((t) => Z(t.replace(/\n/g, " ")));
        return ((e.raw = t), e);
      };
    let L = 0;
    for (; L < q.length;) {
      if (!q[L].itap) {
        (O(q[L].text), L++);
        continue;
      }
      let t = L;
      for (; t < q.length && q[t].itap;) t++;
      const e = q.slice(L, t);
      L = t;
      const n = e.some((t) => t.itap >= 2);
      if (n) {
        let t = 0;
        for (; t < e.length;) {
          if (e[t].itap < 2) {
            (e[t].ttp || O(e[t].text), t++);
            continue;
          }
          let n = t;
          for (; n < e.length && e[n].itap >= 2;) n++;
          const s = e.slice(t, n);
          t = n;
          const i = [];
          let a = [],
            o = [];
          for (const t of s)
            t.innerTtp
              ? (o.length && a.push(o.join("\n")),
                a.length && i.push(U(a)),
                (a = []),
                (o = []))
              : (o.push(t.text),
                (t.innerCell || 7 === t.end) &&
                  (a.push(o.join("\n")), (o = [])));
          (a.length && i.push(U(a)), _(i));
        }
        continue;
      }
      const s = [];
      let i = [],
        a = [];
      for (const t of e)
        t.ttp
          ? (a.length && i.push(a.join("\n")),
            i.length && s.push(U(i)),
            (i = []),
            (a = []))
          : (a.push(t.text), 7 === t.end && (i.push(a.join("\n")), (a = [])));
      (a.length && i.push(a.join("\n")), i.length && s.push(U(i)), _(s));
    }
    const I = [n];
    for (const t of ["Data", "1Table", "0Table"]) e[t] && I.push(e[t]());
    for (const t of Object.keys(e))
      /^MsoDataStore|^ObjectPool|Pictures/i.test(t) && I.push(e[t]());
    const N = (function (t) {
      let e = null;
      for (const n of t)
        for (let t = 0; t + 8 < n.length; t++)
          if (255 === n[t] && 216 === n[t + 1] && 255 === n[t + 2]) {
            let s = t + 2,
              i = -1;
            for (; s + 4 < n.length && 255 === n[s];) {
              const t = n[s + 1];
              if (216 === t || (t >= 208 && t <= 215) || 1 === t) {
                s += 2;
                continue;
              }
              const e = (n[s + 2] << 8) | n[s + 3];
              if (218 === t) {
                for (
                  s += 2 + e;
                  s + 1 < n.length && (255 !== n[s] || 217 !== n[s + 1]);
                )
                  s++;
                i = s + 2;
                break;
              }
              s += 2 + e;
            }
            if (i > t && i <= n.length) {
              const s = n.slice(t, i);
              ((!e || s.length > e.bytes.length) &&
                (e = { bytes: s, ext: "jpeg" }),
                (t = i - 1));
            }
          } else if (
            137 === n[t] &&
            80 === n[t + 1] &&
            78 === n[t + 2] &&
            71 === n[t + 3]
          ) {
            let s = t + 8,
              i = !1;
            for (; s + 12 <= n.length;) {
              const t =
                  ((n[s] << 24) |
                    (n[s + 1] << 16) |
                    (n[s + 2] << 8) |
                    n[s + 3]) >>>
                  0,
                e = String.fromCharCode(n[s + 4], n[s + 5], n[s + 6], n[s + 7]);
              if (((s += 12 + t), "IEND" === e)) {
                i = !0;
                break;
              }
              if (t > n.length) break;
            }
            if (i && s <= n.length) {
              const i = n.slice(t, s);
              ((!e || i.length > e.bytes.length) &&
                (e = { bytes: i, ext: "png" }),
                (t = s - 1));
            }
          }
      if (!e) return null;
      const n = dt(e.bytes);
      return n && (n.w < 60 || n.h < 60)
        ? null
        : { bytes: e.bytes, ext: e.ext, crop: null, cx: null, cy: null };
    })(I);
    return { blocks: P, textParts: A, photo: N };
  }
