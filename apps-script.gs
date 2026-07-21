// Nutrisme - Google Apps Script backend
// Build 2026-07-21-18
// Active form: short Hero form only.

var CONFIG = {
  SPREADSHEET_ID: "1rhOPKMv0HSPlpb_Gl4RpNKdxRd0Y6_qFaTZbMfg8bl0",
  SHEET_NAME: "Order",
  NOTIFICATION_EMAIL: "nutrismeindonesia@gmail.com",
  EMAIL_SENDER_NAME: "Nutrisme Indonesia",
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-21-18"
};

// Columns are limited to the currently active short form, plus a hidden Request ID
// used only to confirm that a submission was stored successfully.
var HEADERS = [
  "No",
  "Waktu",
  "Nama Lengkap",
  "Username Instagram",
  "Persetujuan Privacy Policy",
  "Request ID"
];

function doGet(e) {
  var p = e && e.parameter ? e.parameter : {};
  var callback = cleanText_(p.callback, 180);

  try {
    var action = cleanText_(p.action || "health", 40);

    if (action === "status") {
      var requestId = cleanText_(p.requestId, 120);
      if (!requestId) throw new Error("Request ID wajib diisi.");
      var sheet = getOrCreateSheet_();
      var found = findRequest_(sheet, requestId);
      return webOutput_({
        status: "ok",
        connected: true,
        found: found,
        version: CONFIG.APP_VERSION
      }, callback);
    }

    var activeSheet = getOrCreateSheet_();
    return webOutput_({
      status: "ok",
      connected: true,
      service: "Nutrisme short lead form",
      sheet: activeSheet.getName(),
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
  var lock;
  try {
    var data = readPayload_(e);

    if (cleanText_(data.website, 200) !== "") {
      return jsonOutput_({ status: "ok", ignored: true, version: CONFIG.APP_VERSION });
    }

    if (cleanText_(data.action, 40) !== "createHeroLead") {
      throw new Error("Aksi tidak dikenal.");
    }

    var lead = validateHeroLead_(data);
    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = getOrCreateSheet_();
    if (!findRequest_(sheet, lead.requestId)) {
      var nextRow = Math.max(sheet.getLastRow(), 1) + 1;
      var number = nextRow - 1;
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
        number,
        lead.createdAt,
        safeSheetText_(lead.name),
        safeSheetText_(lead.instagram),
        "DISETUJUI",
        lead.requestId
      ]]);
      sheet.getRange(nextRow, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
      SpreadsheetApp.flush();

      try {
        sendNotificationEmail_(lead, number);
      } catch (mailError) {
        console.error("Email notification failed: " + errorMessage_(mailError));
      }
    }

    lock.releaseLock();
    lock = null;

    return jsonOutput_({
      status: "ok",
      requestId: lead.requestId,
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

function setupNutrisme() {
  var spreadsheet = getSpreadsheet_();
  if (spreadsheet.getName() !== "Order") spreadsheet.rename("Order");
  var sheet = getOrCreateSheet_();
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
  sheet.setColumnWidth(3, 220);
  sheet.setColumnWidth(4, 200);
  sheet.hideColumns(6); // Request ID is technical and not part of the visible form data.

  var result = {
    status: "ok",
    spreadsheet: getSpreadsheet_().getName(),
    sheet: sheet.getName(),
    columns: HEADERS.length,
    notificationEmail: CONFIG.NOTIFICATION_EMAIL,
    version: CONFIG.APP_VERSION
  };
  console.log(JSON.stringify(result));
  return result;
}

function testNotificationEmailNutrisme() {
  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: "Tes Notifikasi Form Nutrisme",
    body: "Notifikasi email form singkat Nutrisme berhasil dikonfigurasi.",
    name: CONFIG.EMAIL_SENDER_NAME
  });
  return { status: "ok", recipient: CONFIG.NOTIFICATION_EMAIL };
}

function testHeroLeadNutrisme() {
  return doPost({ parameter: {
    action: "createHeroLead",
    requestId: "test-" + new Date().getTime(),
    nama: "TEST NUTRISME",
    instagram: "nutrisme.test",
    consent: "yes",
    website: ""
  }});
}

function validateHeroLead_(data) {
  var name = cleanText_(data.nama, 100);
  var instagram = normalizeInstagram_(data.instagram);
  var consent = String(data.consent || "").toLowerCase();

  if (name.length < 3) throw new Error("Nama lengkap minimal 3 karakter.");
  if (!/^[A-Za-z0-9._]{2,50}$/.test(instagram)) throw new Error("Username Instagram tidak valid.");
  if (["yes", "true", "1"].indexOf(consent) === -1) throw new Error("Persetujuan Privacy Policy belum diberikan.");

  return {
    name: name,
    instagram: "@" + instagram,
    requestId: cleanText_(data.requestId, 120) || Utilities.getUuid(),
    createdAt: new Date()
  };
}

function sendNotificationEmail_(lead, number) {
  var sheetUrl = getSpreadsheet_().getUrl();
  var subject = "Data Form Nutrisme Baru - " + lead.name;
  var body =
    "Data baru telah masuk melalui form singkat Nutrisme.\n\n" +
    "No: " + number + "\n" +
    "Nama Lengkap: " + lead.name + "\n" +
    "Username Instagram: " + lead.instagram + "\n" +
    "Privacy Policy: Disetujui\n\n" +
    "Spreadsheet: " + sheetUrl;

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body,
    htmlBody:
      '<div style="font-family:Arial,sans-serif;color:#18342d;line-height:1.6">' +
      '<h2 style="color:#07563f">Data Form Nutrisme Baru</h2>' +
      '<p><strong>Nama Lengkap:</strong> ' + htmlEscape_(lead.name) + '</p>' +
      '<p><strong>Username Instagram:</strong> ' + htmlEscape_(lead.instagram) + '</p>' +
      '<p><strong>Privacy Policy:</strong> Disetujui</p>' +
      '<p><a href="' + htmlEscape_(sheetUrl) + '" style="color:#07563f;font-weight:700">Buka Spreadsheet</a></p>' +
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

  // Rename the previous tab instead of creating a second tab and leaving old data behind.
  if (!sheet) {
    var legacySheet = spreadsheet.getSheetByName("Order Nutrisme");
    if (legacySheet) {
      legacySheet.setName(CONFIG.SHEET_NAME);
      sheet = legacySheet;
    }
  }

  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  migrateSchema_(sheet);
  var header = sheet.getRange(1, 1, 1, HEADERS.length);
  header.setValues([HEADERS]);
  header.setFontWeight("bold").setBackground("#07563f").setFontColor("#ffffff");
  sheet.setFrozenRows(1);
  return sheet;
}

function migrateSchema_(sheet) {
  if (sheet.getLastRow() === 0) return;
  var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var exact = HEADERS.every(function(header, index) { return existingHeaders[index] === header; });
  if (exact && sheet.getLastColumn() === HEADERS.length) return;

  var map = {};
  existingHeaders.forEach(function(header, index) { map[header] = index; });
  var oldRows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
    : [];

  var migrated = oldRows.map(function(row, index) {
    return [
      map["No"] !== undefined ? row[map["No"]] : index + 1,
      map["Waktu"] !== undefined ? row[map["Waktu"]] : "",
      map["Nama Lengkap"] !== undefined ? row[map["Nama Lengkap"]] : "",
      map["Username Instagram"] !== undefined ? row[map["Username Instagram"]] : "",
      map["Persetujuan Privacy Policy"] !== undefined ? row[map["Persetujuan Privacy Policy"]] : "DISETUJUI",
      map["Request ID"] !== undefined ? row[map["Request ID"]] : "legacy-" + (index + 1)
    ];
  });

  sheet.clear();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (migrated.length) sheet.getRange(2, 1, migrated.length, HEADERS.length).setValues(migrated);
}

function findRequest_(sheet, requestId) {
  if (!requestId || sheet.getLastRow() < 2) return false;
  var values = sheet.getRange(2, 6, sheet.getLastRow() - 1, 1).getDisplayValues();
  return values.some(function(row) { return String(row[0]) === requestId; });
}

function readPayload_(e) {
  if (!e) throw new Error("Request event tidak tersedia.");
  if (e.parameter && Object.keys(e.parameter).length) return e.parameter;
  if (!e.postData || !e.postData.contents) throw new Error("Body request kosong.");
  try { return JSON.parse(e.postData.contents); }
  catch (error) { throw new Error("Format body tidak valid."); }
}

function normalizeInstagram_(value) {
  return String(value || "").trim().replace(/^@/, "").substring(0, 50);
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value).replace(/[\u0000-\u001F\u007F]/g, " ").trim().substring(0, maxLength || 500);
}

function safeSheetText_(value) {
  var text = cleanText_(value, 1000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function webOutput_(data, callback) {
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]{0,179}$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(data) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonOutput_(data);
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
