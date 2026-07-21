// Nutrisme - Google Apps Script backend
// Build 2026-07-21-21
// Active form: short Hero form only.

var CONFIG = {
  SPREADSHEET_ID: "1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M",
  SPREADSHEET_NAME: "Order",
  SHEET_NAME: "Order",
  NOTIFICATION_EMAIL: "nutrismeindonesia@gmail.com",
  EMAIL_SENDER_NAME: "Nutrisme Indonesia",
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-21-21"
};

var HEADERS = [
  "No",
  "Tanggal",
  "Jam",
  "Nama Lengkap",
  "Username Instagram"
];

function doGet(e) {
  var params = e && e.parameter ? e.parameter : {};
  var callback = cleanText_(params.callback, 180);
  var action = cleanText_(params.action, 40) || "health";

  try {
    if (action === "createHeroLead") {
      return webOutput_(createHeroLead_(params), callback);
    }

    if (action !== "health") {
      throw new Error("Aksi tidak dikenal.");
    }

    return webOutput_(healthPayload_(), callback);
  } catch (error) {
    console.error("Nutrisme GET failed: " + errorMessage_(error));
    return webOutput_({
      status: "error",
      connected: false,
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    }, callback);
  }
}

function doPost(e) {
  try {
    var data = readPayload_(e);
    var action = cleanText_(data.action, 40);

    if (action !== "createHeroLead") {
      throw new Error("Aksi tidak dikenal.");
    }

    return jsonOutput_(createHeroLead_(data));
  } catch (error) {
    console.error("Nutrisme POST failed: " + errorMessage_(error));
    return jsonOutput_({
      status: "error",
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    });
  }
}

function createHeroLead_(data) {
  // Honeypot: silently ignore automated submissions.
  if (cleanText_(data.website, 200) !== "") {
    return { status: "ok", ignored: true, version: CONFIG.APP_VERSION };
  }

  var lead = validateHeroLead_(data);
  var requestId = cleanText_(data.requestId, 100);
  var cache = CacheService.getScriptCache();
  var cacheKey = requestId ? "lead_" + requestId : "";

  if (cacheKey && cache.get(cacheKey)) {
    return {
      status: "ok",
      duplicate: true,
      version: CONFIG.APP_VERSION
    };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);

  try {
    var sheet = getReadySheet_();
    var nextRow = Math.max(sheet.getLastRow(), 1) + 1;
    var number = nextRow - 1;
    var submittedAt = new Date();

    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      number,
      submittedAt,
      submittedAt,
      safeSheetText_(lead.name),
      safeSheetText_(lead.instagram)
    ]]);

    sheet.getRange(nextRow, 2).setNumberFormat("dd/MM/yyyy");
    sheet.getRange(nextRow, 3).setNumberFormat("HH:mm:ss");
    sheet.getRange(nextRow, 4, 1, 2).setNumberFormat("@");
    SpreadsheetApp.flush();

    if (cacheKey) cache.put(cacheKey, "1", 21600);

    try {
      sendNotificationEmail_(lead, number, submittedAt);
    } catch (mailError) {
      console.error("Email notification failed: " + errorMessage_(mailError));
    }

    return {
      status: "ok",
      number: number,
      spreadsheet: CONFIG.SPREADSHEET_NAME,
      sheet: CONFIG.SHEET_NAME,
      version: CONFIG.APP_VERSION
    };
  } finally {
    lock.releaseLock();
  }
}

function healthPayload_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = getReadySheet_();

  return {
    status: "ok",
    connected: true,
    service: "Nutrisme short lead form",
    spreadsheetId: spreadsheet.getId(),
    spreadsheet: spreadsheet.getName(),
    sheet: sheet.getName(),
    columns: HEADERS,
    version: CONFIG.APP_VERSION,
    time: Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, "yyyy-MM-dd HH:mm:ss")
  };
}

// Run once from the Apps Script editor before deploying the web app.
function setupNutrisme() {
  var spreadsheet = getSpreadsheet_();

  if (spreadsheet.getName() !== CONFIG.SPREADSHEET_NAME) {
    spreadsheet.rename(CONFIG.SPREADSHEET_NAME);
  }

  var sheet = getOrCreateSheetForSetup_();
  migrateSchema_(sheet);
  formatSheet_(sheet);

  var result = healthPayload_();
  result.notificationEmail = CONFIG.NOTIFICATION_EMAIL;
  console.log(JSON.stringify(result));
  return result;
}

function testHeroLeadNutrisme() {
  return createHeroLead_({
    action: "createHeroLead",
    requestId: "test-" + new Date().getTime(),
    nama: "TEST NUTRISME",
    instagram: "nutrisme.test",
    consent: "yes",
    website: ""
  });
}

function testNotificationEmailNutrisme() {
  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: "Tes Notifikasi Form Nutrisme",
    body: "Notifikasi email form singkat Nutrisme berhasil dikonfigurasi.",
    name: CONFIG.EMAIL_SENDER_NAME
  });

  return {
    status: "ok",
    recipient: CONFIG.NOTIFICATION_EMAIL,
    version: CONFIG.APP_VERSION
  };
}

function validateHeroLead_(data) {
  var name = cleanText_(data.nama, 100);
  var instagram = normalizeInstagram_(data.instagram);
  var consent = cleanText_(data.consent, 10).toLowerCase();

  if (name.length < 3) throw new Error("Nama lengkap minimal 3 karakter.");
  if (!/^[A-Za-z0-9._]{2,50}$/.test(instagram)) throw new Error("Username Instagram tidak valid.");
  if (consent !== "yes") throw new Error("Persetujuan Privacy Policy wajib diberikan.");

  return {
    name: name,
    instagram: "@" + instagram
  };
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getOrCreateSheetForSetup_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    var legacy = spreadsheet.getSheetByName("Order Nutrisme");
    if (legacy) {
      legacy.setName(CONFIG.SHEET_NAME);
      sheet = legacy;
    }
  }

  if (!sheet) {
    var sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      sheets[0].setName(CONFIG.SHEET_NAME);
      sheet = sheets[0];
    }
  }

  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  return sheet;
}

function getReadySheet_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "Order" belum tersedia. Jalankan setupNutrisme() satu kali.');
  }

  var displayed = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  var valid = HEADERS.every(function(header, index) {
    return displayed[index] === header;
  });

  if (!valid) {
    throw new Error("Struktur kolom belum sesuai. Jalankan setupNutrisme() satu kali.");
  }

  return sheet;
}

function migrateSchema_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), 1);

  if (lastRow === 0) {
    ensureColumnCount_(sheet);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  var existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0]
    .map(function(value) { return String(value || "").trim(); });

  var exact = HEADERS.every(function(header, index) {
    return existingHeaders[index] === header;
  }) && existingHeaders.length === HEADERS.length;

  if (exact) {
    ensureColumnCount_(sheet);
    return;
  }

  var headerMap = {};
  existingHeaders.forEach(function(header, index) {
    if (header) headerMap[header] = index;
  });

  var oldRows = lastRow > 1
    ? sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues()
    : [];

  var migratedRows = oldRows.map(function(row, index) {
    var oldTimestamp = valueFromHeader_(row, headerMap, "Waktu");
    var oldDate = valueFromHeader_(row, headerMap, "Tanggal");
    var oldTime = valueFromHeader_(row, headerMap, "Jam");

    return [
      valueFromHeader_(row, headerMap, "No") || (index + 1),
      oldDate || oldTimestamp || "",
      oldTime || oldTimestamp || "",
      valueFromHeader_(row, headerMap, "Nama Lengkap"),
      valueFromHeader_(row, headerMap, "Username Instagram")
    ];
  });

  sheet.clear();
  ensureColumnCount_(sheet);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (migratedRows.length) {
    sheet.getRange(2, 1, migratedRows.length, HEADERS.length).setValues(migratedRows);
  }
}

function ensureColumnCount_(sheet) {
  var maxColumns = sheet.getMaxColumns();
  if (maxColumns < HEADERS.length) {
    sheet.insertColumnsAfter(maxColumns, HEADERS.length - maxColumns);
  } else if (maxColumns > HEADERS.length) {
    sheet.deleteColumns(HEADERS.length + 1, maxColumns - HEADERS.length);
  }
}

function formatSheet_(sheet) {
  ensureColumnCount_(sheet);
  var header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setValues([HEADERS]);
  header.setFontWeight("bold");
  header.setBackground("#07563f");
  header.setFontColor("#ffffff");
  header.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 70);
  sheet.setColumnWidth(2, 110);
  sheet.setColumnWidth(3, 90);
  sheet.setColumnWidth(4, 240);
  sheet.setColumnWidth(5, 220);

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 2, sheet.getLastRow() - 1, 1).setNumberFormat("dd/MM/yyyy");
    sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).setNumberFormat("HH:mm:ss");
    sheet.getRange(2, 4, sheet.getLastRow() - 1, 2).setNumberFormat("@");
  }
}

function sendNotificationEmail_(lead, number, submittedAt) {
  var spreadsheetUrl = getSpreadsheet_().getUrl();
  var dateText = Utilities.formatDate(submittedAt, CONFIG.TIME_ZONE, "dd/MM/yyyy");
  var timeText = Utilities.formatDate(submittedAt, CONFIG.TIME_ZONE, "HH:mm:ss");
  var subject = "Data Form Nutrisme Baru - " + lead.name;
  var body =
    "Data baru telah masuk melalui form singkat Nutrisme.\n\n" +
    "No: " + number + "\n" +
    "Tanggal: " + dateText + "\n" +
    "Jam: " + timeText + "\n" +
    "Nama Lengkap: " + lead.name + "\n" +
    "Username Instagram: " + lead.instagram + "\n\n" +
    "Spreadsheet: " + spreadsheetUrl;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body,
    name: CONFIG.EMAIL_SENDER_NAME
  });
}

function valueFromHeader_(row, headerMap, header) {
  return Object.prototype.hasOwnProperty.call(headerMap, header) ? row[headerMap[header]] : "";
}

function readPayload_(e) {
  if (!e) throw new Error("Request event tidak tersedia.");
  if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
  if (!e.postData || !e.postData.contents) throw new Error("Body request kosong.");

  var raw = String(e.postData.contents || "").trim();
  var contentType = String(e.postData.type || "").toLowerCase();
  if (contentType.indexOf("application/x-www-form-urlencoded") === 0) return parseFormBody_(raw);

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("Format body tidak valid.");
  }
}

function parseFormBody_(raw) {
  var data = {};
  raw.split("&").forEach(function(part) {
    if (!part) return;
    var pieces = part.split("=");
    var key = decodeURIComponent((pieces.shift() || "").replace(/\+/g, " "));
    var value = decodeURIComponent(pieces.join("=").replace(/\+/g, " "));
    data[key] = value;
  });
  return data;
}

function normalizeInstagram_(value) {
  return String(value || "").trim().replace(/^@/, "").substring(0, 50);
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxLength || 500);
}

function safeSheetText_(value) {
  var text = cleanText_(value, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function webOutput_(payload, callback) {
  var json = JSON.stringify(payload);
  var safeCallback = String(callback || "").trim();

  if (safeCallback && /^[A-Za-z_$][0-9A-Za-z_$]*(?:\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(safeCallback)) {
    return ContentService.createTextOutput(safeCallback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function jsonOutput_(payload) {
  return webOutput_(payload, "");
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error || "Terjadi kesalahan.");
}
