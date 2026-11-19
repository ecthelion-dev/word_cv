/**
 * 04-docx-builder.js — Standart Word (.docx) OpenXML hujjatini va ZIP paketini generatsiya qilish
 */
  const $t = (t) =>
      t
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;"),
    kt = (t) => Math.round(20 * t);
  function vt(t, n, s, i, a) {
    return `<w:r><w:rPr><w:rFonts w:ascii="${e}" w:hAnsi="${e}" w:eastAsia="${e}" w:cs="${e}"/>${s ? "<w:b/>" : ""}${a ? `<w:spacing w:val="${a}"/>` : ""}<w:sz w:val="${2 * n}"/><w:szCs w:val="${2 * n}"/>${i ? '<w:highlight w:val="yellow"/>' : ""}</w:rPr><w:t xml:space="preserve">${$t(t).split("\n").join('</w:t><w:br/><w:t xml:space="preserve">')}</w:t></w:r>`;
  }
  const St = () => "<w:r><w:tab/></w:r>",
    zt =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,:;()-–—‘’'`\"“”«»/?!%№абвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯўЎ",
    jt = [
      444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500,
      500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 722, 667, 667, 722,
      611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556,
      611, 722, 722, 944, 722, 722, 611, 500, 500, 500, 500, 500, 500, 500, 500,
      500, 500, 250, 250, 250, 278, 278, 333, 333, 333, 500, 1e3, 333, 333, 180,
      333, 408, 444, 444, 500, 500, 278, 444, 333, 833, 954, 444, 509, 472, 410,
      509, 444, 444, 691, 395, 535, 535, 486, 499, 633, 535, 500, 535, 500, 444,
      437, 500, 648, 500, 535, 503, 770, 770, 517, 672, 456, 429, 747, 460, 722,
      574, 667, 578, 682, 611, 611, 896, 501, 722, 722, 667, 678, 889, 722, 722,
      722, 556, 667, 611, 708, 790, 722, 722, 650, 1009, 1009, 706, 872, 574,
      660, 1028, 667, 500, 708,
    ],
    Mt = [
      500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500,
      556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 722, 667, 722, 722,
      667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556,
      667, 722, 722, 1e3, 722, 722, 667, 500, 500, 500, 500, 500, 500, 500, 500,
      500, 500, 250, 250, 250, 333, 333, 333, 333, 333, 500, 1e3, 333, 333, 278,
      333, 555, 500, 500, 500, 500, 278, 500, 333, 1e3, 1005, 500, 500, 540,
      454, 506, 444, 444, 725, 402, 576, 576, 576, 561, 681, 576, 500, 576, 556,
      444, 491, 500, 692, 500, 576, 564, 844, 844, 583, 781, 529, 432, 764, 541,
      722, 661, 667, 636, 688, 667, 667, 989, 528, 778, 778, 725, 745, 944, 778,
      778, 778, 611, 722, 667, 734, 859, 722, 778, 734, 1098, 1098, 765, 982,
      661, 678, 1126, 722, 500, 734,
    ],
    Ct = { r: new Map(), b: new Map() };
  for (let t = 0; t < 154; t++)
    (Ct.r.set(zt[t], jt[t]), Ct.b.set(zt[t], Mt[t]));
  for (const [t, e] of [
    ["қ", "к"],
    ["Қ", "К"],
    ["ғ", "г"],
    ["Ғ", "Г"],
    ["ҳ", "х"],
    ["Ҳ", "Х"],
  ])
    (Ct.r.set(t, Ct.r.get(e)), Ct.b.set(t, Ct.b.get(e)));
  function Tt(t, e) {
    const n = e ? Ct.b : Ct.r;
    let s = 0;
    for (const e of t || "") s += n.has(e) ? n.get(e) : 520;
    return 0.24 * s;
  }
  const qt = 708,
    Pt = 6 * qt,
    At = [1, 2, 3, 4, 5, 6].map((t) => qt * t);
  function Ot(t, e) {
    const n = Tt(t || "", e) + 20,
      s = At.filter((t) => t > n).length;
    return { tabs: St().repeat(Math.max(1, s)), stops: At };
  }
  const _t = (t, e) =>
    Math.max(...(t || "").split("\n").map((t) => Tt(t, e))) > 3700 ||
    (t || "").includes("\n")
      ? { indent: Pt, hanging: Pt }
      : {};
  let Ut = !1;
  const Lt = "______________________________",
    It = (t, e, s) =>
      t ? vt(t, e, s || !1, !1) : Ut ? vt(Lt, e, !1, !1) : vt(n, e, !0, !0);
  function Nt(t, e = {}) {
    const {
      align: n,
      after: s = 0,
      before: i = 0,
      keep: a,
      pageBreak: o,
      indent: r,
      tab: l,
      hanging: c,
    } = e;
    return (
      `<w:p><w:pPr>${a ? "<w:keepNext/>" : ""}${o ? "<w:pageBreakBefore/>" : ""}` +
      (l
        ? `<w:tabs>${(Array.isArray(l) ? l : [l]).map((t) => `<w:tab w:val="left" w:pos="${t}"/>`).join("")}</w:tabs>`
        : "") +
      `<w:spacing w:before="${kt(i)}" w:after="${kt(s)}" w:line="240" w:lineRule="auto"/>` +
      `${r ? `<w:ind w:left="${r}"${c ? ` w:hanging="${c}"` : ""}/>` : ""}<w:jc w:val="${n || "left"}"/></w:pPr>${t || ""}</w:p>`
    );
  }
  const Dt = (t, e) =>
    `<w:tc><w:tcPr><w:tcW w:w="${t}" w:type="dxa"/><w:vAlign w:val="center"/></w:tcPr>${e}</w:tc>`;
  const Et = (t) => /вафот|vafot/i.test(t.work || "") && !t.address,
    Ft = {
      Отаси: 1,
      Онаси: 2,
      Акаси: 3,
      Опаси: 3,
      Укаси: 4,
      Синглиси: 4,
      "Турмуш ўртоғи": 5,
      Ўғли: 6,
      Қизи: 6,
      Қайнотаси: 7,
      Қайнонаси: 8,
      Қайноғаси: 9,
      "Қайни опаси": 9,
      "Қайни акаси": 10,
      "Қайни укаси": 10,
      Қайнсингили: 10,
      Божаси: 11,
      Поччаси: 11,
    };
  function Ht(t) {
    const e = t.fields,
      s = t.S,
      i = s.labels,
      a = [];
    (a.push(
      Nt(
        (t.photo
          ? (function (t) {
              const e = t.cx || Math.round(1054800),
                n = t.cy || Math.round(1306800);
              let s = "";
              return (
                t.crop &&
                  (s = `<a:srcRect ${Object.entries(t.crop)
                    .map(([t, e]) => `${t}="${e}"`)
                    .join(" ")}/>`),
                `<w:r><w:drawing><wp:anchor distT="0" distB="0" distL="114300" distR="0" simplePos="0" relativeHeight="251659264" behindDoc="0" locked="0" layoutInCell="1" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="margin"><wp:align>right</wp:align></wp:positionH><wp:positionV relativeFrom="paragraph"><wp:posOffset>24765</wp:posOffset></wp:positionV><wp:extent cx="${e}" cy="${n}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapSquare wrapText="bothSides"/><wp:docPr id="1" name="Photo"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="photo"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdPhoto"/>${s}<a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${e}" cy="${n}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r>`
              );
            })(t.photo)
          : "") + vt(s.title, 14, !0),
        { align: "center" },
      ),
    ),
      a.push(Nt(It(t.name, 14, !0), { align: "center", after: 6, before: 4 })),
      t.since && a.push(Nt(vt(t.since, 12, !1))),
      t.position
        ? a.push(Nt(vt(t.position, 12, !0), { after: 6 }))
        : a.push(Nt("", { after: 6 })),
      e.birth_date && (e.birth_date = B(e.birth_date)[0]));
    const r = (t) => {
        (a.push(Nt(vt(i[t] + ":", 12, !0), { keep: !0 })),
          a.push(Nt(It(e[t], 12), { after: 6 })));
      },
      l = (t, s) => {
        const o = Pt - 150;
        let l = [e[t] || ""];
        if (Tt(e[t] || "", !1) > o) {
          l = [];
          for (const n of String(e[t]).split(/\s+/)) {
            const t = l.length ? l[l.length - 1] : null;
            null !== t && Tt(t + " " + n, !1) <= o
              ? (l[l.length - 1] = t + " " + n)
              : l.push(n);
          }
          if (
            !e[s] ||
            l.length > 3 ||
            l.some((t) => Tt(t, !1) > o) ||
            Object.keys(_t(e[s], !1)).length
          )
            return (r(t), void r(s));
        }
        const c = Ot(i[t] + ":", !0),
          h = Ot(l[0] || (Ut ? Lt : n), !e[t] && !Ut);
        a.push(
          Nt(vt(i[t] + ":", 12, !0) + c.tabs + vt(i[s] + ":", 12, !0), {
            keep: !0,
            tab: c.stops,
          }),
        );
        const f = l
          .slice(1)
          .map((t) => "<w:r><w:br/></w:r>" + vt(t, 12, !1))
          .join("");
        a.push(
          Nt(
            (e[t] ? vt(l[0], 12, !1) : It("", 12)) + h.tabs + It(e[s], 12) + f,
            { after: 6, tab: h.stops, ...(f ? {} : _t(e[s], !1)) },
          ),
        );
      };
    (l("birth_date", "birth_place"),
      l("nationality", "party"),
      l("education", "grad_year"));
    const c = Ot(i.specialty + ":", !0),
      h = i.specialty + ":",
      f = Tt(h, !0) - (Pt - 60),
      p = f > 0 ? -Math.min(10, Math.ceil(f / h.length)) : 0;
    (a.push(
      Nt(vt(h, 12, !0, !1, p) + c.tabs + It(e.specialty, 12), {
        after: 6,
        tab: c.stops,
        ..._t(e.specialty, !1),
      }),
    ),
      l("degree", "title"),
      l("languages", "military"));
    for (const t of ["awards", "deputy"]) r(t);
    if (
      (a.push(
        Nt(vt(s.work, 14, !0), {
          align: "center",
          after: 6,
          before: 6,
          keep: !0,
        }),
      ),
      t.work.length)
    ) {
      const e =
          /^(\d{4}(?:-\d{4})?\s*(?:yy\.|йй\.|y\.|й\.|-yil\.?|-йил\.?)\s*(?:h\.v\.|ҳ\.в\.)?\s*-)\s*(.*)$/,
        n = Tt(" ", !1),
        s = t.work.map((t) => {
          const n = t.match(e);
          return n ? [n[1], n[2]] : [null, t];
        }),
        i = Math.ceil(
          Math.max(0, ...s.filter((t) => t[0]).map((t) => Tt(t[0], !1))) + n,
        );
      for (const [t, e] of s) {
        if (!t) {
          a.push(Nt(vt(e, 12, !1), { after: 4 }));
          continue;
        }
        const s = Math.max(1, Math.round((i - Tt(t, !1)) / n)),
          o = 9505,
          r = Math.round(i / n);
        let l = t + " ".repeat(s),
          c = Tt(l, !1),
          h = "",
          f = !0;
        for (const t of e.split(/\s+/).filter((t) => t)) {
          const e = (f ? "" : " ") + t,
            n = Tt(e, !1);
          (!f && c + n > o
            ? ((h += l + "\n"), (l = " ".repeat(r) + t), (c = Tt(l, !1)))
            : ((l += e), (c += n)),
            (f = !1));
        }
        a.push(Nt(vt(h + l, 12, !1), { after: 4 }));
      }
    } else a.push(Nt(It("", 12)));
    const g = t.name || t.relHeadingName;
    (a.push(
      Nt(It(g ? g + s.relSuffix : "", 14, !0), {
        align: "center",
        pageBreak: !0,
        after: 6,
      }),
    ),
      a.push(Nt(vt(s.relTitle, 14, !0), { align: "center", after: 6 })));
    const d = { rel: "", name: "", birth: "", work: "", address: "" },
      u = (t.relatives.length ? t.relatives : [d]).concat(Ut ? [d, d] : []),
      m = [];
    m.push(
      `<w:tr><w:trPr><w:tblHeader w:val="true"/></w:trPr>${s.relHeaders.map((t, e) => Dt(o[e], Nt(vt(t, 12, !0), { align: "center" }))).join("")}</w:tr>`,
    );
    for (const t of u) {
      const e = t.birth ? relativeBirthYear(t.birth, s) : "",
        n = Et(t),
        i = [
          s.relations[t.rel] || t.rel,
          t.name,
          G(e, "birth", s),
          n ? t.work : G(t.work, "work", s),
          G(t.address, "address", s),
        ],
        a = [];
      for (let t = 0; t < 5; t++) {
        if (n && 3 === t) {
          a.push(
            `<w:tc><w:tcPr><w:tcW w:w="${o[3] + o[4]}" w:type="dxa"/><w:gridSpan w:val="2"/><w:vAlign w:val="center"/></w:tcPr>${Nt(It(i[3], 12), { align: "center" })}</w:tc>`,
          );
          break;
        }
        a.push(
          Dt(
            o[t],
            Nt(Ut && !i[t] ? "" : It(i[t], 12, 0 === t), { align: "center" }),
          ),
        );
      }
      m.push(
        `<w:tr><w:trPr><w:cantSplit/>${Ut ? '<w:trHeight w:val="680"/>' : ""}</w:trPr>${a.join("")}</w:tr>`,
      );
    }
    return (
      a.push(
        (function ({
          widths: t,
          rows: e,
          borders: n,
          margins: s,
          jc: i,
          style: a,
        }) {
          const o = s;
          return `<w:tbl><w:tblPr>${a ? `<w:tblStyle w:val="${a}"/>` : ""}<w:tblW w:w="${t.reduce((t, e) => t + e, 0)}" w:type="dxa"/>${i ? `<w:jc w:val="${i}"/>` : ""}${n ? "<w:tblBorders>" + ["top", "left", "bottom", "right", "insideH", "insideV"].map((t) => `<w:${t} w:val="single" w:sz="4" w:space="0" w:color="auto"/>`).join("") + "</w:tblBorders>" : "<w:tblBorders>" + ["top", "left", "bottom", "right", "insideH", "insideV"].map((t) => `<w:${t} w:val="nil"/>`).join("") + "</w:tblBorders>"}<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="${o.top || 0}" w:type="dxa"/><w:left w:w="${o.left}" w:type="dxa"/><w:bottom w:w="${o.bottom || 0}" w:type="dxa"/><w:right w:w="${o.right}" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${t.map((t) => `<w:gridCol w:w="${t}"/>`).join("")}</w:tblGrid>${e.join("")}</w:tbl>`;
        })({
          widths: o,
          rows: m,
          borders: !0,
          jc: "center",
          style: "TableGrid",
          margins: { top: 20, bottom: 20, left: 60, right: 60 },
        }),
      ),
      a.push('<w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr></w:p>'),
      a.join("")
    );
  }
  const Rt = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    bmp: "image/bmp",
  };
  async function Zt(t) {
    const n = new JSZip(),
      s = Ht(t),
      i = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${tt.w}" xmlns:r="${tt.r}" xmlns:wp="${tt.wp}" xmlns:a="${tt.a}" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>${s}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="851" w:right="567" w:bottom="567" w:left="1134" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>`,
      a =
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="${tt.w}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${e}" w:hAnsi="${e}" w:eastAsia="${e}" w:cs="${e}"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="uz-Cyrl-UZ" w:eastAsia="ru-RU"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:uiPriority w:val="99"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/><w:basedOn w:val="TableNormal"/><w:uiPriority w:val="39"/><w:tblPr><w:tblBorders>` +
        ["top", "left", "bottom", "right", "insideH", "insideV"]
          .map(
            (t) =>
              `<w:${t} w:val="single" w:sz="4" w:space="0" w:color="auto"/>`,
          )
          .join("") +
        "</w:tblBorders></w:tblPr></w:style></w:styles>",
      o = t.photo ? (Rt[t.photo.ext] ? t.photo.ext : "png") : null,
      r =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
        (o ? `<Default Extension="${o}" ContentType="${Rt[o]}"/>` : "") +
        '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/></Types>',
      l =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>' +
        (o
          ? `<Relationship Id="rIdPhoto" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/photo.${o}"/>`
          : "") +
        "</Relationships>";
    return (
      n.file("[Content_Types].xml", r),
      n.file(
        "_rels/.rels",
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      ),
      n.file("word/document.xml", i),
      n.file("word/styles.xml", a),
      n.file(
        "word/settings.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="${qt}"/><w:characterSpacingControl w:val="doNotCompress"/></w:settings>`,
      ),
      n.file("word/_rels/document.xml.rels", l),
      o && n.file(`word/media/photo.${o}`, t.photo.bytes),
      n.generateAsync({ type: "uint8array", compression: "DEFLATE" })
    );
  }
