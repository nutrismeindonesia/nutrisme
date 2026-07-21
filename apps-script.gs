// Nutrisme - Google Apps Script backend
// Build 2026-07-21-19
// Active form: short Hero form only.

var CONFIG = {
  SPREADSHEET_ID: "1W84u1NlUBYCGrv80bsk9bp0-kt6uX8EcEz6uPju-_0M",
  SPREADSHEET_NAME: "Order",
  SHEET_NAME: "Order",
  NOTIFICATION_EMAIL: "nutrismeindonesia@gmail.com",
  EMAIL_SENDER_NAME: "Nutrisme Indonesia",
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-21-19"
};

var HEADERS = [
  "No",
  "Tanggal",
  "Jam",
  "Nama Lengkap",
  "Username Instagram"
];

function doGet(e) {
  var parameters = e && e.parameter ? e.parameter : {};
  var callback = cleanText_(parameters.callback, 180);

  try {
    var spreadsheet = getSpreadsheet_();
    var sheet = getOrCreateSheet_();

    return webOutput_({
      status: "ok",
      connected: true,
      service: "Nutrisme short lead form",
      spreadsheet: spreadsheet.getName(),
      sheet: sheet.getName(),
      columns: HEADERS,
      version: CONFIG.APP_VERSION,
      time: Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, "yyyy-MM-dd HH:mm:ss")
    }, callback);
  } catch (error) {
    return webOutput_({
      status: "error",
      connected: false,
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    }, callback);
  }
}

function doPost(e) {
  var lock = null;

  try {
    var data = readPayload_(e);

    // Honeypot: silently ignore automated submissions.
    if (cleanText_(data.website, 200) !== "") {
      return jsonOutput_({ status: "ok", ignored: true, version: CONFIG.APP_VERSION });
    }

    if (cleanText_(data.action, 40) !== "createHeroLead") {
      throw new Error("Aksi tidak dikenal.");
    }

    var lead = validateHeroLead_(data);
    var submittedAt = new Date();

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = getOrCreateSheet_();
    var nextRow = Math.max(sheet.getLastRow(), 1) + 1;
    var number = nextRow - 1;

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

    lock.releaseLock();
    lock = null;

    try {
      sendNotificationEmail_(lead, number, submittedAt);
    } catch (mailError) {
      console.error("Email notification failed: " + errorMessage_(mailError));
    }

    return jsonOutput_({
      status: "ok",
      number: number,
      version: CONFIG.APP_VERSION
    });
  } catch (error) {
    if (lock) {
      try { lock.releaseLock(); } catch (ignore) {}
    }

    console.error("Nutrisme submission failed: " + errorMessage_(error));
    return jsonOutput_({
      status: "error",
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    });
  }
}

// Jalankan satu kali dari editor Apps Script sebelum membuat deployment Web App.
function setupNutrisme() {
  var spreadsheet = getSpreadsheet_();
  if (spreadsheet.getName() !== CONFIG.SPREADSHEET_NAME) {
    spreadsheet.rename(CONFIG.SPREADSHEET_NAME);
  }

  var sheet = getOrCreateSheet_();
  formatSheet_(sheet);

  var result = {
    status: "ok",
    spreadsheetId: spreadsheet.getId(),
    spreadsheet: spreadsheet.getName(),
    sheet: sheet.getName(),
    columns: HEADERS,
    notificationEmail: CONFIG.NOTIFICATION_EMAIL,
    version: CONFIG.APP_VERSION
  };

  console.log(JSON.stringify(result));
  return result;
}

// Tes tulis tanpa perlu membuka landing page.
function testHeroLeadNutrisme() {
  return doPost({
    parameter: {
      action: "createHeroLead",
      nama: "TEST NUTRISME",
      instagram: "nutrisme.test",
      website: ""
    }
  });
}

// Tes izin dan pengiriman notifikasi email.
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

  if (name.length < 3) {
    throw new Error("Nama lengkap minimal 3 karakter.");
  }

  if (!/^[A-Za-z0-9._]{2,50}$/.test(instagram)) {
    throw new Error("Username Instagram tidak valid.");
  }

  return {
    name: name,
    instagram: "@" + instagram
  };
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
    htmlBody:
      '<div style="font-family:Arial,sans-serif;color:#18342d;line-height:1.6">' +
      '<h2 style="color:#07563f">Data Form Nutrisme Baru</h2>' +
      '<p><strong>No:</strong> ' + htmlEscape_(number) + '</p>' +
      '<p><strong>Tanggal:</strong> ' + htmlEscape_(dateText) + '</p>' +
      '<p><strong>Jam:</strong> ' + htmlEscape_(timeText) + '</p>' +
      '<p><strong>Nama Lengkap:</strong> ' + htmlEscape_(lead.name) + '</p>' +
      '<p><strong>Username Instagram:</strong> ' + htmlEscape_(lead.instagram) + '</p>' +
      '<p><a href="' + htmlEscape_(spreadsheetUrl) + '" style="color:#07563f;font-weight:700">Buka Spreadsheet</a></p>' +
      '</div>',
    name: CONFIG.EMAIL_SENDER_NAME
  });
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

function getOrCreateSheet_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    var legacySheet = spreadsheet.getSheetByName("Order Nutrisme");
    if (legacySheet) {
      legacySheet.setName(CONFIG.SHEET_NAME);
      sheet = legacySheet;
    }
  }

  if (!sheet) {
    var sheets = spreadsheet.getSheets();
    if (sheets.length === 1 && sheets[0].getLastRow() === 0) {
      sheets[0].setName(CONFIG.SHEET_NAME);
      sheet = sheets[0];
    }
  }

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  migrateSchema_(sheet);
  formatSheet_(sheet);
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

function valueFromHeader_(row, headerMap, header) {
  return Object.prototype.hasOwnProperty.call(headerMap, header)
    ? row[headerMap[header]]
    : "";
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

function readPayload_(e) {
  if (!e) throw new Error("Request event tidak tersedia.");

  if (e.parameter && Object.keys(e.parameter).length) {
    return e.parameter;
  }

  if (!e.postData || !e.postData.contents) {
    throw new Error("Body request kosong.");
  }

  var raw = String(e.postData.contents || "").trim();
  var contentType = String(e.postData.type || "").toLowerCase();

  if (contentType.indexOf("application/x-www-form-urlencoded") === 0) {
    return parseFormBody_(raw);
  }

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
    return ContentService
      .createTextOutput(safeCallback + "(" + json + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function jsonOutput_(payload) {
  return webOutput_(payload, "");
}

function htmlEscape_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error || "Terjadi kesalahan.");
}
