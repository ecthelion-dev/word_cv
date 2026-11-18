/**
 * 10-dual-excel.js
 * Separate authoritative sources:
 *   1) employees Excel: staff rate + first employment date.
 *   2) personnel database Excel: current department + position.
 *
 * For duplicate employees.xlsx rows, the earliest valid date is treated as
 * the first employment date and the latest dated row supplies the current rate.
 */
XL_FIELDS.push([
  "rate",
  "Stavka",
  ["ставка", "stavka", "stavkasi", "ставкаси", "stavka miqdori", "штат бирлиги"],
]);

/* The personnel workbook uses the long-form Cyrillic F.I.Sh. header. */
XL_FIELDS[0][2].push(
  "фамилияси исми ва отасининг исми",
  "familiyasi ismi va otasining ismi",
  "фамилия имя и отчество",
);

function dualEnsureSources() {
  if (!xl.sources || typeof xl.sources !== "object") {
    xl.sources = { employee: null, positions: null, merged: false };
  }
  return xl.sources;
}
dualEnsureSources();

const dualBaseLoadExcel = loadExcel;
const dualBaseRunCompare = runCompare;
const dualBaseWipeExcel = xlWipe;
const dualBaseRestore = store.restore;

function dualSourceName(row, map) {
  const value =
    (map && map.name !== undefined ? String(row[map.name] || "") : "") ||
    [
      map && map.surname !== undefined ? row[map.surname] : "",
      map && map.first !== undefined ? row[map.first] : "",
      map && map.patr !== undefined ? row[map.patr] : "",
    ]
      .filter(Boolean)
      .join(" ");
  const cleaned = cleanPersonName(String(value || "").replace(/\s+/g, " ").trim());
  return cleaned || String(value || "").replace(/\s+/g, " ").trim();
}

function dualSheetPriority(name) {
  const value = String(name || "").toLowerCase();
  if (/ходимлар.*рўйхати|ходимлар.*руйхати|xodimlar.*royxati/.test(value)) return 300;
  if (/^асосий$|^asosiy$/.test(value.trim())) return 200;
  if (/профессор.?ўқитувчи|профессор.?укитувчи|professor.?o.?qituvchi/.test(value)) return 100;
  return 0;
}

const DUAL_EXTRA_FIELDS = [
  ["birth_date", "Tug‘ilgan sana (2-Excel)"],
  ["birth_place", "Tug‘ilgan joyi (2-Excel)"],
  ["nationality", "Millati (2-Excel)"],
  ["party", "Partiyaviyligi (2-Excel)"],
  ["education", "Ma’lumoti (2-Excel)"],
  ["grad_year", "Tamomlagan (2-Excel)"],
  ["grad_years", "OTMni tugatgan yili (2-Excel)"],
  ["otm", "Tamomlagan OTM nomi (2-Excel)"],
  ["specialty", "Mutaxassisligi (2-Excel)"],
  ["degree", "Ilmiy darajasi (2-Excel)"],
  ["title", "Ilmiy unvoni (2-Excel)"],
  ["staff_cat", "Xodim toifasi (2-Excel)"],
  ["languages", "Chet tillari (2-Excel)"],
  ["military", "Harbiy unvoni (2-Excel)"],
  ["awards", "Davlat mukofotlari (2-Excel)"],
  ["deputy", "Deputatlik (2-Excel)"],
];

function dualMapHeaders(headers) {
  const map = {};
  (headers || []).forEach((header, index) => {
    const key = guessField(header);
    if (key && map[key] === undefined) map[key] = index;
  });
  return map;
}

function dualReadPositionWorkbook(sheets) {
  const candidates = (sheets || [])
    .map((sheet) => ({ sheet, priority: dualSheetPriority(sheet.name) }))
    .sort((a, b) => b.priority - a.priority);

  const records = [];
  const selectedSheets = [];
  const hasPriority = candidates.some((item) => item.priority > 0);
  for (const candidate of candidates) {
    if (hasPriority && candidate.priority === 0 && records.length) break;
    const picked = pickHeader([candidate.sheet]);
    if (!picked || picked.hits < 3) continue;

    const headers = (candidate.sheet.rows[picked.r] || []).map((value) =>
      String(value || "").trim(),
    );
    const map = dualMapHeaders(headers);
    if (
      (map.name === undefined && map.surname === undefined) ||
      map.position === undefined
    ) continue;

    const sourceRows = dropGone(
      candidate.sheet.rows
        .slice(picked.r + 1)
        .filter((row) => row && row.some((value) => String(value || "").trim())),
    ).rows;
    let added = 0;

    for (let index = 0; index < sourceRows.length; index++) {
      const row = sourceRows[index];
      const name = dualSourceName(row, map);
      const position = String(row[map.position] || "").trim();
      if (!name || !position) continue;

      const fields = {};
      for (const [key] of DUAL_EXTRA_FIELDS) {
        if (map[key] !== undefined) {
          const val = String(row[map[key]] || "").trim();
          if (val) fields[key] = val;
        }
      }
      if (map.since_date !== undefined) {
        const val = String(row[map.since_date] || "").trim();
        if (val) fields.since_date = val;
      }
      if (map.rate !== undefined) {
        const val = String(row[map.rate] || "").trim();
        if (val) fields.rate = val;
      }

      records.push({
        name,
        position,
        dept: map.dept === undefined ? "" : String(row[map.dept] || "").trim(),
        org: map.org === undefined ? "" : String(row[map.org] || "").trim(),
        fields,
        sheet: candidate.sheet.name,
        priority: candidate.priority,
        rowNumber: index + picked.r + 2,
      });
      added++;
    }

    if (added) selectedSheets.push({ name: candidate.sheet.name, count: added });
  }

  if (!records.length) {
    throw new Error(
      "Ikkinchi Excelda «ходимлар рўйхати», «асосий» yoki «профессор-ўқитувчилар» varaqlaridan lavozim va F.I.Sh. ustunlari topilmadi.",
    );
  }
  return { records, selectedSheets };
}

function dualDateStamp(value) {
  const parsed = parseDate(String(value || ""));
  if (!parsed || !parsed.y) return null;
  return Date.UTC(parsed.y, (parsed.m || 1) - 1, parsed.d || 1);
}

function dualEmployeeGroups(source) {
  const map = source.map || {};
  const groups = new Map();

  for (const row of source.rows || []) {
    const name = dualSourceName(row, map);
    if (!name) continue;
    const key = nameLoose(name) || SpravkaCore.norm(name);
    if (!key) continue;

    if (!groups.has(key)) groups.set(key, { name, entries: [] });
    const dateText =
      map.since_date === undefined ? "" : String(row[map.since_date] || "").trim();
    const rateText =
      map.rate === undefined ? "" : String(row[map.rate] || "").trim();
    groups.get(key).entries.push({
      row,
      name,
      dateText,
      dateStamp: dualDateStamp(dateText),
      rateText,
    });
  }

  return [...groups.values()].map((group) => {
    const entries = group.entries;
    const dated = entries.filter((entry) => entry.dateStamp !== null);
    const earliest = dated.length
      ? dated.reduce((best, entry) => entry.dateStamp < best.dateStamp ? entry : best)
      : entries.find((entry) => entry.dateText) || entries[0];
    const latest = dated.length
      ? dated.reduce((best, entry) => entry.dateStamp >= best.dateStamp ? entry : best)
      : entries.slice().reverse().find((entry) => entry.rateText) || entries[entries.length - 1];
    return {
      name: group.name,
      row: (latest.row || entries[0].row).slice(),
      firstDate: earliest ? earliest.dateText : "",
      rate: latest ? latest.rateText : "",
    };
  });
}

function dualBuildPositionIndex(records) {
  const exact = new Map();
  const buckets = new Map();
  const items = [];
  for (const record of records || []) {
    const loose = nameLoose(record.name);
    const parts = SpravkaCore.nameParts(record.name);
    const entry = { record, loose, parts };
    items.push(entry);
    if (loose) {
      let list = exact.get(loose);
      if (!list) {
        list = [];
        exact.set(loose, list);
      }
      list.push(record);
    }
    const ch1 = parts.sur && parts.sur[0];
    if (ch1) {
      let list = buckets.get(ch1);
      if (!list) {
        list = [];
        buckets.set(ch1, list);
      }
      list.push(entry);
    }
    const ch2 = parts.giv && parts.giv[0];
    if (ch2 && ch2 !== ch1) {
      let list = buckets.get(ch2);
      if (!list) {
        list = [];
        buckets.set(ch2, list);
      }
      list.push(entry);
    }
  }
  return { exact, buckets, items };
}

function dualMergeMatchingRecords(records) {
  if (!records || !records.length) return null;
  const sorted = records.slice().sort((a, b) => b.priority - a.priority);
  const top = sorted[0];
  const mergedFields = { ...(top.fields || {}) };
  let dept = top.dept || "";
  let org = top.org || "";
  for (let i = 1; i < sorted.length; i++) {
    const rec = sorted[i];
    if (!dept && rec.dept) dept = rec.dept;
    if (!org && rec.org) org = rec.org;
    if (rec.fields) {
      for (const [k, v] of Object.entries(rec.fields)) {
        if (!mergedFields[k] && v) mergedFields[k] = v;
      }
    }
  }
  return {
    ...top,
    dept,
    org,
    fields: mergedFields,
  };
}

function dualFindPosition(name, indexOrRecords) {
  const index = Array.isArray(indexOrRecords)
    ? dualBuildPositionIndex(indexOrRecords)
    : indexOrRecords;
  if (!index) return null;

  const targetLoose = nameLoose(name);
  const exactMatches = targetLoose ? index.exact.get(targetLoose) : null;
  if (exactMatches && exactMatches.length) {
    return dualMergeMatchingRecords(exactMatches);
  }

  let bestScore = 0;
  const matched = [];
  const targetParts = SpravkaCore.nameParts(name);
  const pool =
    targetParts.sur
      ? new Set([
          ...(index.buckets.get(targetParts.sur[0]) || []),
          ...(targetParts.giv && targetParts.giv[0]
            ? index.buckets.get(targetParts.giv[0]) || []
            : []),
        ])
      : index.items;

  for (const entry of pool) {
    const score = SpravkaCore.nameScore(targetParts, entry.parts);
    if (score < 0.86) continue;
    if (score > bestScore + 0.005) {
      bestScore = score;
      matched.length = 0;
      matched.push(entry.record);
    } else if (Math.abs(score - bestScore) <= 0.005) {
      matched.push(entry.record);
    }
  }
  return matched.length ? dualMergeMatchingRecords(matched) : null;
}

function dualBuildMergedRows() {
  const sources = xl.sources || {};
  const employee = sources.employee;
  const positions = sources.positions;
  if (!employee || !employee.rows || !employee.rows.length ||
      !positions || !positions.records || !positions.records.length) {
    sources.merged = false;
    return false;
  }

  const employeeMap = { ...(employee.map || {}) };
  const groups = dualEmployeeGroups(employee);
  const baseLength = Math.max(
    (employee.headers || []).length,
    ...employee.rows.map((row) => row.length),
  );
  const positionIndex = baseLength;
  const deptIndex = baseLength + 1;
  const orgIndex = baseLength + 2;
  const extraCols = DUAL_EXTRA_FIELDS.map(([key, label], idx) => ({
    key,
    label,
    colIndex: orgIndex + 1 + idx,
  }));
  const totalCols = orgIndex + 1 + extraCols.length;
  const headers = (employee.headers || []).slice();
  headers[positionIndex] = "Lavozim (ikkinchi Excel)";
  headers[deptIndex] = "Bo‘lim (ikkinchi Excel)";
  headers[orgIndex] = "Tashkilot (ikkinchi Excel)";
  for (const col of extraCols) {
    headers[col.colIndex] = col.label;
  }

  const missing = [];
  const matchedPosKeys = new Set();
  const positionIndexObj = dualBuildPositionIndex(positions.records);
  const mergedRows = groups.map((group) => {
    const row = group.row.slice();
    while (row.length < totalCols) row.push("");

    if (employeeMap.since_date !== undefined && group.firstDate) {
      row[employeeMap.since_date] = group.firstDate;
    }
    if (employeeMap.rate !== undefined && group.rate) {
      row[employeeMap.rate] = group.rate;
    }

    const match = dualFindPosition(group.name, positionIndexObj);
    if (match) {
      const mk = nameLoose(match.name) || SpravkaCore.norm(match.name);
      if (mk) matchedPosKeys.add(mk);
      if (
        employeeMap.name !== undefined &&
        match.name &&
        spellScore(match.name) > spellScore(group.name)
      ) {
        row[employeeMap.name] = match.name;
      }
    }
    row[positionIndex] = match ? match.position : "";
    row[deptIndex] = match ? match.dept : "";
    row[orgIndex] = match ? match.org : "";
    for (const col of extraCols) {
      row[col.colIndex] =
        match && match.fields && match.fields[col.key]
          ? match.fields[col.key]
          : "";
    }
    if (!match) missing.push(group.name);
    return row;
  });

  // Also include employees present in 2-Excel who were not in 1-Excel so they
  // are never falsely marked as "Excel'da yo'q".
  const extraPosGroups = new Map();
  for (const rec of positions.records) {
    const mk = nameLoose(rec.name) || SpravkaCore.norm(rec.name);
    if (!mk || matchedPosKeys.has(mk)) continue;
    if (!extraPosGroups.has(mk)) extraPosGroups.set(mk, []);
    extraPosGroups.get(mk).push(rec);
  }
  for (const list of extraPosGroups.values()) {
    const rec = dualMergeMatchingRecords(list);
    if (!rec) continue;
    const row = new Array(totalCols).fill("");
    if (employeeMap.name !== undefined) row[employeeMap.name] = rec.name;
    if (employeeMap.since_date !== undefined && rec.fields && rec.fields.since_date) {
      row[employeeMap.since_date] = rec.fields.since_date;
    }
    if (employeeMap.rate !== undefined && rec.fields && rec.fields.rate) {
      row[employeeMap.rate] = rec.fields.rate;
    }
    row[positionIndex] = rec.position || "";
    row[deptIndex] = rec.dept || "";
    row[orgIndex] = rec.org || "";
    for (const col of extraCols) {
      row[col.colIndex] =
        rec.fields && rec.fields[col.key] ? rec.fields[col.key] : "";
    }
    mergedRows.push(row);
  }

  // The employee sheet is authoritative for name/date/rate. Its job title is
  // deliberately replaced with dedicated columns sourced from the second book.
  employeeMap.position = positionIndex;
  employeeMap.dept = deptIndex;
  employeeMap.org = orgIndex;
  for (const col of extraCols) {
    if (employeeMap[col.key] === undefined) {
      employeeMap[col.key] = col.colIndex;
    }
  }
  xl.map = employeeMap;
  xl.headers = headers;
  xl.rows = mergedRows;
  xl.fileName =
    String(employee.fileName || "employees.xlsx") +
    " + " +
    String(positions.fileName || "lavozimlar.xlsx");
  xl.prevHeaders = (employee.headers || []).slice();
  xl.used = null;
  xl.matches = new Map();
  xl.lead = null;
  xl.ran = false;

  sources.merged = true;
  sources.missingPositions = missing;
  sources.employeeCount = groups.length;
  sources.matchedPositions = groups.length - missing.length;
  calcUnmatched();
  drawMap();
  drawNew();

  $("xlInfo").textContent =
    "Stavka va ishga qabul qilingan sana: «" + employee.fileName + "» (" +
    groups.length + " nafar xodim). Bir xodimda bir nechta yozuv bo‘lsa, " +
    "eng erta sana ish boshlagan sana, eng so‘nggi yozuvdagi stavka olinadi.";
  dualRefreshSourceInfo();
  $("xlActs").hidden = false;
  $("xlRun").disabled = false;
  store.saveXl();
  return true;
}

function dualApplyPositionsOnly() {
  const sources = xl.sources || {};
  const positions = sources.positions;
  if (!positions || !positions.records || !positions.records.length) return false;

  const byKey = new Map();
  for (const rec of positions.records) {
    const k = nameLoose(rec.name) || SpravkaCore.norm(rec.name);
    if (!k) continue;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k).push(rec);
  }
  const mergedList = [...byKey.values()]
    .map(dualMergeMatchingRecords)
    .filter(Boolean);

  const headers = [
    "F.I.Sh.",
    "Lavozim (2-Excel)",
    "Bo‘lim (2-Excel)",
    "Tashkilot (2-Excel)",
    "Ishga kirgan sana (2-Excel)",
    "Stavka (2-Excel)",
    ...DUAL_EXTRA_FIELDS.map(([, label]) => label),
  ];
  const map = {
    name: 0,
    position: 1,
    dept: 2,
    org: 3,
    since_date: 4,
    rate: 5,
  };
  DUAL_EXTRA_FIELDS.forEach(([key], idx) => {
    map[key] = 6 + idx;
  });

  const rows = mergedList.map((rec) => {
    const f = rec.fields || {};
    return [
      rec.name,
      rec.position || "",
      rec.dept || "",
      rec.org || "",
      f.since_date || "",
      f.rate || "",
      ...DUAL_EXTRA_FIELDS.map(([key]) => f[key] || ""),
    ];
  });

  xl.headers = headers;
  xl.rows = rows;
  xl.map = map;
  xl.fileName = String(positions.fileName || "lavozimlar.xlsx");
  xl.prevHeaders = headers.slice();
  xl.used = null;
  xl.matches = new Map();
  xl.lead = null;
  xl.ran = false;
  calcUnmatched();
  drawMap();
  drawNew();
  dualRefreshSourceInfo();
  $("xlActs").hidden = false;
  $("xlRun").disabled = false;
  store.saveXl();
  return true;
}

function dualReady() {
  const sources = dualEnsureSources();
  return !!(
    sources.employee && sources.employee.rows && sources.employee.rows.length &&
    sources.positions && sources.positions.records && sources.positions.records.length
  );
}

function dualRenderMissingPositions(missing) {
  const box = $("xlJobMissing");
  if (!box) return;
  box.textContent = "";
  if (!missing || !missing.length || !(xl.sources && xl.sources.merged)) {
    box.hidden = true;
    return;
  }
  box.hidden = false;
  const det = el("details", "newd");
  const sum = el("summary");
  sum.append(
    el("b", "", "2-Excel'da lavozimi topilmagan xodimlar (" + missing.length + " ta)"),
    el("span", "", " — ko‘rish yoki Excel'ga yuklash"),
  );
  det.append(sum);

  const acts = el("div", "acts");
  const btn = el("button", "btn2", "Ro‘yxatni Excel'ga yuklash");
  btn.type = "button";
  btn.onclick = async () => {
    btn.disabled = true;
    try {
      const rows = [
        ["№", "F.I.Sh. (1-Excel)", "Holat"],
        ...missing.map((name, i) => [i + 1, name, "2-Excel'da topilmadi"]),
      ];
      await save(
        btn,
        $("xlMsg"),
        "Lavozimi_topilmagan_xodimlar.xlsx",
        await xlsxBuild([
          { name: "Topilmaganlar", rows, head: 1, freeze: true, filter: true, widths: [6, 38, 24] },
        ]),
      );
    } finally {
      btn.disabled = false;
    }
  };
  acts.append(btn);
  det.append(acts);

  const ul = el("div", "xlnewlist");
  for (let i = 0; i < missing.length; i++) {
    ul.append(el("div", "", `${i + 1}. ${missing[i]}`));
  }
  det.append(ul);
  box.append(det);
}

function dualRefreshSourceInfo() {
  const node = $("xlJobInfo");
  if (!node) return;

  const sources = dualEnsureSources();
  const employee = sources.employee;
  const positions = sources.positions;
  if (!positions) {
    node.textContent = employee
      ? "1-Excel yuklandi. Endi lavozim va bo‘limlar olinadigan ikkinchi Excel faylini tanlang."
      : "2-Excel: lavozim va bo‘limlar shu fayldan olinadi. «ходимлар рўйхати», «асосий» va «профессор-ўқитувчилар» varaqlari tekshiriladi.";
    dualRenderMissingPositions([]);
    return;
  }

  const sheets = (positions.selectedSheets || [])
    .map((sheet) => sheet.name + ": " + sheet.count + " ta")
    .join("; ");
  const missing = (xl.sources && xl.sources.missingPositions) || [];
  node.textContent =
    "Lavozimlar manbasi: «" + positions.fileName + "». " +
    positions.records.length + " ta yozuv" +
    (sheets ? " (" + sheets + ")" : "") +
    (xl.sources.merged
      ? ". Xodimlar bilan moslashtirildi: " + (xl.sources.matchedPositions || 0) +
        " ta; lavozim topilmadi: " + missing.length + " ta."
      : ". Xodimlar Excel fayli bilan birlashtirish kutilmoqda.");
  dualRenderMissingPositions(missing);
}

function dualSetWaitingState() {
  const sources = dualEnsureSources();
  const ready = dualReady();
  const singleReady = !!(xl.rows && xl.rows.length);
  if ($("xlRun")) $("xlRun").disabled = !(ready || singleReady);
  if (!ready) {
    $("xlMsg").className = "msg";
    $("xlMsg").textContent = !sources.employee
      ? "Avval 1-Excel — employees.xlsx faylini yuklang (stavka va ishga qabul qilingan sana uchun)."
      : "1-Excel yuklandi. Ikkinchi lavozimlar Excel'ini ham yuklashingiz yoki mavjud ustunlar bilan «Solishtirish»ni bosishingiz mumkin.";
  }
  dualRefreshSourceInfo();
}

loadExcel = async function (file, options) {
  xl._dualLoading = true;
  let result;
  try {
    result = await dualBaseLoadExcel(file, options);
  } finally {
    xl._dualLoading = false;
  }
  if (!file) return result;

  const sources = dualEnsureSources();
  sources.employee = {
    rows: xl.rows.map((row) => row.slice()),
    headers: xl.headers.slice(),
    map: { ...xl.map },
    fileName: file.name || "employees.xlsx",
  };
  sources.merged = false;

  if (dualReady()) {
    dualBuildMergedRows();
    dualBaseRunCompare();
  } else {
    drawMap();
    dualSetWaitingState();
    store.saveXl();
  }
  return result;
};

runCompare = function () {
  if (xl._dualLoading) return;
  const sources = dualEnsureSources();
  if (dualReady()) {
    if (!sources.merged) dualBuildMergedRows();
    return dualBaseRunCompare();
  }
  if (xl.rows && xl.rows.length) {
    return dualBaseRunCompare();
  }
  dualSetWaitingState();
};

const dualBaseDiffRow = diffRow;
diffRow = function (person, row) {
  const changes = dualBaseDiffRow(person, row);
  const rateIndex = xl.map && xl.map.rate;
  if (rateIndex === undefined) return changes;

  const value = String(row[rateIndex] || "").trim();
  if (!value || !/^\d+(?:[.,]\d+)?$/.test(value)) return changes;

  const oldValue = String(
    (person.fields && (person.fields.staff_rate || person.fields.rate)) || "",
  ).trim();
  const numberValue = (text) => {
    const number = Number(String(text || "").replace(",", "."));
    return Number.isFinite(number) ? number : null;
  };
  const oldNumber = numberValue(oldValue);
  const newNumber = numberValue(value);
  if (newNumber === null || (oldNumber !== null && oldNumber === newNumber)) {
    return changes;
  }

  changes.push({
    kind: "field",
    key: "staff_rate",
    label: "Stavka",
    old: oldValue,
    val: value,
    on: true,
    auto: true,
  });
  return changes;
};

$("xlJobPick").addEventListener("click", () => $("xlJobFile").click());
$("xlJobFile").addEventListener("change", async () => {
  const file = $("xlJobFile").files[0];
  $("xlJobFile").value = "";
  if (!file) return;

  $("xlJobInfo").textContent = "«" + file.name + "» o‘qilmoqda…";
  try {
    const sheets = await readXlsx(await file.arrayBuffer());
    const parsed = dualReadPositionWorkbook(sheets);
    const sources = dualEnsureSources();
    sources.positions = {
      records: parsed.records,
      selectedSheets: parsed.selectedSheets,
      fileName: file.name,
    };
    sources.merged = false;

    if (dualReady()) {
      dualBuildMergedRows();
      dualBaseRunCompare();
    } else {
      dualApplyPositionsOnly();
      dualBaseRunCompare();
      dualSetWaitingState();
      store.saveXl();
    }
  } catch (error) {
    $("xlJobInfo").textContent =
      "Ikkinchi Excel o‘qilmadi: " + ((error && error.message) || error);
    $("xlMsg").className = "msg err";
    $("xlMsg").textContent = "Lavozimlar bazasi faylini tekshiring yoki qayta tanlang.";
  }
});

xlWipe = async function (showToast) {
  xl.sources = { employee: null, positions: null, merged: false };
  if ($("xlJobFile")) $("xlJobFile").value = "";
  const result = await dualBaseWipeExcel(showToast);
  dualSetWaitingState();
  return result;
};

store.restore = async function (...args) {
  const result = await dualBaseRestore.apply(this, args);
  const sources = dualEnsureSources();
  if (dualReady()) {
    dualBuildMergedRows();
    dualBaseRunCompare();
    $("xlRun").disabled = false;
    dualRefreshSourceInfo();
  } else if (sources.positions && sources.positions.records && sources.positions.records.length) {
    dualApplyPositionsOnly();
    dualBaseRunCompare();
    dualSetWaitingState();
  } else {
    dualSetWaitingState();
  }
  return result;
};

// Both sources are required before the comparison can run.
dualSetWaitingState();

// Local-only read-only hook used by the Chromium integration test.
if (
  typeof window !== "undefined" &&
  window.location &&
  window.location.hostname === "127.0.0.1" &&
  new URLSearchParams(window.location.search).has("e2e")
) {
  window.__dualExcelDiagnostics = () => {
    const row = (xl.rows && xl.rows[0]) || [];
    const map = xl.map || {};
    return {
      employeeRows: (xl.sources.employee && xl.sources.employee.rows.length) || 0,
      hireDate: map.since_date === undefined ? "" : String(row[map.since_date] || ""),
      rate: map.rate === undefined ? "" : String(row[map.rate] || ""),
      position: map.position === undefined ? "" : String(row[map.position] || ""),
      department: map.dept === undefined ? "" : String(row[map.dept] || ""),
      matchedPositions: xl.sources.matchedPositions || 0,
      missingPositions: (xl.sources.missingPositions || []).length,
    };
  };
}
