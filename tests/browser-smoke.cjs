const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".xml": "application/xml; charset=utf-8",
};

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function zipStored(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const data = Buffer.from(entry.content, "utf8");
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(0, 8);
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(33, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(data.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    localParts.push(local, name, data);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(0, 10);
    central.writeUInt16LE(0, 12);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(data.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(0, 38);
    central.writeUInt32LE(offset, 42);
    centralParts.push(central, name);

    offset += local.length + name.length + data.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, ...centralParts, end]);
}

function xmlEscape(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index) {
  let result = "";
  let number = index + 1;
  while (number > 0) {
    const remainder = (number - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    number = Math.floor((number - 1) / 26);
  }
  return result;
}

function worksheetXml(rows) {
  const body = rows.map((row, rowIndex) => {
    const cells = row.map((value, columnIndex) => {
      const ref = columnName(columnIndex) + (rowIndex + 1);
      return '<c r="' + ref + '" t="inlineStr"><is><t>' +
        xmlEscape(value) + "</t></is></c>";
    }).join("");
    return '<row r="' + (rowIndex + 1) + '">' + cells + "</row>";
  }).join("");
  return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    "<sheetData>" + body + "</sheetData></worksheet>";
}

function makePersonnelWorkbook() {
  const headers = [
    "№",
    "Фамилияси, исми ва отасининг исми",
    "Ташкилот номи",
    "Ишлаётган бошқарма ёки факултет, кафедра ва бўлим (гуруҳ, грант, лойиҳа) номи",
    "Лавозими",
    "Ставка",
  ];
  const activeRows = [
    headers,
    ["1", "Хайитова Санобар Пояновна", "Термиз давлат педагогика институти",
      "Амалий инглиз тили кафедраси", "Ўқитувчи", "1.25"],
  ];
  const teachingRows = [
    headers,
    ["1", "Хайитова Санобар Пояновна", "Термиз давлат педагогика институти",
      "Факультетлараро хорижий тиллар кафедраси", "Катта ўқитувчи", "1.00"],
  ];

  const workbook =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    "<sheets>" +
    '<sheet name="ходимлар рўйхати" sheetId="1" r:id="rId1"/>' +
    '<sheet name="профессор-ўқитувчилар" sheetId="2" r:id="rId2"/>' +
    "</sheets></workbook>";

  const rels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
    '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>' +
    "</Relationships>";

  return zipStored([
    { name: "xl/workbook.xml", content: workbook },
    { name: "xl/_rels/workbook.xml.rels", content: rels },
    { name: "xl/worksheets/sheet1.xml", content: worksheetXml(activeRows) },
    { name: "xl/worksheets/sheet2.xml", content: worksheetXml(teachingRows) },
  ]);
}

function startServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const requested = pathname === "/" ? "/index.html" : pathname;
    const target = path.resolve(ROOT, "." + requested);
    if (!target.startsWith(ROOT + path.sep) && target !== path.join(ROOT, "index.html")) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    fs.readFile(target, (error, data) => {
      if (error) {
        response.writeHead(404).end("Not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": MIME[path.extname(target)] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      response.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, port: server.address().port });
    });
  });
}

async function main() {
  const { server, port } = await startServer();
  let browser;
  const pageErrors = [];

  try {
    browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await page.goto("http://127.0.0.1:" + port + "/?e2e=1", {
      waitUntil: "load",
      timeout: 60000,
    });
    await page.waitForFunction(
      () => typeof window.__dualExcelDiagnostics === "function",
      { timeout: 30000 },
    );

    const details = page.locator("#xlD");
    if (!(await details.getAttribute("open"))) {
      await details.locator("summary").click();
    }

    assert.equal(await page.locator("#xlFile").count(), 1, "employees Excel input exists");
    assert.equal(await page.locator("#xlJobFile").count(), 1, "positions Excel input exists");
    assert.equal(await page.locator("#xlJobPick").isVisible(), true, "second Excel control is visible");

    const employeeCsv = [
      "ФИО,Lavozim,Ставка,Дата приказа о приеме",
      "XAYITOVA SANOBAR POYANOVNA,Old role,0.75,2026-04-01",
      "XAYITOVA SANOBAR POYANOVNA,New role,1.25,2026-09-02",
    ].join("\n");

    await page.locator("#xlFile").setInputFiles({
      name: "employees-fixture.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(employeeCsv, "utf8"),
    });
    await page.waitForFunction(
      () => document.querySelector("#xlJobInfo").textContent.includes("1-Excel yuklandi"),
      { timeout: 15000 },
    );

    await page.locator("#xlJobFile").setInputFiles({
      name: "personnel-fixture.xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: makePersonnelWorkbook(),
    });
    await page.waitForFunction(
      () => document.querySelector("#xlJobInfo").textContent.includes("Xodimlar bilan moslashtirildi: 1 ta"),
      { timeout: 15000 },
    );

    const diagnostics = await page.evaluate(() => window.__dualExcelDiagnostics());
    assert.equal(diagnostics.employeeRows, 2, "both employee history records were read");
    assert.equal(diagnostics.hireDate, "2026-04-01", "earliest hire date comes from employees file");
    assert.equal(diagnostics.rate, "1.25", "rate comes from the latest employees-file record");
    assert.equal(diagnostics.position, "Ўқитувчи", "position comes from the higher-priority personnel sheet");
    assert.equal(diagnostics.department, "Амалий инглиз тили кафедраси", "department comes from the higher-priority personnel sheet");
    assert.equal(diagnostics.matchedPositions, 1, "employee matched to personnel database");
    assert.equal(diagnostics.missingPositions, 0, "no position match was lost");
    assert.equal(await page.locator("#xlRun").isDisabled(), false, "comparison enables after both files load");

    assert.deepEqual(pageErrors, [], "page has no uncaught JavaScript errors");
    console.log("Browser smoke test passed: both Excel sources loaded and authoritative fields merged.");
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve, reject) =>
      server.close((error) => error ? reject(error) : resolve()),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
