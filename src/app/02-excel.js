/**
 * 02-excel.js — Excel (.xlsx / .csv) kadrlar bazasi bilan integratsiya, ustunlarni bogʻlash va solishtirish
 */
const XL_FIELDS = [
    [
      "name",
      "F.I.Sh.",
      [
        "ф.и.ш",
        "фиш",
        "fish",
        "фио",
        "familiyasi ismi otasining ismi",
        "фамилияси исми отасининг исми",
        "фамилия имя отчество",
        "xodim",
        "ходим",
        "ф.и.о",
        "фамилия, имя, отчество",
        "фамилия имя отчество сотрудника",
        "familiya ism sharifi",
        "familiyasi ismi sharifi",
        "фамилияси исми шарифи",
        "xodimning f.i.sh",
        "ходимнинг ф.и.ш",
        "f.i.o",
        "сотрудник",
        "работник",
      ],
    ],
    ["surname", "Familiyasi (alohida)", ["familiyasi", "фамилияси", "фамилия"]],
    ["first", "Ismi (alohida)", ["ismi", "исми", "имя"]],
    [
      "patr",
      "Otasining ismi (alohida)",
      ["otasining ismi", "отасининг исми", "отчество", "sharifi", "шарифи"],
    ],
    [
      "since_date",
      "Lavozimga tayinlangan sana",
      [
        "buyruq",
        "буйруқ",
        "buyruq raqami va sanasi",
        "буйруқ рақами ва санаси",
        "buyruq sanasi va raqami",
        "буйруқ санаси ва рақами",
        "tayinlangan sana",
        "тайинланган сана",
        "tayinlangan yili",
        "тайинланган йили",
        "qachondan",
        "қачондан",
        "qachondan beri",
        "lavozimda ishlayotgan sana",
        "ishlay boshlagan",
        "ишлай бошлаган",
        "boshlagan sana",
        "бошлаган сана",
        "boshlagan yili",
        "бошлаган йили",
        "lavozimga tayinlangan",
        "лавозимга тайинланган",
        "qabul qilingan sana",
        "қабул қилинган сана",
        "ishga qabul",
        "ишга қабул",
        "дата назначения",
        "дата приема",
        "buyruq sanasi",
        "буйруқ санаси",
        "ishlagan vaqti",
        "ишлаган вақти",
        "lavozimda ishlagan vaqti",
        "лавозимда ишлаган вақти",
        "ushbu lavozimda",
        "ушбу лавозимда",
        "ishga kirgan",
        "ишга кирган",
        "ishga kirgan sana",
        "ишга кирган сана",
        "lavozimga tayinlangan vaqti",
        "лавозимга тайинланган вақти",
        "ishlay boshlagan vaqti",
        "ишлай бошлаган вақти",
        "дата приказа о приеме",
        "дата приказа о приёме",
        "дата приказа",
        "приказ о приеме",
        "номер и дата приказа",
        "дата назначения на должность",
        "qachondan buyon",
        "қачондан буён",
        "qachondan buyon ushbu lavozimda",
        "buyruq raqami",
        "буйруқ рақами",
        "tayinlanganlik buyrug",
        "тайинланганлик буйруғи",
      ],
    ],
    [
      "org",
      "Ish joyi / tashkilot (lavozim oldiga)",
      [
        "tashkilot",
        "ташкилот",
        "tashkilot nomi",
        "ташкилот номи",
        "muassasa",
        "муассаса",
        "организация",
        "ish joyi",
        "иш жойи",
        "ish joyi nomi",
        "иш жойи номи",
        "hozirgi ish joyi",
        "ҳозирги иш жойи",
        "место работы",
      ],
    ],
    [
      "dept",
      "Bo'lim (lavozim oldiga)",
      [
        "bolim",
        "бўлим",
        "bolinma",
        "бўлинма",
        "kafedra",
        "кафедра",
        "fakultet",
        "факультет",
        "подразделение",
        "отдел",
        "структурное подразделение",
        "tarkibiy bolinma",
        "таркибий бўлинма",
        "bolinma nomi",
        "бўлинма номи",
        "kafedra nomi",
        "кафедра номи",
        "bolim nomi",
        "бўлим номи",
        "ishlayotgan bolim",
        "ишлаётган бўлим",
      ],
    ],
    [
      "position",
      "Hozirgi lavozimi",
      [
        "lavozimi",
        "лавозими",
        "egallab turgan lavozimi",
        "эгаллаб турган лавозими",
        "должность",
        "lavozim",
        "лавозим",
        "lavozim nomi",
        "лавозим номи",
        "наименование должности",
        "egallagan lavozimi",
        "эгаллаган лавозими",
      ],
    ],
    [
      "birth_date",
      "Tug'ilgan sana",
      [
        "tugilgan sana",
        "туғилган сана",
        "tugilgan yili",
        "туғилган йили",
        "tugilgan kuni",
        "дата рождения",
        "tugilgan sanasi",
        "туғилган санаси",
        "tugilgan yil oy kun",
        "туғилган йил ой кун",
        "год рождения",
      ],
    ],
    [
      "birth_place",
      "Tug'ilgan joyi",
      [
        "tugilgan joyi",
        "туғилган жойи",
        "место рождения",
        "tugilgan joy",
        "туғилган жой",
      ],
    ],
    ["nationality", "Millati", ["millati", "миллати", "национальность"]],
    [
      "party",
      "Partiyaviyligi",
      ["partiyaviyligi", "партиявийлиги", "партийность"],
    ],
    [
      "education",
      "Ma'lumoti",
      [
        "malumoti",
        "маълумоти",
        "образование",
        "malumot darajasi",
        "маълумот даражаси",
        "уровень образования",
      ],
    ],
    [
      "grad_year",
      "Tamomlagan (to'liq matn)",
      ["tamomlagan", "тамомлаган", "окончил"],
    ],
    [
      "grad_years",
      "O'qigan yillari (oxirgisi olinadi)",
      [
        "otm ni tugatgan yili",
        "отм ни тугатган йили",
        "tugatgan yili",
        "тугатган йили",
        "oqigan yillari",
        "ўқиган йиллари",
        "oqish davri",
        "ўқиш даври",
        "tamomlagan yili",
        "тамомлаган йили",
        "bitirgan yili",
        "битирган йили",
        "oqish yillari",
        "ўқиш йиллари",
        "годы обучения",
        "год окончания",
        "год окончания вуза",
        "otm tugatgan yili",
      ],
    ],
    [
      "otm",
      "Tamomlagan OTM nomi",
      [
        "otm",
        "отм",
        "tugatgan oliy talim muassasasi nomi",
        "тугатган олий таълим муассасаси номи",
        "oliy talim muassasasi",
        "олий таълим муассасаси",
        "tamomlagan otm",
        "тамомлаган отм",
        "bitirgan otm",
        "битирган отм",
        "oquv yurti",
        "ўқув юрти",
        "oquv muassasasi",
        "ўқув муассасаси",
        "вуз",
        "учебное заведение",
        "окончил вуз",
        "наименование вуза",
        "tamomlagan oquv yurti",
        "тамомлаган ўқув юрти",
      ],
    ],
    [
      "specialty",
      "Mutaxassisligi",
      [
        "mutaxassisligi",
        "мутахассислиги",
        "специальность",
        "malumoti boyicha mutaxassisligi",
        "специальность по диплому",
        "diplom boyicha mutaxassisligi",
        "диплом бўйича мутахассислиги",
      ],
    ],
    [
      "degree",
      "Ilmiy darajasi",
      ["ilmiy darajasi", "илмий даражаси", "ученая степень"],
    ],
    [
      "title",
      "Ilmiy unvoni",
      ["ilmiy unvoni", "илмий унвони", "ученое звание"],
    ],
    [
      "staff_cat",
      "Xodim toifasi (PPS / ma'muriy)",
      [
        "xodim toifasi",
        "ходим тоифаси",
        "xodimlar toifasi",
        "ходимлар тоифаси",
        "категория персонала",
        "тип персонала",
        "категория работника",
        "персонал тури",
        "xodim turi",
        "ходим тури",
      ],
    ],
    [
      "languages",
      "Chet tillari",
      [
        "chet tillari",
        "чет тиллари",
        "qaysi chet tillarini biladi",
        "иностранные языки",
      ],
    ],
    [
      "military",
      "Harbiy (maxsus) unvoni",
      [
        "harbiy unvoni",
        "ҳарбий унвони",
        "harbiy maxsus unvoni",
        "воинское звание",
      ],
    ],
    [
      "awards",
      "Davlat mukofotlari",
      ["davlat mukofotlari", "давлат мукофотлари", "mukofotlari", "награды"],
    ],
    [
      "deputy",
      "Deputatlik",
      ["deputat", "депутат", "deputatligi", "депутатлиги"],
    ],
  ],
  XL_TEXT_KEYS = [
    "birth_date",
    "birth_place",
    "nationality",
    "party",
    "education",
    "grad_year",
    "specialty",
    "degree",
    "title",
    "languages",
    "military",
    "awards",
    "deputy",
  ],
  xl = { rows: [], headers: [], map: {}, matches: new Map(), unmatched: [] };
$("xlPick").addEventListener("click", () => $("xlFile").click());
const FSA = "function" == typeof window.showOpenFilePicker,
  xlLink = { handle: null, last: 0, timer: null, busy: !1 };
function idb(e, t) {
  return openDB().then(
    (a) =>
      new Promise((n) => {
        if (!a) return n(null);
        try {
          const i = a
              .transaction("kv", "get" === e ? "readonly" : "readwrite")
              .objectStore("kv"),
            o =
              "get" === e
                ? i.get("excel")
                : "del" === e
                  ? i.delete("excel")
                  : i.put(t, "excel");
          ((o.onsuccess = () => n("get" !== e || o.result)),
            (o.onerror = () => n(null)));
        } catch (e) {
          n(null);
        }
      }),
  );
}
async function ensurePerm(e, t) {
  try {
    return (
      "granted" === (await e.queryPermission({ mode: "read" })) ||
      (!!t && "granted" === (await e.requestPermission({ mode: "read" })))
    );
  } catch (e) {
    return !1;
  }
}
async function readLinked(e, t) {
  const a = xlLink.handle;
  if (a && !xlLink.busy)
    if (await ensurePerm(a, e)) {
      xlLink.busy = !0;
      try {
        const e = await a.getFile();
        if (t && e.lastModified === xlLink.last) return;
        xlLink.last = e.lastModified;
        const n = !!xl.ran,
          i = await loadExcel(e, { keepMap: !0 });
        (($("xlInfo").textContent =
          `Ulangan Excel: «${e.name}» — ${xl.rows.length} ta qator, oxirgi saqlangan: ${new Date(e.lastModified).toLocaleDateString("ru-RU")} ${fmtTime(e.lastModified)}.` +
          (t ? " Fayl o‘zgargani uchun avtomatik yangilandi." : "")),
          n && !i && runCompare());
      } catch (e) {
        t ||
          (($("xlMsg").className = "msg err"),
          ($("xlMsg").textContent =
            "Ulangan Excel'ni o'qib bo'lmadi (fayl ko'chirilgan yoki o'chirilgan bo'lishi mumkin): " +
            (e && e.message ? e.message : e)));
      } finally {
        xlLink.busy = !1;
      }
    } else
      t ||
        (($("xlMsg").className = "msg"),
        ($("xlMsg").textContent =
          `«${a.name}» ulangan. Davom etish uchun «Yangilash»ni bosing (brauzer ruxsat so'raydi).`));
}
function startWatch() {
  (clearInterval(xlLink.timer),
    (xlLink.timer = setInterval(() => {
      "visible" === document.visibilityState && readLinked(!1, !0);
    }, 4e3)));
}
FSA &&
  ($("xlLink").addEventListener("click", async () => {
    try {
      const [e] = await window.showOpenFilePicker({
        types: [
          {
            description: "Excel",
            accept: {
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
              "text/csv": [".csv"],
            },
          },
        ],
      });
      ((xlLink.handle = e),
        (xlLink.last = 0),
        await idb("put", e),
        ($("xlRefresh").hidden = !1),
        ($("xlDel").hidden = !1),
        ($("xlLink").textContent = "Boshqa Excel'ni ulash"),
        await readLinked(!0),
        startWatch());
    } catch (e) {
      e &&
        "AbortError" !== e.name &&
        (($("xlMsg").className = "msg err"),
        ($("xlMsg").textContent =
          "Bu oynada faylga ulanib bo'lmadi — «Excel faylni tanlash»dan foydalaning."));
    }
  }),
  $("xlRefresh").addEventListener("click", async () => {
    ((xlLink.last = 0), await readLinked(!0), startWatch());
  }),
  idb("get").then(async (e) => {
    e &&
      ((xlLink.handle = e),
      ($("xlRefresh").hidden = !1),
      ($("xlDel").hidden = !1),
      ($("xlLink").textContent = "Boshqa Excel'ni ulash"),
      ($("xlInfo").textContent =
        `Oldin ulangan Excel: «${e.name}». «Yangilash»ni bosing.`),
      (await ensurePerm(e, !1)) && (await readLinked(!1), startWatch()));
  }));
let xlDelT = null;
async function xlWipe(e) {
  xlSum(null);
  const t = xl.fileName || (xlLink.handle && xlLink.handle.name) || "Excel";
  (clearInterval(xlLink.timer), (xlLink.handle = null), (xlLink.last = 0));
  try {
    await idb("del");
  } catch (e) {}
  Object.assign(xl, {
    rows: [],
    headers: [],
    map: {},
    matches: new Map(),
    unmatched: [],
    used: null,
    ran: !1,
    prevHeaders: null,
    fileName: "",
    lead: null,
    gone: null,
    q: "",
  });
  for (const e of items)
    (delete e.xlRow,
      delete e.xlStatus,
      delete e.xlChanges,
      delete e.xlFuzzy,
      delete e.xlManual,
      delete e.xlAuto,
      e.P && store.dirty.add(e));
  (($("xlMap").hidden = !0),
    ($("xlMap").textContent = ""),
    ($("xlActs").hidden = !0),
    ($("xlApplyAll").hidden = !0),
    ($("xlNew").hidden = !0),
    ($("xlNew").textContent = ""),
    ($("xlMsg").className = "msg"),
    ($("xlMsg").textContent = ""),
    ($("xlRefresh").hidden = !0),
    ($("xlLink").textContent = "Kompyuterdagi Excel'ga ulash"),
    ($("xlInfo").textContent =
      `«${t}» o'chirildi. Ma'lumotnomalar va ularga oldin qo'llangan o'zgarishlar joyida qoldi. Kadrlar bazasi Excel faylini qayta tanlashingiz mumkin.`),
    (lead.list = null));
  for (const e of items) renderCard(e);
  (store.saveXl(),
    store.flush(),
    updateStats(),
    xlStatus(),
    "check" === curView
      ? renderCheck(!0)
      : "lead" === curView && renderLead(!0),
    e || toast(`Excel o'chirildi: «${t}»`));
}
async function compareClick() {
  const e = $("xlRun");
  if (e.disabled) return;
  const t = items.filter((e) => e.P && !e.fromExcel).length;
  if (!t)
    return (
      ($("xlMsg").className = "msg err"),
      ($("xlMsg").textContent =
        "Solishtiriladigan ma'lumotnoma yo'q — avval ma'lumotnomalarni (ZIP, Word yoki PDF) yuklang."),
      $("xlMsg").classList.add("flash"),
      void setTimeout(() => $("xlMsg").classList.remove("flash"), 1300)
    );
  const a = e.textContent;
  ((e.disabled = !0),
    e.classList.add("busy"),
    (e.textContent = `Solishtirilmoqda… (${t} ta)`),
    ($("xlMsg").className = "msg"),
    ($("xlMsg").textContent =
      `${t} ta ma'lumotnoma Excel'dagi ${xl.rows.length} ta qator bilan solishtirilmoqda…`));
  const n = performance.now();
  await new Promise((e) => requestAnimationFrame(() => setTimeout(e, 30)));
  try {
    runCompare();
    const e = 450 - (performance.now() - n);
    e > 0 && (await new Promise((t) => setTimeout(t, e)));
    const t = $("xlMsg");
    ((t.textContent =
      `✓ Solishtirildi (${fmtTime(Date.now())}). ` + t.textContent),
      t.classList.add("flash"),
      setTimeout(() => t.classList.remove("flash"), 1300),
      toast("Solishtirish tugadi"));
  } catch (e) {
    (($("xlMsg").className = "msg err"),
      ($("xlMsg").textContent =
        `Solishtirishda xato: ${(e && e.message) || e}. Sahifani yangilab, qayta urinib ko'ring.`));
  } finally {
    ((e.disabled = !1), e.classList.remove("busy"), (e.textContent = a));
  }
}
($("xlDel").addEventListener("click", async () => {
  const e = $("xlDel");
  if (!e.dataset.sure)
    return (
      (e.dataset.sure = "1"),
      (e.textContent = "Rostdan o'chirilsinmi? Yana bosing"),
      clearTimeout(xlDelT),
      void (xlDelT = setTimeout(() => {
        (delete e.dataset.sure, (e.textContent = "Excel'ni o'chirish"));
      }, 4e3))
    );
  (clearTimeout(xlDelT),
    delete e.dataset.sure,
    (e.textContent = "Excel'ni o'chirish"),
    await xlWipe());
}),
  $("xlFile").addEventListener("change", async () => {
    const e = $("xlFile").files[0];
    if ((($("xlFile").value = ""), e))
      try {
        if ((await loadExcel(e), xl.afterLoad)) {
          const e = xl.afterLoad;
          ((xl.afterLoad = null), e());
        }
      } catch (e) {
        ((xl.afterLoad = null),
          ($("xlMsg").className = "msg err"),
          ($("xlMsg").textContent =
            "Excel faylni o'qib bo'lmadi: " +
            (e && e.message ? e.message : e)));
      }
  }),
  $("xlRun").addEventListener("click", compareClick));
let confTimer = 0;
function updApply() {
  const e = $("xlApplyAll");
  e &&
    ((e.hidden = !0),
    clearTimeout(confTimer),
    (confTimer = setTimeout(renderConf, 60)));
}
$("xlApplyAll").addEventListener("click", () => {
  let e = 0,
    t = 0;
  for (const a of items)
    if (a.xlChanges && a.xlChanges.length) {
      const n = applyChanges(
        a,
        a.xlChanges.filter((e) => e.on),
      );
      n && ((e += n), t++);
    }
  (store.saveXl(),
    updApply(),
    ($("xlMsg").className = "msg"),
    ($("xlMsg").textContent =
      `✓ ${t} ta ma'lumotnomaga ${e} ta o'zgarish qo'llandi.`),
    toast(`${e} ta o'zgarish qo'llandi`));
});
const colIdx = (e) => {
  let t = 0;
  for (const a of e.replace(/\d+/g, "")) t = 26 * t + (a.charCodeAt(0) - 64);
  return t - 1;
};
async function readXlsx(e) {
  const t = await JSZip.loadAsync(e),
    a = (e) => new DOMParser().parseFromString(e, "application/xml"),
    n = [],
    i = t.file("xl/sharedStrings.xml");
  if (i)
    for (const e of [...a(await i.async("string")).getElementsByTagName("si")])
      n.push(
        [...e.getElementsByTagName("t")].map((e) => e.textContent).join(""),
      );
  const o = a(await t.file("xl/workbook.xml").async("string")),
    l = a(await t.file("xl/_rels/workbook.xml.rels").async("string")),
    s = {};
  for (const e of [...l.getElementsByTagName("Relationship")])
    s[e.getAttribute("Id")] = e.getAttribute("Target");
  const r = [];
  for (const e of [...o.getElementsByTagName("sheet")]) {
    let i =
      s[
        e.getAttribute("r:id") ||
          e.getAttributeNS(
            "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
            "id",
          )
      ] || "";
    ((i = i.replace(/^\//, "")), i.startsWith("xl/") || (i = "xl/" + i));
    const o = t.file(i);
    if (!o) continue;
    const l = a(await o.async("string")),
      d = [];
    for (const e of [...l.getElementsByTagName("row")]) {
      const t = [];
      for (const a of [...e.getElementsByTagName("c")]) {
        const e = a.getAttribute("t"),
          i = a.getElementsByTagName("v")[0];
        let o = "";
        ((o =
          "s" === e
            ? n[+(i ? i.textContent : 0)] || ""
            : "inlineStr" === e
              ? [...a.getElementsByTagName("t")]
                  .map((e) => e.textContent)
                  .join("")
              : i
                ? i.textContent
                : ""),
          (t[colIdx(a.getAttribute("r") || "A1")] = o));
      }
      d[(+e.getAttribute("r") || d.length + 1) - 1] = t.map((e) =>
        null == e ? "" : String(e),
      );
    }
    r.push({ name: e.getAttribute("name"), rows: d.filter(Boolean) });
  }
  return r;
}
function readCsv(e) {
  const t =
      ((e = e.replace(/^﻿/, "")).split("\n")[0].match(/;/g) || []).length >=
      (e.split("\n")[0].match(/,/g) || []).length
        ? ";"
        : ",",
    a = [];
  let n = [],
    i = "",
    o = !1;
  for (let l = 0; l < e.length; l++) {
    const s = e[l];
    o
      ? '"' === s
        ? '"' === e[l + 1]
          ? ((i += '"'), l++)
          : (o = !1)
        : (i += s)
      : '"' === s
        ? (o = !0)
        : s === t
          ? (n.push(i), (i = ""))
          : "\n" === s
            ? (n.push(i.replace(/\r$/, "")), a.push(n), (n = []), (i = ""))
            : (i += s);
  }
  return (
    (i || n.length) && (n.push(i), a.push(n)),
    [{ name: "CSV", rows: a }]
  );
}
const hnorm = (e) => SpravkaCore.norm(String(e || "").replace(/[ʻʼ‘’`']/g, ""));
function guessField(e) {
  const t = hnorm(e);
  if (!t) return null;
  let a = null;
  for (const [e, , n] of XL_FIELDS)
    for (const i of n) {
      const n = hnorm(i),
        o =
          t === n
            ? 1
            : t.includes(n) && n.length >= 5
              ? 0.9 + Math.min(0.09, n.length / 1e3)
              : SpravkaCore.ratio(t, n);
      o >= 0.85 && (!a || o > a[0]) && (a = [o, e]);
    }
  return a ? a[1] : null;
}
const GONE_RE =
    /иш?дан\s*(?:бўша|буша|кет|озод|чиқ|чик)|ishdan\s*(?:bo.?sha|ket|ozod|chiq)|уволен|увольн|бўшаганлар|бушаганлар|bo.?shaganlar|кетганлар|ketganlar/i,
  LEAD_SHEET_RE = /раҳбар|рахбар|rahbar|руковод/i,
  SKIP_SHEET_RE =
    /жами|jami|вакан|vakan|асосий|asosiy|ўриндош|уриндош|o['‘’`ʻ]?rindosh|профессор|professor|свод|итог|summary|статистик|statistik|ҳисобот|hisobot/i,
  MAIN_SHEET_RE =
    /рўйхат|руйхат|ro['‘’`ʻ]?yxat|список|штат|shtat|база|baza|ходимлар|xodimlar|сотрудник/i;
function dropGone(e) {
  const t = [];
  let a = !1,
    n = 0;
  for (const i of e) {
    const e = (i || []).map((e) => String(e || "").trim()).filter(Boolean);
    if (!e.length) continue;
    const o = e.length <= 2 && e.join(" ").length < 120;
    o && GONE_RE.test(e.join(" "))
      ? ((a = !0), n++)
      : (a && o && (a = !1),
        a || e.some((e) => e.length < 60 && GONE_RE.test(e)) ? n++ : t.push(i));
  }
  return { rows: t, dropped: n };
}
function pickHeader(e) {
  let t = null;
  for (const a of e)
    for (let e = 0; e < Math.min(15, a.rows.length); e++) {
      const n = (a.rows[e] || []).filter((e) => guessField(e)).length;
      (!t ||
        n > t.hits ||
        (n === t.hits && a.rows.length > t.sh.rows.length)) &&
        (t = { sh: a, r: e, hits: n });
    }
  return t && t.hits >= 1 ? t : null;
}
async function loadExcel(e, t) {
  xl.afterLoad || ($("xlD").open = !0);
  const a = /\.csv$/i.test(e.name)
      ? readCsv(await e.text())
      : await readXlsx(await e.arrayBuffer()),
    n = a.filter((e) => GONE_RE.test(e.name || "")),
    i = a.filter((e) => !GONE_RE.test(e.name || "")),
    o = i.find((e) => LEAD_SHEET_RE.test(e.name || "")),
    l = i
      .filter(
        (e) =>
          e !== o &&
          SKIP_SHEET_RE.test(e.name || "") &&
          !MAIN_SHEET_RE.test(e.name || ""),
      )
      .map((e) => e.name),
    s = i.filter((e) => e !== o && !l.includes(e.name) && pickHeader([e])),
    r = s.find((e) => MAIN_SHEET_RE.test(e.name || "")),
    d = r ? pickHeader([r]) : s.length ? pickHeader([s[0]]) : pickHeader(i);
  if (!d)
    throw new Error("ustun sarlavhalari tanilmadi (F.I.Sh., Lavozimi va h.k.)");
  xl.headers = d.sh.rows[d.r].map((e) => String(e || "").trim());
  const c = dropGone(
    d.sh.rows
      .slice(d.r + 1)
      .filter((e) => e && e.some((e) => String(e).trim())),
  );
  if (((xl.rows = c.rows), (xl.lead = null), o && o !== d.sh)) {
    const e = pickHeader([o]);
    if (e) {
      const t = e.sh.rows[e.r].map((e) => String(e || "").trim()),
        a = {};
      (t.forEach((e, t) => {
        const n = guessField(e);
        n && void 0 === a[n] && (a[n] = t);
      }),
        (xl.lead = {
          name: o.name,
          headers: t,
          map: a,
          rows: dropGone(e.sh.rows.slice(e.r + 1)).rows,
        }));
    }
  } else o === d.sh && (xl.lead = { name: o.name, same: !0 });
  ((xl.gone = { sheets: n.map((e) => e.name), rows: c.dropped }),
    (xl.used = null));
  for (const e of items) (delete e.xlManual, (e.xlRow = void 0));
  const p = d.sh.rows[d.r].map((e) => String(e || "").trim());
  ((t &&
    t.keepMap &&
    JSON.stringify(p) === JSON.stringify(xl.prevHeaders || [])) ||
    ((xl.map = {}),
    xl.headers.forEach((e, t) => {
      const a = guessField(e);
      a && void 0 === xl.map[a] && (xl.map[a] = t);
    })),
    (xl.prevHeaders = p),
    drawMap());
  const m = [
    xl.gone.sheets.length ? `«${xl.gone.sheets.join("», «")}» varag'i` : "",
    xl.gone.rows ? `${xl.gone.rows} ta qator («ишдан кетганлар»)` : "",
  ]
    .filter(Boolean)
    .join(" va ");
  return (
    ($("xlInfo").textContent =
      `«${e.name}» — «${d.sh.name}» varag'i, ${xl.rows.length} ta qator.${xl.lead && !xl.lead.same ? ` Rahbarlar ro'yxati: «${xl.lead.name}» varag'i (${xl.lead.rows.length} qator).` : ""}${m ? ` ${m} hisobga olinmadi.` : ""}${l.length ? ` Yig'ma varaqlar hisobga olinmadi: «${l.join("», «")}».` : ""} Quyida qaysi ustun qaysi maydonga olinishini tekshiring; kerak bo'lmaganini «—» qiling.`),
    ($("xlActs").hidden = !1),
    ($("xlMsg").textContent = ""),
    (xl.fileName = e.name),
    calcUnmatched(),
    drawNew(),
    store.saveXl(),
    !(
      (void 0 === xl.map.name && void 0 === xl.map.surname) ||
      !items.some((e) => e.P && !e.fromExcel)
    ) && (runCompare(), !0)
  );
}
function drawMap() {
  const e = $("xlMap");
  ((e.hidden = !1), (e.textContent = ""), ($("xlDel").hidden = !1));
  const t = XL_FIELDS.filter(([e]) => void 0 !== xl.map[e]).length,
    a = void 0 !== xl.map.name || void 0 !== xl.map.surname,
    n = el("details", "mapd");
  n.open = !a;
  const i = el("summary");
  (i.append(
    el("b", "", "Ustunlar moslashuvi"),
    el(
      "span",
      "",
      ` — ${XL_FIELDS.length} ta maydondan ${t} tasi Excel ustuniga bog'landi` +
        (a
          ? ". Tekshirish yoki o'zgartirish uchun oching."
          : ". F.I.Sh. ustuni topilmadi — tanlang."),
    ),
  ),
    n.append(i));
  const o = el("div", "map");
  for (const [e, t] of XL_FIELDS) {
    const a = el("label");
    a.append(el("span", "", t));
    const n = el("select");
    (n.append(Object.assign(el("option", "", "—"), { value: "" })),
      xl.headers.forEach((e, t) => {
        e && n.append(Object.assign(el("option", "", e), { value: String(t) }));
      }),
      (n.value = void 0 !== xl.map[e] ? String(xl.map[e]) : ""),
      n.classList.toggle("on", !!n.value),
      n.addEventListener("change", () => {
        ("" === n.value ? delete xl.map[e] : (xl.map[e] = +n.value),
          n.classList.toggle("on", !!n.value));
      }),
      a.append(n),
      o.append(a));
  }
  (n.append(o), e.append(n));
}
const MONTHS_C = [
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
  MONTHS_L = [
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
function parseDate(e) {
  const t = [
      ...(e = String(e || "").trim()).matchAll(
        /(?<!\d)(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?!\d)/g,
      ),
    ].map((e) => ({ d: +e[1], m: +e[2], y: +e[3] })),
    a = [
      ...e.matchAll(/(?<!\d)(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?!\d)/g),
    ].map((e) => ({ d: +e[3], m: +e[2], y: +e[1] })),
    n = [
      /^(?:январ|yanvar|янв)/i,
      /^(?:феврал|fevral|фев)/i,
      /^(?:март|mart)/i,
      /^(?:апрел|aprel)/i,
      /^(?:май|may)/i,
      /^(?:июн|iyun)/i,
      /^(?:июл|iyul)/i,
      /^(?:август|avgust)/i,
      /^(?:сентябр|сентабр|sentabr|sentyabr)/i,
      /^(?:октябр|октабр|oktabr|oktyabr)/i,
      /^(?:ноябр|noyabr)/i,
      /^(?:декабр|dekabr)/i,
    ],
    i = (e) => n.findIndex((t) => t.test(e)) + 1;
  for (const a of e.matchAll(
    /(?<!\d)(\d{1,2})\s*-?\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ‘’']{3,})\s*,?\s*(\d{4})(?!\d)/g,
  )) {
    const e = i(a[2]);
    e && t.push({ d: +a[1], m: e, y: +a[3] });
  }
  for (const a of e.matchAll(
    /(?<!\d)(\d{4})\s*-?\s*(?:йил|yil|й\.|y\.)?\s*(\d{1,2})\s*-?\s*([A-Za-zА-Яа-яЎўҚқҒғҲҳ‘’']{3,})/g,
  )) {
    const e = i(a[3]);
    e && t.push({ d: +a[2], m: e, y: +a[1] });
  }
  const o = t
    .concat(a)
    .filter(
      (e) =>
        e.m >= 1 &&
        e.m <= 12 &&
        e.d >= 1 &&
        e.d <= 31 &&
        e.y >= 1900 &&
        e.y <= 2100,
    );
  if (o.length)
    return o.sort((e, t) => e.y - t.y || e.m - t.m || e.d - t.d).pop();
  if (/^\d{4,5}(\.\d+)?$/.test(e) && +e > 1e4 && +e < 8e4) {
    const t = new Date(Math.round(864e5 * (+e - 25569)));
    return { d: t.getUTCDate(), m: t.getUTCMonth() + 1, y: t.getUTCFullYear() };
  }
  let l = e.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  return l
    ? { d: +l[1], m: +l[2], y: +l[3] }
    : ((l = e.match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})/)),
      l
        ? { d: +l[3], m: +l[2], y: +l[1] }
        : ((l = e.match(/^(\d{4})$/)), l ? { y: +l[1] } : null));
}
const p2 = (e) => String(e).padStart(2, "0");
function toScript(e, t) {
  if (
    !(e = String(e || "")
      .trim()
      .replace(/\s+/g, " "))
  )
    return e;
  const a = (e.match(/[A-Za-z]/g) || []).length,
    n = (e.match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length,
    i = (t) =>
      e
        .split(/(\s+)/)
        .map((e) =>
          /^\s+$/.test(e) ||
          ((e) =>
            /^(?:[A-ZА-ЯЎҚҒҲЁ]{2,6}|[A-Z][a-z]*[A-Z][A-Za-z]*)[.,;:)]*$/.test(
              e,
            ))(e)
            ? e
            : t(e),
        )
        .join("");
  return t && n > a
    ? i(SpravkaCore.cyrToLat)
    : !t && a > n
      ? i(SpravkaCore.latToCyr)
      : t
        ? SpravkaCore.fixApostrophes(e)
        : e;
}
function cleanVal(e, t) {
  if (!(e = toScript(e, t))) return e;
  const a = new Set();
  return SpravkaCore.fixOrgText(SpravkaCore.fixTypos(e, a), t, a);
}
function rowName(e) {
  const t = (t) =>
      void 0 !== xl.map[t] ? String(e[xl.map[t]] || "").trim() : "",
    a = (
      t("name") ||
      [t("surname"), t("first"), t("patr")].filter(Boolean).join(" ")
    )
      .replace(/\s+/g, " ")
      .trim();
  return cleanPersonName(a) || a;
}
const NAME_LAT2CYR = {
    A: "А",
    a: "а",
    B: "В",
    C: "С",
    c: "с",
    E: "Е",
    e: "е",
    H: "Н",
    K: "К",
    k: "к",
    M: "М",
    O: "О",
    o: "о",
    P: "Р",
    p: "р",
    T: "Т",
    X: "Х",
    x: "х",
    y: "у",
  },
  NAME_CYR2LAT = Object.fromEntries(
    Object.entries(NAME_LAT2CYR).map(([e, t]) => [t, e]),
  ),
  NAME_PART =
    /^(?:ўғли|ўгли|угли|уғли|ўғлы|қизи|кизи|o[‘’'`ʻ]?g[‘’'`ʻ]?li|ugli|og[‘’'`ʻ]?li|qizi|kizi)$/i,
  NAME_PATR_END =
    /(?:вич|вна|ўғли|ўгли|угли|қизи|кизи|o[‘’'`ʻ]?g[‘’'`ʻ]?li|ugli|qizi|kizi|ovich|evich|ovna|evna)$/i;
function fixHomoglyphs(e) {
  const t = (e.match(/[А-Яа-яЁёЎўҚқҒғҲҳ]/g) || []).length,
    a = (e.match(/[A-Za-z]/g) || []).length;
  return (
    t &&
      a &&
      (e =
        t >= a
          ? e.replace(/[A-Za-z]/g, (e) => NAME_LAT2CYR[e] || e)
          : e.replace(/[А-Яа-я]/g, (e) => NAME_CYR2LAT[e] || e)),
    a >= t ? e.replace(/([OoGg])[‘’'`ʻʼ]/g, "$1‘") : e
  );
}
function cleanPersonName(e) {
  e = String(e || "")
    .replace(/[(\[«“"][^)\]»”"]*[)\]»”"]?/g, " ")
    .replace(/[,;]+/g, " ");
  try {
    e = SpravkaCore.stripNameNote(e, []);
  } catch (e) {}
  let t = e.split(/\s+/).filter(Boolean).map(fixHomoglyphs);
  (t.length &&
    !t.some((e) => /[A-ZА-ЯЁЎҚҒҲ]/.test(e)) &&
    (t = t.map((e) =>
      NAME_PART.test(e) ? e : e[0].toUpperCase() + e.slice(1),
    )),
    (t = t
      .filter((e) => !/[\d.№]/.test(e) && /[A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]/.test(e))
      .filter(
        (e) =>
          !/^(?:х{2,}|x{2,}|отм|otm|мчж|mchj|тдпи|tdpi|терду|terdu)$/i.test(e),
      )
      .filter((e) => NAME_PART.test(e) || /^[A-ZА-ЯЁЎҚҒҲ]/.test(e))
      .filter(
        (e, t, a) =>
          !(
            a.length > 3 &&
            !NAME_PART.test(e) &&
            a.some((e) => /[a-zа-яёўқғҳ]/.test(e)) &&
            /^[A-ZА-ЯЁЎҚҒҲ]{1,4}$/.test(e)
          ),
      )));
  const a = t.findIndex((e, t) => t >= 1 && NAME_PATR_END.test(e));
  return (
    a >= 1 && (t = t.slice(0, a + 1)),
    (t = t.map((e) =>
      e === e.toUpperCase() && e.length > 1 && !NAME_PART.test(e)
        ? niceName(e)
        : e,
    )),
    (t = t.map((e) =>
      NAME_PART.test(e)
        ? /[а-яў]/i.test(e)
          ? /[кқ]изи/i.test(e)
            ? "қизи"
            : "ўғли"
          : /[qk]izi/i.test(e)
            ? "qizi"
            : "o‘g‘li"
        : e,
    )),
    t.length >= 2 ? t.join(" ") : ""
  );
}
const same = (e, t) =>
    SpravkaCore.norm(String(e || "")) === SpravkaCore.norm(String(t || "")),
  FULL_STOP = new Set([
    "йил",
    "й",
    "йй",
    "г",
    "гг",
    "год",
    "ва",
    "ҳамда",
    "ва",
    "и",
    "шаҳар",
    "шаҳри",
    "ш",
    "туман",
    "тумани",
    "т",
    "вилоят",
    "вилояти",
    "вил",
    "республикаси",
    "тили",
  ]),
  FULL_STOP_N = new Set([...FULL_STOP].map((e) => SpravkaCore.norm(e)));
function fullToks(e) {
  return new Set(
    SpravkaCore.latToCyr(String(e || ""))
      .toLowerCase()
      .split(/[^0-9a-zа-яёўқғҳ]+/i)
      .map((e) => SpravkaCore.norm(e))
      .filter((e) => e && !FULL_STOP_N.has(e)),
  );
}
function fuller(e, t) {
  const a = fullToks(e),
    n = fullToks(t);
  if (!a.size || !n.size) return 0;
  const i = [...n].every((e) => a.has(e)),
    o = [...a].every((e) => n.has(e));
  return i ? 1 : o ? -1 : 0;
}
const FULL_KEYS = new Set([
  "birth_place",
  "grad_year",
  "specialty",
  "degree",
  "title",
  "languages",
  "military",
  "awards",
  "deputy",
  "party",
  "nationality",
]);
function sameSince(e, t) {
  const a = ((t = String(t || "")).match(/\d{4}/) || [])[0];
  if (!a || +a !== e.y) return !1;
  if (!e.d) return !0;
  const n = t.replace(/\d{4}/, ""),
    i = (n.match(/\d{1,2}/) || [])[0],
    o = SpravkaCore.cyrToLat(n.toLowerCase()),
    l = MONTHS_L.findIndex((e) => o.includes(e.slice(0, 4)));
  return (!i || +i === e.d) && (l < 0 || l + 1 === e.m) && !!(i || l >= 0);
}
function posMinor(e, t) {
  const a = (e) =>
      SpravkaCore.latToCyr(String(e || ""))
        .toLowerCase()
        .split(/[^0-9а-яёўқғҳ]+/i)
        .map((e) =>
          ((e) =>
            e.replace(
              /(?:ларининг|ларини|лари|нинг|ини|ида|сида|даги|да|си|ни|ли|и)$/,
              "",
            ))(SpravkaCore.norm(e)),
        )
        .filter(
          (e) => e && e.length > 1 && !/^(?:ва|ҳамда|бўйича|буйича)$/.test(e),
        ),
    n = a(e),
    i = a(t);
  if (!n.length || !i.length) return !1;
  const o = (e, t) =>
    e.some(
      (e) =>
        e === t ||
        (e.length > 3 && t.length > 3 && SpravkaCore.ratio(e, t) >= 0.8),
    );
  return n.every((e) => o(i, e)) && i.every((e) => o(n, e));
}
const spellScore = (e) =>
  (SpravkaCore.latToCyr(String(e || "")).match(/[ЎўҒғҚқҲҳЁёЭэЪъ]/g) || [])
    .length;
function pickBestWords(e, t, a) {
  if (String(t || "").includes("\n"))
    return String(t)
      .split("\n")
      .map((t) => pickBestWords(e, t, a))
      .join("\n");
  const n = cleanVal(e, a),
    i = cleanVal(t, a);
  if (!n || !i) return i || n;
  const o = n.split(/\s+/).filter(Boolean),
    l = i.split(/\s+/).filter(Boolean);
  return l
    .map((e, t) => {
      const a = o[t];
      if (!a || SpravkaCore.norm(a) !== SpravkaCore.norm(e)) return e;
      return spellScore(a) > spellScore(e) ? a : e;
    })
    .join(" ");
}
function pickBestSpelling(e, t, a) {
  const n = cleanVal(e, a),
    i = cleanVal(t, a);
  if (!n || !i) return i || n;
  if (SpravkaCore.norm(n) !== SpravkaCore.norm(i)) return i;
  const o = n.split(/\s+/).filter(Boolean),
    l = i.split(/\s+/).filter(Boolean);
  if (o.length === l.length)
    return l
      .map((e, t) => (spellScore(o[t]) > spellScore(e) ? o[t] : e))
      .join(" ");
  return spellScore(n) > spellScore(i) ? n : i;
}
function diffRow(e, t) {
  const a = e.S.labels,
    n = e.S.latin,
    i = [],
    o = (e) => (void 0 !== xl.map[e] ? String(t[xl.map[e]] || "").trim() : "");
  for (const t of XL_TEXT_KEYS) {
    let l = o(t);
    if ("grad_year" === t) {
      if ("function" == typeof leadEdu && (l || o("grad_years") || o("otm")))
        l = leadEdu(
          e.fields.grad_year || "",
          e.work || [],
          o("grad_years"),
          o("otm"),
          l,
          e.fields.specialty || o("specialty"),
        );
      else if (!l) {
        const e = o("grad_years").match(/\d{4}/g) || [],
          t = o("otm");
        (e.length || t) &&
          (l = [e.length ? e[e.length - 1] + (n ? " yil" : " йил") : "", t]
            .filter(Boolean)
            .join(", "));
      }
    }
    if (
      l &&
      !/^[-–—.\s]+$/.test(l) &&
      !/^(?:нет|не имеет|mavjud emas|мавжуд эмас)$/i.test(l)
    ) {
      if ("education" === t) {
        const e = l.toLowerCase();
        l = /олий|oliy|высш|бакалавр|bakalavr|магистр|magistr/.test(e)
          ? n
            ? "oliy"
            : "олий"
          : /ўрта|урта|o.?rta|средн/.test(e)
            ? n
              ? "o‘rta maxsus"
              : "ўрта махсус"
            : l;
      }
      if ("birth_date" === t) {
        const a = parseDate(l);
        if (!a || !a.d) continue;
        l = `${p2(a.d)}.${p2(a.m)}.${a.y}`;
        const n = parseDate(e.fields[t]);
        if (n && n.d === a.d && n.m === a.m && n.y === a.y) continue;
      } else if ("grad_year" === t && l.includes("\n"))
        l = l
          .split("\n")
          .map((e) => cleanVal(e, n).replace(/\s+/g, " "))
          .filter(Boolean)
          .join("\n");
      else
        ((l = cleanVal(l, n).replace(/\s+/g, " ")),
          ((["nationality", "party", "education", "title"].includes(t) &&
            !/\s/.test(l)) ||
            /^(?:йўқ|yo‘q)$/i.test(l)) &&
            (l = l[0].toLowerCase() + l.slice(1)));
      if (same(l, e.fields[t])) {
        const s = pickBestSpelling(e.fields[t] || "", l, n);
        s &&
          s !== (e.fields[t] || "") &&
          spellScore(s) > spellScore(e.fields[t] || "") &&
          i.push({
            kind: "field",
            key: t,
            label: a[t],
            old: e.fields[t] || "",
            val: s,
            on: !0,
            auto: !0,
            spell: !0,
          });
      } else {
        const o =
          FULL_KEYS.has(t) && e.fields[t] && !isEmptyV(e.fields[t])
            ? fuller(e.fields[t], l)
            : 0;
        if (1 === o) continue;
        const r =
          e.fields[t] && !isEmptyV(e.fields[t])
            ? pickBestWords(e.fields[t], l, n)
            : l;
        i.push({
          kind: "field",
          key: t,
          label: a[t],
          old: e.fields[t] || "",
          val: r,
          on: !0,
          auto: -1 === o || !e.fields[t] || isEmptyV(e.fields[t]),
        });
      }
    }
  }
  let l = cleanVal(o("position"), n);
  const s =
      /^(?:ректорат|rektorat|раҳбарият|rahbariyat|бошқарув|boshqaruv)$/i.test(
        o("dept").trim(),
      )
        ? ""
        : o("dept"),
    r = [o("org"), s]
      .filter(Boolean)
      .map((e) => cleanVal(e, n).replace(/\s+/g, " "))
      .join(" "),
    d = SpravkaCore.norm(e.position || ""),
    c = SpravkaCore.norm(l || ""),
    p =
      c &&
      d &&
      (d.includes(c) || d.includes(c.replace(/и$/, "")) || c.includes(d));
  if (l && r) {
    const e = r.split(/\s+/).pop(),
      t = l.split(/\s+/)[0];
    t &&
      e &&
      t.length > 3 &&
      SpravkaCore.norm(e).startsWith(SpravkaCore.norm(t).slice(0, 5)) &&
      (l = l.split(/\s+/).slice(1).join(" "));
  }
  if (
    (l &&
      r &&
      (l = l.replace(/([A-Za-zА-Яа-яЎўҚқҒғҲҳЁё‘’']+)$/, (e) => {
        if (e.length < 3) return e;
        const t = SpravkaCore.norm(e);
        return /^(?:доцент|профессор|мудир|укитувчи|ассистент|декан|проректор|ректор|уринбосар|тадкикотчи|лаборант|методист|стажер|катта)$/.test(
          t,
        )
          ? /(?:чи|chi)$/i.test(e)
            ? e + (n ? "si" : "си")
            : e +
              (/[аеёиоуўэюяaeiou]$/i.test(e)
                ? n
                  ? "si"
                  : "си"
                : n
                  ? "i"
                  : "и")
          : e;
      })),
    l && r)
  ) {
    const t = void 0 === xl.map.org ? orgOf(e.position || "") : "",
      a =
        t && !SpravkaCore.norm(r).includes(SpravkaCore.norm(t)) ? t + " " : "";
    l = SpravkaCore.fixOrgText(a + r + " " + l, n, new Set());
  } else if (
    l &&
    e.position &&
    (!p ||
      SpravkaCore.norm(l).replace(/(?:си|и)$/, "") !==
        SpravkaCore.norm(
          (e.position.match(
            /(?:кафедраси|бўлими|бошқармаси|факультети|маркази|институти|университети|kafedrasi|bo‘limi|boshqarmasi|fakulteti|markazi|instituti|universiteti)\s+(.+)$/i,
          ) || [])[1] || l,
        ).replace(/(?:си|и)$/, ""))
  ) {
    const t = e.position.split(/\s+/),
      a =
        /^(?:институти|университети|академияси|вазирлиги|ҳокимлиги|бошқармаси|маркази|мактаби|коллежи|техникуми|лицейи|банки|филиали|жамияти|корхонаси|instituti|universiteti|akademiyasi|vazirligi|hokimligi|boshqarmasi|markazi|maktabi|kolleji|texnikumi|litseyi|banki|filiali|jamiyati|korxonasi)$/i;
    let i = -1;
    (t.forEach((e, t) => {
      a.test(e.replace(/[,.]$/, "")) && (i = t);
    }),
      i >= 0 &&
        !SpravkaCore.norm(l).includes(
          SpravkaCore.norm(t.slice(0, i + 1).join(" ")),
        ) &&
        (l = SpravkaCore.fixOrgText(
          t.slice(0, i + 1).join(" ") + " " + l,
          n,
          new Set(),
        )));
  }
  let m = o("since_date");
  if (!m) {
    const e = t.find((e) => /№/.test(String(e || "")) && parseDate(e));
    e && (m = String(e));
  }
  const u = parseDate(m),
    h =
      u && u.y
        ? u.d
          ? n
            ? `${u.y}-yil ${u.d}-${MONTHS_L[u.m - 1]}dan:`
            : `${u.y}-йил ${u.d}-${MONTHS_C[u.m - 1]}дан:`
          : n
            ? `${u.y}-yildan:`
            : `${u.y}-йилдан:`
        : "",
    f =
      /^(?:институти|университети|академияси|филиали|кафедраси|бўлими|бўлинмаси|бошқармаси|факультети|маркази|сектори|лабораторияси|деканати|ректорати|instituti|universiteti|akademiyasi|filiali|kafedrasi|bo‘limi|bo'limi|bo‘linmasi|boshqarmasi|fakulteti|markazi|sektori|laboratoriyasi|dekanati|rektorati)$/i,
    g = (e) => {
      const t = String(e || "")
        .replace(/[,.]+$/, "")
        .split(/\s+/)
        .filter(Boolean);
      let a = -1;
      return (
        t.forEach((e, t) => {
          f.test(e.replace(/[,.]$/, "")) && (a = t);
        }),
        { unit: t.slice(0, a + 1).join(" "), title: t.slice(a + 1).join(" ") }
      );
    },
    y = (e) =>
      SpravkaCore.norm(e)
        .replace(/(?:си|и)$/, "")
        .replace(/(?:си|и)$/, ""),
    k = g(e.position),
    x = g(l),
    b = x.title && k.title && y(x.title) !== y(k.title),
    v = SpravkaCore.norm(k.unit || ""),
    w = SpravkaCore.norm(x.unit || ""),
    $ = r && w && v && !v.endsWith(w) && !w.endsWith(v),
    S = l && (b || $ || (!p && !same(l, e.position)));
  if (!S && h && !sameSince(u, e.since)) {
    const t = (String(e.since || "").match(/\d{4}/) || [])[0];
    i.push({
      kind: "since",
      label: n ? "Lavozimga tayinlangan sana" : "Лавозимга тайинланган сана",
      old: e.since || "",
      val: h,
      year: u.y,
      oldY: t,
      on: !0,
    });
  }
  if (S) {
    const t = h || e.since,
      a = e.position ? pickBestWords(e.position, l, n) : l,
      o = !!(
        u &&
        u.y &&
        e.since &&
        sameSince(u, e.since) &&
        posMinor(e.position, a)
      );
    i.push({
      kind: "position",
      label: n ? "Lavozim (yangi tayinlov)" : "Лавозим (янги тайинлов)",
      old: [e.since, e.position].filter(Boolean).join(" "),
      val: [t, a].filter(Boolean).join(" "),
      since: t,
      pos: a,
      year: u && u.y ? u.y : null,
      noDate: !(u && u.y),
      sameDate: !!(u && u.y && e.since && sameSince(u, e.since)),
      on: !0,
      minor: o,
      spell: o,
    });
  } else if (l && e.position) {
    const t = pickBestSpelling(e.position, l, n);
    t &&
      t !== e.position &&
      spellScore(t) > spellScore(e.position) &&
      i.push({
        kind: "position",
        label: n ? "Lavozim (imlo)" : "Лавозим (имло)",
        old: e.position,
        val: t,
        since: e.since,
        pos: t,
        year: u && u.y ? u.y : null,
        sameDate: !0,
        on: !0,
        auto: !0,
        spell: !0,
      });
  }
  return i;
}
function autoApplyJob(e) {
  (e.xlChanges || []).filter((e) => "position" === e.kind && e.noDate).length &&
    (e.warnings = e.warnings || []).push(
      "Excel'da bu xodimning yangi lavozimi bor, lekin buyruq sanasi topilmadi — mehnat faoliyatiga qo‘shilmadi. Sanani Excel'da tekshiring yoki «Excel bo‘yicha o‘zgarishlar»dan qo‘lda qo‘llang.",
    );
  const t = (e.xlChanges || []).filter(
      (e) => ("position" === e.kind && !e.noDate) || "since" === e.kind,
    ),
    a = e.P.work.slice();
  t.length && applyChanges(e, t, !0);
  const n =
      /^\d{4}\s*-?\s*(?:й\.|y\.|йил\.?|yil\.?)\s*-?\s*(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)/i,
    i = ((e.P.since || "").match(/\d{4}/) || [])[0];
  e.P.position &&
    i &&
    !e.P.work.some((e) => n.test(e)) &&
    setCurrentJob(e.P, e.P.position, i, { force: !0 });
  const o = e.P.work.filter((e) => !a.includes(e));
  return t.length || o.length
    ? ((e.warnings = e.warnings || []).push(
        `Excel bo‘yicha hozirgi lavozim qo‘yildi${o.length ? ": «" + o.join("», «") + "»" : ""} — tekshiring.`,
      ),
      (e.reasons = reviewReasons(e.P)),
      (e.state = e.reasons.length ? "warn" : "ok"),
      t.length)
    : 0;
}
function applyChanges(e, t, a, n) {
  const i = e.P;
  i.S.latin;
  for (const a of t)
    if ("field" === a.kind) i.fields[a.key] = a.val;
    else if ("name" === a.kind) i.name = a.val;
    else if ("since" === a.kind) {
      i.since = a.val;
      const e =
        /^(\d{4})(\s*-?\s*(?:й\.|y\.|йил\.?|yil\.?)\s*-?\s*(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)\s*-\s*)(.*)$/i;
      for (let t = i.work.length - 1; t >= 0; t--) {
        const n = i.work[t].match(e);
        if (n) {
          const o =
            t > 0
              ? +(
                  (i.work[t - 1].match(/^(\d{4})(?:\s*-\s*(\d{4}))?/) || [])[2] ||
                  0
                )
              : 0;
          n[1] === String(a.year) ||
            (+a.year < o && +n[1] >= o) ||
            (i.position && !SpravkaCore.sameJob(n[3], i.position)) ||
            (i.work[t] = String(a.year) + n[2] + n[3]);
          break;
        }
      }
      i.position &&
        !i.work.some((t) => e.test(t)) &&
        setCurrentJob(i, i.position, a.year);
    } else if ("position" === a.kind) {
      i.position;
      if (((i.position = a.pos), a.since && (i.since = a.since), !a.year)) {
        (e.warnings = e.warnings || []).push(
          "Buyruq sanasi yo‘q — lavozim tepada yangilandi, mehnat faoliyatiga qator qo‘shilmadi. Yilni qo‘lda kiriting.",
        );
        continue;
      }
      if (a.sameDate) {
        const e =
          /^(\d{4}\s*-?\s*(?:й\.|y\.|йил\.?|yil\.?)\s*-?\s*(?:ҳ\.в\.|h\.v\.|х\.в\.|x\.v\.)\s*-\s*)(.*)$/i;
        let t = !1;
        for (let n = i.work.length - 1; n >= 0; n--) {
          const o = i.work[n].match(e);
          if (
            (o &&
              String(o[1]).startsWith(String(a.year)) &&
              ((i.work[n] = o[1] + a.pos), (t = !0)),
            o)
          )
            break;
        }
        if (t) continue;
      }
      "older-added" === setCurrentJob(i, a.pos, a.year, { force: !0 }) &&
        (e.warnings = e.warnings || []).push(
          `Excel'dagi lavozim (${a.year}) hujjatdagi hozirgi ishdan oldinroq — ikkala «h.v.» qatori ham qoldirildi. Qaysi biri hozirgi ekanini tekshiring.`,
        );
    }
  for (const a of t)
    hist(
      e,
      n || (e.fromExcel && !e.hist ? "Excel'dan yaratildi" : "Excel"),
      a.label,
      a.old,
      a.val,
    );
  return (
    (e.xlApplied = (e.xlApplied || 0) + t.length),
    (e.xlChanges = e.xlChanges.filter((e) => !t.includes(e))),
    renderCard(e),
    updateStats(),
    "function" == typeof updApply && updApply(),
    t.length
  );
}
function nameLoose(e) {
  return SpravkaCore.latToCyr(String(e || ""))
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/ў/g, "у")
    .replace(/қ/g, "к")
    .replace(/ғ/g, "г")
    .replace(/ҳ/g, "х")
    .replace(/[йъь'‘’`ʻ]/g, "")
    .replace(/э/g, "е")
    .replace(/[^а-яa-z\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((e) => !/^(?:угли|кизи|оглы|кизи|qizi|ugli|х{2,}|x{2,})$/.test(e))
    .slice(0, 3)
    .map((e, t) =>
      (2 === t
        ? e.replace(/(?:на|[ао])$/, "")
        : e.replace(/(ов|ев)а$/, "$1")
      )
        .replace(/боев/g, "баев")
        .replace(/^[оу]гул/g, "угил")
        .replace(/(.)\1+/g, "$1"),
    )
    .join(" ");
}
function fzSame(e, t) {
  if (nameLoose(e.name) === nameLoose(rowName(t))) return !0;
  if (void 0 === xl.map.birth_date) return !1;
  const a = parseDate(e.fields.birth_date),
    n = parseDate(String(t[xl.map.birth_date] || ""));
  return !!(a && n && a.d && n.d && a.d === n.d && a.m === n.m && a.y === n.y);
}
function runCompare() {
  if (!xl.rows.length) return;
  if (((xl.ran = !0), void 0 === xl.map.name && void 0 === xl.map.surname))
    return (
      ($("xlMsg").className = "msg err"),
      void ($("xlMsg").textContent =
        "F.I.Sh. ustunini tanlang — xodimlar shu bo'yicha topiladi.")
    );
  const e = xl.rows.map((e) => {
      const t = rowName(e);
      return {
        parts: SpravkaCore.nameParts(t),
        norm: SpravkaCore.norm(t),
      };
    }),
    t = [],
    a = items.filter((e) => e.P && !e.fromExcel),
    n = new Map(),
    dupN = new Map(),
    byCh = new Map();
  e.forEach((e, t) => {
    e.norm &&
      (n.has(e.norm) ? dupN.set(e.norm, (dupN.get(e.norm) || 1) + 1) : n.set(e.norm, t));
    const a = e.parts.sur && e.parts.sur[0];
    if (a) {
      let n = byCh.get(a);
      (n || ((n = []), byCh.set(a, n)), n.push(t));
    }
    const i = e.parts.giv && e.parts.giv[0];
    if (i && i !== a) {
      let e = byCh.get(i);
      (e || ((e = []), byCh.set(i, e)), e.push(t));
    }
  });
  for (const i of a) {
    if (void 0 === i.xlManual && i.xlManualName) {
      const e = n.get(SpravkaCore.norm(i.xlManualName));
      void 0 !== e && (i.xlManual = e);
    }
    if (void 0 !== i.xlManual) {
      t.push([2, i, i.xlManual]);
      continue;
    }
    const a = new Set((i.xlReject || []).map((e) => SpravkaCore.norm(e))),
      o =
        i.P.name ||
        i.P.relHeadingName ||
        ((i.file && i.file.name) || "").replace(/\.[^.]+$/, ""),
      r = SpravkaCore.norm(o),
      d = r ? n.get(r) : void 0;
    if (void 0 !== d && !dupN.has(r) && !(a.size && a.has(r))) {
      t.push([1, i, d]);
      continue;
    }
    const l = SpravkaCore.nameParts(o);
    if (!l.sur) continue;
    const p = new Set([
      ...(byCh.get(l.sur[0]) || []),
      ...(l.giv && l.giv[0] ? byCh.get(l.giv[0]) || [] : []),
    ]);
    for (const n of p) {
      const s = e[n];
      if (!s.parts.sur) continue;
      const o = SpravkaCore.nameScore(l, s.parts);
      !(o >= 0.86) || (a.size && a.has(s.norm)) || t.push([o, i, n]);
    }
  }
  t.sort((e, t) => t[0] - e[0]);
  const i = new Set(
      items
        .filter((e) => e.fromExcel && void 0 !== e.xlRow)
        .map((e) => e.xlRow),
    ),
    o = new Map();
  for (const [e, a, n] of t)
    o.has(a) || i.has(n) || (o.set(a, [n, e]), i.add(n));
  const l = new Map();
  for (const [e, [t]] of o) l.set(t, e);
  let s = 0;
  for (const [e, a, n] of t) {
    if (o.has(a)) continue;
    const t = l.get(n);
    t &&
      SpravkaCore.nameScore(t.P.name || "", a.P.name || "") >= 0.95 &&
      (o.set(a, [n, e]), s++);
  }
  let r = 0,
    d = 0,
    c = 0,
    p = 0,
    m = 0,
    u = 0,
    h = 0;
  const f = new Map();
  for (const e of a) {
    const t = o.get(e);
    if (!t) {
      ((e.xlChanges = null),
        (e.xlStatus = "notfound"),
        (e.xlRow = void 0),
        p++,
        (e.reasons = reviewReasons(e.P, e)),
        e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
        store.dirty.add(e),
        renderCard(e));
      continue;
    }
    const [a, n] = t;
    let i = n,
      l = i < 0.97 && 2 !== i;
    (l &&
      $("xlPrimary").checked &&
      fzSame(e.P, xl.rows[a]) &&
      ((l = !1),
      (i = 2),
      h++,
      hist(
        e,
        "Excel",
        "Excel'dagi xodim",
        "",
        `avtomatik tasdiqlandi (imlo farqi): ${rowName(xl.rows[a])}`,
      )),
      r++,
      l && m++,
      (e.xlRow = a),
      (e.xlFuzzy = l),
      (e.xlChanges = diffRow(e.P, xl.rows[a])),
      proposeName(e, a, i),
      setDefaults(e),
      (e.xlAuto = !1),
      l || (u += xlAutoApply(e, f)),
      (e.xlStatus = e.xlChanges.length ? "changed" : "same"),
      e.xlChanges.length ? d++ : c++,
      (e.reasons = reviewReasons(e.P, e)),
      e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
      store.dirty.add(e),
      renderCard(e));
  }
  ((xl.used = i),
    f.size && pushUndo(`Excel'dan avtomatik (${u} ta)`, f),
    calcUnmatched(),
    (xl.unmatched = xl.unmatched.filter((e) => !i.has(e))),
    ($("xlMsg").className = "msg"),
    ($("xlMsg").textContent = [
      d
        ? $("xlPrimary").checked
          ? "Quyidagi jadvalda faqat lavozim va bo'limdagi nomutanosiblik qoldi — tekshiring."
          : "Farqlar quyidagi jadvalda — tekshirib, tasdiqlaganlaringizni qo'llang. Ma'lumotnomalar o'zi o'zgarmaydi."
        : "Topilganlarning hammasi Excel bilan bir xil.",
      u
        ? `${u} ta maydon Excel bo'yicha avtomatik tuzatildi (tarixda «Avtomatik» deb yozilgan, «Bekor qilish» bilan qaytariladi).`
        : "",
      h
        ? `${h} tasida ism faqat imloda farq qilardi — Excel'dagidek tuzatildi.`
        : "",
      m
        ? `${m} tasida ism taxminan mos${$("xlPrimary").checked ? ", tug'ilgan sana ham farq qiladi" : ""} — tekshiring.`
        : "",
      s ? `${s} tasi bir xodimning takror fayli.` : "",
      p ? "Excel'da yo'qlarini kartochkada qo‘lda tanlash mumkin." : "",
    ]
      .filter(Boolean)
      .join(" ")),
    xlSum([
      [
        r,
        "Topildi",
        `farq yoki bo'sh joy: ${d} · bir xil: ${c}`,
        d ? "warn" : "ok",
      ],
      [p, "Excel'da yo'q", "ma'lumotnoma bor, bazada yo'q", p ? "err" : "ok"],
      [
        xl.unmatched.length,
        "Yangi xodim",
        "bazada bor, ma'lumotnomasi yo'q",
        xl.unmatched.length ? "new" : "ok",
        () => {
          const e = $("xlNew");
          e &&
            !e.hidden &&
            e.scrollIntoView({ behavior: "smooth", block: "start" });
        },
      ],
    ]),
    ($("xlMissXlsx") &&
      ($("xlMissXlsx").hidden = !(p || m || xl.unmatched.length)),
    updApply(),
    (confLim = 100),
    renderConf(),
    store.saveXl(),
    drawNew(),
    updateStats()));
}
$("xlMissXlsx") &&
  $("xlMissXlsx").addEventListener("click", async () => {
    const e = $("xlMissXlsx");
    e.disabled = !0;
    try {
      const t = [
        [
          "№",
          "Holat",
          "Obyektivka F.I.Sh.",
          "Excel F.I.Sh.",
          "Lavozim / Bo'lim",
          "Fayl nomi",
        ],
      ];
      let a = 0;
      for (const e of items)
        e.P &&
          !e.excluded &&
          "notfound" === e.xlStatus &&
          t.push([
            ++a,
            "Excel'da topilmadi",
            e.P.name || "",
            "",
            e.P.position || "",
            e.name || "",
          ]);
      for (const e of items)
        e.P &&
          !e.excluded &&
          e.xlFuzzy &&
          void 0 !== e.xlRow &&
          t.push([
            ++a,
            "Ism taxminan mos (fuzzy)",
            e.P.name || "",
            rowName(xl.rows[e.xlRow]),
            e.P.position || "",
            e.name || "",
          ]);
      for (const e of xl.unmatched || []) {
        const n = xl.rows[e] || [];
        t.push([
          ++a,
          "Ma'lumotnomasi yo'q (faqat Excel'da)",
          "",
          rowName(n),
          void 0 !== xl.map.position ? String(n[xl.map.position] || "") : "",
          "",
        ]);
      }
      await save(
        e,
        $("xlMsg"),
        "Excel_topilmagan_va_taxminiylar.xlsx",
        await xlsxBuild([
          {
            name: "Hisobot",
            rows: t,
            head: 1,
            freeze: !0,
            filter: !0,
            widths: [6, 30, 30, 30, 34, 30],
          },
        ]),
      );
    } finally {
      e.disabled = !1;
    }
  });
function xlSum(e) {
  let t = $("xlSum");
  (t || ((t = el("div", "xlsum")), (t.id = "xlSum"), $("xlMsg").before(t)),
    (t.textContent = ""),
    (t.hidden = !e));
  for (const [a, n, i, o, l] of e || []) {
    const e = el(l ? "button" : "div", "xs " + o);
    (l && ((e.type = "button"), (e.onclick = l)),
      e.append(el("b", "", String(a)), el("span", "", n), el("small", "", i)),
      t.append(e));
  }
}
function calcUnmatched() {
  if (xl.used) {
    const e = new Set(xl.used);
    for (const t of items)
      void 0 !== t.xlRow && null !== t.xlRow && e.add(t.xlRow);
    return void (xl.unmatched = xl.rows
      .map((e, t) => t)
      .filter((t) => rowName(xl.rows[t]) && !e.has(t)));
  }
  const e = new Set();
  for (const t of items) t.P && t.P.name && e.add(SpravkaCore.norm(t.P.name));
  xl.unmatched = xl.rows
    .map((e, t) => t)
    .filter((t) => {
      const a = rowName(xl.rows[t]);
      return a && !e.has(SpravkaCore.norm(a));
    });
}
function searchRows(e) {
  const t = String(e)
    .split(/[\s,.]+/)
    .map((e) => SpravkaCore.norm(e))
    .filter(Boolean);
  if (!t.length) return [];
  const a = [];
  for (const e of xl.unmatched) {
    const n = rowName(xl.rows[e])
      .split(/[\s,.]+/)
      .map((e) => SpravkaCore.norm(e))
      .filter(Boolean);
    let i = 0,
      o = !0;
    for (const e of t) {
      let t = 0;
      for (const a of n) {
        const n = a.startsWith(e)
          ? 1
          : a.includes(e)
            ? 0.9
            : e.length >= 4
              ? SpravkaCore.ratio(e, a.slice(0, Math.max(e.length, 4)))
              : 0;
        n > t && (t = n);
      }
      if (t < 0.75) {
        o = !1;
        break;
      }
      i += t;
    }
    o && a.push([i + (n[0] && n[0].startsWith(t[0]) ? 0.5 : 0), e]);
  }
  return a.sort((e, t) => t[0] - e[0]).map((e) => e[1]);
}
function drawNew() {
  const e = $("xlNew");
  if (((e.textContent = ""), !xl.rows.length || !xl.unmatched))
    return void (e.hidden = !0);
  e.hidden = !1;
  const t = el("div", "xlsearch");
  (t.append(el("h3", "", "Excel'dan ma'lumotnoma yaratish")),
    t.append(
      el(
        "p",
        "msg",
        `Ma'lumotnomasi yo'q xodimlar: ${xl.unmatched.length} ta. Familiya yoki ismni yozing (kirill yoki lotin).`,
      ),
    ));
  const a = el("input");
  ((a.type = "search"),
    (a.placeholder = "Familiya yoki ism bo'yicha qidirish…"),
    (a.value = xl.q || ""),
    (a.autocomplete = "off"));
  const n = el("div", "newlist"),
    i = (e, t) =>
      void 0 !== xl.map[t]
        ? String(e[xl.map[t]] || "")
            .trim()
            .replace(/\s+/g, " ")
        : "",
    o = () => {
      ((xl.q = a.value), (n.textContent = ""));
      const e = a.value.trim()
        ? searchRows(a.value)
        : (xl.unmatched || []).filter((e) => !isHeadRow(xl.rows[e]));
      if (!e.length)
        return void n.append(el("p", "msg", "Hech kim topilmadi."));
      const t = "lat" === scriptNow();
      for (const a of e.slice(0, 20)) {
        const e = xl.rows[a],
          o = el("div"),
          l = el("span");
        l.append(el("b", "", rowName(e)));
        const s = [
          i(e, "position"),
          i(e, "birth_date") && parseDate(i(e, "birth_date"))
            ? (() => {
                const t = parseDate(i(e, "birth_date"));
                return t.d ? `${p2(t.d)}.${p2(t.m)}.${t.y}` : t.y;
              })()
            : "",
        ]
          .filter(Boolean)
          .join(" · ");
        s &&
          l.append(
            el(
              "small",
              "",
              " — " + (s.length > 110 ? s.slice(0, 110) + "…" : s),
            ),
          );
        const r = el("button", "btn2", "Ma'lumotnoma yaratish");
        ((r.type = "button"),
          r.addEventListener("click", () => {
            (createFromExcel(a, t),
              (o.textContent = ""),
              o.append(
                el(
                  "span",
                  "msg",
                  `✓ ${rowName(e)} — yaratildi, ro'yxatning yuqorisida.`,
                ),
              ),
              ($("xlNew").querySelector(".xlsearch > p.msg").textContent =
                `Ma'lumotnomasi yo'q xodimlar: ${xl.unmatched.length} ta. Familiya yoki ismni yozing (kirill yoki lotin).`));
          }),
          o.append(l, r),
          n.append(o));
      }
      e.length > 20 &&
        n.append(
          el(
            "p",
            "msg",
            `Yana ${e.length - 20} ta mos keldi — aniqroq yozing.`,
          ),
        );
    };
  let l;
  (a.addEventListener("input", () => {
    (clearTimeout(l), (l = setTimeout(o, 120)));
  }),
    t.append(a, n),
    e.append(t),
    o());
}
function excelFill(e, t) {
  const a = xl.rows[t],
    n = e.S.latin,
    i = JSON.stringify([e.since, e.position, e.fields]);
  e.name = toScript(rowName(a), n);
  const o = diffRow(e, a);
  let l = 0;
  for (const t of o)
    "field" === t.kind
      ? String(e.fields[t.key] || "").trim() || ((e.fields[t.key] = t.val), l++)
      : "since" === t.kind
        ? ((e.since = t.val), l++)
        : "position" === t.kind &&
          ((e.position = t.pos),
          t.since && (e.since = t.since),
          l++,
          t.year && setCurrentJob(e, t.pos, t.year, { force: !0 }));
  if (
    ((e.work = e.work.filter((e) => String(e).trim())),
    !String(e.fields.education || "").trim())
  ) {
    const t = SpravkaCore.eduFromGrad(e.fields.grad_year, n);
    t && ((e.fields.education = t), l++);
  }
  return i !== JSON.stringify([e.since, e.position, e.fields]) || l ? l : 0;
}
function attachExcelLookup(e, t) {
  const a = e.querySelector('[data-k="name"]');
  if (!a) return;
  const n = el("div", "xlfind");
  a.closest(".grid2").after(n);
  const i = (e, t) =>
      void 0 !== xl.map[t]
        ? String(e[xl.map[t]] || "")
            .trim()
            .replace(/\s+/g, " ")
        : "",
    o = () => {
      n.textContent = "";
      const e = a.value.trim();
      if (!xl.rows.length) {
        if (!t.it.fromBlank) return;
        const e = el(
            "p",
            "hint",
            "F.I.Sh. ni yozing — kadrlar bazasi (Excel) yuklansa, xodimning bor ma'lumotlari o'zi to'ldiriladi. ",
          ),
          i = el("button", "btn2", "Excel faylni tanlash");
        return (
          (i.type = "button"),
          i.addEventListener("click", () => {
            ((xl.afterLoad = () => {
              (o(), a.focus());
            }),
              $("xlFile").click());
          }),
          void n.append(e, i)
        );
      }
      if (SpravkaCore.norm(e).length < 3)
        return void (
          t.it.fromBlank &&
          n.append(
            el(
              "p",
              "hint",
              "Familiya va ismni yozing (kirill yoki lotin) — Excel'dan xodim qidiriladi.",
            ),
          )
        );
      if (t.xlFilled === e)
        return void n.append(
          el(
            "p",
            "hint okhint",
            "✓ Excel'dagi ma'lumotlar qo'yildi. Sariq maydonlarni to'ldiring.",
          ),
        );
      const l = xl.unmatched;
      xl.unmatched = xl.rows.map((e, t) => t);
      let s = searchRows(e);
      xl.unmatched = l;
      const r = SpravkaCore.nameParts(e);
      if (
        ((s = s
          .map((e) => [SpravkaCore.nameScore(r, rowName(xl.rows[e])), e])
          .sort((e, t) => t[0] - e[0])
          .map((e) => e[1])
          .slice(0, 6)),
        s.length)
      ) {
        n.append(
          el(
            "p",
            "hint",
            1 === s.length
              ? "Excel'da topildi:"
              : `Excel'da ${s.length} ta mos xodim — keraklisini tanlang:`,
          ),
        );
        for (const e of s) {
          const a = xl.rows[e],
            o = el("div", "xlhit"),
            l = el("span");
          l.append(el("b", "", rowName(a)));
          const s = [
            i(a, "position"),
            i(a, "dept"),
            (() => {
              const e = parseDate(i(a, "birth_date"));
              return e && e.d ? `${p2(e.d)}.${p2(e.m)}.${e.y}` : "";
            })(),
          ]
            .filter(Boolean)
            .join(" · ");
          s &&
            l.append(
              el(
                "small",
                "",
                " — " + (s.length > 120 ? s.slice(0, 120) + "…" : s),
              ),
            );
          const r = el("button", "btn", "Excel'dan to'ldirish");
          ((r.type = "button"),
            r.addEventListener("click", () => {
              const n = excelFill(t.P, e);
              ((t.it.xlRow = e),
                (t.xlFilled = toScript(rowName(a), t.P.S.latin)),
                xl.used && xl.used.add(e),
                renderDetail());
              const i = [...$("pBody").querySelectorAll(".need")];
              (toast(
                `Excel'dan ${n} ta ma'lumot qo'yildi${i.length ? ` — ${i.length} ta bo'sh joyni to'ldiring` : ""}`,
              ),
                i[0] &&
                  (i[0].scrollIntoView({ block: "center" }), i[0].focus()));
            }),
            o.append(l, r),
            n.append(o));
        }
      } else
        n.append(
          el(
            "p",
            "hint",
            "Excel'da bunday xodim topilmadi — ma'lumotlarni qo'lda kiriting.",
          ),
        );
    };
  let l;
  (a.addEventListener("input", () => {
    (clearTimeout(l), (l = setTimeout(o, 200)));
  }),
    o());
}
function markEmpty(e) {
  const t = (e) => {
    ((e.dataset.mk = "1"),
      e.classList.toggle(
        "need",
        !e.dataset.opt && !String(e.value || "").trim(),
      ));
  };
  e.querySelectorAll(
    ".f input[type=text], .f textarea, .wrow textarea, .f select[data-k]",
  ).forEach((e) => {
    (t(e),
      e.addEventListener("SELECT" === e.tagName ? "change" : "input", () =>
        t(e),
      ));
  });
  const a = e.querySelectorAll(".need").length;
  if (a) {
    const t = el(
        "p",
        "hint needhint",
        `Sariq bilan belgilangan ${a} ta maydon bo'sh — ularni xodimning o'zi to'ldiradi.`,
      ),
      n = e.querySelector(".edbar");
    n && n.after(t);
  }
}
