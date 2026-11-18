/**
 * 07-storage.js — IndexedDB xotira boshqaruvi, Zaxira nusxa (Backup/Restore) va Umumiy kompyuter 30-daqiqalik avto-tozalash
 */
const outNameOf = (e, t, a = "docx") =>
  ((e.name || "")
    .replace(/[\\/:*?"<>|]/g, "")
    .replace(/\s+/g, " ")
    .trim() || t.name.replace(/\.(?:docx?|pdf)$/i, "") + "_standart") +
  "." +
  a;
var dbP = null;
function openDB() {
  return (
    dbP ||
    (dbP = new Promise((e) => {
      try {
        const t = indexedDB.open("malumotnoma", 2);
        ((t.onupgradeneeded = () => {
          const e = t.result;
          for (const t of ["kv", "items", "files", "meta"])
            e.objectStoreNames.contains(t) || e.createObjectStore(t);
        }),
          (t.onsuccess = () => e(t.result)),
          (t.onerror = () => e(null)),
          (t.onblocked = () => e(null)));
      } catch (t) {
        e(null);
      }
    }))
  );
}
function dbGet(e, t) {
  return openDB().then(
    (a) =>
      new Promise((n) => {
        if (!a) return n(null);
        try {
          const i = a.transaction(e).objectStore(e).get(t);
          ((i.onsuccess = () => n(i.result)), (i.onerror = () => n(null)));
        } catch (e) {
          n(null);
        }
      }),
  );
}
function dbAll(e) {
  return openDB().then(
    (t) =>
      new Promise((a) => {
        const n = new Map();
        if (!t) return a(n);
        try {
          const i = t.transaction(e).objectStore(e).openCursor();
          ((i.onsuccess = () => {
            const e = i.result;
            e ? (n.set(e.key, e.value), e.continue()) : a(n);
          }),
            (i.onerror = () => a(n)));
        } catch (e) {
          a(n);
        }
      }),
  );
}
const ITEM_KEYS = [
  "id",
  "name",
  "folder",
  "state",
  "approved",
  "reasons",
  "warnings",
  "summary",
  "xlRow",
  "xlManual",
  "xlManualName",
  "xlReject",
  "xlOk",
  "hist",
  "notGone",
  "xlStatus",
  "xlApplied",
  "xlFuzzy",
  "xlAuto",
  "xlChanges",
  "fromBlank",
  "fromExcel",
  "excluded",
];
function packItem(e) {
  const t = {};
  for (const a of ITEM_KEYS) void 0 !== e[a] && (t[a] = e[a]);
  if (
    ((t.fileName = e.file && e.file.name),
    (t.manualKeys = e.manualKeys ? [...e.manualKeys] : null),
    e.P)
  ) {
    const { S: a, photo: n, src: i, ...o } = e.P;
    ((t.P = o), (t.lat = !(!a || !a.latin)));
  }
  return t;
}
function unpackItem(e, t, a) {
  const n = { ...e, warnings: e.warnings || [], reasons: e.reasons || [] };
  return (
    (n.file = t || { name: e.fileName || e.name }),
    (n._fileSaved = !!t),
    (n.manualKeys = e.manualKeys ? new Set(e.manualKeys) : null),
    e.P &&
      ((n.P = {
        ...e.P,
        S: SpravkaCore.SCRIPTS[e.lat ? "lat" : "cyr"],
        photo: (a && a.photo) || null,
        src: (a && a.src) || null,
      }),
      (n._hp = n.P.photo),
      (n._hs = n.P.src)),
    delete n.lat,
    delete n.fileName,
    (n.li = el("tr", "item")),
    (n.fi = el("li")),
    n
  );
}
var store = {
  seq: 0,
  dirty: new Set(),
  t: null,
  ok: !0,
  pending: !1,
  restoring: !1,
  warned: !1,
  safe() {
    return this.ok && !this.dirty.size && !this.t;
  },
  schedule() {
    this.t || (this.t = setTimeout(() => this.flush(), 1200));
  },
  async flush() {
    if ((clearTimeout(this.t), (this.t = null), this.pending)) return;
    const e = await openDB();
    if (!e) return void (this.ok = !1);
    const t = [...this.dirty];
    if ((this.dirty.clear(), !t.length && !this.xlDirty && !this.coiDirty))
      return;
    const a = this.xlDirty;
    this.xlDirty = !1;
    try {
      (await new Promise((n, i) => {
        const o = e.transaction(["items", "files", "meta"], "readwrite"),
          l = o.objectStore("items"),
          s = o.objectStore("files"),
          r = o.objectStore("meta");
        for (const e of t)
          items.includes(e)
            ? (l.put(packItem(e), e.id),
              !e._fileSaved &&
                "undefined" != typeof Blob &&
                e.file instanceof Blob &&
                (s.put(e.file, e.id), (e._fileSaved = !0)),
              !e.P ||
                (e._hp === e.P.photo && e._hs === e.P.src) ||
                (s.put(
                  { photo: e.P.photo || null, src: e.P.src || null },
                  "h" + e.id,
                ),
                (e._hp = e.P.photo),
                (e._hs = e.P.src)))
            : (l.delete(e.id), s.delete(e.id), s.delete("h" + e.id));
        (r.put(
          items.filter((e) => e.id).map((e) => e.id),
          "order",
        ),
          r.put(
            {
              n: items.length,
              approved: items.filter((e) => e.approved).length,
              ok: items.filter((e) => "ok" === e.state).length,
              ts: Date.now(),
              script: scriptNow(),
              seq: this.seq,
            },
            "info",
          ),
          this.coiDirty && (r.put(coiReg, "coi"), (this.coiDirty = !1)),
          a &&
            r.put(
              xl.rows && xl.rows.length
                ? {
                    headers: xl.headers,
                    rows: xl.rows,
                    map: xl.map,
                    ran: !!xl.ran,
                    prevHeaders: xl.prevHeaders,
                    fileName: xl.fileName,
                    sources: xl.sources || null,
                    primary: $("xlPrimary").checked,
                    lead: xl.lead || null,
                    gone: xl.gone || null,
                  }
                : null,
              "xl",
            ),
          (o.oncomplete = n),
          (o.onerror = () => i(o.error)),
          (o.onabort = () => i(o.error)));
      }),
        (this.ok = !0),
        (savedAt = Date.now()),
        updateSaved(),
        memSoon());
    } catch (e) {
      this.ok = !1;
      for (const e of t) ((e._fileSaved = !1), (e._hp = e._hs = void 0));
      this.warned ||
        ((this.warned = !0),
        toast(
          e && "QuotaExceededError" === e.name
            ? "Brauzer xotirasi to'ldi — ish saqlanmayapti. Natijani yuklab oling."
            : "Ishni brauzerda saqlab bo'lmadi — natijani yuklab olishni unutmang.",
        ));
    }
  },
  saveXl() {
    ((this.xlDirty = !0), this.schedule());
  },
  async clear() {
    (this.dirty.clear(),
      clearTimeout(this.t),
      (this.t = null),
      (this.pending = !1),
      ($("restore").hidden = !0));
    const e = await openDB();
    if (e)
      try {
        const t = e.transaction(["items", "files", "meta"], "readwrite");
        for (const e of ["items", "files", "meta"]) t.objectStore(e).clear();
      } catch (e) {}
  },
  async restore(e) {
    if (!this.pending) return;
    ((this.pending = !1), ($("restore").hidden = !0));
    const [t, a, n, i, o, l] =
      e ||
      (await Promise.all([
        dbGet("meta", "order"),
        dbGet("meta", "info"),
        dbAll("items"),
        dbAll("files"),
        dbGet("meta", "xl"),
        dbGet("meta", "coi"),
      ]));
    (l && "object" == typeof l && (coiReg = l), (this.restoring = !0));
    try {
      if (a && a.script) {
        const e = document.querySelector(
          `input[name="script"][value="${a.script}"]`,
        );
        e && (e.checked = !0);
      }
      this.seq = Math.max(
        this.seq,
        (a && a.seq) || 0,
        ...[...n.keys()].map(Number).filter((e) => !isNaN(e)),
      );
      const e = t && t.length ? t : [...n.keys()],
        l = [],
        s = [];
      for (const t of e) {
        const e = n.get(t);
        if (!e) continue;
        const a = unpackItem(e, i.get(t), i.get("h" + t));
        (a.folder || "")
          .split("/")
          .some((e) => NONSTAFF_DIR_RE.test(e) || GONE_RE.test(e)) ||
        NONSTAFF_FILE_RE.test(a.name || "") ||
        ("function" == typeof isSummaryTableDoc && isSummaryTableDoc(a.P))
          ? s.push(a)
          : (l.push(a),
            "queue" === a.state &&
              a.file &&
              a.file.arrayBuffer &&
              queue.push(a));
      }
      if ((items.unshift(...l), s.length)) {
        for (const e of s) this.dirty.add(e);
        (this.schedule(),
          setTimeout(
            () =>
              toast(
                `«PhD» va «Ishdan ketganlar» papkalaridagi ${s.length} ta fayl ro'yxatdan olib tashlandi`,
              ),
            1500,
          ));
      }
      for (const e of l.slice().reverse())
        (list.prepend(e.li), flist.prepend(e.fi));
      o &&
        o.rows &&
        o.rows.length &&
        (Object.assign(xl, {
          headers: o.headers,
          rows: o.rows,
          map: o.map || {},
          ran: !!o.ran,
          prevHeaders: o.prevHeaders,
          fileName: o.fileName,
          sources: o.sources || null,
          used: null,
          lead: o.lead || null,
          gone: o.gone || null,
        }),
        ($("xlPrimary").checked = !1 !== o.primary),
        drawMap(),
        ($("xlActs").hidden = !1),
        ($("xlInfo").textContent =
          `«${o.fileName || "Excel"}» — ${xl.rows.length} ta qator (saqlangan nusxadan).`),
        calcUnmatched(),
        drawNew());
      for (const e of l) migrateItem(e);
      setTimeout(() => shrinkOld(l), 1500);
      for (const e of l) renderCard(e);
      xl.ran && setTimeout(renderConf, 0);
    } finally {
      this.restoring = !1;
    }
    ((dupSig = ""),
      updateStats(),
      pump(),
      toast(`Oldingi ish tiklandi: ${items.length} ta ma'lumotnoma`));
  },
};
async function shrinkOld(e) {
  for (const t of e) {
    const e = t.P && t.P.photo;
    if (!e || !e.bytes || e.bytes.length < PHOTO_BIG) continue;
    const a = await shrinkPhoto(e);
    a !== e &&
      items.includes(t) &&
      ((t.P.photo = a), store.dirty.add(t), store.schedule());
  }
}
function fixDocName(e, t) {
  const a = e.P;
  if (!a || !a.name) return !1;
  const n = cleanPersonName(a.name);
  if (
    !n ||
    n === a.name ||
    n.split(" ").length < Math.min(3, a.name.split(/\s+/).length) - 1
  )
    return !1;
  const i = a.name;
  if (((a.name = n), a.relHeadingName)) {
    const e = cleanPersonName(a.relHeadingName);
    e && (a.relHeadingName = e);
  }
  return (
    (e.warnings = e.warnings || []).push(
      `F.I.Sh. tuzatildi: «${i}» → «${n}» (ortiqcha so'z yoki aralash harf)`,
    ),
    t && hist(e, "Avtomatik tuzatish", a.S.latin ? "F.I.Sh." : "Ф.И.Ш.", i, n),
    !0
  );
}
function migrateItem(e) {
  const t = e.P;
  if (!t || !SpravkaCore.mergeWork) return;
  fixDocName(e, !0) && (store.dirty.add(e), store.schedule());
  const a = [],
    n = cloneP(t);
  ((t.name = SpravkaCore.stripNameNote(t.name, a)),
    (t.relHeadingName = SpravkaCore.stripNameNote(t.relHeadingName, a)),
    t.fields &&
      t.fields.grad_year &&
      (t.fields.grad_year = String(t.fields.grad_year)
        .split(/\n/)
        .map((e) =>
          e
            .replace(
              /^(?:(?:тугалланмаган\s+)?(?:олий|oliy)(?:\s+маълумот(?:ли)?)?)[\s,.;:()-]+/iu,
              "",
            )
            .trim(),
        )
        .filter(Boolean)
        .join("\n")));
  const i = SpravkaCore.mergeWork(t.work).map((e) =>
    SpravkaCore.fixWorkLine(e, t.S.latin),
  );
  if (
    (JSON.stringify(i) !== JSON.stringify(t.work) && (t.work = i),
    JSON.stringify(n.work) !== JSON.stringify(t.work) ||
      n.name !== t.name ||
      n.relHeadingName !== t.relHeadingName)
  ) {
    for (const t of [...new Set(a)])
      e.warnings.push(
        `F.I.Sh. yonidagi izoh olib tashlandi: «(${t})» — bu ism emas, kerak bo‘lsa alohida qayd eting.`,
      );
    (histDiff(e, n, t, "Avtomatik tuzatish"),
      (e.reasons = reviewReasons(t)),
      e.approved || (e.state = e.reasons.length ? "warn" : "ok"),
      store.dirty.add(e),
      store.schedule());
  } else {
    const a = reviewReasons(t);
    "err" !== e.state &&
      a.join("|") !== (e.reasons || []).join("|") &&
      ((e.reasons = a),
      e.approved || (e.state = a.length ? "warn" : "ok"),
      store.dirty.add(e),
      store.schedule());
  }
}
function markDirty(e) {
  store.restoring ||
    (e.id || (e.id = ++store.seq), store.dirty.add(e), store.schedule());
}
(document.addEventListener("visibilitychange", () => {
  "hidden" === document.visibilityState &&
    (store.t || store.dirty.size) &&
    store.flush();
}),
  window.addEventListener("pagehide", () => {
    (store.t || store.dirty.size) && store.flush();
  }),
  $("restoreYes").addEventListener("click", () => store.restore()));
const BKP_NAME = "zaxira.json",
  u8b64 = (e) => {
    let t = "";
    for (let a = 0; a < e.length; a += 32768)
      t += String.fromCharCode.apply(null, e.subarray(a, a + 32768));
    return btoa(t);
  },
  b64u8 = (e) => {
    const t = atob(e),
      a = new Uint8Array(t.length);
    for (let e = 0; e < t.length; e++) a[e] = t.charCodeAt(e);
    return a;
  },
  bkpRep = (e, t) =>
    t instanceof Uint8Array
      ? { __u8: u8b64(t) }
      : t instanceof ArrayBuffer
        ? { __u8: u8b64(new Uint8Array(t)) }
        : t instanceof Map
          ? { __map: [...t] }
          : t instanceof Set
            ? { __set: [...t] }
            : t,
  bkpRev = (e, t) =>
    t && "object" == typeof t
      ? void 0 !== t.__u8
        ? b64u8(t.__u8)
        : t.__map
          ? new Map(t.__map)
          : t.__set
            ? new Set(t.__set)
            : t
      : t;
async function backupExport(e) {
  if (!items.some((e) => e.P || "err" === e.state))
    return void toast("Saqlanadigan ish yo'q");
  draft && commitDraft();
  const t = e.textContent;
  ((e.disabled = !0), (e.textContent = "Tayyorlanmoqda…"));
  try {
    for (const e of items) e.id || (e.id = ++store.seq);
    const t = new JSZip(),
      a = {},
      n = {},
      i = [];
    for (const e of items)
      (i.push([e.id, packItem(e)]),
        e.P &&
          (e.P.photo || e.P.src) &&
          (a["h" + e.id] = { photo: e.P.photo || null, src: e.P.src || null }),
        "undefined" != typeof Blob &&
          e.file instanceof Blob &&
          ((n[e.id] = e.file.name || e.name || "fayl_" + e.id),
          t.file("fayllar/" + e.id, e.file)));
    const o =
        xl.rows && xl.rows.length
          ? {
              headers: xl.headers,
              rows: xl.rows,
              map: xl.map,
              ran: !!xl.ran,
              prevHeaders: xl.prevHeaders,
              fileName: xl.fileName,
              primary: $("xlPrimary").checked,
              lead: xl.lead || null,
              gone: xl.gone || null,
            }
          : null,
      l = {
        n: items.length,
        approved: items.filter((e) => e.approved).length,
        ok: items.filter((e) => "ok" === e.state).length,
        ts: Date.now(),
        script: scriptNow(),
        seq: store.seq,
      },
      s = {
        app: "malumotnoma-tuzatgich",
        v: 1,
        ts: Date.now(),
        order: items.map((e) => e.id),
        info: l,
        items: i,
        heavy: a,
        fileNames: n,
        xl: o,
        coi: (void 0 !== coiReg && coiReg) || null,
      };
    (t.file(BKP_NAME, JSON.stringify(s, bkpRep)),
      t.file(
        "OQING.txt",
        "Bu «Ma'lumotnoma tuzatgich» ishining zaxira nusxasi. Tiklash uchun dasturda «Zaxiradan tiklash»ni bosing yoki faylni yuklash maydoniga tashlang. Ichida xodimlarning shaxsiy ma'lumotlari bor — begona joyda saqlamang.",
      ));
    const r = await t.generateAsync({
        type: "uint8array",
        compression: "DEFLATE",
        compressionOptions: { level: 3 },
      }),
      d = new Date(),
      c = `malumotnoma-zaxira_${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}_${p2(d.getHours())}-${p2(d.getMinutes())}.zip`;
    (await save(e, $("bNote"), c, r)) &&
      toast(`Zaxira nusxa saqlandi: ${i.length} ta ma'lumotnoma`);
  } catch (e) {
    (($("bNote").className = "msg err"),
      ($("bNote").textContent =
        "Zaxira nusxani yaratib bo‘lmadi: " + ((e && e.message) || e)));
  } finally {
    ((e.disabled = !1), (e.textContent = t));
  }
}
async function backupImport(e) {
  let t;
  try {
    t = JSON.parse(await e.file(BKP_NAME).async("string"), bkpRev);
  } catch (e) {
    return void toast("Zaxira faylini o'qib bo'lmadi");
  }
  if (!t || "malumotnoma-tuzatgich" !== t.app || !Array.isArray(t.items))
    return void toast("Bu fayl dasturning zaxira nusxasi emas");
  if (
    items.length &&
    !window.confirm(
      `Zaxiradagi ${t.items.length} ta ma'lumotnoma yuklansinmi?\nHozirgi ro'yxat (${items.length} ta) zaxiradagisi bilan almashtiriladi.`,
    )
  )
    return;
  (revokePhotoUrls(),
    (items.length = 0),
    (queue.length = 0),
    (draft = null),
    (unsaved = !1),
    (list.textContent = ""),
    (flist.textContent = ""),
    (sel = null),
    (dupSig = ""),
    addedKeys.clear(),
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
    }),
    await store.clear());
  const a = {};
  for (const [n, i] of Object.entries(t.fileNames || {})) {
    const t = e.file("fayllar/" + n);
    t && (a[n] = new File([await t.async("blob")], i));
  }
  const n = new Map(t.items.map(([e, t]) => [e, t])),
    i = new Map();
  for (const [e] of t.items) a[e] && i.set(e, a[e]);
  for (const [e, a] of Object.entries(t.heavy || {})) i.set(e, a);
  const o = [
      t.order || t.items.map((e) => e[0]),
      { ...(t.info || {}), n: t.items.length },
      n,
      i,
      t.xl || null,
      t.coi || null,
    ],
    l = await openDB();
  (l &&
    (await new Promise((e, n) => {
      const i = l.transaction(["items", "files", "meta"], "readwrite"),
        o = i.objectStore("items"),
        s = i.objectStore("files"),
        r = i.objectStore("meta");
      for (const [e, n] of t.items) (o.put(n, e), a[e] && s.put(a[e], e));
      for (const [e, a] of Object.entries(t.heavy || {})) s.put(a, e);
      (r.put(t.order || t.items.map((e) => e[0]), "order"),
        r.put({ ...(t.info || {}), n: t.items.length, ts: Date.now() }, "info"),
        t.xl && r.put(t.xl, "xl"),
        t.coi && r.put(t.coi, "coi"),
        (i.oncomplete = e),
        (i.onerror = () => n(i.error)),
        (i.onabort = () => n(i.error)));
    })),
    (store.pending = !0),
    await store.restore(o),
    xlStatus(),
    renderDetail(),
    updateStats(),
    xl.ran && renderConf());
  const s = new Date(t.ts || Date.now());
  toast(
    `Zaxiradan tiklandi: ${t.items.length} ta ma'lumotnoma (${s.toLocaleDateString("ru-RU")} ${s.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })})`,
  );
}
($("bkpSave").addEventListener("click", (e) => backupExport(e.currentTarget)),
  $("bkpLoad").addEventListener("click", () => $("bkpFile").click()),
  $("bkpFile").addEventListener("change", async () => {
    const e = $("bkpFile").files[0];
    if ((($("bkpFile").value = ""), e))
      try {
        const t = await JSZip.loadAsync(await e.arrayBuffer());
        if (!t.file(BKP_NAME))
          return void toast(
            "Bu fayl dasturning zaxira nusxasi emas — ma'lumotnomalarni yuklash maydoniga tashlang",
          );
        await backupImport(t);
      } catch (e) {
        toast("Faylni ochib bo'lmadi: " + ((e && e.message) || e));
      }
  }),
  $("restoreNo").addEventListener("click", () => {
    (store.clear(), toast("Saqlangan ish o'chirildi"));
  }));
let rDelT = null;
($("restoreDel").addEventListener("click", async () => {
  const e = $("restoreDel");
  if (!e.dataset.sure)
    return (
      (e.dataset.sure = "1"),
      e.classList.add("danger"),
      (e.textContent = "Rostdan o'chirilsinmi? Yana bosing"),
      clearTimeout(rDelT),
      void (rDelT = setTimeout(() => {
        (delete e.dataset.sure,
          e.classList.remove("danger"),
          (e.textContent = "O'chirish"));
      }, 4e3))
    );
  (clearTimeout(rDelT),
    delete e.dataset.sure,
    e.classList.remove("danger"),
    (e.textContent = "O'chirish"),
    await store.clear());
  try {
    await idb("del");
  } catch (e) {}
  toast("Saqlangan ish butunlay o'chirildi");
}),
  $("xlPrimary").addEventListener("change", () => {
    (store.saveXl(), xl.ran && runCompare());
  }));
const IDLE_MS = 18e5,
  IDLE_WARN = 60,
  shared = { on: !1, last: Date.now(), t: null, cd: null, left: 0 };
function kvGet(e) {
  return openDB().then(
    (t) =>
      new Promise((a) => {
        if (!t) return a(null);
        try {
          const n = t.transaction("kv").objectStore("kv").get(e);
          ((n.onsuccess = () => a(n.result)), (n.onerror = () => a(null)));
        } catch (e) {
          a(null);
        }
      }),
  );
}
function kvPut(e, t) {
  return openDB().then(
    (a) =>
      new Promise((n) => {
        if (!a) return n(null);
        try {
          const i = a
            .transaction("kv", "readwrite")
            .objectStore("kv")
            .put(t, e);
          ((i.onsuccess = () => n(!0)), (i.onerror = () => n(null)));
        } catch (e) {
          n(null);
        }
      }),
  );
}
function hasWork() {
  return items.length > 0 || !(!xl.rows || !xl.rows.length) || store.pending;
}
function idleTick() {
  if (
    shared.on &&
    !shared.cd &&
    Date.now() - shared.last >= 18e5 &&
    hasWork()
  ) {
    ((shared.left = 60), ($("idleW").hidden = !1));
    const e = () => {
      $("idleTxt").textContent =
        `30 daqiqa ishlatilmadi. Shaxsiy ma'lumotlar qolib ketmasligi uchun ro'yxat va Excel ${shared.left} soniyadan keyin o'chiriladi.`;
    };
    (e(),
      (shared.cd = setInterval(() => {
        (shared.left--, e(), shared.left <= 0 && sharedWipe());
      }, 1e3)));
  }
}
function idleReset() {
  shared.last = Date.now();
}
function idleCancel() {
  (clearInterval(shared.cd),
    (shared.cd = null),
    ($("idleW").hidden = !0),
    idleReset());
}
async function sharedWipe() {
  (clearInterval(shared.cd),
    (shared.cd = null),
    ($("idleW").hidden = !0),
    wipeList());
  try {
    await xlWipe(!0);
  } catch (e) {}
  try {
    ((coiReg = {}), (coiRows = []));
  } catch (e) {}
  (showView("list"),
    idleReset(),
    toast("Umumiy kompyuter rejimi: ish tozalandi"));
}
