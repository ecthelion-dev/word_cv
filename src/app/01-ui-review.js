/**
 * 01-ui-review.js — Asosiy UI, fayllarni yuklash, Worker Pool, Statistika, Tekshiruv (Review) va ZIP/PDF/DOCX Eksport
 */
const drop = document.getElementById("drop"),
  input = document.getElementById("file"),
  list = document.getElementById("list"),
  flist = document.getElementById("flist"),
  VIEWS = {
    list: "vList",
    review: "vReview",
    fill: "vFill",
    lead: "vLead",
    check: "vCheck",
    excel: "vXl",
    dup: "vDup",
    bulk: "vBulk",
    coi: "vCoi",
    evid: "vEvid",
    sci: "vSci",
  };
(document.getElementById("xlSlot").append(document.getElementById("xl")),
  document.getElementById("bulkSlot").append(document.getElementById("bulk")),
  document.getElementById("coiSlot").append(document.getElementById("coi")),
  (document.getElementById("xlD").open = !0));
let curView = "list";
function emptyBox(e, t, a, n) {
  ((e.textContent = ""), (e.className = "nofiles"), (e.hidden = !1));
  const i = el("div", "gi");
  (i.append(el("b", "", t), el("span", "", a)), e.append(i));
  const o = el("div", "acts");
  for (const [e, t, a] of n || []) {
    const n = el("button", a || "btn2", e);
    ((n.type = "button"), (n.onclick = t), o.append(n));
  }
  e.append(o);
}
const NOFILE_TXT = {
  review:
    "Tekshiruv uchun avval ma'lumotnomalarni yuklang (Word, PDF yoki ZIP).",
  fill: "Bo'sh maydonlar jadvali ma'lumotnomalar yuklangach to'ladi.",
  dup: "Takrorlar ma'lumotnomalar yuklangach aniqlanadi.",
  bulk: "Ommaviy tuzatish yuklangan ma'lumotnomalarga qo'llanadi. Saqlangan qoidalaringiz pastda turibdi.",
  coi: "Qarindoshlarni solishtirish uchun avval ma'lumotnomalarni yuklang.",
  sci: "Ilmiy daraja va unvonlar ma'lumotnomalardan (va Excel'dan) olinadi — avval fayllarni yuklang.",
  evid: "Dalillar ma'lumotnomalardagi qarindoshlar va mehnat faoliyatidan yig'iladi — avval fayllarni yuklang.",
  lead: "Rahbarlar jadvali ma'lumotnomalar va Excel'dan tuziladi.",
};
function noFiles(e) {
  let t = document.getElementById("noFiles");
  if (
    (t || ((t = el("div")), (t.id = "noFiles")),
    items.length ||
      !NOFILE_TXT[e] ||
      ("sci" === e && xl.rows && xl.rows.length))
  )
    return void (t.hidden = !0);
  const a = document.getElementById(VIEWS[e]);
  ((a.querySelector(".vhead") || a.firstElementChild).after(t),
    "sci" !== e
      ? emptyBox(t, "Hali ma'lumotnoma yuklanmagan", NOFILE_TXT[e], [
          [
            "Fayllarni yuklash",
            () => {
              (showView("list"), input.click());
            },
            "btn",
          ],
          ["Ma'lumotnomalar sahifasi", () => showView("list"), "btn2"],
        ])
      : emptyBox(
          t,
          "Kadrlar bazasi Excel'ini yoki ma'lumotnomalarni yuklang",
          "Excel'da «Ilmiy darajasi» va «Ilmiy unvoni» ustunlari bo'lsa, ma'lumotnomalarsiz ham statistika chiqadi.",
          [
            ["Excel faylni yuklash", () => $("sciXlIn").click(), "btn"],
            [
              "Ma'lumotnomalarni yuklash",
              () => {
                (showView("list"), input.click());
              },
              "btn2",
            ],
          ],
        ));
}
function showView(e) {
  ((curView = e),
    document.body.classList.toggle("in-review", "review" === e),
    $("menuBtn").setAttribute("aria-expanded", "false"),
    document.querySelector(".side").classList.remove("open"),
    mbarSync());
  for (const [t, a] of Object.entries(VIEWS))
    document.getElementById(a).hidden = t !== e;
  if (
    (document.querySelectorAll(".nav button").forEach((t) => {
      t.dataset.view === e
        ? t.setAttribute("aria-current", "page")
        : t.removeAttribute("aria-current");
    }),
    "review" === e && !sel)
  ) {
    const e = firstToReview();
    e ? selectItem(e) : renderDetail();
  }
  ("fill" === e && renderFill(!0),
    "lead" === e && renderLead(!0),
    "check" === e && renderCheck(!0),
    "dup" === e && renderDups(),
    "excel" === e && ($("xlD").open = !0),
    "bulk" === e && ($("bulkD").open = !0),
    "evid" === e && renderEvid(!0),
    "sci" === e && ((sciPage = 0), renderSci()),
    "coi" === e && (($("coiD").open = !0), items.some((e) => e.P) && runCoi()),
    noFiles(e),
    window.scrollTo({ top: 0 }));
}
(document.querySelectorAll(".nav button").forEach((e) =>
  e.addEventListener("click", () => {
    "report" !== e.dataset.go ? showView(e.dataset.view) : openReport();
  }),
),
  document.getElementById("menuBtn").addEventListener("click", () => {
    const e = document.querySelector(".side"),
      t = !e.classList.contains("open");
    (e.classList.toggle("open", t),
      document
        .getElementById("menuBtn")
        .setAttribute("aria-expanded", String(t)));
  }),
  ["dragenter", "dragover"].forEach((e) =>
    drop.addEventListener(e, (e) => {
      (e.preventDefault(), drop.classList.add("over"));
    }),
  ),
  ["dragleave", "drop"].forEach((e) =>
    drop.addEventListener(e, (e) => {
      (e.preventDefault(), drop.classList.remove("over"));
    }),
  ),
  drop.addEventListener("drop", async (e) =>
    addFiles(await filesFromDrop(e.dataTransfer)),
  ),
  drop.addEventListener("keydown", (e) => {
    ("Enter" !== e.key && " " !== e.key) || (e.preventDefault(), input.click());
  }),
  input.addEventListener("change", () => {
    (handle(input.files), (input.value = ""));
  }),
  ["dragover", "drop"].forEach((e) =>
    window.addEventListener(e, (e) => e.preventDefault()),
  ));
let dragN = 0;
const hasFiles = (e) =>
  e.dataTransfer && [...(e.dataTransfer.types || [])].includes("Files");
function el(e, t, a) {
  const n = document.createElement(e);
  return (t && (n.className = t), void 0 !== a && (n.textContent = a), n);
}
function fact(e, t) {
  const a = el("span");
  return (a.append(e + ": ", Object.assign(el("b"), { textContent: t })), a);
}
(window.addEventListener("dragenter", (e) => {
  hasFiles(e) &&
    (dragN++,
    $("vList").classList.contains("empty-state") || ($("dropov").hidden = !1));
}),
  window.addEventListener("dragleave", () => {
    ((dragN = Math.max(0, dragN - 1)), dragN || ($("dropov").hidden = !0));
  }),
  window.addEventListener("drop", async (e) => {
    if (
      ((dragN = 0),
      ($("dropov").hidden = !0),
      drop.contains(e.target) || !hasFiles(e))
    )
      return;
    const t = await filesFromDrop(e.dataTransfer);
    t.length && (addFiles(t), "list" !== curView && showView("list"));
  }));
const items = [],
  queue = [];
let running = !1;
const scriptNow = () =>
    document.querySelector('input[name="script"]:checked').value,
  scriptIsLatin = () => ["lat", "new"].includes(scriptNow()),
  $ = (e) => document.getElementById(e);
if ("undefined" != typeof JSZip && !JSZip.prototype._tzFix) {
  const e = JSZip.prototype.generateAsync;
  ((JSZip.prototype.generateAsync = function (t, a) {
    for (const e of Object.values(this.files))
      e &&
        e.date &&
        !e._tz &&
        ((e.date = new Date(
          e.date.getTime() - 6e4 * e.date.getTimezoneOffset(),
        )),
        (e._tz = !0));
    return e.call(this, t, a);
  }),
    (JSZip.prototype._tzFix = !0));
}
let toastT;
function toast(e) {
  const t = $("toast");
  ((t.textContent = e), (t.hidden = !1), clearTimeout(toastT));
  const a = Math.min(7e3, Math.max(3e3, 55 * String(e).length)),
    n = () => {
      (clearTimeout(toastT),
        (toastT = setTimeout(() => {
          t.matches(":hover") ? n() : (t.hidden = !0);
        }, a)));
    };
  n();
}
let unsaved = !1;
function startReview() {
  const e = firstToReview();
  (e && selectItem(e), showView("review"));
}
function guideAct(e, t) {
  "review-serious" === e
    ? (setQ("serious"), startReview())
    : "review" === e
      ? startReview()
      : "zip" === e
        ? zipAll(t)
        : "dup" === e || "excel" === e || "fill" === e
          ? showView(e)
          : "xlconf" === e &&
            (showView("excel"),
            setTimeout(() => {
              const e = $("xlConf");
              e &&
                !e.hidden &&
                e.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50));
}
function setGuide(e, t, a, n, i, o, l) {
  $("guide").className = "guide g-" + e;
  const s = $("gNum");
  ((s.hidden = null == l),
    null != l && ((s.textContent = l), (s.className = "gnum " + e)),
    ($("gTitle").textContent = t),
    ($("gSub").textContent = a),
    ($("gBarW").hidden = null == n),
    null != n && ($("gBar").style.width = n + "%"));
  for (const [e, t] of [
    ["gPrimary", i],
    ["gSecondary", o],
  ]) {
    const a = $(e);
    ((a.hidden = !t), t && ((a.textContent = t[0]), (a.dataset.act = t[1])));
  }
}
(window.addEventListener("beforeunload", (e) => {
  unsaved &&
    items.some((e) => e.P) &&
    !store.safe() &&
    (e.preventDefault(), (e.returnValue = ""));
}),
  $("helpBtn").addEventListener("click", () => {
    const e = $("help");
    e.showModal ? e.showModal() : e.setAttribute("open", "");
  }),
  $("helpX").addEventListener("click", () => $("help").close()),
  $("help").addEventListener("click", (e) => {
    e.target === $("help") && $("help").close();
  }),
  $("gPrimary").addEventListener("click", () =>
    guideAct($("gPrimary").dataset.act, $("gPrimary")),
  ),
  $("gSecondary").addEventListener("click", () =>
    guideAct($("gSecondary").dataset.act, $("gSecondary")),
  ),
  document.addEventListener("keydown", (e) => {
    if ("review" === curView && !$("help").open)
      return (e.ctrlKey || e.metaKey) && "Enter" === e.key
        ? (e.preventDefault(),
          void ($("dApprove").disabled || $("dApprove").click()))
        : void (
            /^(INPUT|TEXTAREA|SELECT)$/.test(
              (e.target && e.target.tagName) || "",
            ) ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey ||
            ("ArrowRight" === e.key
              ? (e.preventDefault(), step(1))
              : "ArrowLeft" === e.key
                ? (e.preventDefault(), step(-1))
                : ("e" === e.key ||
                    "E" === e.key ||
                    "у" === e.key ||
                    "У" === e.key) &&
                  "edit" !== pMode &&
                  sel &&
                  sel.P &&
                  (e.preventDefault(), openEdit(null)))
          );
  }),
  $("pickDir").addEventListener("click", () => $("dir").click()),
  $("addBtn").addEventListener("click", () => input.click()),
  $("mAdd").addEventListener("click", () => input.click()),
  $("mZip").addEventListener("click", () => zipAll()),
  $("bulkBtn").addEventListener("click", () => {
    (showView("bulk"), setTimeout(() => $("bkFind").focus(), 100));
  }));
let blankN = 0;
async function photoFromFile(e) {
  const t = await createImageBitmap(e),
    a = 2.93 / 3.63;
  let n = t.width,
    i = t.height,
    o = 0,
    l = 0;
  n / i > a
    ? ((n = Math.round(i * a)), (o = Math.round((t.width - n) / 2)))
    : ((i = Math.round(n / a)), (l = Math.round((t.height - i) / 4)));
  const s = Math.min(700, i),
    r = Math.round(s * a),
    d = document.createElement("canvas");
  ((d.width = r),
    (d.height = s),
    d.getContext("2d").drawImage(t, o, l, n, i, 0, 0, r, s));
  const c = await new Promise((e) => d.toBlob(e, "image/jpeg", 0.9));
  return {
    bytes: new Uint8Array(await c.arrayBuffer()),
    ext: "jpeg",
    crop: null,
    cx: null,
    cy: null,
  };
}
($("newBlank").addEventListener("click", async () => {
  store.pending && (await store.restore());
  const e = scriptIsLatin(),
    t = SpravkaCore.blankData(e);
  ((t.relatives = ["Отаси", "Онаси"].map((e) => ({
    rel: e,
    name: "",
    birth: "",
    work: "",
    address: "",
  }))),
    (t.src = null),
    (t.fixes = []));
  const a = "Yangi ma'lumotnoma" + (++blankN > 1 ? " " + blankN : ""),
    n = {
      file: { name: a + ".docx" },
      name: a,
      state: "warn",
      P: t,
      warnings: [
        "Noldan yaratilgan — barcha maydonlarni to'ldiring va rasm qo'shing.",
      ],
      reasons: [],
      fromBlank: !0,
    };
  ((n.reasons = reviewReasons(t)),
    (n.li = el("tr", "item")),
    (n.fi = el("li")),
    items.unshift(n),
    list.prepend(n.li),
    flist.prepend(n.fi),
    (unsaved = !0),
    renderCard(n),
    updateStats(),
    selectItem(n),
    showView("review"),
    openEdit("name"));
}),
  $("dir").addEventListener("change", () => {
    (addFiles([...$("dir").files]), ($("dir").value = ""));
  }));
const rf = () =>
  (document.querySelector('input[name="rf"]:checked') || {}).value || "all";
function itemVisible(e, t) {
  const a = rf(),
    n = sevOf(e);
  if ("warn" === a && "serious" !== n && "minor" !== n) return !1;
  if ("serious" === a && "serious" !== n) return !1;
  if ("minor" === a && "minor" !== n) return !1;
  if ("other" === a && "err" !== n && !e.dup) return !1;
  if ("sel" === a && !e.selected) return !1;
  if ("err" === a && "err" !== n) return !1;
  if ("ok" === a && "ok" !== n) return !1;
  if ("gone" === a && "gone" !== n) return !1;
  const i = $("fFolder").value;
  if (i && (e.folder || "") !== i && !(e.folder || "").startsWith(i + "/"))
    return !1;
  const o = $("fDept").value;
  if (o && deptOf(e) !== o) return !1;
  if (!("xl" !== a || (e.xlChanges && e.xlChanges.length))) return !1;
  if ("dup" === a && !e.dup) return !1;
  if (e.excluded && ("warn" === a || "ok" === a || "err" === a)) return !1;
  if (!t) return !0;
  const l = ((e.P && e.P.name) || "") + " " + e.name + " " + (e.folder || "");
  e.hayKey !== l && ((e.hayKey = l), (e.hay = SpravkaCore.norm(l)));
  const s = e.hay;
  return t.every((e) => s.includes(e));
}
var listPage = 0,
  PAGE_N = 20;
function applyFilter(e) {
  e && (listPage = 0);
  const t = $("rSearch")
    .value.split(/\s+/)
    .map((e) => SpravkaCore.norm(e))
    .filter(Boolean);
  syncFnow();
  const a = items.filter((e) => e.selected).length,
    n = a ? ` · belgilangan: ${a}` : "",
    aSelBtn = $("apprSel");
  if (aSelBtn) {
    const unappr = items.filter((e) => e.selected && e.P && !e.excluded && !e.approved).length;
    aSelBtn.hidden = !a;
    aSelBtn.textContent = unappr ? `Belgilanganlarni tasdiqlash (${unappr} ta)` : `Belgilanganlar tasdiqlangan ✓`;
    aSelBtn.disabled = !unappr;
  }
  const i = t.length || "all" !== rf() || $("fFolder").value || $("fDept").value,
    o = [...list.children],
    l = [];
  for (const e of o) {
    const a = e._it;
    a && (!i || itemVisible(a, t) ? l.push(e) : (e.hidden = !0));
  }
  const s = Math.max(1, Math.ceil(l.length / PAGE_N));
  listPage > s - 1 && (listPage = s - 1);
  const r = listPage * PAGE_N,
    d = r + PAGE_N;
  l.forEach((e, t) => {
    const a = t < r || t >= d;
    e.hidden !== a && (e.hidden = a);
  });
  const c = l.length ? `${r + 1}–${Math.min(d, l.length)}` : "0";
  (($("rInfo").textContent =
    (l.length
      ? i
        ? `${items.length} tadan ${l.length} tasi mos · ${c} ko'rsatilmoqda`
        : `Jami ${items.length} ta · ${c} ko'rsatilmoqda`
      : items.length
        ? "Bu shartga mos ma'lumotnoma yo'q."
        : "") + n),
    renderPager(s, l.length));
}
function pagerInto(e, t, a, n) {
  if (((e.textContent = ""), (e.hidden = t <= 1), t <= 1)) return;
  const i = (t, i, o = {}) => {
    const l = el("button", "pg" + (i !== a || o.nav ? "" : " on"), t);
    ((l.type = "button"),
      o.aria && l.setAttribute("aria-label", o.aria),
      i !== a || o.nav || l.setAttribute("aria-current", "page"),
      (l.disabled = !!o.dis),
      (l.onclick = () => n(i)),
      e.append(l));
  };
  i("‹", a - 1, { nav: !0, dis: 0 === a, aria: "Oldingi sahifa" });
  const o = new Set([0, t - 1, a - 1, a, a + 1]);
  (a <= 2 && [1, 2, 3].forEach((e) => o.add(e)),
    a >= t - 3 && [t - 2, t - 3, t - 4].forEach((e) => o.add(e)));
  let l = -1;
  for (let a = 0; a < t; a++)
    o.has(a) &&
      (a - l > 1 && e.append(el("span", "gap", "…")),
      i(String(a + 1), a, { aria: `${a + 1}-sahifa` }),
      (l = a));
  i("›", a + 1, { nav: !0, dis: a === t - 1, aria: "Keyingi sahifa" });
}
function renderPager(e, t) {
  const a = $("pager");
  if (
    ((a.textContent = ""),
    (a.hidden = t <= PAGE_N),
    ($("pSize").closest("label").hidden = t <= 20),
    (a.parentElement.hidden = t <= 20),
    a.hidden)
  )
    return;
  const n = (e, t, n = {}) => {
    const i = el("button", "pg" + (t === listPage ? " on" : ""), e);
    ((i.type = "button"),
      n.aria && i.setAttribute("aria-label", n.aria),
      t !== listPage || n.nav || i.setAttribute("aria-current", "page"),
      (i.disabled = n.dis || !1),
      (i.onclick = () => {
        ((listPage = t), applyFilter());
        const e = $("rFilter").closest(".card");
        e && e.scrollIntoView({ block: "start", behavior: "smooth" });
      }),
      a.append(i));
  };
  n("‹", listPage - 1, {
    nav: !0,
    dis: 0 === listPage,
    aria: "Oldingi sahifa",
  });
  const i = new Set([0, e - 1, listPage - 1, listPage, listPage + 1]);
  (listPage <= 2 && [1, 2, 3].forEach((e) => i.add(e)),
    listPage >= e - 3 && [e - 2, e - 3, e - 4].forEach((e) => i.add(e)));
  let o = -1;
  for (let t = 0; t < e; t++)
    i.has(t) &&
      (t - o > 1 && a.append(el("span", "gap", "…")),
      n(String(t + 1), t, { aria: `${t + 1}-sahifa` }),
      (o = t));
  n("›", listPage + 1, {
    nav: !0,
    dis: listPage >= e - 1,
    aria: "Keyingi sahifa",
  });
}
let filterT;
function syncKpi() {
  const e = rf();
  document
    .querySelectorAll("#kpis .kpi")
    .forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.f === e)));
}
($("rSearch").addEventListener("input", () => {
  (clearTimeout(filterT), (filterT = setTimeout(() => applyFilter(!0), 120)));
}),
  $("rFilter").addEventListener("change", () => {
    (syncKpi(), applyFilter(!0));
  }),
  $("kpis").addEventListener("click", (e) => {
    const t = e.target.closest(".kpi");
    if (!t) return;
    if ("nodoc" === t.dataset.f) {
      "undefined" != typeof ck && (ck.tab = "miss");
      showView("check");
      return;
    }
    const a =
      rf() === t.dataset.f && "all" !== t.dataset.f ? "all" : t.dataset.f;
    listPage = 0;
    const n = document.querySelector('input[name="rf"][value="' + a + '"]');
    (n && (n.checked = !0), syncKpi(), applyFilter());
    const i = $("rFilter").closest(".card");
    i && i.scrollIntoView({ behavior: "smooth", block: "start" });
  }),
  $("nextWarn").addEventListener("click", startReview),
  $("rBack").addEventListener("click", () => showView("list")),
  $("qSearch").addEventListener("input", qFilter),
  $("qTog").addEventListener("click", () => {
    const e = document.querySelector(".queue"),
      t = !e.classList.contains("qopen");
    (e.classList.toggle("qopen", t),
      $("qTog").setAttribute("aria-expanded", String(t)));
  }),
  $("flist").addEventListener("click", (e) => {
    e.target.closest("li") &&
      matchMedia("(max-width:700px)").matches &&
      (document.querySelector(".queue").classList.remove("qopen"),
      $("qTog").setAttribute("aria-expanded", "false"));
  }));
let clearArmed = null,
  photoUrls = new WeakMap();
const activePhotoUrls = new Set();
function photoUrl(e) {
  if (!e || !e.bytes) return "";
  let t = photoUrls.get(e);
  if (t) return t;
  try {
    return (
      (t = URL.createObjectURL(
        new Blob([e.bytes], {
          type: "image/" + ("jpg" === e.ext ? "jpeg" : e.ext || "jpeg"),
        }),
      )),
      photoUrls.set(e, t),
      activePhotoUrls.add(t),
      t
    );
  } catch (e) {
    return "";
  }
}
function revokePhotoUrls() {
  for (const e of activePhotoUrls)
    try {
      URL.revokeObjectURL(e);
    } catch (e) {}
  (activePhotoUrls.clear(), (photoUrls = new WeakMap()));
}
function wipeList() {
  (revokePhotoUrls(),
    (items.length = 0),
    (queue.length = 0),
    (draft = null),
    (unsaved = !1),
    (list.textContent = ""),
    (flist.textContent = ""),
    ($("rSearch").value = ""),
    (sel = null),
    (dupSig = ""),
    renderDetail(),
    updateStats(),
    addedKeys.clear(),
    store.clear());
  try {
    ((undoStack.length = 0), syncUndo());
  } catch (e) {}
}
async function filesFromDrop(e) {
  const t = [...(e.items || [])]
    .map((e) => e.webkitGetAsEntry && e.webkitGetAsEntry())
    .filter(Boolean);
  if (!t.length) return [...e.files];
  const a = [],
    n = async (e) => {
      if (e.isFile) {
        const t = await new Promise((t, a) => e.file(t, a));
        ((t.relPath = e.fullPath.replace(/^\//, "")), a.push(t));
      } else if (e.isDirectory) {
        const t = e.createReader();
        let a;
        do {
          a = await new Promise((e, a) => t.readEntries(e, a));
          for (const e of a) await n(e);
        } while (a.length);
      }
    };
  for (const e of t) await n(e);
  return a;
}
async function handle(e) {
  addFiles([...e]);
}
($("clearAll").addEventListener("click", () => {
  const e = $("clearAll");
  if (!clearArmed)
    return (
      (e.textContent = `Ha, ${items.length} tasini o'chirish`),
      e.classList.add("danger"),
      void (clearArmed = setTimeout(() => {
        ((clearArmed = null),
          (e.textContent = "Ro'yxatni tozalash"),
          e.classList.remove("danger"));
      }, 4e3))
    );
  (clearTimeout(clearArmed),
    (clearArmed = null),
    (e.textContent = "Ro'yxatni tozalash"),
    e.classList.remove("danger"),
    wipeList(),
    toast("Ro'yxat va saqlangan nusxa o'chirildi"));
}),
  $("zipAll").addEventListener("click", (e) => zipAll(e.currentTarget)),
  $("csvAll").addEventListener("click", async () => {
    const e = $("csvAll");
    e.disabled = !0;
    try {
      await save(
        e,
        $("bNote"),
        "hisobot.xlsx",
        await xlsxBuild([
          {
            name: "Hisobot",
            rows: reportCsv(),
            head: 1,
            freeze: !0,
            filter: !0,
            widths: [5, 24, 30, 28, 20, 40, 26, 14, 50],
          },
        ]),
      );
    } finally {
      e.disabled = !1;
    }
  }));
const zipName = (e) => {
  const t = e instanceof Uint8Array ? e : new Uint8Array(e);
  try {
    return new TextDecoder("utf-8", { fatal: !0 }).decode(t);
  } catch (e) {
    try {
      return new TextDecoder("ibm866").decode(t);
    } catch (e) {
      return new TextDecoder("windows-1251").decode(t);
    }
  }
};
async function inflateRaw(e) {
  const t = new Response(
    new Blob([e]).stream().pipeThrough(new DecompressionStream("deflate-raw")),
  );
  return new Uint8Array(await t.arrayBuffer());
}
async function zipSalvage(e) {
  const t = new Uint8Array(e),
    a = new DataView(e),
    n = [];
  let i = 0;
  const o = (e, n) => e + 4 <= t.length && a.getUint32(e, !0) === n,
    l = (e) => {
      for (let a = e; a + 4 <= t.length; a++)
        if (
          80 === t[a] &&
          75 === t[a + 1] &&
          ((3 === t[a + 2] && 4 === t[a + 3]) ||
            (1 === t[a + 2] && 2 === t[a + 3]))
        )
          return a;
      return t.length;
    };
  let s = o(0, 67324752) ? 0 : l(0),
    r = 0;
  for (; s + 30 <= t.length && r++ < 2e5 && o(s, 67324752);) {
    const e = a.getUint16(s + 6, !0),
      r = a.getUint16(s + 8, !0),
      d = a.getUint32(s + 18, !0),
      c = a.getUint16(s + 26, !0),
      p = s + 30 + c + a.getUint16(s + 28, !0),
      m = t.subarray(s + 30, s + 30 + c),
      u = 2048 & e ? new TextDecoder().decode(m) : zipName(m);
    let h;
    if (8 & e || 4294967295 === d) {
      const e = l(p);
      ((s = e),
        (h = o(e - 16, 134695760) ? [e - 16] : [e - 12, e - 16, e - 24]));
    } else if (((h = [p + d]), (s = p + d), h[0] > t.length)) {
      i++;
      break;
    }
    if (/\/$/.test(u)) continue;
    if (1 & e) {
      i++;
      continue;
    }
    let f = null;
    for (const e of h) {
      if (e < p || e > t.length) continue;
      const a = t.subarray(p, e);
      try {
        f = 0 === r ? a.slice() : 8 === r ? await inflateRaw(a) : null;
      } catch (e) {
        f = null;
      }
      if (f) break;
    }
    f ? n.push({ name: u, bytes: f }) : i++;
  }
  return { out: n, bad: i };
}
function zipWhy(e, t) {
  const a = String.fromCharCode(...t.subarray(0, 6));
  if (/^Rar!/.test(a))
    return "Bu RAR arxiv, ZIP emas. WinRAR'da ochib, «ZIP» formatida qayta saqlang.";
  if (55 === t[0] && 122 === t[1] && 188 === t[2])
    return "Bu 7z arxiv, ZIP emas. 7-Zip'da ochib, «ZIP» formatida qayta saqlang.";
  if (!t.length) return "Fayl bo'sh (0 bayt) — yuklab olish tugallanmagan.";
  const n = String((e && e.message) || e || "");
  return /encrypt/i.test(n)
    ? "ZIP parol bilan himoyalangan — parolsiz qayta arxivlang."
    : /end of central directory|end of data|corrupt/i.test(n)
      ? "ZIP fayl to'liq emas yoki shikastlangan (ko'pincha yuklab olish oxirigacha bormaganda bo'ladi). Faylni qayta yuklab oling yoki arxivni qaytadan yarating."
      : "ZIP arxivni ochib bo'lmadi: " + n.slice(0, 160);
}
var addedKeys = new Set(),
  goneSkip = 0,
  phdSkip = 0;
const NONSTAFF_DIR_RE =
    /^\s*(?:\d+\s*[.)]\s*)?(?:phd|dsc|(?:таянч\s+)?докторант|(?:tayanch\s+)?doktorant|мустақил\s+изланувчи|mustaqil\s+izlanuvchi|соискател)/i,
  NONSTAFF_FILE_RE =
    /(?:фототаблица|fototablitsa|раҳбарлар(?:и)?[_\s]+тўғрисида|rahbarlar(?:i)?[_\s]+to[‘'`ʻ’]?g[‘'`ʻ’]?risida|ходимлар[_\s]+рўйхати|xodimlar[_\s]+ro[‘'`ʻ’]?yxati|штат[_\s]+жадвали|shtat[_\s]+jadvali)/i,
  isSummaryTableDoc = (e) =>
    !!e &&
    (NONSTAFF_FILE_RE.test(e.name || "") ||
      /(?:раҳбарлари|ходимлари)\s+тўғрисида|фототаблица|fototablitsa/i.test(
        e.name || "",
      ) ||
      (!e.work.length &&
        !e.relatives.length &&
        String((e.fields && e.fields.grad_year) || "").length > 600));
async function addFiles(e, t) {
  store.pending && void 0 === t && (await store.restore());
  const a = void 0 === t,
    n = goneSkip,
    i = phdSkip;
  for (const n of e) {
    const e = n.name || "";
    if (/^~\$|^\./.test(e) || NONSTAFF_FILE_RE.test(e)) continue;
    const i = [
      t || "",
      n.relPath || n.webkitRelativePath || "",
      e.replace(/\.zip$/i, ""),
    ]
      .join("/")
      .split("/")
      .slice(0, -1)
      .concat(/\.zip$/i.test(e) ? [e.replace(/\.zip$/i, "")] : []);
    if (i.some((e) => GONE_RE.test(e))) {
      goneSkip++;
      continue;
    }
    if (i.some((e) => NONSTAFF_DIR_RE.test(e))) {
      phdSkip++;
      continue;
    }
    if (void 0 === t && null != n.size) {
      const t = [
        n.relPath || n.webkitRelativePath || e,
        n.size,
        n.lastModified || 0,
      ].join("|");
      if (addedKeys.has(t)) {
        toast(`«${e}» allaqachon qo'shilgan — qayta qo'shilmadi`);
        continue;
      }
      addedKeys.add(t);
    }
    const o = [
      t,
      (n.relPath || n.webkitRelativePath || "")
        .split("/")
        .slice(0, -1)
        .join("/"),
    ]
      .filter(Boolean)
      .join("/");
    if (/\.zip$/i.test(e)) {
      let i = null;
      try {
        i = await n.arrayBuffer();
      } catch (t) {
        addItemError(
          e,
          "ZIP faylni o'qib bo'lmadi (fayl ko'chirilgan yoki juda katta): " +
            ((t && t.message) || t),
        );
        continue;
      }
      const l = [o, void 0 !== t ? e.replace(/\.zip$/i, "") : ""]
          .filter(Boolean)
          .join("/"),
        s = (e) => {
          const t = e.split("/"),
            a = t.pop();
          return /(?:^|\/)__MACOSX\//.test(e) ||
            /^~\$|^\./.test(a) ||
            !/\.(?:docx?|pdf|zip)$/i.test(a)
            ? null
            : [t, a];
        };
      try {
        const t = await JSZip.loadAsync(i, { decodeFileName: zipName });
        if (a && t.file(BKP_NAME)) {
          await backupImport(t);
          continue;
        }
        const n = [];
        for (const e of Object.values(t.files)) {
          if (e.dir) continue;
          const t = s(e.name);
          if (!t) continue;
          const a = new File([await e.async("blob")], t[1]);
          ((a.relPath = t[0].concat(t[1]).join("/")), n.push(a));
        }
        (await addFiles(n, l),
          n.length ||
            addItemError(e, "ZIP ichida Word yoki PDF fayl topilmadi."));
      } catch (t) {
        let a = { out: [], bad: 0 };
        try {
          a = await zipSalvage(i);
        } catch (e) {}
        const n = [];
        for (const e of a.out) {
          const t = s(e.name);
          if (!t) continue;
          const a = new File([e.bytes], t[1]);
          ((a.relPath = t[0].concat(t[1]).join("/")), n.push(a));
        }
        n.length
          ? (await addFiles(n, l),
            addItemError(
              e,
              `ZIP shikastlangan, lekin ${n.length} ta fayl tiklandi va ro'yxatga qo'shildi${a.bad ? `; ${a.bad} tasini tiklab bo'lmadi` : ""}. To'liq ro'yxat uchun arxivni qayta yuklab oling.`,
            ))
          : addItemError(e, zipWhy(t, new Uint8Array(i)));
      }
      continue;
    }
    if (!/\.(?:docx?|pdf)$/i.test(e)) continue;
    const l = {
      file: n,
      name: e,
      folder: o,
      state: "queue",
      P: null,
      warnings: [],
      reasons: [],
    };
    ((l.li = el("tr", "item")),
      (l.fi = el("li")),
      items.push(l),
      list.append(l.li),
      flist.append(l.fi),
      resetCard(l),
      queue.push(l));
  }
  (a &&
    (phdSkip > i || goneSkip > n) &&
    (toast(
      [
        goneSkip > n ? `«Ishdan ketganlar» papkasidan ${goneSkip - n} ta` : "",
        phdSkip > i ? `«PhD» papkasidan ${phdSkip - i} ta` : "",
      ]
        .filter(Boolean)
        .join(", ") + " fayl qo'shilmadi — ular kerak emas",
    ),
    (goneSkip = 0),
    (phdSkip = 0)),
    updateStats(),
    pump());
}
function addItemError(e, t) {
  const a = {
    file: null,
    name: e,
    state: "err",
    P: null,
    warnings: [],
    reasons: [t],
  };
  ((a.li = el("tr", "item")),
    (a.fi = el("li")),
    items.push(a),
    list.append(a.li),
    flist.append(a.fi),
    renderCard(a),
    updateStats());
}
function resetCard(e) {
  renderCard(e);
}
function isTechDept(it, p) {
  const norm = (s) => (s ? String(s).toLowerCase().replace(/['‘’`ʻ]/g, "'") : "");
  const hay = [];
  if (it) {
    if (it.folder) hay.push(norm(it.folder));
    if (it.name) hay.push(norm(it.name));
    if (typeof deptOf === "function") {
      try {
        const d = deptOf(it);
        if (d) hay.push(norm(d));
      } catch (err) {}
    }
    if (it.dept) hay.push(norm(it.dept));
    if (it.xlRow != null && typeof xl !== "undefined" && xl && xl.rows && xl.rows[it.xlRow]) {
      const r = xl.rows[it.xlRow];
      if (xl.map) {
        if (xl.map.dept && r[xl.map.dept]) hay.push(norm(r[xl.map.dept]));
        if (xl.map.position && r[xl.map.position]) hay.push(norm(r[xl.map.position]));
      }
    }
  }
  const P = p || (it && it.P);
  if (P) {
    if (P.position) hay.push(norm(P.position));
    if (P.since) hay.push(norm(P.since));
  }
  const combined = hay.join(" ");
  if (!combined) return false;
  return (
    /техник\s+фойдаланиш|texnik\s+foydalan/i.test(combined) ||
    /х[ўу]жалик\s+б[ўу]лим|xo'?jalik\s+bo'?lim/i.test(combined)
  );
}
function xlBlank(e, t) {
  if (!e) return !1;
  const isEdu = "grad_year" === t || "specialty" === t || "education" === t;
  if (isEdu && isTechDept(e, e.P)) {
    return !0;
  }
  if (e.xlFuzzy || null == e.xlRow || !xl.rows || !xl.map) return !1;
  const a = xl.rows[e.xlRow];
  if (!a) return !1;
  const n = (
    "grad_year" === t ? ["grad_year", "grad_years", "otm"] : [t]
  ).filter((e) => void 0 !== xl.map[e]);
  return (
    !!n.length &&
    n.every((e) => {
      const t = String(a[xl.map[e]] || "").trim();
      return !t || /^[-–—.\s]+$/.test(t);
    })
  );
}
function reviewReasons(e, t) {
  const a = [];
  (void 0 === t && (t = items.find((t) => t.P === e)),
    e.name || a.push("F.I.Sh. topilmadi"));
  const isTech = isTechDept(t, e);
  const n = [
    "birth_date",
    "birth_place",
    "nationality",
    "education",
    "grad_year",
    "specialty",
  ]
    .filter((a) => {
      if (e.fields[a]) return false;
      if (isTech && (a === "grad_year" || a === "specialty" || a === "education")) {
        return false;
      }
      return !xlBlank(t, a);
    })
    .map((t) => e.S.labels[t]);
  (n.length && a.push("Bo‘sh: " + n.join(", ")),
    e.since || e.position || a.push("Lavozim satri yo‘q"),
    e.work.length || a.push("Mehnat faoliyati yo‘q"),
    e.relatives.length || a.push("Qarindoshlar jadvali yo‘q"),
    e.photo || a.push("Rasm yo‘q"),
    e.ocr && a.push("Skaner PDF — matn avtomatik tanilgan"));
  try {
    a.push(...dateIssues(e));
  } catch (e) {}
  return a;
}
function fixDateTypos(t) {
  if (!t) return t;
  if (typeof SpravkaCore !== "undefined" && typeof SpravkaCore.fixDateTypos === "function") {
    return SpravkaCore.fixDateTypos(t);
  }
  return String(t)
    .replace(/(?<![№#/\dA-Za-zА-Яа-яЁёЎўҚқҒғҲҳ])(?<![A-Za-zА-Яа-яЁёЎўҚқҒғҲҳ]-)(?:29|28)([0-2]\d|30)(?!\d)/g, "20$1")
    .replace(/(?<![№#/\dA-Za-zА-Яа-яЁёЎўҚқҒғҲҳ-])10([789]\d)(?=\s*(?:[-–—]\s*(?:\d{4}|й|y|ҳ|h)|й|y|$))/gi, "19$1");
}
const STUDY_RE =
  /талаба|магистр|магистратура|докторант|докторантура|аспирант|аспирантура|изланувчи|тадқиқотчи|стажёр|стажер|ўқувчи|тингловчи|ўриндош|ўриндошлик|ординатор|ординатура|резидент|резидентура|интерн|интернатура|соатбай|ставка|talaba|magistr|magistratura|doktorant|doktorantura|aspirant|aspirantura|izlanuvchi|tadqiqotchi|stajyor|stajer|o['‘’`ʻ]quvchi|tinglovchi|o['‘’`ʻ]rindosh|o['‘’`ʻ]rindoshlik|soatbay|stavka|студент|совмест|ҳарбий хизмат|harbiy xizmat|срочн/i;
function dateIssues(e) {
  const t = [],
    a = new Date().getFullYear(),
    n = [];
  if (e && e.work) {
    for (let idx = 0; idx < e.work.length; idx++) {
      const orig = e.work[idx];
      const fixed = fixDateTypos(orig);
      if (fixed !== orig) {
        e.work[idx] = fixed;
        if (e.fixes) e.fixes.push([orig, fixed]);
      }
    }
  }
  if (e && e.since) {
    const sFixed = fixDateTypos(e.since);
    if (sFixed !== e.since) {
      if (e.fixes) e.fixes.push([e.since, sFixed]);
      e.since = sFixed;
    }
  }
  if (e && e.fields) {
    if (e.fields.grad_year) {
      const gFixed = fixDateTypos(e.fields.grad_year);
      if (gFixed !== e.fields.grad_year) {
        if (e.fixes) e.fixes.push([e.fields.grad_year, gFixed]);
        e.fields.grad_year = gFixed;
      }
    }
    if (e.fields.birth_date) {
      const bFixed = fixDateTypos(e.fields.birth_date);
      if (bFixed !== e.fields.birth_date) {
        if (e.fixes) e.fixes.push([e.fields.birth_date, bFixed]);
        e.fields.birth_date = bFixed;
      }
    }
  }
  for (const t of e.work || []) {
    const m =
      /^\s*(\d{4})\s*(?:-\s*(\d{4}))?\s*(?:йй\.|yy\.|й\.|y\.|-йил\.|-yil\.|йил|yil)?\s*(ҳ\.?\s*в\.?|h\.?\s*v\.?)?/i.exec(
        t,
      );
    if (!m) continue;
    const i = +m[1],
      o = m[2] ? +m[2] : m[3] ? Math.max(a, i) : i,
      l = t.replace(WORK_PFX, "$2");
    n.push({
      a: i,
      b: o,
      open: !!m[3] && !m[2],
      study: STUDY_RE.test(l),
      w: t,
    });
  }
  const i = (e) =>
    e.a === e.b ? String(e.a) : `${e.a}–${e.open ? "h.v." : e.b}`;
  for (const e of n)
    (e.b < e.a &&
      t.push(`Sana: «${e.a}-${e.b}» — tugash yili boshlanishidan oldin`),
      (e.a > a || (!e.open && e.b > a)) &&
        t.push(`Sana: ${i(e)} — kelajakdagi yil`),
      e.a < 1940 && t.push(`Sana: ${e.a} — yil noto‘g‘ri ko‘rinadi`));
  for (let e = 1; e < n.length; e++) {
    const a = n[e - 1],
      o = n[e];
    const isParallel =
      a.study ||
      o.study ||
      a.a === o.a ||
      (o.a >= a.a && o.b <= a.b) ||
      (a.a >= o.a && a.b <= o.b);
    if (o.a < a.a) {
      if (!isParallel) {
        t.push(
          `Sana: tartib buzilgan — ${i(o)} qatori ${i(a)} dan keyin yozilgan`,
        );
      }
    } else {
      if (!(!a.open || o.open || a.study || o.study)) {
        t.push(
          `Sana: ${i(a)} (hozirgacha) dan keyin yana ${i(o)} qatori bor`,
        );
      }
      if (!a.open && a.b - o.a >= 2 && !isParallel) {
        t.push(
          `Sana: ${i(a)} va ${i(o)} bir-birini ${a.b - o.a} yil kesib o‘tadi`,
        );
      }
    }
  }
  const o = /(\d{4})/.exec(e.since || ""),
    l =
      n.filter((e) => e.open && !e.study).pop() ||
      n.filter((e) => e.open).pop() ||
      n[n.length - 1];
  o &&
    l &&
    +o[1] !== l.a &&
    t.push(
      `Sana: tepadagi lavozim ${o[1]}-yildan, mehnat faoliyatida esa ${l.a}-yildan — qaysi biri to‘g‘ri?`,
    );
  const s = /(\d{4})/.exec((e.fields && e.fields.birth_date) || "");
  if (s && n.length) {
    const e = +s[1],
      i = Math.min(...n.map((e) => e.a));
    (e > 1900 &&
      i - e < 14 &&
      t.push(
        `Sana: ${i}-yilda ishga kirgan — o‘shanda ${i - e} yoshda bo‘lgan (tug‘ilgan yili ${e})`,
      ),
      e > a - 14 && t.push(`Sana: tug‘ilgan yili ${e} — noto‘g‘ri ko‘rinadi`));
  }
  return [...new Set(t)].slice(0, 6);
}
let pdfJsReady = null;
function configurePdfJs() {
  const api = window.pdfjsLib || window["pdfjs-dist/build/pdf"];
  if (!api) throw new Error("pdf.js topilmadi");
  return PdfEngine.configure(api, document.baseURI);
}
function loadPdfJs() {
  if (window.pdfjsLib || window["pdfjs-dist/build/pdf"])
    return Promise.resolve(configurePdfJs());
  if (pdfJsReady) return pdfJsReady;
  const load = (id, url) =>
    new Promise((resolve, reject) => {
      const inline = document.getElementById(id);
      if (inline && inline.textContent.trim().length > 1e3) {
        const script = document.createElement("script");
        ((script.textContent = inline.textContent),
          document.head.append(script));
        return resolve();
      }
      const script = document.createElement("script");
      ((script.src = url),
        (script.onload = resolve),
        (script.onerror = () =>
          reject(
            new Error(
              "PDF.js kutubxonasini yuklab bo'lmadi. Internet yoki vendor/pdf.min.js faylini tekshiring.",
            ),
          )),
        document.head.append(script));
    });
  return (
    (pdfJsReady = load(
      "pdfjsLibSrc",
      new URL("vendor/pdf.min.js", document.baseURI).href,
    )
      .then(configurePdfJs)
      .catch((error) => {
        pdfJsReady = null;
        throw error;
      })),
    pdfJsReady
  );
}
const PDFGEN_SRC = {
  lib: "vendor/pdf-lib.min.js",
  fk: "vendor/fontkit.umd.min.js",
  r: "fonts/tinos-400.ttf",
  b: "fonts/tinos-700.ttf",
};
let pdfGenReady = null;
function loadPdfGen() {
  if (pdfGenReady) return pdfGenReady;
  const e = (e, t, a) =>
      new Promise((n, i) => {
        if (window[a]) return void n();
        const o = document.createElement("script"),
          l = document.getElementById(e);
        if (l && l.textContent.trim().length > 1e3)
          return (
            (o.textContent = l.textContent),
            document.head.append(o),
            void n()
          );
        ((o.src = t),
          (o.onload = n),
          (o.onerror = () =>
            i(new Error("PDF yaratish kutubxonasini yuklab bo'lmadi."))),
          document.head.append(o));
      }),
    t = async (e, t) => {
      const a = document.getElementById(e),
        n = a ? a.textContent.trim() : "";
      if (n.length > 1e3) {
        const e = atob(n),
          t = new Uint8Array(e.length);
        for (let a = 0; a < e.length; a++) t[a] = e.charCodeAt(a);
        return t;
      }
      const i = await fetch(t);
      if (!i.ok) throw new Error("PDF shriftini yuklab bo'lmadi.");
      return new Uint8Array(await i.arrayBuffer());
    };
  return (
    (pdfGenReady = Promise.all([
      e("pdflibSrc", PDFGEN_SRC.lib, "PDFLib"),
      e("fontkitSrc", PDFGEN_SRC.fk, "fontkit"),
      t("tinosR", PDFGEN_SRC.r),
      t("tinosB", PDFGEN_SRC.b),
    ])
      .then(([, , e, t]) => ({
        PDFLib: window.PDFLib,
        fontkit: window.fontkit,
        fonts: { r: e, b: t },
        image: pdfPhoto,
      }))
      .catch((e) => {
        throw ((pdfGenReady = null), e);
      })),
    pdfGenReady
  );
}
async function pdfPhoto(e) {
  if (!e || !e.bytes) return null;
  const t = String(e.ext || "").toLowerCase();
  if ("jpg" === t || "jpeg" === t) return { bytes: e.bytes, type: "jpg" };
  try {
    const t = await createImageBitmap(new Blob([e.bytes])),
      a = document.createElement("canvas");
    ((a.width = t.width),
      (a.height = t.height),
      a.getContext("2d").drawImage(t, 0, 0));
    const n = await new Promise((e) => a.toBlob(e, "image/png"));
    return n
      ? { bytes: new Uint8Array(await n.arrayBuffer()), type: "png" }
      : null;
  } catch (a) {
    return "png" === t ? { bytes: e.bytes, type: "png" } : null;
  }
}
function mapOutputText(data, convert) {
  const mapStrings = (value) => {
    if (typeof value === "string") return convert(value);
    if (Array.isArray(value)) return value.map(mapStrings);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, mapStrings(item)]),
      );
    }
    return value;
  };
  const next = {
    ...data,
    S: mapStrings(data.S || {}),
    fields: { ...(data.fields || {}) },
    work: [...(data.work || [])],
    relatives: (data.relatives || []).map((item) => ({ ...item })),
  };
  const cv = (value) => (typeof value === "string" ? convert(value) : value);
  for (const key of ["name", "since", "position", "relHeadingName"]) {
    next[key] = cv(next[key]);
  }
  for (const key of Object.keys(next.fields)) next.fields[key] = cv(next.fields[key]);
  next.work = next.work.map(cv);
  for (const relative of next.relatives) {
    for (const key of ["name", "birth", "work", "address"]) relative[key] = cv(relative[key]);
  }
  return next;
}
function toNewUzbekLatin(value) {
  return String(value == null ? "" : value)
    .replace(/[oO][’‘ʻʼ']/g, (match) => (match[0] === "O" ? "Ö" : "ö"))
    .replace(/[gG][’‘ʻʼ']/g, (match) => (match[0] === "G" ? "Ğ" : "ğ"))
    .replace(/sh/gi, (match) => (match[0] === match[0].toUpperCase() ? "Ş" : "ş"))
    .replace(/ch/gi, (match) => (match[0] === match[0].toUpperCase() ? "Ç" : "ç"));
}
function toLegacyUzbekLatin(value) {
  return String(value == null ? "" : value)
    .replace(/ö/g, "o‘")
    .replace(/Ö/g, "O‘")
    .replace(/ğ/g, "g‘")
    .replace(/Ğ/g, "G‘")
    .replace(/ş/g, "sh")
    .replace(/Ş/g, "Sh")
    .replace(/ç/g, "ch")
    .replace(/Ç/g, "Ch");
}
function outP(e) {
  const target = scriptNow();
  if ("auto" === target) return e;

  const sourceIsLatin = !!(e.S && e.S.latin);
  if ("cyr" === target) {
    if (!sourceIsLatin) return e;
    const next = mapOutputText(e, toLegacyUzbekLatin);
    SpravkaCore.convertScript(next, false);
    next.work = next.work.map((line) => SpravkaCore.fixWorkLine(line, next.S.latin));
    return next;
  }

  let next = mapOutputText(e, (value) => value);
  if (!sourceIsLatin) SpravkaCore.convertScript(next, true);
  next = mapOutputText(next, "new" === target ? toNewUzbekLatin : toLegacyUzbekLatin);
  next.work = next.work.map((line) => SpravkaCore.fixWorkLine(line, next.S.latin));
  return next;
}
const SCRIPT_LBL = {
  auto: "asl holida",
  cyr: "kirill",
  lat: "eski lotin",
  new: "yangi o‘zbek lotini",
};
async function buildOut(e, t, a) {
  const n = outP(e);
  return "pdf" === t
    ? SpravkaCore.buildPdf(n, { ...(await loadPdfGen()), form: !!a })
    : SpravkaCore.buildFromData(n, { form: !!a });
}
const nameFor = (e, t, a) => outNameOf(outP(e), t, a),
  fmtMenu = el("div", "fmtmenu");
(fmtMenu.setAttribute("role", "menu"),
  (fmtMenu.hidden = !0),
  document.body.append(fmtMenu));
let fmtDone = null,
  fmtOpenedAt = 0;
function closeFmt(e) {
  if (fmtMenu.hidden) return;
  fmtMenu.hidden = !0;
  const t = fmtDone;
  ((fmtDone = null), t && t(e || null));
}
function pickFormat(e, t) {
  (closeFmt(null), (fmtMenu.textContent = ""));
  const a = [
    ["docx", "Word", ".docx — keyin tahrirlash mumkin"],
    ["pdf", "PDF", ".pdf — chop etish va yuborish uchun"],
  ];
  ((!0 !== t && "all" !== t) ||
    a.push(["both", "Word + PDF", "ikkala shaklda"]),
    "one" === t &&
      a.push(
        [
          "form",
          "Xodimga to'ldirish uchun",
          "PDF: bo'sh joylar chiziq bilan — chop etib beriladi",
        ],
        [
          "decl",
          "Deklaratsiya (17-modda)",
          "Word: yaqin qarindoshlar, ish joyi va lavozimi — loyiha",
        ],
      ),
    fmtMenu.append(
      el(
        "div",
        "fmh",
        "form" === t
          ? "To'ldirish varaqlari qaysi shaklda?"
          : "Qaysi shaklda yuklab olinsin?",
      ),
    ));
  const scriptRow = el("label", "fmscript");
  scriptRow.append(el("span", "", "Yozuv"));
  const scriptSelect = document.createElement("select");
  scriptSelect.setAttribute("aria-label", "Yozuv");
  for (const [value, label] of [
    ["auto", "Asl holida"],
    ["cyr", "Кирилл"],
    ["lat", "Eski lotin"],
    ["new", "Yangi o‘zbek lotini (Ö, Ğ, Ş, Ç)"],
  ]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    scriptSelect.append(option);
  }
  scriptSelect.value = scriptNow();
  scriptSelect.addEventListener("change", () => {
    const radio = document.querySelector(
      `input[name="script"][value="${scriptSelect.value}"]`,
    );
    if (radio) {
      radio.checked = !0;
      radio.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  scriptRow.append(scriptSelect);
  fmtMenu.append(scriptRow);
  for (const [e, t, n] of a) {
    const a = el("button", "fmi");
    ((a.type = "button"),
      a.setAttribute("role", "menuitem"),
      (a.dataset.v = e),
      a.append(el("b", "", t), el("span", "", n)),
      fmtMenu.append(a));
  }
  fmtMenu.hidden = !1;
  const n = e.getBoundingClientRect(),
    i = fmtMenu.offsetWidth,
    o = fmtMenu.offsetHeight;
  let l = Math.min(window.innerWidth - i - 8, Math.max(8, n.right - i)),
    s = n.bottom + 6;
  return (
    s + o > window.innerHeight - 8 && (s = Math.max(8, n.top - o - 6)),
    (fmtMenu.style.left = l + "px"),
    (fmtMenu.style.top = s + "px"),
    fmtMenu.querySelector(".fmi").focus({ preventScroll: !0 }),
    (fmtOpenedAt = Date.now()),
    new Promise((e) => {
      fmtDone = e;
    })
  );
}
if (
  typeof window !== "undefined" &&
  window.location &&
  window.location.hostname === "127.0.0.1" &&
  new URLSearchParams(window.location.search).has("e2e")
) {
  window.__openFormatMenuForTest = (anchor) => pickFormat(anchor, "one");
  window.__formatScriptNowForTest = () => scriptNow();
  window.__convertScriptOutputForTest = (data, sourceScript, targetScript) => {
    const radio = document.querySelector(`input[name="script"][value="${targetScript}"]`);
    if (!radio) throw new Error("Unknown script target: " + targetScript);
    radio.checked = true;
    const output = SpravkaCore.blankData("cyr" !== sourceScript);
    output.name = data.name;
    output.since = data.since || "";
    output.position = data.position;
    output.fields = { ...output.fields, specialty: data.specialty };
    output.work = [data.work];
    output.relatives = [{
      rel: "Отаси",
      name: data.relative,
      birth: "",
      work: data.relativeWork || "",
      address: "",
    }];
    const result = outP(output);
    return {
      name: result.name,
      position: result.position,
      specialty: result.fields.specialty,
      work: result.work[0],
      relative: result.relatives[0].name,
      relativeWork: result.relatives[0].work,
      birthPlaceLabel: result.S.labels && result.S.labels.birth_place,
      birthYearLabel: result.S.labels && result.S.labels.birth_date,
      relationHeader: result.S.relHeaders && result.S.relHeaders[2],
      relationExample: result.S.relations && result.S.relations["Турмуш ўртоғи"],
      scriptLatin: !!result.S.latin,
    };
  };
}
async function downloadOne(e, t, a) {
  if (!e || !e.P) return;
  const n = await pickFormat(t, "one");
  if (n) {
    t.disabled = !0;
    try {
      "decl" === n
        ? await save(t, a, declName(e), await DX.docx(declBody(e)))
        : "form" === n
          ? await save(
              t,
              a,
              nameFor(e.P, e.file, "").replace(/\.$/, "") +
                " — to'ldirish uchun.pdf",
              await buildOut(e.P, "pdf", !0),
            )
          : await save(t, a, nameFor(e.P, e.file, n), await buildOut(e.P, n));
    } catch (e) {
      ((a.className = "msg err"),
        (a.textContent =
          "Faylni tayyorlab bo‘lmadi: " + ((e && e.message) || e)));
    } finally {
      t.disabled = !1;
    }
  }
}
async function pdfImageToBytes(e) {
  const t = e.width,
    a = e.height;
  if (!t || !a) return null;
  const n = document.createElement("canvas");
  ((n.width = t), (n.height = a));
  const i = n.getContext("2d");
  if (e.bitmap) i.drawImage(e.bitmap, 0, 0);
  else {
    if (!e.data) return null;
    {
      const n = i.createImageData(t, a),
        o = n.data,
        l = e.data;
      if (3 === e.kind) o.set(l.subarray(0, o.length));
      else if (2 === e.kind)
        for (let e = 0, t = 0; t < o.length; e += 3, t += 4)
          ((o[t] = l[e]),
            (o[t + 1] = l[e + 1]),
            (o[t + 2] = l[e + 2]),
            (o[t + 3] = 255));
      else {
        if (1 !== e.kind) return null;
        {
          const e = (t + 7) >> 3;
          for (let n = 0; n < a; n++)
            for (let a = 0; a < t; a++) {
              const i = (l[n * e + (a >> 3)] >> (7 - (7 & a))) & 1 ? 255 : 0,
                s = 4 * (n * t + a);
              ((o[s] = o[s + 1] = o[s + 2] = i), (o[s + 3] = 255));
            }
        }
      }
      i.putImageData(n, 0, 0);
    }
  }
  const o = await new Promise((e) => n.toBlob(e, "image/jpeg", 0.92));
  return o
    ? { bytes: new Uint8Array(await o.arrayBuffer()), ext: "jpeg" }
    : null;
}
(fmtMenu.addEventListener("click", (e) => {
  const t = e.target.closest(".fmi");
  t && closeFmt(t.dataset.v);
}),
  fmtMenu.addEventListener("keydown", (e) => {
    const t = [...fmtMenu.querySelectorAll(".fmi")],
      a = t.indexOf(document.activeElement);
    ("ArrowDown" !== e.key && "ArrowUp" !== e.key) ||
      (e.preventDefault(),
      t[(a + ("ArrowDown" === e.key ? 1 : -1) + t.length) % t.length].focus());
  }),
  document.addEventListener(
    "mousedown",
    (e) => {
      fmtMenu.hidden || fmtMenu.contains(e.target) || closeFmt(null);
    },
    !0,
  ),
  document.addEventListener(
    "keydown",
    (e) => {
      "Escape" !== e.key ||
        fmtMenu.hidden ||
        (e.stopPropagation(), closeFmt(null));
    },
    !0,
  ),
  window.addEventListener(
    "scroll",
    (e) => {
      Date.now() - fmtOpenedAt > 400 &&
        !fmtMenu.contains(e.target) &&
        closeFmt(null);
    },
    !0,
  ),
  window.addEventListener("resize", () => closeFmt(null)));
const PARSE_WORKER_URL = "js/parseworker.js?v=lead-edu-24",
  POOL_N = Math.max(1, Math.min(4, (navigator.hardwareConcurrency || 2) - 1));
let poolBad = !1,
  jobSeq = 0;
const pool = [],
  jobs = new Map();
function poolWorker(e) {
  if (poolBad || !PARSE_WORKER_URL || "undefined" == typeof Worker) return null;
  if (pool[e]) return pool[e];
  try {
    const t = new Worker(PARSE_WORKER_URL);
    ((t.onmessage = (e) => {
      const t = jobs.get(e.data.id);
      t &&
        (jobs.delete(e.data.id),
        clearTimeout(t.t),
        e.data.err ? t.rej(new Error(e.data.err)) : t.res(e.data.r));
    }),
      (t.onerror = (a) => {
        (a.preventDefault && a.preventDefault(), (poolBad = !0));
        for (const [e, a] of jobs)
          a.w === t &&
            (clearTimeout(a.t),
            jobs.delete(e),
            a.rej(Object.assign(new Error("worker"), { worker: !0 })));
        try {
          t.terminate();
        } catch (e) {}
        pool[e] === t && (pool[e] = null);
      }),
      (pool[e] = t));
  } catch (e) {
    return ((poolBad = !0), null);
  }
  return pool[e];
}
const kindOf = (e) =>
  /\.pdf$/i.test(e) ? "pdf" : /\.doc$/i.test(e) ? "doc" : "docx";
let tesseractReady = null;
function loadTesseract() {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractReady) return tesseractReady;
  tesseractReady = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
    script.async = true;
    script.onload = () =>
      window.Tesseract
        ? resolve(window.Tesseract)
        : reject(new Error("Tesseract.js yuklandi, ammo OCR API topilmadi."));
    script.onerror = () =>
      reject(
        new Error(
          "OCR kutubxonasini yuklab bo‘lmadi. Internet yoki CDN ulanishini tekshiring.",
        ),
      );
    document.head.append(script);
  }).catch((error) => {
    tesseractReady = null;
    throw error;
  });
  return tesseractReady;
}
function isScannedPdfError(error) {
  return /PDF ichida matn yo['‘]q|skanerlangan rasm/i.test(
    String((error && error.message) || error || ""),
  );
}
async function runScannedPdfOcr(pdfjs, bytes, opts) {
  toast("Skanerlangan PDF aniqlandi — OCR tayyorlanmoqda.");
  try {
    const tesseract = await loadTesseract(),
      result = await ScannedPdfOcr.analyze(
        pdfjs,
        new Uint8Array(bytes),
        tesseract,
        SpravkaCore,
        {
          parserOptions: opts,
          onProgress(progress) {
            if (progress.status === "page-complete")
              toast(
                "PDF OCR: " +
                  progress.page +
                  "/" +
                  progress.pages +
                  " bet tanildi.",
              );
          },
        },
      );
    toast(
      "PDF OCR tugadi. Ajratilgan ma’lumotlarni asl hujjat bilan solishtiring.",
    );
    return result;
  } catch (ocrError) {
    throw new Error(
      "Skanerlangan PDF uchun OCR bajarilmadi: " +
        ((ocrError && ocrError.message) || ocrError),
    );
  }
}
async function analyzePdfWithOcr(bytes, opts) {
  const pdfjs = await loadPdfJs();
  try {
    return await SpravkaCore.analyzePdf(pdfjs, bytes, opts, {
      imageToBytes: pdfImageToBytes,
    });
  } catch (error) {
    if (!isScannedPdfError(error)) throw error;
    return runScannedPdfOcr(pdfjs, bytes, opts);
  }
}
async function analyzeAny(e, t) {
  const a = kindOf(e.name),
    n = { script: "auto" };
  let i = await e.file.arrayBuffer();
  const o = poolWorker(t);
  if (o)
    try {
      const result = await new Promise((resolve, reject) => {
        const id = ++jobSeq,
          timer = setTimeout(() => {
            jobs.delete(id);
            try {
              o.terminate();
            } catch (e) {}
            (pool[t] === o && (pool[t] = null),
              reject(
                new Error(
                  "Fayl juda uzoq o‘qildi (3 daqiqa) — buzilgan yoki juda katta bo‘lishi mumkin.",
                ),
              ));
          }, 18e4);
        (jobs.set(id, { res: resolve, rej: reject, t: timer, w: o }),
          o.postMessage({ id, kind: a, buf: i, opts: n }, [i]));
      });
      return (
        (result.data.S =
          result.data.S && result.data.S.latin
            ? SpravkaCore.SCRIPTS.lat
            : SpravkaCore.SCRIPTS.cyr),
        result
      );
    } catch (error) {
      if (a === "pdf" && isScannedPdfError(error)) {
        try {
          o.terminate();
        } catch (_) {}
        (pool[t] === o && (pool[t] = null), (i = await e.file.arrayBuffer()));
        return runScannedPdfOcr(await loadPdfJs(), i, n);
      }
      if (!error.worker) throw error;
      i = await e.file.arrayBuffer();
    }
  if (a === "pdf") return analyzePdfWithOcr(i, n);
  return "doc" === a
    ? SpravkaCore.analyzeDoc(i, n)
    : SpravkaCore.analyzeDocx(i, n);
}
const PHOTO_MAX = 1e3,
  PHOTO_BIG = 358400;
function jpegOrientation(e) {
  if (255 !== e[0] || 216 !== e[1]) return 1;
  let t = 2;
  for (; t + 4 < e.length && 255 === e[t];) {
    const a = e[t + 1],
      n = (e[t + 2] << 8) | e[t + 3];
    if (
      225 === a &&
      69 === e[t + 4] &&
      120 === e[t + 5] &&
      105 === e[t + 6] &&
      102 === e[t + 7]
    ) {
      const a = t + 10,
        n = 73 === e[a],
        i = (t) => (n ? e[t] | (e[t + 1] << 8) : (e[t] << 8) | e[t + 1]),
        o =
          a +
          ((t) =>
            n
              ? (e[t] |
                  (e[t + 1] << 8) |
                  (e[t + 2] << 16) |
                  (e[t + 3] << 24)) >>>
                0
              : ((e[t] << 24) |
                  (e[t + 1] << 16) |
                  (e[t + 2] << 8) |
                  e[t + 3]) >>>
                0)(a + 4),
        l = i(o);
      for (let t = 0; t < l; t++) {
        const a = o + 2 + 12 * t;
        if (a + 10 > e.length) break;
        if (274 === i(a)) return i(a + 8);
      }
      return 1;
    }
    if (218 === a) break;
    t += 2 + n;
  }
  return 1;
}
async function shrinkPhoto(e) {
  try {
    if (
      !e ||
      !e.bytes ||
      e.bytes.length < PHOTO_BIG ||
      "undefined" == typeof createImageBitmap
    )
      return e;
    const t = String(e.ext || "").toLowerCase();
    if (!/^(?:jpe?g|png|bmp|gif|webp)$/.test(t)) return e;
    if (/jpe?g/.test(t) && 1 !== jpegOrientation(e.bytes)) return e;
    const a = await createImageBitmap(new Blob([e.bytes])),
      n = Math.min(1, PHOTO_MAX / Math.max(a.width, a.height)),
      i = Math.max(1, Math.round(a.width * n)),
      o = Math.max(1, Math.round(a.height * n)),
      l = document.createElement("canvas");
    ((l.width = i), (l.height = o));
    const s = l.getContext("2d");
    ((s.fillStyle = "#fff"),
      s.fillRect(0, 0, i, o),
      (s.imageSmoothingQuality = "high"),
      s.drawImage(a, 0, 0, i, o),
      a.close && a.close());
    const r = await new Promise((e) => l.toBlob(e, "image/jpeg", 0.9));
    return !r || r.size > 0.7 * e.bytes.length
      ? e
      : {
          ...e,
          bytes: new Uint8Array(await r.arrayBuffer()),
          ext: "jpeg",
          shrunk: e.bytes.length,
        };
  } catch (t) {
    return e;
  }
}
async function pumpOne(e) {
  for (; queue.length;) {
    const t = queue.shift();
    if (items.includes(t)) {
      try {
        const a = await analyzeAny(t, e);
        if (!items.includes(t)) continue;
        if (isSummaryTableDoc(a.data)) {
          const e = items.indexOf(t);
          (e >= 0 && items.splice(e, 1),
            t.li && t.li.remove(),
            t.fi && t.fi.remove(),
            store.dirty.add(t),
            statsSoon());
          continue;
        }
        ((t.P = a.data),
          (t.warnings = a.warnings),
          (t.summary = a.summary),
          t.P.photo && (t.P.photo = await shrinkPhoto(t.P.photo)),
          fixDocName(t),
          (t.reasons = reviewReasons(t.P)),
          (t.state = t.reasons.length ? "warn" : "ok"));
      } catch (e) {
        ((t.state = "err"),
          (t.reasons = [
            "Faylni o'qib bo'lmadi (buzilgan yoki parolli): " +
              (e && e.message ? e.message : e),
          ]));
      }
      ((unsaved = !0),
        renderCard(t),
        statsSoon(),
        (!poolBad && PARSE_WORKER_URL) ||
          (await new Promise((e) => setTimeout(e, 0))));
    }
  }
}
async function pump() {
  if (running) return;
  running = !0;
  const e =
    poolBad || !PARSE_WORKER_URL || "undefined" == typeof Worker ? 1 : POOL_N;
  (await Promise.all(Array.from({ length: e }, (e, t) => pumpOne(t))),
    (running = !1),
    queue.length ? pump() : xl.rows.length && xl.ran && runCompare());
}
function xlRan() {
  try {
    return !!xl.ran;
  } catch (e) {
    return !1;
  }
}
let statsT = null;
function statsSoon() {
  statsT ||
    (statsT = setTimeout(() => {
      ((statsT = null), updateStats());
    }, 400));
}
const MINOR_RE = /^(?:Rasm yo‘q|Skaner PDF|Sana:)/,
  reasonTxt = (e) =>
    String(e)
      .replace(/^Bo‘sh: /, "To‘ldiring: ")
      .replace(/^Sana: /, "Sanani tekshiring: ");
function sevOf(e) {
  return e.excluded
    ? "excl"
    : "err" === e.state
      ? "err"
      : "queue" !== e.state && e.P
        ? "function" == typeof isGone && isGone(e)
          ? "gone"
          : e.approved || "ok" === e.state
            ? "ok"
            : (e.reasons || []).some((e) => !MINOR_RE.test(e))
              ? "serious"
              : "minor"
        : "queue";
}
function issueText(e) {
  const t = sevOf(e);
  if ("err" === t)
    return FileError.summary(e.name, (e.reasons && e.reasons[0]) || "");
  if ("excl" === t) return "Takror — ZIP’ga tushmaydi";
  if ("queue" === t) return "";
  if ("gone" === t)
    return "Excel'da yo'q — tekshirilmaydi (ishdan ketgan yoki xodim emas)";
  const a =
    e.dup && !e.dup.some((e) => e.excluded)
      ? `${e.dup.length} ta fayl — bittasini qoldiring`
      : "";
  if ("ok" === t) return a || (e.approved ? "Tasdiqlangan" : "—");
  const n = (e.reasons || []).slice();
  if ("serious" === t) {
    const e = n.filter((e) => !MINOR_RE.test(e));
    return (
      n.some((e) => /^Rasm/.test(e)) && e.push("rasm yo‘q"),
      [a, e.map(reasonTxt).join(" · ")].filter(Boolean).join(" · ")
    );
  }
  const i = e.P && e.P.fixes ? realFixes(e.P).length : 0;
  return [a, n.map(reasonTxt).join(" · "), i ? `imlo: ${i} so‘z` : ""]
    .filter(Boolean)
    .join(" · ");
}
var savedAt = 0;
function fmtTime(e) {
  return new Date(e).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
let memT = null,
  memAsked = !1;
const fmtMB = (e) =>
  e >= 1024 ** 3
    ? (e / 1024 ** 3).toFixed(1) + " GB"
    : Math.max(1, Math.round(e / 1048576)) + " MB";
function memSoon() {
  memT || (memT = setTimeout(memCheck, 2500));
}
async function memCheck() {
  memT = null;
  const e = $("ssMem");
  if (e && navigator.storage && navigator.storage.estimate)
    try {
      !memAsked &&
        items.length &&
        navigator.storage.persist &&
        ((memAsked = !0),
        navigator.storage
          .persisted()
          .then((e) => e || navigator.storage.persist())
          .catch(() => {}));
      const { usage: t = 0, quota: a = 0 } = await navigator.storage.estimate();
      if (!items.length && t < 5242880) return void (e.hidden = !0);
      const n = a ? t / a : 0;
      ((e.hidden = !1),
        (e.textContent = `Xotira: ${fmtMB(t)}${a ? " / " + fmtMB(a) : ""}`),
        (e.className = "sl" + (n > 0.8 ? " memhot" : "")),
        (e.title =
          "Shu kompyuterdagi brauzer xotirasi (ma'lumotnomalar, asl fayllar, rasmlar). Kamaytirish uchun keraksiz fayllarni ro'yxatdan o'chiring yoki zaxira nusxa olib, ro'yxatni tozalang."),
        n > 0.8 &&
          !e.dataset.warned &&
          ((e.dataset.warned = "1"),
          toast(
            `Brauzer xotirasi deyarli to'ldi (${Math.round(100 * n)}%). Zaxira nusxa oling va keraksiz fayllarni o'chiring.`,
          )));
    } catch (t) {
      e.hidden = !0;
    }
}
function updateSaved() {
  const e = savedAt ? `Saqlandi · ${fmtTime(savedAt)}` : "";
  (($("ssSaved").textContent = e),
    ($("rSaved").textContent = e),
    ($("lSub").textContent = items.length
      ? `${items.length} ta fayl${savedAt ? " · " + fmtTime(savedAt) + " da saqlangan" : ""}`
      : "Eski ma'lumotnomalarni yuklang — dastur ularni standart shaklga keltiradi"));
}
function mbarSync() {
  document.body.classList.toggle(
    "mb-on",
    "list" === curView && items.length > 0,
  );
}
function updateStats() {
  statsT && (clearTimeout(statsT), (statsT = null));
  try {
    const e = document.getElementById("nChk"),
      t =
        xl.rows && xl.rows.length && xl.unmatched && xl.ran
          ? xl.unmatched.filter((e) => !isHeadRow(xl.rows[e])).length
          : 0;
    e && (e.textContent = t ? String(t) : "");
    $("sNoDoc") && ($("sNoDoc").textContent = t);
    $("kNoDoc") && ($("kNoDoc").hidden = !t);
  } catch (e) {}
  const e = items.length,
    t = { ok: 0, serious: 0, minor: 0, err: 0, queue: 0, excl: 0, gone: 0 };
  for (const e of items) t[sevOf(e)]++;
  const a = items.filter((e) => e.approved && !e.excluded).length,
    n = e - t.queue;
  n === e && calcDups();
  const i = new Set(
      items
        .filter((e) => e.dup && !e.dup.some((e) => e.excluded))
        .map((e) => e.dup),
    ).size,
    o = items.filter((e) => e.dup).length;
  (($("sTotal").textContent = e),
    ($("sOk").textContent = t.ok),
    ($("sOkSub").textContent = `shundan ${a} tasi tasdiqlangan`),
    ($("sSer").textContent = t.serious),
    ($("sMin").textContent = t.minor),
    ($("sDupN").textContent = o),
    ($("sErr").textContent = t.err),
    ($("sOtherSub").textContent = `${i} xodimda takror · ${t.err} o'qilmagan`),
    ($("sGone").textContent = t.gone),
    ($("kGone").hidden = !t.gone),
    ($("sMsg").textContent = e
      ? n < e
        ? `Fayllar o'qilmoqda: ${n} / ${e}`
        : "Hammasi tayyor."
      : ""),
    ($("zipAll").disabled = n < e || t.ok + t.serious + t.minor + t.gone === 0),
    ($("zipTxt").textContent = "Yuklab olish"),
    ($("zipAll").title =
      "Word yoki PDF, kirill yoki lotin — oynada tanlaysiz"));
  const l = t.err
    ? ` ${t.err} ta faylni o'qib bo'lmadi — ularni Word'da ochib, .docx qilib qayta saqlang.`
    : "";
  let s = null;
  try {
    s = renderSteps(e, n, t, i);
  } catch (e) {
    $("flow").hidden = !0;
  }
  if (e) {
    const a = s ? s.k : null,
      i = s ? s.x : null;
    n < e
      ? setGuide(
          "busy",
          `Fayllar o'qilmoqda… ${n} / ${e}`,
          "Bir oz kuting. Shu vaqtda yana fayl qo'shishingiz mumkin.",
          ((t) => (e ? Math.round((100 * t) / e) : 0))(n),
          null,
          null,
        )
      : "dup" === a
        ? setGuide(
            "todo",
            `${i.dup} ta xodimning bir nechta fayli bor`,
            `Har biridan bittasini qoldiring — qolganlari ZIP'ga tushmaydi.${l}`,
            null,
            ["Takrorlarni ko'rish →", "dup"],
            ["Hozircha yuklab olish", "zip"],
          )
        : "xl" === a
          ? setGuide(
              "todo",
              "Excel bilan solishtiring",
              `Kadrlar bazasi yuklangan, lekin ma'lumotnomalar u bilan hali solishtirilmagan.${l}`,
              null,
              ["Excel bazasi →", "excel"],
              ["Hozircha yuklab olish", "zip"],
            )
          : "conf" === a
            ? setGuide(
                "todo",
                `Excel'dagi ${i.conf} ta farqni tasdiqlang`,
                `Hech narsa o'zi o'zgarmaydi: qaysi qiymat to'g'ri ekanini siz belgilaysiz.${l}`,
                null,
                ["Farqlarni ko'rish →", "xlconf"],
                ["Hozircha yuklab olish", "zip"],
              )
            : "rev" === a && t.serious
              ? setGuide(
                  "todo",
                  `${t.serious} ta jiddiy holatni ko'rib chiqing`,
                  `Ularda asosiy ma'lumot topilmagan.${t.minor ? ` Yana ${t.minor} tasida faqat rasm yo'q yoki imlo tuzatilgan.` : ""}${l}`,
                  null,
                  ["Jiddiylardan boshlash →", "review-serious"],
                  ["Hozircha yuklab olish", "zip"],
                )
              : "rev" === a
                ? setGuide(
                    "minor",
                    `${t.minor} ta kichik kamchilikni ko'ring`,
                    `Asosiy ma'lumotlar joyida — rasm yo'q, imlo tuzatilgan yoki sana tekshirilishi kerak.${l}`,
                    null,
                    ["Ko'rib chiqish →", "review"],
                    ["Hozircha yuklab olish", "zip"],
                  )
                : "fill" === a
                  ? setGuide(
                      "minor",
                      `${i.fill} ta ma'lumotnomada bo'sh maydon bor`,
                      `Topilmagan ma'lumotlarni bitta jadvalda yozing yoki xodimlarga to'ldirish varag'ini bering.${l}`,
                      null,
                      ["Bo'sh maydonlar →", "fill"],
                      ["Hozircha yuklab olish", "zip"],
                    )
                  : t.ok
                    ? setGuide(
                        "done",
                        "Hammasi tayyor ✓",
                        `${t.ok} ta ma'lumotnoma standart shaklda. Endi yuklab oling.${l}`,
                        null,
                        ["Yuklab olish", "zip"],
                        null,
                      )
                    : setGuide(
                        "todo",
                        "Fayllarni o'qib bo'lmadi",
                        l.trim(),
                        null,
                      );
  }
  $("guide").hidden = !e;
  const r = items.filter((e) => e.xlChanges && e.xlChanges.length).length;
  (($("fDup").textContent = o), ($("fXl").textContent = r));
  const d = items.filter(
    (e) => e.P && !e.excluded && !isGone(e) && emptyKeys(e.P, !1, e).length,
  ).length;
  (($("nFill").textContent = d || ""),
    ($("nAll").textContent = e),
    ($("nWarn").textContent = t.serious + t.minor || ""),
    ($("nDup").textContent = i || ""),
    ($("qSer").textContent = t.serious),
    ($("qMin").textContent = t.minor),
    ($("sStat").hidden = !e),
    ($("ssOk").textContent = t.ok),
    ($("ssTot").textContent = `/ ${e - t.excl - t.gone} tayyor`),
    ($("ssBar").style.width =
      (e - t.excl - t.gone
        ? Math.round((100 * t.ok) / (e - t.excl - t.gone))
        : 0) + "%"),
    ($("listEmpty").hidden = e > 0),
    $("vList").classList.toggle("empty-state", 0 === e),
    ($("nextWarn").disabled = !items.some((e) => e.P)));
  const c = e - t.excl - t.gone;
  (($("rProg").textContent =
    `${a} tasdiqlangan · ${t.serious + t.minor} qoldi`),
    ($("qTogT").textContent = `Navbat — ${t.serious + t.minor} ta qoldi`),
    ($("rBar").style.width = (c ? Math.round((100 * t.ok) / c) : 0) + "%"),
    ($("rBar2").style.width =
      (c ? Math.round((100 * (t.serious + t.minor)) / c) : 0) + "%"),
    n === e && (fillFolders(), fillDepts(), applySort()),
    updateSaved(),
    mbarSync(),
    xlStatus(),
    memSoon(),
    applyFilter());
}
function renderSteps(e, t, a, n) {
  const i = $("flow");
  if (((i.hidden = !e), !e)) return null;
  const o = !(!xl.rows || !xl.rows.length),
    l = o && !!xl.ran,
    s = l ? confRows().length : 0,
    r = l ? items.filter((e) => e.xlFuzzy && !e.excluded).length : 0,
    d = a.serious + a.minor,
    c = items.filter(
      (e) => e.P && !e.excluded && !isGone(e) && emptyKeys(e.P, !1, e).length,
    ).length,
    p = [
      {
        k: "load",
        t: "Yuklash",
        s: t < e ? `${t} / ${e} o'qildi` : `${e} ta fayl`,
        st: t < e ? "busy" : "done",
        go: () => showView("list"),
      },
      {
        k: "dup",
        t: "Takrorlar",
        s: n ? `${n} ta xodim` : "takror yo'q",
        st: n ? "todo" : "done",
        go: () => showView("dup"),
      },
      {
        k: "xl",
        t: "Excel bazasi",
        s: o
          ? l
            ? "solishtirildi"
            : "solishtirilmagan"
          : "ixtiyoriy — yuklanmagan",
        st: o ? (l ? "done" : "todo") : "skip",
        go: () => showView("excel"),
      },
      {
        k: "conf",
        t: "Farqlarni tasdiqlash",
        s: l
          ? s + r
            ? `${s + r} ta kutmoqda`
            : "hammasi ko‘rildi"
          : "Excel kerak",
        st: l ? (s + r ? "todo" : "done") : "skip",
        go: () => {
          (showView("excel"),
            setTimeout(() => {
              const e = $("xlConf");
              e &&
                !e.hidden &&
                e.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50));
        },
      },
      {
        k: "rev",
        t: "Tekshiruv",
        s: d ? `${d} ta qoldi` : "hammasi ko‘rildi",
        st: d ? "todo" : "done",
        go: () => showView("review"),
      },
      {
        k: "fill",
        t: "Bo'sh maydonlar",
        s: c ? `${c} ta ma'lumotnomada` : "bo'sh joy yo'q",
        st: c ? "todo" : "done",
        go: () => showView("fill"),
      },
      {
        k: "zip",
        t: "Yuklab olish",
        s: "Word yoki PDF",
        st: "last",
        go: () => {
          $("zipAll").disabled || zipAll();
        },
      },
    ],
    m = p.findIndex((e) => "todo" === e.st || "busy" === e.st),
    u = { k: m >= 0 ? p[m].k : "zip", x: { dup: n, conf: s + r, fill: c } },
    h = p.map((e) => e.st + e.s).join("|") + m;
  return (
    i.dataset.sig === h ||
      ((i.dataset.sig = h),
      (i.textContent = ""),
      p.forEach((e, t) => {
        const a = t === m || (m < 0 && "last" === e.st),
          n = el(
            "li",
            "s-" +
              ("last" === e.st ? (a ? "cur" : "todo") : e.st) +
              (a ? " s-cur" : ""),
          ),
          o = el("button");
        ((o.type = "button"),
          a && o.setAttribute("aria-current", "step"),
          o.append(el("span", "sn", "done" === e.st ? "✓" : String(t + 1))));
        const l = el("span", "st");
        (l.append(
          el("b", "", e.t),
          el("small", "", e.s),
          el("small", "sof", `${t + 1}/${p.length}-qadam`),
        ),
          o.append(l),
          (o.onclick = e.go),
          n.append(o),
          i.append(n));
      })),
    u
  );
}
var deptSig = null;
function fillDepts() {
  let e = [];
  try {
    e = [...new Set(items.map((e) => deptOf(e)).filter(Boolean))].sort((e, t) =>
      e.localeCompare(t, "uz"),
    );
  } catch (t) {
    e = [];
  }
  const t = e.join("|");
  if (t === deptSig) return;
  deptSig = t;
  const a = $("fDept"),
    n = a.value;
  ((a.textContent = ""),
    a.append(
      Object.assign(
        el("option", "", e.length ? `Hammasi (${e.length} ta)` : "Hammasi"),
        { value: "" },
      ),
    ));
  for (const t of e) {
    const e = items.filter((e) => deptOf(e) === t).length;
    a.append(
      Object.assign(
        el("option", "", `${t.length > 60 ? t.slice(0, 60) + "…" : t} (${e})`),
        { value: t },
      ),
    );
  }
  ((a.value = e.includes(n) ? n : ""), (a.closest("label").hidden = !e.length));
}
var folderSig = null;
function fillFolders() {
  const e = [
      ...new Set(
        items
          .map((e) => (e.folder || "").split("/").slice(0, 2).join("/"))
          .filter(Boolean),
      ),
    ].sort(),
    t = e.join("|");
  if (t === folderSig) return;
  folderSig = t;
  const a = $("fFolder"),
    n = a.value;
  ((a.textContent = ""),
    a.append(
      Object.assign(
        el("option", "", e.length ? `Hammasi (${e.length} papka)` : "Hammasi"),
        { value: "" },
      ),
    ));
  for (const t of e) a.append(Object.assign(el("option", "", t), { value: t }));
  ((a.value = e.includes(n) ? n : ""), (a.closest("label").hidden = !e.length));
}
var sortSig = "";
const SEV_ORDER = {
  serious: 0,
  minor: 1,
  err: 2,
  queue: 3,
  ok: 4,
  gone: 5,
  excl: 6,
};
function applySort(e) {
  const t = $("fSort").value,
    a = items.slice();
  "sev" === t
    ? a.sort(
        (e, t) =>
          SEV_ORDER[sevOf(e)] - SEV_ORDER[sevOf(t)] ||
          items.indexOf(e) - items.indexOf(t),
      )
    : "name" === t &&
      a.sort((e, t) =>
        String((e.P && e.P.name) || e.name).localeCompare(
          String((t.P && t.P.name) || t.name),
          "uz",
        ),
      );
  const n = t + ":" + a.map((e) => items.indexOf(e)).join(",");
  if (!e && n === sortSig) return;
  sortSig = n;
  const i = document.createDocumentFragment();
  for (const e of a) i.append(e.li);
  list.append(i);
}
function setFilter(e) {
  const t = document.querySelector(`input[name="rf"][value="${e}"]`);
  (t && (t.checked = !0), syncKpi(), applyFilter(!0));
}
function syncFnow() {
  const e = {
      dup: "Takrorlar",
      xl: "Excel o'zgarishi",
      sel: "Belgilanganlar",
      err: "Xato",
      warn: "Tekshirish kerak",
    }[rf()],
    t = $("fNow");
  if (((t.hidden = !e), (t.textContent = ""), e)) {
    const a = el("button", "", "×");
    ((a.type = "button"),
      a.setAttribute("aria-label", "Filtrni olib tashlash"),
      (a.onclick = () => setFilter("all")),
      t.append("Filtr: " + e, a));
  }
}
function xlStatus() {
  const e = $("xlStat");
  if (!e) return;
  e.textContent = "";
  const t = $("xlDel");
  (t &&
    (t.hidden = !(
      (xl.rows && xl.rows.length) ||
      (void 0 !== xlLink && xlLink.handle)
    )),
    xl.rows && xl.rows.length
      ? (e.append(
          el("b", "", "Excel ulangan"),
          el(
            "span",
            "",
            `${xl.fileName || "kadrlar bazasi"} · ${xl.rows.length} qator`,
          ),
        ),
        ($("nXl").textContent = "✓"))
      : (e.append(
          el("b", "", "Excel ulanmagan"),
          el("span", "", "Kadrlar bazasi — ixtiyoriy"),
        ),
        ($("nXl").textContent = "")));
}
($("pSize").addEventListener("change", () => {
  ((PAGE_N = +$("pSize").value || 20), applyFilter(!0));
}),
  $("fSort").addEventListener("change", () => {
    (applySort(!0), applyFilter(!0));
  }),
  $("fFolder").addEventListener("change", () => applyFilter(!0)),
  $("fDept").addEventListener("change", () => applyFilter(!0)),
  $("selAll").addEventListener("change", () => {
    const e = $("selAll").checked;
    for (const t of items)
      if (!t.li.hidden && t.P) {
        t.selected = e;
        const a = t.li.querySelector(".c-cb input");
        a && (a.checked = e);
      }
    applyFilter();
  }));
const apprSelBtn = $("apprSel");
apprSelBtn && apprSelBtn.addEventListener("click", () => approveSelectedItems());
const STATE_TXT = {
    ok: "Tayyor",
    serious: "Jiddiy",
    minor: "Kichik",
    err: "Xato",
    queue: "Navbatda…",
    excl: "Chiqarilgan",
    gone: "Excel'da yo'q",
  },
  CHIP_CLS = {
    ok: "ok",
    serious: "ser",
    minor: "min",
    err: "xerr",
    queue: "work",
    excl: "exch",
    gone: "exch",
  };
function shortPos(e) {
  const t = ((e && e.position) || "").trim(),
    a = t.match(
      /(?:институти|университети|академияси|instituti|universiteti|akademiyasi)\s+(.+)$/i,
    );
  return (a ? a[1] : t).slice(0, 70);
}
function toggleApproveItem(e) {
  if (!e || !e.P) return;
  if (typeof draft !== "undefined" && draft && draft.it === e) {
    commitDraft();
    pMode = "fixed";
  }
  e.approved = !e.approved;
  if (e.approved) {
    e.state = "ok";
    toast((e.P.name || e.name || "Xodim") + " tasdiqlandi ✓");
  } else {
    e.state = (e.reasons && e.reasons.length) ? "warn" : "ok";
    toast((e.P.name || e.name || "Xodim") + " tasdiqlash bekor qilindi");
  }
  unsaved = !0;
  if (typeof store !== "undefined" && store.dirty) store.dirty.add(e);
  if (e.li) renderCard(e);
  updateStats();
  if (window.sel === e && typeof renderDetail === "function") {
    renderDetail();
  }
}

function approveSelectedItems() {
  const targets = (items || []).filter((e) => e.selected && e.P && !e.excluded && !e.approved);
  if (!targets.length) {
    toast("Tasdiqlash uchun yangi belgilangan ma'lumotnoma yo'q");
    return;
  }
  for (const e of targets) {
    e.approved = !0;
    e.state = "ok";
    if (typeof store !== "undefined" && store.dirty) store.dirty.add(e);
    if (e.li) renderCard(e);
  }
  unsaved = !0;
  updateStats();
  toast(`${targets.length} ta ma'lumotnoma tasdiqlandi ✓`);
  applyFilter();
}

function renderCard(e) {
  const t = sevOf(e),
    a = e.li;
  ((a._it = e),
    (a.className =
      "item is-" +
      e.state +
      " sev-" +
      t +
      (e === sel ? " sel" : "") +
      (e.excluded ? " is-excl" : "")),
    (a.textContent = ""),
    (a.tabIndex = 0),
    markDirty(e));
  const n = e.P,
    i = n && n.name,
    o = el("td", "c-cb"),
    l = el("input");
  ((l.type = "checkbox"),
    (l.checked = !!e.selected),
    (l.disabled = !n),
    l.setAttribute("aria-label", "Belgilash: " + (i || e.name)),
    (l.onclick = (e) => e.stopPropagation()),
    (l.onchange = () => {
      ((e.selected = l.checked), applyFilter());
    }),
    o.append(l));
  const s = el("td", "c-who");
  if (
    (s.append(el("span", "who", i || e.name)),
    s.append(
      el(
        "span",
        "file",
        (e.folder ? e.folder + " / " : "") + (i ? e.name : ""),
      ),
    ),
    e.dup)
  ) {
    const t = el("span", "chip dupchip", `⧉ ${e.dup.length} ta fayl`);
    ((t.title =
      "Bu xodimning bir nechta fayli bor — tekshiruvda bittasini qoldiring"),
      s.append(el("br"), t));
  }
  const r = el("td", "c-st");
  r.append(
    el(
      "span",
      "chip " + CHIP_CLS[t],
      e.approved && "ok" === t ? "Tasdiqlangan" : STATE_TXT[t],
    ),
  );
  const d = issueText(e),
    c = el("td", "c-iss" + ("serious" === t || "err" === t ? " bad" : ""), d),
    p = el("td", "c-pos", n ? shortPos(n) || "—" : ""),
    m = el("td", "c-ph");
  if (n) {
    if (n.photo && n.photo.bytes) {
      const t = photoUrl(n.photo);
      if (t) {
        const e = el("img", "thumb");
        ((e.src = t),
          (e.alt = "Rasm"),
          (e.loading = "lazy"),
          m.append(e));
      } else m.append(el("span", "tg ok", "rasm bor"));
    } else m.append(el("span", "tg no", "rasm yo'q"));
    const t =
      e.xlChanges && e.xlChanges.length
        ? ["warn", `farq: ${e.xlChanges.length}`]
        : "same" === e.xlStatus || e.xlAuto
          ? ["ok", "Excel: mos"]
          : "notfound" === e.xlStatus
            ? ["err", "Excel'da yo'q"]
            : null;
    t && m.append(el("span", "tg " + t[0], t[1]));
  }
  const u = el("td", "acts"),
    h = el("div", "ra");
  u.append(h);
  const f = el(
    "button",
    "btn2",
    n ? "Ko'rish" : "err" === e.state ? "Sababi" : "…",
  );
  if (
    ((f.type = "button"),
    h.append(f),
    "err" === e.state &&
      ((f.title = "Haqiqiy xato sababini ko‘rish"),
      f.addEventListener("click", (a) => {
        (a.stopPropagation(),
          toast(FileError.details(e.name, e.reasons && e.reasons[0])));
      })),
    n)
  ) {
    const ab = el(
      "button",
      "btn2 btn-appr" + (e.approved ? " is-appr" : ""),
      e.approved ? "✓ Tasdiqlangan" : "Tasdiqlash",
    );
    ((ab.type = "button"),
      (ab.title = e.approved
        ? "Tasdiqlangan (bekor qilish uchun bosing)"
        : "Ma'lumotnomani tasdiqlash"),
      (ab.onclick = (t) => {
        (t.stopPropagation(), toggleApproveItem(e));
      }),
      (ab.onkeydown = (e) => e.stopPropagation()),
      h.append(ab));

    const t = el("button", "btn2 dl");
    ((t.type = "button"),
      (t.title = "Yuklab olish (Word, PDF yoki to‘ldirish varag‘i)"),
      t.setAttribute("aria-label", "Yuklab olish: " + (i || e.name)),
      (t.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>'),
      (t.onclick = (a) => {
        (a.stopPropagation(), downloadOne(e, t, $("bNote")));
      }),
      (t.onkeydown = (e) => e.stopPropagation()),
      h.append(t));
  }
  (a.append(o, s, r, c, p, m, u),
    (a.onclick = () => {
      (selectItem(e), showView("review"));
    }),
    (a.onkeydown = (t) => {
      "Enter" === t.key && (selectItem(e), showView("review"));
    }));
  const g = e.fi;
  ((g.textContent = ""),
    (g.className = (e === sel ? "sel" : "") + (e.excluded ? " excl" : "")),
    (g.dataset.sev = t));
  const y = n
    ? "ok" === t
      ? e.approved
        ? "Tasdiqlangan"
        : "Tayyor"
      : d || STATE_TXT[t]
    : "err" === e.state
      ? "Xato"
      : "Navbatda…";
  (g.append(
    el("span", "dot " + t),
    el("span", "fn", i || e.name),
    el("span", "fs", y),
  ),
    (g.onclick = () => selectItem(e)),
    e === sel && renderDetail());
}
var qMode = "all";
function setQ(e) {
  ((qMode = e),
    document
      .querySelectorAll("#qSeg button")
      .forEach((t) =>
        t.setAttribute("aria-pressed", String(t.dataset.q === e)),
      ),
    qFilter());
}
function qFilter() {
  const e = $("qSearch")
    .value.split(/\s+/)
    .map((e) => SpravkaCore.norm(e))
    .filter(Boolean);
  for (const t of items) {
    const a = sevOf(t),
      n = "all" === qMode || a === qMode || t === sel,
      i = SpravkaCore.norm(((t.P && t.P.name) || "") + " " + t.name);
    t.fi.hidden = !(n && e.every((e) => i.includes(e)));
  }
}
$("qSeg").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-q]");
  if (t) {
    setQ(t.dataset.q);
    const e = queueItems().find((e) => e.P);
    e && sevOf(sel || {}) !== qMode && "all" !== qMode && selectItem(e);
  }
});
let sel = null,
  pMode = "fixed",
  draft = null,
  focusKey = null;
const cloneP = (e) => ({
  ...e,
  fields: { ...e.fields },
  work: [...e.work],
  relatives: e.relatives.map((e) => ({ ...e })),
});
function commitDraft() {
  if (!draft) return !1;
  const e = draft.it,
    t = e.P;
  return (
    (e.P = draft.P),
    (draft = null),
    noteManual(e, t, e.P),
    histDiff(e, t, e.P, "Qo'lda tahrir"),
    e.fromBlank && (e.warnings = []),
    (e.reasons = reviewReasons(e.P)),
    (e.state = e.reasons.length ? "warn" : "ok"),
    (e.approved = !1),
    (unsaved = !0),
    renderCard(e),
    updateStats(),
    !0
  );
}
const HIST_MAX = 300;
function hist(e, t, a, n, i) {
  if (!e) return;
  const o = (e) =>
    (e = String(null == e ? "" : e)).length > 300 ? e.slice(0, 300) + "…" : e;
  ((e.hist = e.hist || []).push({
    t: Date.now(),
    src: t,
    label: String(a || ""),
    old: o(n),
    val: o(i),
  }),
    e.hist.length > HIST_MAX && e.hist.splice(0, e.hist.length - HIST_MAX));
}
const FLD_LBL = (e, t) =>
  "name" === t
    ? "F.I.Sh."
    : "since" === t
      ? "Tayinlangan sana"
      : "position" === t
        ? "Hozirgi lavozim"
        : "work" === t
          ? "Mehnat faoliyati"
          : "rel" === t
            ? "Qarindoshlar"
            : (e && e.S && e.S.labels && e.S.labels[t]) || t;
function histDiff(e, t, a, n) {
  if (!t || !a) return;
  for (const i of ["name", "since", "position"])
    (t[i] || "") !== (a[i] || "") && hist(e, n, FLD_LBL(a, i), t[i], a[i]);
  for (const i of new Set([
    ...Object.keys(t.fields || {}),
    ...Object.keys(a.fields || {}),
  ]))
    ((t.fields || {})[i] || "") !== ((a.fields || {})[i] || "") &&
      hist(e, n, FLD_LBL(a, i), (t.fields || {})[i], (a.fields || {})[i]);
  const i = t.work || [],
    o = a.work || [];
  if (JSON.stringify(i) !== JSON.stringify(o)) {
    const t = i.filter((e) => !o.includes(e)),
      a = o.filter((e) => !i.includes(e));
    for (let i = 0; i < Math.max(t.length, a.length); i++)
      hist(e, n, "Mehnat faoliyati", t[i] || "", a[i] || "");
  }
  (JSON.stringify(t.relatives || []) !== JSON.stringify(a.relatives || []) &&
    hist(
      e,
      n,
      "Qarindoshlar",
      `${(t.relatives || []).length} ta qator`,
      `${(a.relatives || []).length} ta qator (tahrirlandi)`,
    ),
    (t.photo || null) !== (a.photo || null) &&
      hist(
        e,
        n,
        "Rasm",
        t.photo ? "bor" : "yo'q",
        a.photo ? "almashtirildi" : "o'chirildi",
      ));
}
function renderHist(e) {
  const t = $("rHist");
  t.textContent = "";
  const a = e.hist || [];
  if ((($("rHistC").hidden = !a.length), !a.length)) return;
  $("rHistN").textContent = String(a.length);
  const n = el("ol", "hist");
  for (const e of a.slice().reverse().slice(0, 60)) {
    const t = el("li"),
      a = new Date(e.t);
    t.append(
      el(
        "small",
        "",
        `${a.toLocaleDateString("ru-RU")} ${a.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} · ${e.src}`,
      ),
    );
    const i = el("span");
    (i.append(el("b", "", e.label + ": ")),
      e.old && i.append(el("del", "", e.old), " → "),
      i.append(el("ins", "", e.val || "(bo'sh)")),
      t.append(i),
      n.append(t));
  }
  (t.append(n),
    a.length > 60 &&
      t.append(
        el(
          "p",
          "msg",
          `… va yana ${a.length - 60} ta oldingi yozuv («Tarix (CSV)» da hammasi).`,
        ),
      ));
}
function histCsv() {
  const t = [["Xodim", "Fayl", "Sana", "Manba", "Maydon", "Oldin", "Keyin"]];
  for (const a of items)
    for (const n of a.hist || []) {
      const i = new Date(n.t);
      t.push([
        a.P ? a.P.name : a.name,
        a.name,
        `${i.toLocaleDateString("ru-RU")} ${i.toLocaleTimeString("ru-RU")}`,
        n.src,
        n.label,
        n.old,
        n.val,
      ]);
    }
  return t;
}
function openEdit(e) {
  sel && sel.P && ((pMode = "edit"), (focusKey = e || null), renderDetail());
}
function fillFocus(e) {
  const t =
    $("rFill").querySelector(`[data-k="${e}"]`) ||
    ($("rFill").querySelector("select") && "birth_place" === e
      ? $("rFill").querySelector('[data-k="birth_place"]')
      : null);
  t && !$("rTodoC").hidden
    ? (t.scrollIntoView({ block: "center", behavior: "smooth" }),
      t.focus(),
      t.closest(".f") && t.closest(".f").classList.add("flash"),
      setTimeout(
        () => t.closest(".f") && t.closest(".f").classList.remove("flash"),
        1300,
      ))
    : openEdit(e);
}
($("pBody").addEventListener("click", (e) => {
  const t = e.target.closest("mark.q[data-k]");
  t && fillFocus(t.dataset.k);
}),
  $("pBody").addEventListener("keydown", (e) => {
    const t = e.target.closest("mark.q[data-k]");
    !t ||
      ("Enter" !== e.key && " " !== e.key) ||
      (e.preventDefault(), fillFocus(t.dataset.k));
  }),
  $("rFix").addEventListener("click", () => openEdit(null)),
  $("rZip").addEventListener("click", (e) => zipAll(e.currentTarget)));
const firstToReview = () => {
  const e = (e) => items.find((t) => t.P && sevOf(t) === e);
  return (
    ("all" === qMode ? e("serious") || e("minor") : e(qMode)) ||
    items.find((e) => e.P && !e.excluded) ||
    items.find((e) => e.P)
  );
};
function selectItem(e) {
  (draft && draft.it !== e && commitDraft(),
    (sel = e),
    items.forEach((t) => {
      (t.li.classList.toggle("sel", t === e),
        t.fi.classList.toggle("sel", t === e));
    }),
    "edit" === pMode && (pMode = "fixed"),
    renderDetail(),
    e.fi.scrollIntoView({ block: "nearest" }));
}
$("pTabs").addEventListener("click", (e) => {
  const t = e.target.closest("button[data-p]");
  t &&
    ("edit" === pMode &&
      "edit" !== t.dataset.p &&
      commitDraft() &&
      toast("O'zgarishlar saqlandi"),
    (pMode = t.dataset.p),
    renderDetail());
});
const queueItems = () => items.filter((e) => !e.fi.hidden);
function step(e) {
  const t = queueItems();
  if (!t.length) return;
  const a = t.indexOf(sel);
  selectItem(t[(a + e + t.length) % t.length]);
}
function markWords(e, t, a, n) {
  if (!a.length) return void e.append(t);
  const i = a
      .map((e) => e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .sort((e, t) => t.length - e.length),
    o = new RegExp(`(?<![\\p{L}])(${i.join("|")})(?![\\p{L}])`, "gu");
  let l,
    s = 0;
  for (; (l = o.exec(t));)
    (e.append(t.slice(s, l.index)),
      e.append(el("mark", n, l[1])),
      (s = l.index + l[1].length));
  e.append(t.slice(s));
}
($("dPrev").addEventListener("click", () => step(-1)),
  $("dNext").addEventListener("click", () => step(1)),
  $("dDownload").addEventListener("click", async () => {
    sel && sel.P && (await downloadOne(sel, $("dDownload"), $("dNote")));
  }),
  $("dApprove").addEventListener("click", () => {
    if (!sel || !sel.P) return;
    (draft && (commitDraft(), (pMode = "fixed")),
      (sel.approved = !0),
      (unsaved = !0),
      toast("Tasdiqlandi ✓"),
      (sel.state = "ok"),
      renderCard(sel),
      updateStats());
    const e = queueItems().filter(
        (e) => e.P && !e.excluded && !e.approved && "ok" !== e.state,
      ),
      t = items.indexOf(sel),
      a = e.find((e) => items.indexOf(e) > t) || e[0];
    a ? selectItem(a) : renderDetail();
  }));
const realFixes = (e) =>
  (e.fixes || []).filter((e) => e[0].toLowerCase() !== e[1].toLowerCase());
function renderOriginal(e) {
  const t = el("div", "page"),
    a = realFixes(e).map((e) => e[0]);
  if (!e.src)
    return (
      t.append(
        el("p", "", "Asl hujjat yo'q — bu ma'lumotnoma Excel'dan yaratilgan."),
      ),
      t
    );
  for (const n of e.src)
    if ("p" === n.t) {
      if (!n.text.trim()) continue;
      const e = el("p");
      (markWords(e, n.text.replace(/\t+/g, "   "), a, "ox"), t.append(e));
    } else {
      const e = el("table");
      for (const t of n.rows) {
        const n = el("tr");
        for (const e of t) {
          const t = el("td");
          (markWords(t, e, a, "ox"), n.append(t));
        }
        e.append(n);
      }
      t.append(e);
    }
  return t;
}
function renderFixed(e) {
  const t = el("div", "page"),
    a = e.S.labels,
    n = realFixes(e).map((e) => e[1]),
    isTech = isTechDept(
      (typeof items !== "undefined" && items.find((x) => x.P === e)) ||
        (typeof sel !== "undefined" && sel),
      e,
    ),
    i = (e, t, a, i) => {
      const o = el(t);
      if (a && !/^\?+$/.test(String(a).trim())) markWords(o, a, n, "fx");
      else if (isTech && ("grad_year" === i || "specialty" === i || "education" === i)) {
        o.append(el("span", "muted", "—"));
      } else {
        const e = el("mark", "q", i ? "bo'sh — to'ldirish" : "bo'sh");
        (i &&
          ((e.dataset.k = i),
          (e.title = "Bosing va to‘ldiring"),
          (e.tabIndex = 0)),
          o.append(e));
      }
      return (e.append(o), o);
    };
  if (e.photo && e.photo.bytes) {
    const a = el("img", "photo");
    ((a.alt = "Rasm"),
      (a.src = photoUrl(e.photo)),
      t.append(a));
  } else {
    const e = el("button", "nophoto", "Rasm qo'shish");
    ((e.type = "button"),
      (e.onclick = () => {
        ((photoTarget = sel), $("rPhotoIn").click());
      }),
      t.append(e));
  }
  (t.append(el("h4", "", e.S.title)),
    i(t, "h4", e.name, "name"),
    e.since && i(t, "p", e.since));
  i(t, "p", e.position, "position").style.fontWeight = "700";
  const o = el("div", "pg");
  for (const t of [
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
  ]) {
    const n = el("div");
    (n.append(el("b", "", a[t] + ":")),
      i(n, "span", e.fields[t], t),
      o.append(n));
  }
  t.append(o);
  for (const n of ["awards", "deputy"]) {
    const o = el("p");
    (o.append(el("b", "", a[n] + ": ")),
      i(o, "span", e.fields[n], n),
      t.append(o));
  }
  if (
    (t.append(el("div", "ph2", e.S.work)),
    e.work.forEach((e) => {
      const a = i(t, "p", e);
      /(?:ҳ\.в\.|h\.v\.)/.test(e) && a.querySelectorAll("mark").length;
    }),
    e.relatives.length)
  ) {
    t.append(el("div", "ph2", e.S.relTitle));
    const a = el("table"),
      i = el("tr");
    (e.S.relHeaders.forEach((e) => i.append(el("th", "", e))), a.append(i));
    for (const t of e.relatives) {
      const i = el("tr");
      ([
        e.S.relations[t.rel] || t.rel,
        t.name,
        SpravkaCore.relativeBirthYear(t.birth, e.S),
        t.work,
        t.address,
      ].forEach((e) => {
        const t = el("td");
        (e && markWords(t, e, n, "fx"), i.append(t));
      }),
        a.append(i));
    }
    t.append(a);
  } else {
    const a = el("div", "norel");
    a.append(
      e.S.latin
        ? "Qarindoshlar jadvali topilmadi — asl hujjatda yo‘q yoki rasm ko‘rinishida."
        : "Қариндошлар жадвали топилмади — асл ҳужжатда йўқ ёки расм кўринишида.",
    );
    const n = el("button", "", "Qo'lda qo'shish");
    ((n.type = "button"),
      (n.onclick = () => openEdit("relatives")),
      a.append(n),
      t.append(a));
  }
  return t;
}
const CHANGE_RE =
  /qo‘yildi|olindi|qo‘shildi|to‘ldirildi|yopildi|o‘girildi|tuzatildi|o‘qildi|almashtirildi/i;
function renderDetail() {
  const e = sel,
    t = $("pBody");
  ((t.textContent = ""),
    $("pTabs")
      .querySelectorAll("button")
      .forEach((e) =>
        e.setAttribute("aria-pressed", String(e.dataset.p === pMode)),
      ));
  const a = $("rChg");
  if (
    ((a.textContent = ""),
    ($("rTodo").textContent = ""),
    ($("rFill").textContent = ""),
    ($("dDownload").disabled = !(e && e.P)),
    ($("dApprove").disabled = !(e && e.P && !e.approved)),
    ($("dNote").textContent = ""),
    ($("rXlC").hidden = !0),
    ($("rXl").textContent = ""),
    ($("rHistC").hidden = !0),
    ($("rHist").textContent = ""),
    ($("rDone").hidden = !(
      items.some((e) => e.P) &&
      !items.some((e) => {
        const t = sevOf(e);
        return "serious" === t || "minor" === t;
      })
    )),
    renderDupCard(e),
    ($("rWho").textContent = e ? "— " + ((e.P && e.P.name) || e.name) : ""),
    !e)
  )
    return (
      t.append(
        el(
          "div",
          "empty-d",
          "Jadvaldan ma'lumotnomani tanlang yoki «Tekshiruvni boshlash»ni bosing.",
        ),
      ),
      a.append(el("li", "r", "—")),
      ($("rTodoC").hidden = !0),
      void ($("rChgN").textContent = "")
    );
  if (!e.P)
    return (
      t.append(
        el(
          "div",
          "empty-d",
          "queue" === e.state ? "Navbatda…" : e.reasons.join(" "),
        ),
      ),
      void ($("rTodoC").hidden = !0)
    );
  const n = e.P;
  if (
    (($("pTabs").querySelector('[data-p="both"]').hidden = !n.src),
    "both" !== pMode || n.src || (pMode = "fixed"),
    $("pTabs")
      .querySelectorAll("button")
      .forEach((e) =>
        e.setAttribute("aria-pressed", String(e.dataset.p === pMode)),
      ),
    ($("pLegend").hidden = "edit" === pMode),
    "edit" === pMode)
  ) {
    (draft && draft.it === e) || (draft = { it: e, P: cloneP(n) });
    const a = buildEditor(draft.P),
      i = () => {
        (commitDraft(),
          (pMode = "fixed"),
          renderDetail(),
          toast("O'zgarishlar saqlandi"));
      },
      o = el("div", "edbar");
    o.append(el("span", "", "Maydonlarni to'g'rilang va «Saqlash»ni bosing."));
    const l = el("div", "acts"),
      s = el("button", "btn2", "Bekor qilish"),
      r = el("button", "btn", "Saqlash");
    ((s.type = r.type = "button"),
      s.addEventListener("click", () => {
        ((draft = null),
          (pMode = "fixed"),
          renderDetail(),
          toast("O'zgarishlar bekor qilindi"));
      }),
      r.addEventListener("click", i),
      l.append(s, r),
      o.append(l));
    const d = el("button", "btn", "Saqlash");
    if (
      ((d.type = "button"),
      d.addEventListener("click", i),
      a.prepend(o),
      a.append(d),
      t.append(a),
      attachExcelLookup(a, draft),
      markEmpty(a),
      focusKey)
    ) {
      const e = a.querySelector(`[data-k="${focusKey}"]`);
      ((focusKey = null),
        e && (e.scrollIntoView({ block: "center" }), e.focus()));
    }
  } else if ("both" === pMode) {
    const e = el("div", "pages"),
      a = el("div", "pcol");
    a.append(el("span", "pl", "Asl hujjat"), renderOriginal(n));
    const i = el("div", "pcol");
    (i.append(el("span", "pl", "Tuzatilgan"), renderFixed(n)),
      e.append(a, i),
      t.append(e));
  } else t.append(renderFixed(n));
  (renderChanges(e), renderFillCard(e));
  const i = excelBlock(e);
  (i && ($("rXl").append(i), ($("rXlC").hidden = !1)), renderHist(e));
}
var chgAll = !1;
function renderChanges(e) {
  const t = e.P,
    a = $("rChg");
  a.textContent = "";
  const n = [],
    i = realFixes(t);
  if (i.length) {
    const e = el("li");
    (e.append(el("i", "aa", "Aa"), "Imlo: "),
      i.slice(0, 8).forEach(([t, a], n) => {
        (n && e.append(", "),
          e.append("«" + t + "» → "),
          e.append(el("b", "", "«" + a + "»")));
      }),
      i.length > 8 && e.append(` va yana ${i.length - 8} ta`),
      n.push(e));
  }
  for (const t of e.warnings) {
    if (!CHANGE_RE.test(t)) continue;
    const e = t.replace(/ — tekshiring\.?$| Tekshiring\.?$/, ""),
      [a, i] = /Excel/.test(e)
        ? ["", "XL"]
        : /qo‘shildi|yopildi|almashtirildi/.test(e)
          ? ["pl", "+"]
          : /Bo‘sh maydonlarga/.test(e)
            ? ["dt", "•"]
            : ["aa", "Aa"],
      o = el("li");
    (o.append(el("i", a, i), e), n.push(o));
  }
  if ((($("rChgN").textContent = n.length || ""), n.length)) {
    if (
      (n.slice(0, chgAll ? n.length : 4).forEach((e) => a.append(e)),
      n.length > 4)
    ) {
      const t = el("li", "more2"),
        i = el(
          "button",
          "",
          chgAll ? "Kamroq ko‘rsatish" : `Yana ${n.length - 4} ta`,
        );
      ((i.type = "button"),
        (i.onclick = () => {
          ((chgAll = !chgAll), renderChanges(e));
        }),
        t.append(i),
        a.append(t));
    }
  } else
    a.append(
      el(
        "li",
        "",
        e.fromBlank
          ? "Noldan yaratilgan — hamma ma'lumotni siz kiritasiz."
          : e.fromExcel
            ? "Excel'dagi ma'lumot bilan to'ldirildi."
            : "Faqat tartib namunaga keltirildi — matn o'zgarmadi.",
      ),
    );
}
function renderFillCard(e) {
  const t = e.P,
    a = $("rFill"),
    n = $("rTodo");
  ((a.textContent = ""), (n.textContent = ""));
  const i = "edit" === pMode,
    o = t.S.latin,
    l = t.S.labels,
    s = i ? [] : emptyKeys(t, !1, e),
    r = { S: t.S, name: "", position: "", fields: {} };
  for (const e of s) {
    let t;
    ((t =
      "birth_place" === e
        ? placeField(l.birth_place, r)
        : "party" === e
          ? partyField(l.party, r)
          : "education" === e
            ? eduField(l.education, r)
            : "title" === e
              ? titleField(l.title, r)
              : "birth_date" === e
                ? dateField(l.birth_date, r)
                : "name" === e
                  ? field(
                      "F.I.Sh.",
                      "",
                      (e) => {
                        r.name = e;
                      },
                      !1,
                      "name",
                    )
                  : "position" === e
                    ? field(
                        o ? "Hozirgi lavozimi" : "Ҳозирги лавозими",
                        "",
                        (e) => {
                          r.position = e;
                        },
                        !0,
                        "position",
                      )
                    : field(
                        l[e],
                        "",
                        (t) => {
                          r.fields[e] = t;
                        },
                        "grad_year" === e || "specialty" === e,
                        e,
                      )),
      a.append(t));
  }
  if (!i && !t.photo) {
    const t = el("div", "phrow");
    t.append(o ? "Rasm (3×4)" : "Расм (3×4)");
    const n = el("button", "btn2", "Rasm tanlash");
    ((n.type = "button"),
      (n.onclick = () => {
        ((photoTarget = e), $("rPhotoIn").click());
      }),
      t.append(n),
      a.append(t));
  }
  const d = (e.reasons || []).some((e) => /^Qarindosh/.test(e)),
    c = (e.reasons || []).some((e) => /^Lavozim/.test(e)),
    p = e.warnings.filter(
      (e) =>
        !(
          CHANGE_RE.test(e) ||
          /^Imlo tuzatildi/.test(e) ||
          /maydoni bo.sh|^Rasm topilmadi/.test(e) ||
          (d && /qarindoshlar jadvali/i.test(e)) ||
          (c && /lavozim satri/i.test(e))
        ),
    );
  [
    ...(i && draft && draft.it === e
      ? reviewReasons(draft.P, draft.it)
      : e.reasons
    )
      .filter((e) => !/^Bo‘sh:|^Rasm yo‘q|^F\.I\.Sh\. topilmadi/.test(e))
      .map(reasonTxt),
    ...p,
  ].forEach((e) => n.append(el("li", "", e)));
  const m = s.length + (i || t.photo ? 0 : 1) + n.children.length;
  (($("rTodoN").textContent = m || ""),
    ($("rFillSave").hidden = !s.length),
    ($("rFix").hidden = i),
    ($("rFix").textContent = n.children.length
      ? "Tahrirlash (qarindoshlar, mehnat…)"
      : "Tahrirlash"));
  const u = $("rFillHint");
  if (((u.textContent = ""), s.length && !i)) {
    u.append(
      "notfound" === e.xlStatus
        ? "Excel'da topilmadi. "
        : xl.rows && xl.rows.length
          ? "Excel'da ham yo'q. "
          : "",
    );
    const a = el(
      "button",
      "linkbtn",
      "Xodimga to'ldirish varag'ini yuklab olish",
    );
    ((a.type = "button"),
      (a.onclick = async () => {
        a.disabled = !0;
        try {
          await save(
            a,
            $("dNote"),
            outNameOf(t, e.file, "").replace(/\.$/, "") +
              " — to'ldirish uchun.pdf",
            await buildOut(t, "pdf", !0),
          );
        } finally {
          a.disabled = !1;
        }
      }),
      u.append(a));
  }
  (($("rTodoC").hidden = !m && i),
    m ||
      i ||
      (($("rTodoC").hidden = !1),
      n.append(el("li", "okline", "Hammasi to'ldirilgan ✓"))),
    ($("rFillSave").onclick = () => {
      if (
        r.fields.birth_date &&
        String(r.fields.birth_date).trim() &&
        !/^\d{2}\.\d{2}\.\d{4}$/.test(String(r.fields.birth_date).trim())
      )
        return void toast("Tug'ilgan sana kk.oo.yyyy ko'rinishida bo'lsin");
      const a = [],
        i = cloneP(t);
      (r.name.trim() &&
        ((t.name = niceName(toScript(r.name.trim(), o))), a.push("name")),
        r.position.trim() &&
          ((t.position = toScript(r.position.trim(), o)), a.push("position")));
      for (const [e, n] of Object.entries(r.fields)) {
        const i = String(n || "").trim();
        if (i) {
          ((t.fields[e] = [
            "party",
            "education",
            "birth_date",
            "birth_place",
            "title",
          ].includes(e)
            ? i
            : toScript(i, o)),
            a.push(e));
        }
      }
      if (!a.length) return void toast("Hech narsa yozilmadi");
      if (isEmptyV(t.fields.education) && t.fields.grad_year) {
        const e = SpravkaCore.eduFromGrad(t.fields.grad_year, o);
        e && (t.fields.education = e);
      }
      const n = e.manualKeys || (e.manualKeys = new Set());
      (a.forEach((e) => n.add(e)),
        histDiff(e, i, t, "Qo'lda tahrir"),
        (unsaved = !0),
        (e.reasons = reviewReasons(t)),
        e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
        renderCard(e),
        updateStats(),
        toast(`Saqlandi: ${a.length} ta maydon ✓`));
    }),
    (a.onkeydown = (e) => {
      "Enter" === e.key &&
        "INPUT" === e.target.tagName &&
        (e.preventDefault(), $("rFillSave").click());
    }));
}
var photoTarget = null;
function dlList() {
  const e =
    (document.querySelector('input[name="dlScope"]:checked') || {}).value ||
    "all";
  return items.filter(
    (t) =>
      t.P &&
      !t.excluded &&
      ("all" === e ||
        ("ok" === e && "ok" === sevOf(t)) ||
        ("sel" === e && t.selected)),
  );
}
$("rPhotoIn").addEventListener("change", async () => {
  const e = $("rPhotoIn").files[0];
  $("rPhotoIn").value = "";
  const t = photoTarget;
  if (((photoTarget = null), e && t && t.P))
    try {
      const a = !!t.P.photo;
      ((t.P.photo = await photoFromFile(e)),
        hist(t, "Qo'lda tahrir", "Rasm", a ? "bor" : "yo'q", "qo'shildi"),
        (unsaved = !0),
        (t.reasons = reviewReasons(t.P)),
        t.approved || (t.state = t.reasons.length ? "warn" : "ok"),
        renderCard(t),
        updateStats(),
        toast("Rasm qo‘shildi ✓"));
    } catch (e) {
      toast("Rasmni o'qib bo'lmadi");
    }
});
const isGone0 = (e) =>
    !(
      !(xl.ran && xl.rows.length && e.P) ||
      e.fromExcel ||
      "notfound" !== e.xlStatus
    ),
  isGone = (e) => isGone0(e) && !e.notGone;
function deptOf(e) {
  return void 0 !== xl.map.dept &&
    void 0 !== e.xlRow &&
    null !== e.xlRow &&
    xl.rows[e.xlRow]
    ? String(xl.rows[e.xlRow][xl.map.dept] || "")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}
function ensureCompared() {
  xl.rows.length &&
    (void 0 !== xl.map.name || void 0 !== xl.map.surname) &&
    items.some((e) => e.P && !e.fromExcel && !e.xlStatus) &&
    runCompare();
}
function dlRefresh() {
  ensureCompared();
  {
    const e = items.filter((e) => !e.excluded && isGone0(e)),
      t = e.filter((e) => !e.notGone).length;
    (($("dlGoneL").hidden = !e.length),
      ($("dlGoneN").textContent = e.length ? `(${t} ta)` : ""),
      ($("dlGoneD").hidden = !e.length || !$("dlGone").checked));
    const a = $("dlGoneList");
    a.textContent = "";
    for (const t of e) {
      const n = el("label"),
        i = el("input");
      ((i.type = "checkbox"),
        (i.checked = !t.notGone),
        (i.onchange = () => {
          ((t.notGone = !i.checked),
            store.dirty.add(t),
            store.schedule(),
            ($("dlGoneN").textContent =
              `(${e.filter((e) => !e.notGone).length} ta)`));
        }),
        n.append(
          i,
          el(
            "span",
            "",
            (t.P.name || t.name) + (t.folder ? ` — ${t.folder}` : ""),
          ),
        ),
        a.append(n));
    }
    $("dlDeptL").hidden = !(
      xl.ran &&
      void 0 !== xl.map.dept &&
      items.some((e) => deptOf(e))
    );
  }
  const e = items.filter((e) => e.P && !e.excluded),
    t = e.filter((e) => "ok" === sevOf(e)).length,
    a = e.filter((e) => e.selected).length,
    n = items.filter((e) => e.excluded).length;
  (($("dlAllN").textContent = `${e.length} ta${n ? " · takrorlarsiz" : ""}`),
    ($("dlOkN").textContent = `${t} ta`),
    ($("dlSelN").textContent = a ? `${a} ta tanlangan` : "jadvalda belgilang"));
  const i = document.querySelector('input[name="dlScope"][value="sel"]');
  ((i.disabled = !a),
    !a &&
      i.checked &&
      (document.querySelector('input[name="dlScope"][value="all"]').checked =
        !0));
  const o = dlList(),
    l = document.querySelector('input[name="dlFmt"]:checked').value,
    s = o.filter((e) => {
      const t = sevOf(e);
      return "ok" !== t && "gone" !== t;
    }).length,
    r = o.filter((e) => !e.P.photo).length,
    d = [];
  (s &&
    d.push(
      `${s} tasi hali tasdiqlanmagan${$("dlSplit").checked ? " — ular «Tekshirish_kerak» papkasiga tushadi" : ""}.`,
    ),
    r && d.push(`${r} tasida rasm yo'q.`),
    ($("dlWarn").hidden = !d.length),
    ($("dlWarnT").textContent = d.join(" ")));
  const c = "docx" === l ? 0.03 : "pdf" === l ? 0.09 : 0.12,
    p = Math.round(o.length * c);
  (($("dlInfo").textContent =
    `${o.length * ("both" === l ? 2 : 1)} ta fayl · ZIP arxiv · ${p < 60 ? "bir necha soniya" : "taxminan " + Math.round(p / 60) + " daqiqa"}`),
    ($("dlGo").disabled = !o.length));
}
function zipAll() {
  (draft && commitDraft(), closeFmt(null), dlRefresh());
  const e = $("dl");
  e.showModal ? e.showModal() : e.setAttribute("open", "");
}
($("dl").addEventListener("change", dlRefresh),
  $("dlX").addEventListener("click", () => $("dl").close()),
  $("dlCancel").addEventListener("click", () => $("dl").close()),
  $("dl").addEventListener("click", (e) => {
    e.target === $("dl") && $("dl").close();
  }),
  $("dl").addEventListener("close", () => {
    store.saveXl();
  }),
  $("dlGo").addEventListener("click", async () => {
    const e = $("dlGo"),
      t = $("dlInfo"),
      a = document.querySelector('input[name="dlFmt"]:checked').value,
      n = "both" === a ? ["docx", "pdf"] : [a],
      i = !$("dlGoneL").hidden && $("dlGone").checked,
      o = !$("dlDeptL").hidden && $("dlDept").checked,
      l = $("dlSplit").checked,
      s = $("dlFolders").checked,
      r = $("dlReport").checked,
      d = dlList();
    if (d.length) {
      ((e.disabled = !0), ($("dlCancel").disabled = !0));
      try {
        const a = new JSZip(),
          c = new Set();
        let p = 0;
        t.className = "msg";
        t.textContent = `Tayyorlanmoqda: 0 / ${d.length}`;
        for (const e of d) {
          const r = i && isGone(e),
            m =
              o && !r
                ? (deptOf(e) || "Bo'lim_aniqlanmagan")
                    .replace(/[\\/:*?"<>|]/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 100) + "/"
                : s && e.folder
                  ? e.folder.replace(/[\\:*?"<>|]/g, "") + "/"
                  : "",
            u =
              (r
                ? "Ishdan_ketganlar/"
                : l
                  ? "ok" === sevOf(e)
                    ? "Tayyor/"
                    : "Tekshirish_kerak/"
                  : "") + m;
          let h = nameFor(e.P, e.file, "").replace(/\.$/, ""),
            f = h,
            g = 2;
          for (; n.some((e) => c.has((u + h + "." + e).toLowerCase()));)
            h = `${f} (${g++})`;
          for (const t of n)
            (c.add((u + h + "." + t).toLowerCase()),
              a.file(u + h + "." + t, await buildOut(e.P, t)));
          ++p % (n.includes("pdf") ? 1 : 5) == 0 &&
            ((t.className = "msg"),
            (t.textContent = `Tayyorlanmoqda: ${p} / ${d.length}`),
            await new Promise((e) => setTimeout(e, 0)));
        }
        (r && a.file("hisobot.csv", rowsToCsv(reportCsv())),
          (t.textContent = "ZIP yig'ilmoqda: 0%"));
        const m = await a.generateAsync(
          { type: "uint8array", compression: "STORE" },
          (e) => {
            t.textContent = `ZIP yig'ilmoqda: ${Math.round(e.percent || 0)}%`;
          },
        );
        (await save(e, $("bNote"), "malumotnomalar.zip", m))
          ? ((unsaved = !1),
            $("dl").close(),
            toast(`ZIP arxiv yuklab olindi: ${d.length} ta ma'lumotnoma ✓`))
          : ((t.className = "msg err"),
            (t.textContent = $("bNote").textContent || "Saqlab bo'lmadi."));
      } catch (e) {
        ((t.className = "msg err"),
          (t.textContent = "Xato: " + ((e && e.message) || e)));
      } finally {
        ((e.disabled = !1), ($("dlCancel").disabled = !1));
      }
    }
  }));
