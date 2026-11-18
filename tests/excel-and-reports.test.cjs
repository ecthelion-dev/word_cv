const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const ROOT = path.resolve(__dirname, "..");

function createAppContext() {
  const mockEl = () => ({
    value: "",
    checked: false,
    hidden: false,
    disabled: false,
    textContent: "",
    innerHTML: "",
    children: [],
    childNodes: [],
    options: [],
    selectedOptions: [{ textContent: "" }],
    parentElement: {},
    parentNode: {},
    addEventListener: () => {},
    append: () => {},
    appendChild: () => {},
    remove: () => {},
    setAttribute: () => {},
    getAttribute: () => null,
    closest: () => mockEl(),
    querySelector: () => mockEl(),
    querySelectorAll: () => [],
    style: {},
    dataset: {},
    classList: {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    },
  });

  const ctx = {
    window: null,
    self: null,
    global: null,
    console,
    setTimeout: () => {},
    clearTimeout: () => {},
    setInterval: () => {},
    clearInterval: () => {},
    addEventListener: () => {},
    document: {
      body: mockEl(),
      documentElement: mockEl(),
      getElementById: () => mockEl(),
      querySelectorAll: () => [],
      querySelector: () => mockEl(),
      createElement: () => mockEl(),
      createDocumentFragment: () => mockEl(),
      addEventListener: () => {},
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    indexedDB: null,
    location: { href: "http://localhost/", hostname: "localhost", search: "" },
    navigator: {},
  };
  ctx.window = ctx;
  ctx.self = ctx;
  ctx.global = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "js/core.js"), "utf8"), ctx);
  ctx.SpravkaCore = ctx.self.SpravkaCore;
  for (const file of [
    "js/coi-engine.js",
    "js/science-engine.js",
    "js/pdf-engine.js",
    "js/file-error.js",
    "js/scanned-pdf-ocr.js",
    "js/app.js",
  ]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), "utf8"), ctx);
  }
  return ctx;
}

const app = createAppContext();

test("fmtPhone normalizes 9-, 10-, and 12-digit Uzbek phone numbers", () => {
  assert.equal(app.fmtPhone("93-638-23-26"), "+998 (93) 638-23-26");
  assert.equal(app.fmtPhone("998915897996"), "+998 (91) 589-79-96");
  assert.equal(app.fmtPhone("+998 (90) 978-09-01"), "+998 (90) 978-09-01");
  assert.equal(app.fmtPhone("0991234567"), "+998 (99) 123-45-67");
});

test("leadEdu merges bachelor and master degrees and omits aspirantura/retraining", () => {
  const merged = app.leadEdu(
    "Термиз давлат университети (бакалвр, кундузги)\nТермиз давлат педагогика институти (магистратура)",
    [],
    "2023",
    "Термиз давлат педагогика институти",
    "",
    "Бошланғич таълим",
  );
  assert.equal(
    merged,
    "Термиз давлат университети (бакалавр)\n2023 й. Термиз давлат педагогика институти (магистратура)",
  );

  const filteredAsp = app.leadEdu(
    "2008 й. Низомий номидаги Тошкент давлат педагогика университети (бакалавр)\n2011 й. Низомий номидаги Тошкент давлат педагогика университети (магистратура)\n2013 й. Низомий номидаги Тошкент давлат педагогика университети (аспирантура)",
    [],
    "",
    "",
    "",
    "",
  );
  assert.equal(
    filteredAsp,
    "2008 й. Низомий номидаги Тошкент давлат педагогика университети (бакалавр)\n2011 й. Низомий номидаги Тошкент давлат педагогика университети (магистратура)",
  );
});

test("cleanSpec fixes typos, removes quotes, and deduplicates overlapping prefix", () => {
  assert.equal(
    app.cleanSpec('физика, "Композисион кукунли материаллар ва қопламалар"'),
    "физика, композицион кукунли материаллар ва қопламалар",
  );
  assert.equal(
    app.cleanSpec("филология: Рус тили, Филология"),
    "филология: рус тили",
  );
  assert.equal(
    app.cleanSpec("бюджет корхоналари бухгалтерия"),
    "бюджет корхоналари бухгалтери",
  );
});

test("isCenterSubDeptHead excludes center sub-department heads while keeping center heads", () => {
  assert.equal(
    app.isCenterSubDeptHead(
      "Тармоқларни бошқариш бўлими бошлиғи",
      "Рақамли таълим технологиялар маркази",
    ),
    true,
  );
  assert.equal(
    app.isCenterSubDeptHead(
      "Марказ бошлиғи",
      "Рақамли таълим технологиялар маркази",
    ),
    false,
  );
});

test("pickBestWords preserves line breaks and picks better Uzbek orthography per word", () => {
  const best = app.pickBestWords(
    "Сурхондарё вилояти, Шурчи тумани",
    "Сурхандарё вилояти, Шўрчи тумани",
    false,
  );
  assert.equal(best, "Сурхондарё вилояти, Шўрчи тумани");

  const multi = app.pickBestWords(
    "2006 й. Ўзбекистон Миллий университети",
    "2006 й. Ўзбекистон Миллий университети (бакалавр)\n2009 й. Ўзбекистон Миллий университети (магистратура)",
    false,
  );
  assert.equal(
    multi,
    "2006 й. Ўзбекистон Миллий университети (бакалавр)\n2009 й. Ўзбекистон Миллий университети (магистратура)",
  );
});

test("diffRow auto-resolves spelling differences without proposing worse Excel spelling", () => {
  vm.runInContext(
    `
    xl.headers = ["Ф.И.Ш.", "Туғилган жойи", "Лавозими"];
    xl.map = { name: 0, birth_place: 1, position: 2 };
    `,
    app,
  );

  // Excel has better orthography -> auto & spell flags set
  const docWorse = {
    S: { latin: false, labels: { birth_place: "Туғилган жойи" } },
    position: "Термиз давлат педагогика инстетути ўқитувчиси",
    since: "",
    work: [],
    fields: { birth_place: "Сурхондарё вилояти, Шурчи тумани" },
  };
  const diffs1 = app.diffRow(docWorse, [
    "Алиев Вали",
    "Сурхондарё вилояти, Шўрчи тумани",
    "Термиз давлат педагогика институти ўқитувчиси",
  ]);
  const bp1 = diffs1.find((c) => c.key === "birth_place");
  assert.equal(bp1 && bp1.spell, true);
  assert.equal(bp1 && bp1.auto, true);
  assert.equal(bp1 && bp1.val, "Сурхондарё вилояти, Шўрчи тумани");

  // DOCX already has better orthography -> no diff proposed
  const docBetter = {
    S: { latin: false, labels: { birth_place: "Туғилган жойи" } },
    position: "Термиз давлат педагогика институти ўқитувчиси",
    since: "",
    work: [],
    fields: { birth_place: "Сурхондарё вилояти, Шўрчи тумани" },
  };
  const diffs2 = app.diffRow(docBetter, [
    "Алиев Вали",
    "Сурхондарё вилояти, Шурчи тумани",
    "Термиз давлат педагогика институти укитувчиси",
  ]);
  assert.equal(diffs2.length, 0);
});

test("dualReadPositionWorkbook supports priority sheets and fallback generic sheets", () => {
  const generic = app.dualReadPositionWorkbook([
    {
      name: "Sheet1",
      rows: [
        ["№", "Ф.И.Ш.", "Бўлими", "Лавозими"],
        ["1", "Каримов Салим", "Математика кафедраси", "Ўқитувчи"],
      ],
    },
  ]);
  assert.equal(generic.records.length, 1);
  assert.equal(generic.records[0].position, "Ўқитувчи");

  const idx = app.dualBuildPositionIndex(generic.records);
  const found = app.dualFindPosition("Каримов Салим", idx);
  assert.equal(found && found.dept, "Математика кафедраси");
});

test("sciNone and posDept accurately classify none-phrases and extract department from position", () => {
  assert.equal(app.sciNone("йўқ (мустақил тадқиқотчи)"), true);
  assert.equal(app.sciNone("илмий даражаси йўқ"), true);
  assert.equal(app.sciNone("Илмий даражага ега эмас"), true);
  assert.equal(app.sciNone("Мустақил изланувчи"), true);
  assert.equal(app.sciNone("Педагогика фанлари бўйича фалсафа доктори (PhD)"), false);

  assert.equal(
    app.posDept("Термиз давлат педагогика институти Педагогика кафедраси доценти"),
    "Педагогика кафедраси",
  );
  assert.equal(
    app.posDept("Бошланғич таълим кафедраси ўқитувчиси"),
    "Бошланғич таълим кафедраси",
  );
});

test("setCurrentJob: oxirgi yopiq qator joriy lavozim bilan bir xil bo‘lsa, dublikat va xronologik teskari qator qo‘shmasdan uni ҳ.в. ga ochadi", () => {
  const doc1 = {
    S: app.SpravkaCore.SCRIPTS.cyr,
    work: [
      "2008-2009 йй. - Термиз педагогика коллежида девонхона мудири",
      "2021-2024 йй. - Термиз давлат педагогика институти Факултетлараро хорижий Тиллар кафедраси кабинет мудираси",
      "2024-2025 йй. - Термиз давлат педагогика институти ўқув ёрдамчи ходимлар кабинет мудири",
    ],
  };
  app.SpravkaCore.setCurrentJob(
    doc1,
    "Термиз давлат педагогика институти ўқув ёрдамчи ходимлар кабинет мудири",
    "2021",
  );
  assert.equal(doc1.work.length, 3);
  assert.equal(
    doc1.work[2],
    "2024-йил. ҳ.в. - Термиз давлат педагогика институти ўқув ёрдамчи ходимлар кабинет мудири",
  );

  const doc2 = {
    S: app.SpravkaCore.SCRIPTS.cyr,
    work: [
      "2021-2025 йй. - Термиз давлат педагогика институтида тютор",
      "2025-2026 йй. - Термиз давлат педагогика институти ўқув ёрдамчи ходимлар лаборант",
    ],
  };
  app.SpravkaCore.setCurrentJob(
    doc2,
    "Термиз давлат педагогика институти Ўқитишнинг техник воситалари бўлими муҳандис",
    "2021",
    { force: true },
  );
  assert.equal(doc2.work.length, 3);
  assert.match(doc2.work[2], /^2026-йил\. ҳ\.в\. - /);
});

test("analyzeBlocks: qarindoshlar jadvali ustunlari («Иш жой ва манзил», «Вазифаси»), qisqa sarlavha («...нинг ҳақида МАЪЛУМОТ») va «Маълумоти мутахассислиги бўйича» maydonini to‘g‘ri ajratadi", () => {
  const blocks = [
    { type: "p", text: "МАЪЛУМОТНОМА" },
    { type: "p", text: "Шавилова Наталъя Сергеевна" },
    { type: "p", text: "2023-йил 4-сентябрдан:" },
    {
      type: "p",
      text: "Термиз давлат педагогика институти, рус тили ва адабиёти кафедраси ўқитувчиси",
    },
    {
      type: "p",
      text: "Маълумоти мутахассислиги боʻйича:\tФилолог (тадқиқотчи-педагог)",
    },
    { type: "p", text: "МЕҲНАТ ФАОЛИЯТИ" },
    {
      type: "p",
      text: "2011-2023 йй. - Термиз халқаро аэропорти МЧЖ, архивариус",
    },
    {
      type: "p",
      text: "2023-йил. ҳ.в. - Термиз давлат педагогика институти, рус тили ва адабиёти кафедраси ўқитувчиси",
    },
    { type: "p", text: "Шавилова Наталъя Сергеевнанинг ҳақида" },
    { type: "p", text: "МАЪЛУМОТ" },
    {
      type: "tbl",
      rows: [
        [
          "Қариндош-лиги",
          "Фамилияси, исми ва отасининг исми",
          "Туғилган йили ва жойи",
          "Иш жой ва манзил",
          "Турар жой",
        ],
        [
          "Отаси",
          "Шавилов Сергей Викторович",
          "1963-йил, Термиз шахри",
          "Маълумот йўқ",
          "Россия Федарацияси, Твер шаҳри",
        ],
        [
          "Акаси",
          "Шавилов Иля Сергеевич",
          "1985-йил, Термиз шахри",
          "Жанубий электр тармоқлари ката устаси",
          "Термиз шахри, Ибн-Сино коʻчаси 6/2",
        ],
      ],
    },
  ];
  const r = app.SpravkaCore.analyzeBlocks(
    blocks,
    blocks.map((b) => b.text || ""),
    null,
    {},
  );
  const d = r.data;
  assert.equal(d.fields.specialty, "Филолог (тадқиқотчи-педагог)");
  assert.equal(d.work.length, 2);
  assert.equal(
    d.work[1],
    "2023-йил. ҳ.в. - Термиз давлат педагогика институти, рус тили ва адабиёти кафедраси ўқитувчиси",
  );
  assert.equal(d.relHeadingName, "Шавилова Наталъя Сергеевна");
  assert.equal(d.relatives[0].work, "Маълумот йўқ");
  assert.equal(d.relatives[0].address, "Россия Федерацияси, Твер шаҳри");
  assert.equal(
    d.relatives[1].work,
    "Жанубий электр тармоқлари катта устаси",
  );
  assert.equal(
    d.relatives[1].address,
    "Термиз шаҳри, Ибн-Сино кўчаси 6/2",
  );
});

test("dualBuildMergedRows: 2-Excel'dagi mutaxassislik va boshqa shaxsiy ustunlarni saqlab qoladi va bo‘sh maydonni avtomatik to‘ldiradi", () => {
  const sheets = [
    {
      name: "ходимлар рўйхати",
      rows: [
        [
          "№",
          "Фамилияси, исми ва отасининг исми",
          "Ташкилот номи",
          "Ишлаётган бошқарма ёки факултет, кафедра ва бўлим номи",
          "Лавозими",
          "Мутахассислиги",
        ],
        [
          "1",
          "Уролов Сардор Абдулла ўғли",
          "Термиз давлат педагогика институти",
          "Спорт фаолияти кафедраси",
          "Дотцент в.б.",
          "Жисмоний тарбия ва спорт машғулотлари назарияси ва методикаси",
        ],
      ],
    },
  ];
  const parsedPos = app.dualReadPositionWorkbook(sheets);
  assert.equal(
    parsedPos.records[0].fields.specialty,
    "Жисмоний тарбия ва спорт машғулотлари назарияси ва методикаси",
  );

  const xlRef = vm.runInContext("xl", app);
  xlRef.sources = {
    employee: {
      headers: ["ФИО", "Lavozim", "Ставка", "Дата приказа о приеме"],
      rows: [
        [
          "URALOV SARDOR ABDULLA O‘G‘LI",
          "Доцент вазифасини бажарувчи",
          "1.00",
          "2026-09-02",
        ],
      ],
      map: { name: 0, position: 1, rate: 2, since_date: 3 },
      fileName: "employees.xlsx",
    },
    positions: {
      records: parsedPos.records,
      selectedSheets: parsedPos.selectedSheets,
      fileName: "Malumotlar_bazasi.xlsx",
    },
    merged: false,
  };
  const ok = app.dualBuildMergedRows();
  assert.equal(ok, true);
  assert.notEqual(xlRef.map.specialty, undefined);

  const blocks = [
    { type: "p", text: "МАЪЛУМОТНОМА" },
    { type: "p", text: "Уралов Сардор Абдулла Ўғли" },
    { type: "p", text: "Қайси тилларни билади : Рус тили" },
    { type: "p", text: "Давлат мукофатлари билан мукофатланганми ( қанақа )" },
    { type: "p", text: "йўқ" },
    {
      type: "p",
      text: "Доцент в.б. Уралов Сардор Абдулла ўғлининг яқин қариндошлари ҳақида МАЪЛУМОТ",
    },
  ];
  const doc = app.SpravkaCore.analyzeBlocks(
    blocks,
    blocks.map((b) => b.text),
    null,
    {},
  ).data;
  assert.equal(doc.name, "Уралов Сардор Абдулла ўғли");
  assert.equal(doc.relHeadingName, "Уралов Сардор Абдулла ўғли");
  assert.equal(doc.fields.languages, "Рус тили");
  assert.equal(doc.fields.awards, "йўқ");

  const changes = app.diffRow(doc, xlRef.rows[0]);
  const specChange = changes.find((c) => c.key === "specialty");
  assert.ok(specChange);
  assert.equal(specChange.auto, true);
  assert.equal(
    specChange.val,
    "Жисмоний тарбия ва спорт машғулотлари назарияси ва методикаси",
  );

  assert.equal(
    app.cleanPersonName("XUDOYOROVA MARVARID MAHMUD QIZI"),
    "Xudoyorova Marvarid Mahmud qizi",
  );
  assert.equal(
    app.cleanPersonName("ALIMNAZAROV OLIM MENGLIBOY O‘G‘LI"),
    "Alimnazarov Olim Mengliboy o‘g‘li",
  );
  assert.equal(
    app.cleanPersonName("JURAYEV UMID TUXTA O‘G‘LI"),
    "Jurayev Umid Tuxta o‘g‘li",
  );
  assert.equal(app.cleanPersonName("Тўраев Хайдар ХХХ"), "Тўраев Хайдар");
  assert.equal(app.niceName("YO‘LDOSHEV SHOHRUH"), "Yo‘ldoshev Shohruh");
  assert.ok(
    app.SpravkaCore.nameScore(
      "Абраева Ўғилбека Аннаназаровна",
      "ABRAYEVA OGULBEKA ANNANAZAROVNA",
    ) >= 0.95,
  );
  assert.ok(
    app.SpravkaCore.nameScore(
      "Эшбойев Намоз Чори ўғли",
      "ESHBAYEV NAMOZ CHORI O‘G‘LI",
    ) >= 0.95,
  );
  assert.ok(
    app.SpravkaCore.nameScore(
      "Эркинова Меҳринисо Рўзиқул қизи",
      "ERKINOVA MEHRINISO RO‘ZIBOY QIZI",
    ) >= 0.9,
  );
});

test("toggleApproveItem: qatordagi Tasdiqlash tugmasi orqali ma'lumotnomani bir zumda tasdiqlaydi va holatini ok ga o'tkazadi", () => {
  const item = {
    name: "Абраева Ўғилбека Аннаназаровна.doc",
    P: {
      name: "Абраева Ўғилбека Аннаназаровна",
      position: "Техник фойдаланиш ва хўжалик бўлими талабалар турар жойи қоровули",
      fields: { specialty: "" },
    },
    reasons: ["Маълумоти бўйича мутахассислиги: bo'sh — to'ldirish"],
    state: "warn",
    approved: false,
  };

  assert.equal(app.sevOf(item), "serious");

  // Inline Tasdiqlash tugmasi bosilganda
  app.toggleApproveItem(item);
  assert.equal(item.approved, true);
  assert.equal(item.state, "ok");
  assert.equal(app.sevOf(item), "ok");

  // Qayta bosilganda bekor qilish
  app.toggleApproveItem(item);
  assert.equal(item.approved, false);
  assert.equal(item.state, "warn");
  assert.equal(app.sevOf(item), "serious");
});

test("isTechDept: Texnik foydalanish va xo'jalik bo'limi xodimlarining mutaxassisligi va tugatgan joyi yo'q bo'lsa xatolik berilmaydi", () => {
  const techP = {
    name: "Абраева Ўғилбека Аннаназаровна",
    position: "Техник фойдаланиш ва хўжалик бўлими талабалар турар жойи қоровули",
    since: "2021-йил",
    work: ["2021-йил ҳ.в. - Қоровул"],
    relatives: [{ rel: "Отаси", name: "Аннаназар" }],
    photo: { bytes: [1] },
    fields: {
      birth_date: "1985-02-03",
      birth_place: "Термиз",
      nationality: "ўзбек",
      education: "",
      grad_year: "",
      specialty: "",
    },
    S: {
      labels: {
        birth_date: "Туғилган йили",
        birth_place: "Туғилган жойи",
        nationality: "Миллати",
        education: "Маълумоти",
        grad_year: "Тамомлаган",
        specialty: "Маълумоти бўйича мутахассислиги",
      },
    },
  };

  const techItem = {
    P: techP,
    name: "Абраева Ўғилбека.doc",
    folder: "3. Bo'limlar/Техник фойдаланиш ва хўжалик бўлими",
  };

  assert.equal(app.isTechDept(techItem, techP), true);

  const reasons = app.reviewReasons(techP, techItem);
  // Texnik foydalanish va xo'jalik bo'limi xodimi uchun Tamomlagan va Mutaxassisligi bo'sh bo'lsa xatolik chiqarilmaydi
  assert.equal(
    reasons.some((r) => /Тамомлаган|мутахассислиги|Маълумоти/.test(r)),
    false,
  );

  const empty = app.emptyKeys(techP, false, techItem);
  assert.equal(empty.includes("grad_year"), false);
  assert.equal(empty.includes("specialty"), false);
  assert.equal(empty.includes("education"), false);

  // Boshqa kafedra o'qituvchisi uchun esa mutaxassislik bo'sh bo'lsa xatolik chiqishi kerak
  const teacherP = {
    ...techP,
    position: "Термиз давлат педагогика институти Тарих ва география кафедраси ўқитувчиси",
  };
  const teacherItem = {
    P: teacherP,
    name: "Вахидова Нозикой.doc",
    folder: "4. Fakultetlar/Tarix kafedrasi",
  };
  assert.equal(app.isTechDept(teacherItem, teacherP), false);
  const teacherReasons = app.reviewReasons(teacherP, teacherItem);
  assert.equal(
    teacherReasons.some((r) => /Тамомлаган|мутахассислиги|Маълумоти/.test(r)),
    true,
  );
});

test("fixDateTypos: 2917 kabi klaviatura xatolarini 2017 ga avtomatik tuzatadi", () => {
  assert.equal(
    app.SpravkaCore.fixDateTypos("2016-2917 йй. - Референт"),
    "2016-2017 йй. - Референт",
  );
  assert.equal(
    app.SpravkaCore.fixDateTypos("2917-2021 йй. - Ўқитувчи"),
    "2017-2021 йй. - Ўқитувчи",
  );
  assert.equal(
    app.SpravkaCore.fixDateTypos("2920-йилдан"),
    "2020-йилдан",
  );
});

test("dateIssues: oliy ta'limda o'qish (magistratura/doktorantura) bilan birgalikda ishlash va parallel lavozimlar xatolik deb olinmaydi", () => {
  // 1-holat: 2021-2023 magistratura va 2020-2026 maktab o'qituvchisi
  const p1 = {
    since: "2026-йил",
    fields: { birth_date: "1997-01-01" },
    work: [
      "2016-2020 йй. - Республика “Ёшлар маркази” Сурхондарё бўлинмаси АРМ раҳбари",
      "2021-2023 йй. - Термиз давлат университети Магистратура бўлими: Адабиётшунослик йўналиши магистранти",
      "2020-2026 йй. - Термиз шаҳар касб-ҳунар мактаби (Термиз шаҳар 1-сон техникуми)да она тили ва адабиёт фани ўқитувчиси",
      "2026-йил. ҳ.в. - Термиз давлат педагогика институти Ўзбек тили ва адабиёти кафедрасида ўқитувчи",
    ],
  };

  const issues1 = app.dateIssues(p1);
  assert.equal(issues1.some((s) => s.includes("tartib buzilgan")), false);
  assert.equal(issues1.some((s) => s.includes("kesib o‘tadi")), false);

  // 2-holat: Милиев Сувонқул: 2016-2917 (2017 ga tuzatiladi), 2017-2021, 2021-2025 va 2021-2026 parallel
  const p2 = {
    since: "2021-йил",
    fields: { birth_date: "1960-01-01" },
    work: [
      "2016-2917 йй. - Кафедра мудири",
      "2017-2021 йй. - Кафедра доценти",
      "2021-2025 йй. - Кафедра мудири",
      "2021-2026 йй. - Ўзбек тили ва адабиёти кафедраси профессори",
    ],
  };

  const issues2 = app.dateIssues(p2);
  // 2917 -> 2017 ga tuzatilgan bo'lishi kerak
  assert.equal(p2.work[0], "2016-2017 йй. - Кафедра мудири");
  assert.equal(issues2.some((s) => s.includes("kelajakdagi yil")), false);
  assert.equal(issues2.some((s) => s.includes("kesib o‘tadi")), false);
});







