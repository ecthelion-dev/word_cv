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


