/**
 * 06-docx-analyzer.js — DOCX faylni oʻqish (analyzeDocx) va bloklarni tahlil qilish, ogohlantirishlar yaratish (analyzeBlocks)
 */
  async function Yt(t, e = {}) {
    const n = await JSZip.loadAsync(t),
      s = n.file("word/document.xml");
    if (!s) throw new Error("Бу .docx файл эмас (word/document.xml йўқ).");
    const i = await s.async("string"),
      a = new DOMParser().parseFromString(i, "application/xml").documentElement,
      o = n.file("word/_rels/document.xml.rels"),
      r = {};
    if (o) {
      const t = new DOMParser()
        .parseFromString(await o.async("string"), "application/xml")
        .getElementsByTagName("Relationship");
      for (let e = 0; e < t.length; e++)
        r[t[e].getAttribute("Id")] = t[e].getAttribute("Target");
    }
    const l = et(a).find((t) => nt(t, "w", "body"));
    if (!l) throw new Error("Ҳужжат таркиби ўқилмади.");
    const c = await (async function (t, e, n) {
      const s = [{ el: e, rels: n, base: "word/" }];
      for (const [e, i] of Object.entries(n)) {
        if (!/^(?:header|footer)\d*\.xml$/i.test(String(i).split("/").pop()))
          continue;
        const e = i.startsWith("/") ? i.slice(1) : "word/" + i,
          n = t.file(e);
        if (n)
          try {
            const i = new DOMParser().parseFromString(
                await n.async("string"),
                "application/xml",
              ).documentElement,
              a = t.file(e.replace(/([^/]+)$/, "_rels/$1.rels")),
              o = {};
            if (a) {
              const t = new DOMParser()
                .parseFromString(await a.async("string"), "application/xml")
                .getElementsByTagName("Relationship");
              for (let e = 0; e < t.length; e++)
                "External" !== t[e].getAttribute("TargetMode") &&
                  (o[t[e].getAttribute("Id")] = t[e].getAttribute("Target"));
            }
            s.push({
              el: i,
              rels: o,
              base: e.replace(/[^/]+$/, ""),
              header: !0,
            });
          } catch (t) {}
      }
      const i = [],
        a = new Set(),
        o = (t, e) => {
          for (const n of e) {
            const e = t.getAttributeNS(tt.r, n) || t.getAttribute("r:" + n);
            if (e) return e;
          }
          return t.getAttribute("o:relid") || "";
        };
      for (const e of s) {
        const n = e.el.getElementsByTagName("*");
        for (let s = 0; s < n.length; s++) {
          const c = n[s],
            h = c.localName;
          let f = "";
          if ("blip" === h && c.namespaceURI === tt.a) f = o(c, ["embed"]);
          else {
            if (
              ("imagedata" !== h && "fill" !== h) ||
              !/vml/.test(c.namespaceURI || "")
            )
              continue;
            f = o(c, ["id", "pict"]);
          }
          if (!f || !e.rels[f]) continue;
          let p = e.rels[f];
          if (
            ((p = p.startsWith("/") ? p.slice(1) : e.base + p),
            (p = p.replace(/\/\.\//g, "/").replace(/[^/]+\/\.\.\//g, "")),
            a.has(p))
          )
            continue;
          a.add(p);
          const g = t.file(p);
          if (!g) continue;
          const d = await g.async("uint8array"),
            u =
              ((r = d),
              (l = (p.split(".").pop() || "png").toLowerCase()),
              !r || r.length < 8
                ? l
                : 255 === r[0] && 216 === r[1]
                  ? "jpeg"
                  : 137 === r[0] && 80 === r[1]
                    ? "png"
                    : 71 === r[0] && 73 === r[1]
                      ? "gif"
                      : 66 === r[0] && 77 === r[1]
                        ? "bmp"
                        : 82 === r[0] &&
                            73 === r[1] &&
                            87 === r[8] &&
                            69 === r[9]
                          ? "webp"
                          : (73 === r[0] && 73 === r[1]) ||
                              (77 === r[0] && 77 === r[1])
                            ? "tiff"
                            : 1 === r[0] &&
                                0 === r[1] &&
                                0 === r[2] &&
                                0 === r[3]
                              ? "emf"
                              : 215 === r[0] && 205 === r[1]
                                ? "wmf"
                                : l),
            m = {
              bytes: d,
              ext: "jpg" === u ? "jpeg" : u,
              crop: null,
              cx: null,
              cy: null,
            };
          if ("blip" === h) {
            const t = et(c.parentNode).find((t) => nt(t, "a", "srcRect"));
            if (t) {
              m.crop = {};
              for (const e of ["l", "t", "r", "b"])
                t.getAttribute(e) && (m.crop[e] = t.getAttribute(e));
              Object.keys(m.crop).length || (m.crop = null);
            }
            let e = c.parentNode;
            for (; e && 1 === e.nodeType;) {
              if (nt(e, "wp", "anchor") || nt(e, "wp", "inline")) {
                const t = et(e).find((t) => nt(t, "wp", "extent"));
                t &&
                  ((m.cx = parseInt(t.getAttribute("cx"), 10)),
                  (m.cy = parseInt(t.getAttribute("cy"), 10)));
                break;
              }
              e = e.parentNode;
            }
          } else {
            const t = (t) =>
                t
                  ? ((t = String(t)),
                    /f$/.test(t) ? parseFloat(t) / 65536 : parseFloat(t))
                  : 0,
              e = {};
            for (const [n, s] of [
              ["l", "cropleft"],
              ["t", "croptop"],
              ["r", "cropright"],
              ["b", "cropbottom"],
            ]) {
              const i = t(c.getAttribute(s));
              i > 0 && i < 1 && (e[n] = String(Math.round(1e5 * i)));
            }
            Object.keys(e).length && (m.crop = e);
          }
          const w = mt.has(m.ext) ? dt(d) : null,
            y = w ? w.w * w.h : m.cx && m.cy ? (m.cx * m.cy) / 1e6 : 0;
          if (w && (w.w < 60 || w.h < 60)) continue;
          const b = w ? w.h / w.w : 1.25;
          i.push({
            info: m,
            raster: mt.has(m.ext),
            portrait: b > 0.9 && b < 2.2,
            size: d.length,
            area: y,
            header: !!e.header,
          });
        }
      }
      var r, l;
      return i.length
        ? (i.sort(
            (t, e) =>
              e.raster - t.raster ||
              e.portrait - t.portrait ||
              t.header - e.header ||
              e.size - t.size,
          ),
          i[0].info)
        : null;
    })(n, a, r);
    c && ut(c);
    const h = [],
      f = [];
    for (const t of lt(l))
      if ("p" === t.type) {
        const e = it(t.el);
        (h.push({ type: "p", text: e }), f.push(e));
      } else {
        const e = ct(t.el);
        h.push({ type: "tbl", rows: e });
        for (const t of e) f.push(t.join("\n"));
      }
    return Kt(h, f, c, e);
  }
  function Kt(t, e, n, a = {}) {
    const o = yt(t, n);
    o.S = (function (t) {
      let e = 0,
        n = 0;
      for (const s of t)
        ((e += (s.match(/[A-Za-z]/g) || []).length),
          (n += (s.match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length));
      return e > n;
    })(e)
      ? O.lat
      : O.cyr;
    const r =
      /[,;]?\s*(?:(?:тел(?:ефон)?|tel(?:efon)?|mob(?:il)?|моб(?:ил)?)\.?\s*(?:raqami|рақами|№)?\s*:?\s*)?(?:\(?\+?\s*998\s*\)?[\s().-]*\d{2}[\s().-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}|\(?\d{2}\)?[\s.-]*\d{3}[\s.-]*\d{2}[\s.-]*\d{2}(?=\s*$))/gi;
    let l = 0;
    const h = (t) => {
      if (!t) return t;
      return String(t)
        .replace(r, () => (l++, ""))
        .replace(/\s{2,}/g, " ")
        .replace(/\s+([,.;])/g, "$1")
        .trim();
    };
    ((o.position = h(o.position)), (o.work = o.work.map(h).filter((t) => t)));
    for (const t of Object.keys(o.fields))
      "birth_date" !== t && (o.fields[t] = h(o.fields[t]));
    for (const t of o.relatives)
      for (const e of ["work", "address"]) t[e] = h(t[e]);
    l &&
      o.warnings.push(
        `Telefon raqami olib tashlandi (${l} ta) — ma'lumotnomada telefon ko‘rsatilmaydi.`,
      );
    const f =
      /\s*(?:ЖШШИР|ЖШШИ?Р|JSHSHIR|JShShIR|ПИНФЛ|PINFL)\s*[:№]?\s*\d{0,14}|\b\d{14}\b/gi;
    let p = 0;
    const m = (t) =>
      t
        ? String(t)
            .replace(f, () => (p++, ""))
            .replace(/\s{2,}/g, " ")
            .replace(/\s+:/g, ":")
            .trim()
        : t;
    ((o.since = m(o.since)),
      (o.position = m(o.position)),
      (o.name = m(o.name)),
      (o.work = o.work.map(m).filter((t) => t)));
    for (const t of Object.keys(o.fields)) o.fields[t] = m(o.fields[t]);
    for (const t of o.relatives)
      for (const e of ["name", "birth", "work", "address"]) t[e] = m(t[e]);
    p &&
      o.warnings.push(
        "JSHSHIR (shaxsiy raqam) olib tashlandi — ma'lumotnomada ko‘rsatilmaydi.",
      );
    {
      const t = o.S.latin,
        e = t ? Gt : Vt,
        n = (e) => {
          const n = (String(e).match(/[A-Za-z]/g) || []).length,
            s = (String(e).match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length;
          return t ? s > n : n > s;
        };
      let s = 0;
      const i = ((t) => (e) => {
        const n = t(e);
        return (n !== e && s++, n);
      })((t) => (t && n(t) ? e(t) : t));
      ((o.name = i(o.name)),
        (o.since = i(o.since)),
        (o.position = i(o.position)),
        (o.relHeadingName = i(o.relHeadingName)));
      for (const t of Object.keys(o.fields))
        "birth_date" !== t && (o.fields[t] = i(o.fields[t]));
      o.work = o.work.map(i);
      for (const t of o.relatives)
        for (const e of ["name", "birth", "work", "address"]) t[e] = i(t[e]);
      s &&
        o.warnings.push(
          `${s} ta qiymat ${t ? "lotin" : "kirill"} yozuviga o‘girildi (hujjatda yozuvlar aralash edi).`,
        );
    }
    {
      const t = (t) => {
          const e = String(t || "").match(/\p{L}/gu) || [];
          return (
            e.length >= 5 &&
            /(?:^|[^\p{L}])\p{Lu}{5,}/u.test(
              String(t).replace(/[‘’'ʻʼ`]/g, ""),
            ) &&
            e.filter((t) => t === t.toUpperCase() && t !== t.toLowerCase())
              .length /
              e.length >
              0.8
          );
        },
        e = (t, e) => {
          const n = String(t).split(" ");
          return e
            .split(" ")
            .map((t, e) =>
              n[e] &&
              (n[e].match(/\p{L}/gu) || []).length <= 4 &&
              /\p{Lu}{2,}/u.test(n[e])
                ? n[e]
                : t,
            )
            .join(" ");
        },
        n = (t) =>
          t.replace(/^([«“"'(]*)(\p{L})/u, (t, e, n) => e + n.toUpperCase()),
        s = new Set(u.map((t) => I(t))),
        i =
          /^(?:вилояти|тумани|шаҳри|шаҳар|шахри|viloyati|tumani|shahri|shahar|маҳалласи|mahallasi)$/i,
        a = (t) => {
          const e = String(t).toLowerCase().split(" ");
          return e
            .map((t, a) =>
              0 === a ||
              s.has(I(t)) ||
              (e[a + 1] &&
                i.test(e[a + 1].replace(/[,.]$/, "")) &&
                !/^(?:давлат|davlat)$/i.test(t))
                ? n(t)
                : t,
            )
            .join(" ");
        },
        r = (t) =>
          String(t)
            .toLowerCase()
            .split(/(\s+|-)/)
            .map((t) => n(t))
            .join("")
            .replace(/\b(Қизи|Ўғли|Qizi|O‘g‘li)\b/g, (t) => t.toLowerCase());
      let l = 0;
      const c = (n, s) => (n && t(n) ? (l++, e(n, s(n))) : n);
      ((o.name = c(o.name, r)),
        (o.relHeadingName = c(o.relHeadingName, r)),
        (o.since = c(o.since, (t) => t.toLowerCase())),
        (o.position = c(o.position, a)));
      for (const t of Object.keys(o.fields)) o.fields[t] = c(o.fields[t], a);
      o.work = o.work.map((t) => c(t, a));
      for (const t of o.relatives) {
        t.name = c(t.name, r);
        for (const e of ["birth", "work", "address"]) t[e] = c(t[e], a);
      }
      l &&
        o.warnings.push(
          `${l} ta qiymat katta harflardan oddiy yozuvga keltirildi — atoqli otlarni tekshiring.`,
        );
    }
    {
      const t = o.S.latin,
        e =
          /^(?:доцент|профессор|мудир|укитувчи|ассистент|декан|проректор|ректор|уринбосар|тадкикотчи|лаборант|методист|стажер|стажерукитувчи|инспектор|мутахассис|котиб|бухгалтер|хисобчи|кутубхоначи|мухандис|оператор|диспетчер|архивариус|тарбиячи|техник)$/,
        n =
          /(?:институти|университети|академияси|кафедраси|бўлими|бошқармаси|факультети|маркази|муассасаси|instituti|universiteti|akademiyasi|kafedrasi|bo‘limi|boshqarmasi|fakulteti|markazi|muassasasi)$/i,
        s = (s, i) => {
          if (!s) return s;
          let a = "",
            r = String(s);
          if (i) {
            const t = r.match(/^(\d{4}.*?\s-\s)(.*)$/);
            if (!t) return s;
            ((a = t[1]), (r = t[2]));
          }
          ((r = r
            .replace(
              /[«“"„]([^«»“”"]{6,}?)[»”"]\s+(?:давлат\s+муассасаси|davlat\s+muassasasi|ДМ|DM)(?=[\s,]|$)/i,
              "$1",
            )
            .replace(/^[«“"„]([^«»“”"]{6,}?)[»”"](?=\s)/, "$1")),
            (r = r.replace(/(\S+)\s+(?:да|da)\s+(?=\S)/, (t, e) =>
              n.test(e.replace(/[»”"]$/, "")) ? e + " " : t,
            )),
            (r = r.replace(
              /\s+\d{4,6}$/,
              () => (
                o.warnings.push(
                  `Lavozim oxiridagi raqam olib tashlandi («${s}») — shtat raqami bo‘lsa kerak, tekshiring.`,
                ),
                ""
              ),
            )));
          const l = r.split(" "),
            c = l[l.length - 1] || "";
          return (
            l.length >= 3 &&
              n.test((l[l.length - 2] || "").replace(/[,.]$/, "")) &&
              e.test(I(c).replace(/-/g, "")) &&
              (/(?:чи|chi)$/i.test(c)
                ? (l[l.length - 1] = c + (t ? "si" : "си"))
                : /(?:и|i)$/i.test(c) ||
                  (l[l.length - 1] =
                    c +
                    (/[аоуўеэaoue]$/i.test(c)
                      ? t
                        ? "si"
                        : "си"
                      : t
                        ? "i"
                        : "и")),
              (r = l.join(" "))),
            a + r
          );
        };
      ((o.position = s(o.position, !1)),
        (o.work = o.work.map((t) => s(t, !0))));
    }
    {
      const t = String(o.since || "").match(
        /^(\d{1,2})\.(\d{1,2})\.(\d{4})\s*(?:й(?:ил)?(?:дан)?|y(?:il)?(?:dan)?)?\.?\s*:?$/i,
      );
      if (t && +t[2] >= 1 && +t[2] <= 12) {
        const e = [
            "январ",
            "феврал",
            "март",
            "апрел",
            "май",
            "июн",
            "июл",
            "август",
            "сентябр",
            "октябр",
            "ноябр",
            "декабр",
          ],
          n = [
            "yanvar",
            "fevral",
            "mart",
            "aprel",
            "may",
            "iyun",
            "iyul",
            "avgust",
            "sentabr",
            "oktabr",
            "noyabr",
            "dekabr",
          ];
        o.since = o.S.latin
          ? `${t[3]}-yil ${+t[1]}-${n[+t[2] - 1]}dan:`
          : `${t[3]}-йил ${+t[1]}-${e[+t[2] - 1]}дан:`;
      }
    }
    ((o.since = he(o.since, o.S.latin)),
      (o.relatives = o.relatives
        .map((t, e) => [t, e])
        .sort(
          (t, e) => (Ft[t[0].rel] || 9) - (Ft[e[0].rel] || 9) || t[1] - e[1],
        )
        .map((t) => t[0])));
    const w = new Set(),
      y = (t) => (t ? (o.S.latin && (t = c(t)), P(t, w)) : t);
    {
      const t = [];
      ((o.name = g(o.name, t)), (o.relHeadingName = g(o.relHeadingName, t)));
      for (const e of [...new Set(t)])
        o.warnings.push(
          `F.I.Sh. yonidagi izoh olib tashlandi: «(${e})» — bu ism emas, kerak bo‘lsa alohida qayd eting.`,
        );
    }
    ((o.name = y(o.name)),
      (o.since = y(o.since)),
      (o.position = y(o.position)),
      (o.relHeadingName = y(o.relHeadingName)));
    for (const t of Object.keys(o.fields)) o.fields[t] = y(o.fields[t]);
    const b = o.work.map(y);
    o.work = b.map((t) => d(t, o.S.latin));
    const x = /^\s*(?:\d{1,2}\.)?\d{4}\s*[-–—]\s*(?:\d{1,2}\.)?\d{4}/.test(
      b[b.length - 1] || "",
    );
    if (o.work.length && !x) {
      const t = o.work[o.work.length - 1].match(
        /^(\d{4})\s*(?:й\.|y\.)\s*-\s*(.*)$/,
      );
      t &&
        !/^(?:[ҳх]\.\s*в\.?|[hx]\.\s*v\.?)/i.test(t[2]) &&
        ((o.work[o.work.length - 1] =
          `${t[1]}-${o.S.latin ? "yil." : "йил."} ${o.S.latin ? "h.v." : "ҳ.в."} - ${t[2]}`),
        o.warnings.push(
          `Oxirgi ish joyi hozirgi deb olindi: «${o.work[o.work.length - 1]}» — tekshiring.`,
        ));
    }
    !(function (t) {
      const e = ((t.since || "").match(/\d{4}/) || [])[0];
      if (!e || !(t.position || "").trim()) return !1;
      const n = t.work.slice(),
        s = le(t, t.position, e);
      "reopened" === s &&
        t.warnings.push(
          `Oxirgi ish joyi hozirgi lavozim bilan bir xil — «h.v.» qilib o‘zgartirildi: «${t.work[t.work.length - 1]}». Tekshiring.`,
        );
      "added" === s || "closed" === s
        ? t.warnings.push(
            `Hozirgi lavozim mehnat faoliyatida yo‘q edi — qo‘shildi: «${t.work[t.work.length - 1]}»${"closed" === s ? ", oldingi ish joyi " + e + "-yil bilan yopildi" : ""}. Tekshiring.`,
          )
        : "updated" === s &&
          t.warnings.push(
            `«h.v.» qatori tepadagi lavozim bilan to‘ldirildi: «${n.find((e, n) => e !== t.work[n])}» → «${t.work.find((t, e) => t !== n[e])}». Tekshiring.`,
          );
    })(o);
    {
      const t =
        /^(\d{4})\s*-?\s*(?:й\.|y\.|йил\.?|yil\.?)\s*-?\s*(?:ҳ\.в\.|h\.v\.)\s*-\s*(.*)$/i;
      o.S.latin;
      for (let e = o.work.length - 2; e >= 0; e--) {
        const n = o.work[e].match(t);
        if (!n) continue;
        o.work.slice(e + 1).some((t) => {
          const e = t.match(/^(\d{4})\s*-\s*\d{4}\s*\S*\s*-\s*(.*)$/);
          return e && e[1] === n[1] && ae(e[2], n[2]);
        }) && o.work.splice(e, 1);
      }
    }
    ((o.work = o.work.map((t) =>
      (function (t, e, n) {
        const s = t.match(
          /^(\d{4}(?:-\d{4})?\s*(?:yy\.|йй\.|y\.|й\.|-yil\.|-йил\.)\s*(?:h\.v\.|ҳ\.в\.)?\s*-\s*)(.*)$/,
        );
        return s ? s[1] + $(s[2], e, n) : $(t, e, n);
      })(t, o.S.latin, w),
    )),
      (o.position = $(o.position, o.S.latin, w)));
    for (const t of ["birth_place", "grad_year", "specialty", "degree", "title"])
      o.fields[t] = $(o.fields[t], o.S.latin, w);
    for (const t of o.relatives)
      for (const e of ["birth", "work", "address"])
        t[e] = $(t[e], o.S.latin, w);
    for (const t of o.relatives)
      for (const e of ["name", "birth", "work", "address"]) t[e] = y(t[e]);
    const k =
      /^(?:yo‘q|йўқ|oliy|олий|o‘rta(?: maxsus)?|ўрта(?: махсус)?|tugallanmagan oliy|тугалланмаган олий|bakalavr|бакалавр|magistr|магистр)$/i;
    {
      const t = String(o.fields.grad_year || "")
        .replace(/\s*\n\s*/g, " ")
        .match(
          /^(\d{4})\s*[-–—]\s*(\d{4})\s*-?\s*(йил|yil|й\.|y\.)?\s*,?\s*(\S.*)$/i,
        );
      t &&
        +t[2] > +t[1] &&
        +t[2] - +t[1] <= 8 &&
        (o.fields.grad_year = `${t[2]}-${o.S.latin ? "yil" : "йил"}, ${t[4]}`);
    }
    for (const t of o.relatives) {
      const e = /vafot|вафот/i;
      (!t.work &&
        e.test(t.address || "") &&
        ((t.work = t.address), (t.address = "")),
        e.test(t.work || "") &&
          (t.work = String(t.work).replace(
            /^(?:\d{1,2}\.\d{1,2}\.)?(\d{4})\s*-?\s*(?:йил(?:да)?|yil(?:da)?|й\.|y\.)?\s*(вафот|vafot)/i,
            (t, e, n) => `${e}-${/v/i.test(n) ? "yilda vafot" : "йилда вафот"}`,
          )));
    }
    {
      const t = o.S.latin,
        e = t ? "oliy" : "олий",
        n = t ? "o‘rta maxsus" : "ўрта махсус",
        s = String(o.fields.education || "").trim(),
        i =
          /^(?:тугалланмаган|tugallanmagan|олий|oliy|ўрта|o[‘'’`]?rta|махсус|maxsus|бакалавр|bakalavr|магистр|magistr|\s|[.,()-])+$/i,
        a = s
          .split(/\n|;/)
          .map((t) => t.trim())
          .filter((t) => t && !i.test(t))
          .map((t) =>
            t
              .replace(
                /^(?:(?:тугалланмаган|tugallanmagan|олий|oliy|ўрта|o[‘'’`]?rta|махсус|maxsus)[\s,.;:()-]+)+/i,
                "",
              )
              .trim(),
          )
          .filter(Boolean);
      {
        const t = String(o.fields.grad_year || "")
          .split(/\n/)
          .map((t) =>
            t
              .replace(
                /^(?:(?:тугалланмаган\s+)?(?:олий|oliy)(?:\s+маълумот(?:ли)?)?|ўрта\s+махсус|o[‘'’`]?rta\s+maxsus)[\s,.;:()-]+/i,
                "",
              )
              .trim(),
          )
          .filter((t) => t && !i.test(t));
        o.fields.grad_year = t.join("\n");
      }
      a.length &&
        !String(o.fields.grad_year || "").trim() &&
        (o.fields.grad_year = a.join(", "));
      const r = I(s),
        l =
          F(o.fields.grad_year, t) ||
          F(a.join(" "), t) ||
          (r.includes("олии") || r.includes("бакалавр") || r.includes("магистр")
            ? e
            : r.includes("урта")
              ? n
              : "");
      l &&
        l !== s &&
        ((o.fields.education = l),
        o.warnings.push(
          s
            ? `«Ma’lumoti»: «${s.replace(/\n/g, " ")}» → «${l}» («Tamomlagan» bo‘yicha) — tekshiring.`
            : `«Ma’lumoti» bo‘sh edi — «Tamomlagan»ga qarab «${l}» qo‘yildi. Tekshiring.`,
        ));
    }
    for (const t of [
      "party",
      "degree",
      "title",
      "military",
      "awards",
      "deputy",
      "languages",
    ]) {
      const e = (o.fields[t] || "").trim();
      /^(?:y\s*[o°0о]?\s*)?[‘'’`ʻ]\s*q$|^y\s*[o°0]\s*[‘'’`ʻ]?\s*q$|^й\s*[ўу]\s*[қк]$/i.test(
        e,
      ) &&
        e !== (o.S.latin ? "yo‘q" : "йўқ") &&
        ((o.fields[t] = o.S.latin ? "yo‘q" : "йўқ"),
        w.add(`${e} → ${o.fields[t]}`));
    }
    for (const t of [
      "nationality",
      "party",
      "education",
      "degree",
      "title",
      "military",
      "awards",
      "deputy",
    ]) {
      const e = (o.fields[t] || "").trim();
      e &&
        (k.test(e) || ("nationality" === t && !/\s/.test(e))) &&
        (o.fields[t] = e[0].toLowerCase() + e.slice(1));
    }
    const v = "lat" === a.script || ("cyr" !== a.script && null);
    let S = !1;
    null !== v &&
      v !== o.S.latin &&
      (Xt(o, v), (S = !0), (o.work = o.work.map((t) => d(t, o.S.latin))));
    const z = o.S.latin ? "yo‘q" : "йўқ",
      j = [];
    for (const t of [
      "party",
      "degree",
      "title",
      "languages",
      "military",
      "awards",
      "deputy",
    ])
      o.fields[t] ||
        ((o.fields[t] = z),
        j.push(
          {
            party: "Partiyaviyligi",
            degree: "Ilmiy darajasi",
            title: "Ilmiy unvoni",
            languages: "Chet tillari",
            military: "Harbiy unvoni",
            awards: "Davlat mukofotlari",
            deputy: "Deputatlik",
          }[t],
        ));
    ((o.src = t
      .slice(0, 400)
      .map((t) =>
        "p" === t.type
          ? { t: "p", text: String(t.text || "").slice(0, 2e3) }
          : {
              t: "tbl",
              rows: t.rows
                .slice(0, 60)
                .map((t) => t.map((t) => String(t || "").slice(0, 400))),
            },
      )),
      (o.fixes = [...w]
        .map((t) => t.split(" → "))
        .filter((t) => 2 === t.length && t[0] !== t[1])),
      (function (t, e) {
        const n = t.warnings,
          a = t.S,
          o = (t) => a.labels[t],
          r = (t) => O.lat.relations[t] || t;
        (t.photo || n.push("Rasm topilmadi — hujjatda rasm yo‘q."),
          t.name || n.push("F.I.Sh. (ism-sharif) topilmadi."),
          t.since || t.position || n.push("Joriy lavozim satri topilmadi."));
        for (const e of Object.keys(s))
          t.fields[e] ||
            n.push(`«${o(e)}» maydoni bo‘sh — hujjatda qiymat topilmadi.`);
        if (
          (t.fields.birth_date &&
            B(t.fields.birth_date)[2] &&
            n.push(
              `Tug‘ilgan sanada kun va oy almashgan ko‘rinadi: «${t.fields.birth_date}» → «${B(t.fields.birth_date)[0]}» — tekshiring.`,
            ),
          t.fields.birth_date &&
            !B(t.fields.birth_date)[1] &&
            n.push(
              `Tug‘ilgan sana formatini tanimadim: «${t.fields.birth_date}»`,
            ),
          t.work.length || n.push(`«${a.work}» bo‘limi bo‘sh yoki topilmadi.`),
          (t.foundRelTable && t.relatives.length) ||
            n.push("Yaqin qarindoshlar jadvali topilmadi yoki bo‘sh."),
          t.name && t.relHeadingName
            ? t.name.toLowerCase() !== t.relHeadingName.toLowerCase() &&
              n.push(
                `Ism har xil yozilgan: sarlavhada «${t.name}», qarindoshlar bo‘limida «${t.relHeadingName}».`,
              )
            : t.name &&
              !t.relHeadingName &&
              t.relatives.length &&
              n.push("Qarindoshlar bo‘limi sarlavhasi (F.I.Sh.) topilmadi."),
          t.name)
        ) {
          const e = t.name.split(" "),
            s = e.length ? bt(e[0]) : "",
            i = e.length >= 3 && xt(e[e.length - 1]) ? e[e.length - 2] : "",
            a = ["Укаси", "Акаси", "Опаси", "Синглиси"];
          for (const o of t.relatives) {
            const t = o.name.split(" ").filter((t) => t);
            if (t.length) {
              if (a.includes(o.rel)) {
                const i = bt(t[0]);
                i !== s &&
                  R(i.toLowerCase(), s.toLowerCase()) >= 0.75 &&
                  n.push(
                    `Familiya imlosi farq qiladi: «${e[0]}» va ${r(o.rel).toLowerCase()} «${t[0]}».`,
                  );
              }
              (a.includes(o.rel) &&
                i &&
                t.length >= 3 &&
                xt(t[t.length - 1]) &&
                t[t.length - 2].toLowerCase() !== i.toLowerCase() &&
                n.push(
                  `Otasining ismi farq qiladi: «${i}» va ${r(o.rel).toLowerCase()} «${t[t.length - 2]}».`,
                ),
                "Отаси" === o.rel &&
                  i &&
                  t.length >= 2 &&
                  t[1].toLowerCase() !== i.toLowerCase() &&
                  n.push(
                    `Otasining ismi farq qiladi: F.I.Sh.da «${i}», otasi jadvalda «${t[1]}».`,
                  ));
            }
          }
        }
        const l = (t.fields.birth_date || "").match(/\d{4}/);
        for (const e of t.relatives) {
          const t = r(e.rel) || "Qarindosh";
          (e.birth &&
            !Q(e.birth, a)[1] &&
            n.push(`${t}: tug‘ilgan yil formatini tanimadim: «${e.birth}»`),
            e.birth || n.push(`${t}: tug‘ilgan yili va joyi bo‘sh.`));
          const s = (e.birth || "").match(/^\d{4}/);
          l &&
            s &&
            ("Отаси" === e.rel || "Онаси" === e.rel) &&
            +s[0] > +l[0] - 14 &&
            n.push(
              `${t}: tug‘ilgan yili (${s[0]}) shubhali — ma’lumotnoma egasidan ${+l[0] - +s[0]} yosh katta.`,
            );
          for (const [s, i] of [
            ["name", "F.I.Sh."],
            ["work", "ish joyi"],
            ["address", "turar joyi"],
          ])
            e[s] || ("address" === s && Et(e)) || n.push(`${t}: ${i} bo‘sh.`);
          /(илгари|бўлган|ilgari|bo‘lgan|bo'lgan)/i.test(e.work || "") &&
            n.push(
              `${t}: ish joyida «ilgari/bo‘lgan» so‘zi bor — namunaga ko‘ra hozirgi ish joyi yoziladi (nafaqada bo‘lsa — «nafaqada»).`,
            );
        }
        const c = t.relatives.filter(
          (t) =>
            t.address &&
            !Et(t) &&
            !/(вилоят|область|viloyat|республика|respublika|тошкент\s*шаҳ|toshkent\s*sh|қорақалпоғистон|qoraqalpog)/i.test(
              t.address,
            ),
        ).length;
        c &&
          n.push(
            `${c} ta qarindoshning turar joyida viloyat ko‘rsatilmagan — namunaga ko‘ra viloyat, tuman, shahar/qishloq to‘liq yoziladi.`,
          );
        const h = new Set(),
          f = (t) => {
            for (const e of (t || "").matchAll(
              /(?<![A-Za-zА-Яа-яЎўҚқҒғҲҳ])[A-ZА-ЯЎҚҒҲ]{2,6}(?![A-Za-zА-Яа-яЎўҚқҒғҲҳ])/g,
            ))
              h.add(e[0]);
          };
        for (const e of t.work) f(e);
        for (const e of t.relatives) (f(e.work), f(e.address));
        for (const e of ["education", "grad_year", "specialty"]) f(t.fields[e]);
        (h.delete("ЎзР"),
          h.size &&
            n.push(
              `Qisqartma bo‘lishi mumkin: ${[...h]
                .slice(0, 8)
                .map((t) => "«" + t + "»")
                .join(", ")} — namunaga ko‘ra qisqartmasiz, to‘liq yoziladi.`,
            ));
        for (const e of t.relatives)
          e.rel &&
            !i.includes(e.rel) &&
            n.push(
              `Noma’lum qarindoshlik: «${e.rel}» (standart: ${i.map(r).join(", ")}).`,
            );
        t.relatives.length &&
          !t.relatives.some((t) => "Отаси" === t.rel) &&
          n.push(`Qarindoshlar orasida «${r("Отаси")}» yo‘q.`);
        const p = (t.fields.grad_year || "").match(/\d{4}/);
        let g = p ? +p[0] : null;
        for (const e of t.work) {
          const t = e.match(
            /^(\d{4})\s*[-–—]?\s*(?:(\d{4})|[йy]{0,2}\.?\s*(?:[ҳh]\.?\s*[вv]|ҳозир|hozir|[хx]\.?\s*[вv]))?/i,
          );
          if (!t) continue;
          const s = +t[1],
            i = t[2] ? +t[2] : null;
          (null !== g &&
            s - g > 1 &&
            n.push(
              `Mehnat faoliyatida ${g}–${s} oralig‘ida tanaffus bor (o‘qishni tugatgan yil yoki oldingi ish bilan).`,
            ),
            i && (g = i));
        }
        e.toLowerCase();
      })(o, e.join("\n")),
      j.length &&
        o.warnings.push(
          `Bo‘sh maydonlarga «${z}» qo‘yildi: ${j.map((t) => "«" + t + "»").join(", ")} — to‘g‘riligini tekshiring.`,
        ),
      S &&
        o.warnings.push(
          `Matn ${o.S.latin ? "lotin" : "kirill"} yozuviga o‘girildi — ism-familiyalar va joy nomlarini tekshiring.`,
        ),
      w.size &&
        o.warnings.push(
          `Imlo tuzatildi: ${[...w].map((t) => "«" + t + "»").join(", ")}.`,
        ));
    const M = new Set(),
      C = [];
    for (const t of o.warnings) M.has(t) || (M.add(t), C.push(t));
    return {
      data: o,
      warnings: C,
      summary: {
        name: o.name,
        work: o.work.length,
        relatives: o.relatives.length,
        photo: !!o.photo,
        script: o.S.latin ? "lotin" : "kirill",
      },
    };
  }
