/**
 * 06-editor.js — Maʼlumotnoma interaktiv muharriri (shaxsiy maydonlar, sanalar, joy nomlari, mehnat faoliyati va qarindoshlar)
 */
async function save(e, t, a, n) {
  t.className = "msg";
  const i = /\.zip$/i.test(a)
      ? "application/zip"
      : /\.csv$/i.test(a)
        ? "text/csv"
        : /\.pdf$/i.test(a)
          ? "application/pdf"
          : /\.xlsx$/i.test(a)
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    o = URL.createObjectURL(new Blob([n], { type: i })),
    l = document.createElement("a");
  return (
    (l.href = o),
    (l.download = a),
    document.body.appendChild(l),
    l.click(),
    l.remove(),
    setTimeout(() => URL.revokeObjectURL(o), 1e4),
    (t.textContent = "Yuklab olindi."),
    !0
  );
}
($("coiRun").addEventListener("click", () => runCoi()),
  $("declAllBtn").addEventListener("click", (e) => declAll(e.currentTarget)),
  $("coiCsv").addEventListener("click", async () => {
    const e = $("coiCsv");
    e.disabled = !0;
    try {
      await save(
        e,
        $("coiMsg"),
        "Xizmat_uchun_manfaatlar_toqnashuvi.xlsx",
        await xlsxBuild([
          {
            name: "To'qnashuvlar",
            rows: coiCsv(),
            head: 1,
            freeze: !0,
            filter: !0,
            widths: [5, 26, 24, 20, 26, 30, 26, 46, 36, 20, 36, 30, 20, 24, 14],
          },
        ]),
      );
    } finally {
      e.disabled = !1;
    }
  }),
  $("coiBtn").addEventListener("click", () => {
    (showView("coi"), runCoi());
  }));
const FIELD_ORDER = [
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
  PARTIES = [
    {
      key: "yoq",
      full: ["Partiyaviyligi yo'q", "Партиявийлиги йўқ"],
      val: ["yo‘q", "йўқ"],
      re: /^(?:иук|ек|иок|еук|иуk|нет|бепартия|партиясиз|партиявиилигииук)$/,
    },
    {
      key: "lidep",
      full: [
        "O‘zbekiston Liberal-demokratik partiyasi (O‘zLiDeP)",
        "Ўзбекистон Либерал-демократик партияси (ЎзЛиДеП)",
      ],
      val: ["O‘zLiDeP a’zosi", "ЎзЛиДеП аъзоси"],
      re: /лидеп|либерал/,
    },
    {
      key: "xdp",
      full: [
        "O‘zbekiston Xalq demokratik partiyasi (O‘zXDP)",
        "Ўзбекистон Халқ демократик партияси (ЎзХДП)",
      ],
      val: ["O‘zXDP a’zosi", "ЎзХДП аъзоси"],
      re: /ухдп|хдп|халкдемократик/,
    },
    {
      key: "mtdp",
      full: [
        "O‘zbekiston «Milliy tiklanish» demokratik partiyasi (O‘zMTDP)",
        "Ўзбекистон «Миллий тикланиш» демократик партияси (ЎзМТДП)",
      ],
      val: ["O‘zMTDP a’zosi", "ЎзМТДП аъзоси"],
      re: /мтдп|миллиитикланиш/,
    },
    {
      key: "adolat",
      full: [
        "O‘zbekiston «Adolat» sotsial-demokratik partiyasi (Adolat SDP)",
        "Ўзбекистон «Адолат» социал-демократик партияси (Адолат СДП)",
      ],
      val: ["«Adolat» SDP a’zosi", "«Адолат» СДП аъзоси"],
      re: /адолат/,
    },
    {
      key: "eko",
      full: [
        "O‘zbekiston Ekologik partiyasi (Ekopartiya)",
        "Ўзбекистон Экологик партияси (Экопартия)",
      ],
      val: ["Ekopartiya a’zosi", "Экопартия аъзоси"],
      re: /екопартия|екологик/,
    },
  ],
  REGIONS = [
    [
      "Андижон вилояти",
      "Андижон Асака Балиқчи Бўстон Булоқбоши Жалақудуқ Избоскан Қўрғонтепа Марҳамат Олтинкўл Пахтаобод Улуғнор Хўжаобод Шаҳрихон",
      "Андижон Хонобод",
    ],
    [
      "Бухоро вилояти",
      "Бухоро Вобкент Жондор Когон Олот Пешку Ромитан Шофиркон Ғиждувон Қоракўл Қоровулбозор",
      "Бухоро Когон",
    ],
    [
      "Жиззах вилояти",
      "Арнасой Бахмал Дўстлик Ғаллаорол Шароф_Рашидов Зарбдор Зафаробод Зомин Мирзачўл Пахтакор Фориш Янгиобод",
      "Жиззах",
    ],
    [
      "Қашқадарё вилояти",
      "Деҳқонобод Касби Китоб Косон Кўкдала Миришкор Муборак Нишон Қамаши Қарши Чироқчи Шаҳрисабз Яккабоғ Ғузор",
      "Қарши Шаҳрисабз",
    ],
    [
      "Навоий вилояти",
      "Кармана Конимех Навбаҳор Нурота Томди Учқудуқ Хатирчи Қизилтепа",
      "Навоий Зарафшон",
    ],
    [
      "Наманган вилояти",
      "Давлатобод Косонсой Мингбулоқ Наманган Норин Поп Тўрақўрғон Уйчи Учқўрғон Чортоқ Чуст Янгиқўрғон Янги_Наманган",
      "Наманган",
    ],
    [
      "Самарқанд вилояти",
      "Булунғур Жомбой Иштихон Каттақўрғон Кўшработ Нарпай Нуробод Оқдарё Пайариқ Пастдарғом Пахтачи Самарқанд Тайлоқ Ургут",
      "Самарқанд Каттақўрғон",
    ],
    [
      "Сирдарё вилояти",
      "Боёвут Гулистон Мирзаобод Оқолтин Сайхунобод Сардоба Сирдарё Ховос",
      "Гулистон Янгиер Ширин",
    ],
    [
      "Сурхондарё вилояти",
      "Ангор Бандихон Бойсун Денов Жарқўрғон Қизириқ Қумқўрғон Музработ Олтинсой Сариосиё Термиз Узун Шеробод Шўрчи",
      "Термиз",
    ],
    [
      "Тошкент вилояти",
      "Бекобод Бўка Бўстонлиқ Зангиота Қибрай Қуйичирчиқ Оққўрғон Оҳангарон Паркент Пискент Тошкент Ўртачирчиқ Чиноз Юқоричирчиқ Янгийўл",
      "Олмалиқ Ангрен Бекобод Нурафшон Оҳангарон Чирчиқ Янгийўл",
    ],
    [
      "Фарғона вилояти",
      "Бағдод Бешариқ Бувайда Данғара Ёзёвон Олтиариқ Қўштепа Риштон Сўх Тошлоқ Учкўприк Фарғона Фурқат Ўзбекистон Қува",
      "Фарғона Қўқон Марғилон Қувасой",
    ],
    [
      "Хоразм вилояти",
      "Боғот Гурлан Қўшкўпир Урганч Хазорасп Хива Хонқа Шовот Янгиариқ Янгибозор Тупроққалъа",
      "Урганч Хива",
    ],
    [
      "Қорақалпоғистон Республикаси",
      "Амударё Беруний Бўзатов Кегейли Қанликўл Қонғирот Қораўзак Мўйноқ Нукус Тахиатош Тахтакўпир Тўрткўл Хўжайли Чимбой Шуманай Элликқалъа",
      "Нукус",
    ],
    [
      "Тошкент шаҳри",
      "Бектемир Мирзо_Улуғбек Миробод Олмазор Сергели Учтепа Чилонзор Шайхонтоҳур Юнусобод Яккасарой Яшнобод Янгиҳаёт",
      "",
    ],
  ].map(([e, t, a]) => ({
    r: e,
    items: t
      .split(" ")
      .map((e) => e.replace(/_/g, " ") + " тумани")
      .concat(a ? a.split(" ").map((e) => e + " шаҳри") : []),
  })),
  TITLES = [
    { key: "yoq", c: "йўқ", l: "yo‘q", lbl: "Yo'q" },
    { key: "prof", c: "профессор", l: "professor", lbl: "Professor" },
    { key: "dots", c: "доцент", l: "dotsent", lbl: "Dotsent" },
    {
      key: "profvb",
      c: "профессор в.б.",
      l: "professor v.b.",
      lbl: "Professor v.b.",
    },
    { key: "dotsvb", c: "доцент в.б.", l: "dotsent v.b.", lbl: "Dotsent v.b." },
  ];
function titleOf(e) {
  const t = String(e || "")
      .toLowerCase()
      .replace(/[‘’'`ʻ]/g, ""),
    a = SpravkaCore.cyrToLat(t);
  if (!t.trim()) return null;
  if (
    /^(?:yoq|йўқ|йук|нет|-)$/.test(a.trim()) ||
    /^(?:йўқ|йук)$/.test(t.trim())
  )
    return TITLES[0];
  const n =
    /v\.?\s*b\.?|в\.?\s*б\.?|vazifasini|вазифасини|bajaruvchi|бажарувчи/.test(
      t + " " + a,
    );
  return /professor|профессор/.test(t + " " + a)
    ? TITLES[n ? 3 : 1]
    : /dotsent|dosent|доцент/.test(t + " " + a)
      ? TITLES[n ? 4 : 2]
      : null;
}
function titleField(e, t) {
  const a = el("label", "f"),
    n = !!t.S.latin;
  a.append(el("span", "", e));
  const i = el("select");
  i.dataset.k = "title";
  const o = String(t.fields.title || "").trim(),
    l = titleOf(o);
  i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" }));
  for (const e of TITLES)
    i.append(
      Object.assign(el("option", "", `${e.lbl} — ${n ? e.l : e.c}`), {
        value: e.key,
      }),
    );
  return (
    !o ||
      l ||
      /^\?+$/.test(o) ||
      i.append(
        Object.assign(el("option", "", o + " (hujjatdagi yozuv)"), {
          value: "__cur",
        }),
      ),
    (i.value = l ? l.key : o && !/^\?+$/.test(o) ? "__cur" : ""),
    i.addEventListener("change", () => {
      const e = TITLES.find((e) => e.key === i.value);
      ((t.fields.title = e ? (n ? e.l : e.c) : "__cur" === i.value ? o : ""),
        i.classList.toggle("need", !i.value));
    }),
    a.append(i),
    a
  );
}
function eduField(e, t) {
  const a = el("label", "f"),
    n = t.S.latin;
  a.append(el("span", "", e));
  const i = el("select");
  i.dataset.k = "education";
  const o = n ? ["oliy", "o‘rta maxsus"] : ["олий", "ўрта махсус"];
  (i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" })),
    o.forEach((e) =>
      i.append(Object.assign(el("option", "", e), { value: e })),
    ));
  const l = String(t.fields.education || "").trim(),
    s = SpravkaCore.norm(l);
  return (
    (i.value = o.includes(l)
      ? l
      : s.includes("олии")
        ? o[0]
        : s.includes("урта")
          ? o[1]
          : ""),
    i.value !== l && (t.fields.education = i.value || l),
    i.addEventListener("change", () => {
      ((t.fields.education = i.value), (i.dataset.auto = ""));
    }),
    a.append(i),
    a
  );
}
function dateField(e, t) {
  const a = el("label", "f"),
    n = t.S.latin;
  a.append(el("span", "", e));
  const i = el("input");
  ((i.type = "text"),
    (i.dataset.k = "birth_date"),
    (i.inputMode = "numeric"),
    (i.placeholder = "kk.oo.yyyy (masalan: 27.09.1997)"),
    (i.maxLength = 10));
  {
    const e = String(t.fields.birth_date || ""),
      a = e.replace(
        /^(\d{1,2}\.\d{1,2}\.\d{4})\s*-?\s*(?:й|йил|йили|y|yil|yili)?\.?\s*$/i,
        "$1",
      );
    a !== e && (t.fields.birth_date = a);
  }
  i.value = t.fields.birth_date || "";
  const o = el("div", "dtsel"),
    l = el("select"),
    s = el("select"),
    r = el("select"),
    d = el("small", "dterr");
  (l.setAttribute("aria-label", "Kun"),
    s.setAttribute("aria-label", "Oy"),
    r.setAttribute("aria-label", "Yil"));
  const c = n
    ? [
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
      ]
    : [
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
      ];
  l.append(Object.assign(el("option", "", n ? "kun" : "кун"), { value: "" }));
  for (let e = 1; e <= 31; e++)
    l.append(Object.assign(el("option", "", String(e)), { value: String(e) }));
  (s.append(Object.assign(el("option", "", n ? "oy" : "ой"), { value: "" })),
    c.forEach((e, t) =>
      s.append(
        Object.assign(el("option", "", `${p2(t + 1)} — ${e}`), {
          value: String(t + 1),
        }),
      ),
    ));
  const p = new Date().getFullYear() - 14;
  r.append(Object.assign(el("option", "", n ? "yil" : "йил"), { value: "" }));
  for (let e = p; e >= 1930; e--)
    r.append(Object.assign(el("option", "", String(e)), { value: String(e) }));
  const m = () => {
      const e = i.value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      ((l.value = e ? String(+e[1]) : ""),
        (s.value = e ? String(+e[2]) : ""),
        (r.value =
          e && r.querySelector(`option[value="${+e[3]}"]`)
            ? String(+e[3])
            : ""),
        (d.textContent =
          !i.value ||
          (e &&
            ((e, t, a) => {
              const n = new Date(Date.UTC(a, t - 1, e));
              return (
                n.getUTCFullYear() === a &&
                n.getUTCMonth() === t - 1 &&
                n.getUTCDate() === e
              );
            })(+e[1], +e[2], +e[3]))
            ? ""
            : e
              ? "Bunday sana yo‘q — kun va oyni tekshiring."
              : i.value.length >= 10
                ? "Sana kk.oo.yyyy ko‘rinishida bo‘lsin."
                : ""));
    },
    u = () => {
      l.value &&
        s.value &&
        r.value &&
        ((i.value = `${p2(+l.value)}.${p2(+s.value)}.${r.value}`),
        (t.fields.birth_date = i.value),
        m(),
        i.dispatchEvent(new Event("input")));
    };
  return (
    i.addEventListener("input", (e) => {
      if (
        e.isTrusted &&
        /^[\d.]*$/.test(i.value) &&
        !(e.inputType || "").startsWith("delete")
      ) {
        const e = i.value.replace(/\D/g, "").slice(0, 8);
        i.value =
          e.length > 4
            ? `${e.slice(0, 2)}.${e.slice(2, 4)}.${e.slice(4)}`
            : e.length > 2
              ? `${e.slice(0, 2)}.${e.slice(2)}`
              : e;
      }
      ((t.fields.birth_date = i.value), m());
    }),
    [l, s, r].forEach((e) => e.addEventListener("change", u)),
    o.append(l, s, r),
    a.append(i, o, d),
    m(),
    a
  );
}
function placeField(e, t) {
  const a = el("label", "f"),
    n = t.S.latin,
    i = (e) => (n ? SpravkaCore.cyrToLat(e) : e);
  a.append(el("span", "", e));
  const o = el("input");
  ((o.type = "text"),
    (o.dataset.k = "birth_place"),
    (o.value = t.fields.birth_place || ""),
    o.addEventListener("input", () => {
      t.fields.birth_place = o.value;
    }));
  const l = el("div", "plsel"),
    s = el("select"),
    r = el("select");
  (s.setAttribute("aria-label", "Viloyat"),
    r.setAttribute("aria-label", "Tuman yoki shahar"),
    s.append(
      Object.assign(el("option", "", n ? "— viloyat —" : "— вилоят —"), {
        value: "",
      }),
    ),
    REGIONS.forEach((e, t) =>
      s.append(Object.assign(el("option", "", i(e.r)), { value: String(t) })),
    ));
  const d = () => {
      ((r.textContent = ""),
        r.append(
          Object.assign(
            el("option", "", n ? "— tuman / shahar —" : "— туман / шаҳар —"),
            { value: "" },
          ),
        ));
      const e = REGIONS[+s.value];
      ((r.disabled = !e),
        e &&
          e.items.forEach((e, t) =>
            r.append(
              Object.assign(el("option", "", i(e)), { value: String(t) }),
            ),
          ));
    },
    c = SpravkaCore.norm(o.value),
    p = (e) => SpravkaCore.norm(e);
  let m = REGIONS.findIndex((e) => c.includes(p(e.r)));
  if (
    (m < 0 &&
      (m = REGIONS.findIndex(
        (e) => !/шаҳри$/.test(e.r) && c.includes(p(e.r.split(" ")[0])),
      )),
    (s.value = m >= 0 ? String(m) : ""),
    d(),
    m >= 0)
  ) {
    const e = REGIONS[m].items;
    let t = c.replace(p(REGIONS[m].r), "");
    t === c &&
      (t = c.replace(
        new RegExp(
          "^.*?" +
            p(REGIONS[m].r.split(" ")[0]) +
            "(?:вилояти|вил|viloyati|vil)?",
        ),
        "",
      ));
    let a = e.findIndex((e) => t.includes(p(e)));
    (a < 0 &&
      (a = e.findIndex((e) =>
        t.includes(p(e.replace(/ (?:тумани|шаҳри)$/, ""))),
      )),
      a >= 0 && (r.value = String(a)));
  }
  const u = () => {
    const e = REGIONS[+s.value];
    if (!e) return;
    const a = "" !== r.value ? e.items[+r.value] : "";
    ((o.value = i(a ? `${e.r}, ${a}` : e.r)),
      (t.fields.birth_place = o.value),
      o.dispatchEvent(new Event("input")));
  };
  return (
    s.addEventListener("change", () => {
      (d(), u(), "" !== s.value && r.focus());
    }),
    r.addEventListener("change", u),
    l.append(s, r),
    a.append(o, l),
    a
  );
}
function partyOf(e) {
  const t = SpravkaCore.norm(String(e || ""));
  return (t && PARTIES.find((e) => e.re.test(t))) || null;
}
function partyField(e, t) {
  const a = el("label", "f"),
    n = t.S.latin ? 0 : 1;
  a.append(el("span", "", e));
  const i = el("select");
  i.dataset.k = "party";
  const o = t.fields.party || "",
    l = partyOf(o);
  i.append(Object.assign(el("option", "", "— tanlang —"), { value: "" }));
  for (const e of PARTIES)
    i.append(
      Object.assign(el("option", "", e.full[t.S.latin ? 0 : 1]), {
        value: e.key,
      }),
    );
  return (
    o &&
      !l &&
      i.append(
        Object.assign(el("option", "", o + " (hujjatdagi yozuv)"), {
          value: "__cur",
        }),
      ),
    (i.value = l ? l.key : o ? "__cur" : ""),
    i.addEventListener("change", () => {
      const e = PARTIES.find((e) => e.key === i.value);
      ((t.fields.party = e ? e.val[n] : "__cur" === i.value ? o : ""),
        i.classList.toggle("need", !i.value));
    }),
    a.append(i),
    a
  );
}
function field(e, t, a, n, i) {
  const o = el("label", "f");
  o.append(el("span", "", e));
  const l = el(
    (n = n || String(t || "").includes("\n")) ? "textarea" : "input",
  );
  return (
    n
      ? (l.rows = Math.min(
          5,
          Math.max(
            1,
            String(t || "")
              .split("\n")
              .reduce((e, t) => e + Math.max(1, Math.ceil(t.length / 38)), 0),
          ),
        ))
      : (l.type = "text"),
    (l.value = t || ""),
    i && (l.dataset.k = i),
    n &&
      l.addEventListener("input", () => {
        l.rows = Math.min(
          5,
          Math.max(
            1,
            l.value
              .split("\n")
              .reduce((e, t) => e + Math.max(1, Math.ceil(t.length / 38)), 0),
          ),
        );
      }),
    l.addEventListener("input", () => a(l.value)),
    o.append(l),
    o
  );
}
const setCurrentJob = (e, t, a, n) => SpravkaCore.setCurrentJob(e, t, a, n);
function addCurrentJob(e) {
  const t = ((e.since || "").match(/\d{4}/) || [])[0];
  return t ? setCurrentJob(e, e.position, t) : "nodate";
}
function buildEditor(e, t) {
  const a = el("div", "ed"),
    n = e.S.labels,
    i = el("section");
  i.append(el("h3", "", "Asosiy"));
  const o = el("div", "grid2");
  (o.append(
    field(
      "F.I.Sh.",
      e.name,
      (t) => {
        e.name = t;
      },
      !1,
      "name",
    ),
    field(
      "Sana satri (masalan: 2024 yil 1 sentyabrdan:)",
      e.since,
      (t) => {
        e.since = t;
      },
      !1,
      "since",
    ),
  ),
    i.append(
      o,
      field(
        "Hozirgi lavozimi",
        e.position,
        (t) => {
          e.position = t;
        },
        !0,
        "position",
      ),
    ));
  const l = el("div", "phed"),
    s = el("div", "pv"),
    r = el("div", "acts"),
    d = el("input");
  ((d.type = "file"), (d.accept = "image/jpeg,image/png"), (d.hidden = !0));
  const c = el("button", "btn2", ""),
    p = el("button", "btn2", "Rasmni olib tashlash");
  c.type = p.type = "button";
  const m = () => {
    if (((s.textContent = ""), e.photo && e.photo.bytes)) {
      const t = el("img");
      ((t.alt = "Rasm"),
        (t.src = URL.createObjectURL(new Blob([e.photo.bytes]))),
        s.append(t));
    } else s.append("Rasm yo'q");
    ((c.textContent = e.photo ? "Rasmni almashtirish" : "Rasm qo'shish (3×4)"),
      (p.hidden = !e.photo));
  };
  (c.addEventListener("click", () => d.click()),
    p.addEventListener("click", () => {
      ((e.photo = null), m());
    }),
    d.addEventListener("change", async () => {
      const t = d.files[0];
      if (((d.value = ""), t))
        try {
          ((e.photo = await photoFromFile(t)), m());
        } catch (e) {
          toast("Rasmni o'qib bo'lmadi — JPG yoki PNG tanlang");
        }
    }),
    m(),
    r.append(c, p),
    l.append(s, r, d));
  const u = el("div", "f");
  (u.append(el("span", "", "Rasm"), l), i.append(u), a.append(i));
  const h = el("section");
  h.append(el("h3", "", "Ma'lumotlar"));
  const f = el("div", "grid2");
  for (const t of FIELD_ORDER)
    f.append(
      "party" === t
        ? partyField(n[t], e)
        : "birth_place" === t
          ? placeField(n[t], e)
          : "birth_date" === t
            ? dateField(n[t], e)
            : "education" === t
              ? eduField(n[t], e)
              : "title" === t
                ? titleField(n[t], e)
                : field(
                    n[t],
                    e.fields[t],
                    (a) => {
                      e.fields[t] = a;
                    },
                    "grad_year" === t || "deputy" === t || "awards" === t,
                    t,
                  ),
    );
  {
    const t = f.querySelector('[data-k="grad_year"]'),
      a = f.querySelector('[data-k="education"]');
    t &&
      a &&
      t.addEventListener("input", () => {
        if (!a.value || a.dataset.auto) {
          const n = SpravkaCore.eduFromGrad(t.value, e.S.latin);
          n !== a.value &&
            ((a.value = n),
            (e.fields.education = n),
            (a.dataset.auto = n ? "1" : ""),
            a.classList.toggle("need", !n));
        }
      });
  }
  (h.append(f), a.append(h));
  const g = el("section");
  g.append(el("h3", "", e.S.work));
  const y = el("div"),
    k = () => {
      ((y.textContent = ""),
        e.work.forEach((t, a) => {
          const n = el("div", "wrow"),
            i = el("textarea");
          ((i.rows = 1),
            (i.value = t),
            i.addEventListener("input", () => {
              e.work[a] = i.value;
            }));
          const o = el("button", "x", "×");
          ((o.type = "button"),
            (o.title = "O'chirish"),
            o.setAttribute("aria-label", "Qatorni o'chirish"),
            o.addEventListener("click", () => {
              (e.work.splice(a, 1), k());
            }),
            n.append(i, o),
            y.append(n));
        }));
    };
  k();
  const x = el("div", "acts"),
    b = el("button", "btn2", "+ Qator qo'shish");
  ((b.type = "button"),
    b.addEventListener("click", () => {
      const t = new Date().getFullYear();
      (e.work.push(e.S.latin ? `${t}-yil. h.v. - ` : `${t}-йил. ҳ.в. - `), k());
      const a = y.lastElementChild.querySelector("textarea");
      (a.focus(), a.setSelectionRange(a.value.length, a.value.length));
    }));
  const v = el("p", "msg"),
    w = el("button", "btn2", "Hozirgi lavozimni qo'shish");
  ((w.type = "button"),
    w.addEventListener("click", () => {
      const t = addCurrentJob(e);
      (k(),
        (v.textContent =
          "exists" === t
            ? "Bu lavozim mehnat faoliyatida allaqachon bor («h.v.» qatori) — yangi qator qo'shilmadi."
            : "older" === t
              ? "Tepadagi sana oxirgi «h.v.» qatoridan oldin — qator qo'shilmadi, sanani tekshiring."
              : "empty" === t
                ? "Hozirgi lavozim maydoni bo‘sh."
                : "nodate" === t
                  ? "Avval tepadagi sana satrini to'ldiring (masalan: 2025-yil 1-dekabrdan:)."
                  : ""));
    }),
    x.append(b, w),
    g.append(
      y,
      x,
      v,
      el(
        "p",
        "hint",
        "«Hozirgi lavozimni qo'shish» — tepadagi sana va lavozimdan yangi qator yasaydi, oldingi «h.v.» qatorini shu yil bilan yopadi. Lavozim allaqachon bo'lsa, qayta qo'shmaydi.",
      ),
    ),
    a.append(g));
  const $ = el("section");
  (($.dataset.k = "relatives"),
    ($.tabIndex = -1),
    $.append(el("h3", "", "Qarindoshlar")));
  const S = el("div"),
    q = e.S.relHeaders,
    C = () => {
      ((S.textContent = ""),
        e.relatives.forEach((t, a) => {
          const n = el("div", "rel"),
            i = el("div", "head"),
            o = el("label", "f");
          o.append(el("span", "", q[0].replace("-", "")));
          const l = el("select"),
            s = [...SpravkaCore.RELATIONS];
          t.rel && !s.includes(t.rel) && s.unshift(t.rel);
          for (const t of s) {
            const a = el("option", "", e.S.relations[t] || t);
            ((a.value = t), l.append(a));
          }
          ((l.value = t.rel || s[0]),
            l.addEventListener("change", () => {
              t.rel = l.value;
            }),
            o.append(l));
          const r = el("button", "x", "×");
          ((r.type = "button"),
            r.setAttribute("aria-label", "Qarindoshni o'chirish"),
            r.addEventListener("click", () => {
              (e.relatives.splice(a, 1), C());
            }),
            i.append(o, r));
          const d = el("div", "grid2"),
            c = {};
          ["name", "birth", "work", "address"].forEach((e, a) =>
            d.append(
              (c[e] = field(
                q[a + 1],
                t[e],
                (a) => {
                  ((t[e] = a), ("work" !== e && "address" !== e) || m());
                },
                "work" === e || "address" === e,
              )),
            ),
          );
          const p = c.address.querySelector("textarea, input"),
            m = () => {
              const e = /вафот|vafot|марҳум|marhum/i.test(t.work || "");
              ((p.dataset.opt = e ? "1" : ""),
                (c.address.hidden = e && !String(t.address || "").trim()),
                e
                  ? p.classList.remove("need")
                  : p.dataset.mk &&
                    p.classList.toggle("need", !p.value.trim()));
            };
          (m(), n.append(i, d), S.append(n));
        }));
    };
  C();
  const E = el("button", "btn2", "+ Qarindosh qo'shish");
  return (
    (E.type = "button"),
    E.addEventListener("click", () => {
      (e.relatives.push({
        rel: SpravkaCore.RELATIONS[0],
        name: "",
        birth: "",
        work: "",
        address: "",
      }),
        C());
    }),
    $.append(S, E),
    a.append($),
    a
  );
}
