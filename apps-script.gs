// Nutrisme - Google Apps Script backend
// Paste this file into the Apps Script project, save it, then redeploy the web app.

var CONFIG = {
  SPREADSHEET_ID: "1qy4hSkdrHZZXTSdwcZJNLyu-ffRtQiXA58PmHHaNqhc",
  SHEET_NAME: "Pesanan",
  NOTIFICATION_EMAIL: "nutrismeindonesia@gmail.com",
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-17-2",
  SEND_EMAIL: true
};

var HEADERS = ["No", "Waktu", "Nama Lengkap", "Alamat", "No. Handphone"];

// Health endpoint. Open the deployed /exec URL in an incognito browser.
// A correct deployment returns JSON with status "ok" instead of doGet not found.
function doGet() {
  return jsonOutput_({
    status: "ok",
    service: "Nutrisme order endpoint",
    version: CONFIG.APP_VERSION,
    time: Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, "yyyy-MM-dd HH:mm:ss")
  });
}

function doPost(e) {
  var lock = null;

  try {
    var data = readPayload_(e);

    // Honeypot: silently ignore automated submissions that fill hidden fields.
    if (cleanText_(data.website, 200) !== "") {
      return jsonOutput_({ status: "ok", ignored: true });
    }

    if (data.action && data.action !== "createOrder") {
      throw new Error("Aksi tidak dikenal.");
    }

    var order = validateOrder_(data);

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = getOrCreateSheet_();
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var nextRow = lastRow + 1;
    var orderNumber = nextRow - 1;

    sheet.getRange(nextRow, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    sheet.getRange(nextRow, 5).setNumberFormat("@");
    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      orderNumber,
      order.createdAt,
      order.name,
      order.address,
      order.phone
    ]]);
    SpreadsheetApp.flush();

    lock.releaseLock();
    lock = null;

    var emailStatus = "not-sent";
    if (CONFIG.SEND_EMAIL && CONFIG.NOTIFICATION_EMAIL) {
      try {
        sendNotificationEmail_(order, orderNumber);
        emailStatus = "sent";
      } catch (mailError) {
        emailStatus = "failed";
        console.error("Email notification failed: " + errorMessage_(mailError));
      }
    }

    return jsonOutput_({
      status: "ok",
      orderNumber: orderNumber,
      requestId: order.requestId,
      email: emailStatus,
      version: CONFIG.APP_VERSION
    });
  } catch (error) {
    if (lock) {
      try {
        lock.releaseLock();
      } catch (releaseError) {
        console.error("Lock release failed: " + errorMessage_(releaseError));
      }
    }

    console.error("Order failed: " + errorMessage_(error));
    return jsonOutput_({
      status: "error",
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    });
  }
}

// Run this once from the Apps Script editor before deployment.
// It verifies spreadsheet access, creates/formats the sheet, and requests scopes.
function setupNutrisme() {
  var sheet = getOrCreateSheet_();
  sheet.autoResizeColumns(1, HEADERS.length);
  var emailQuota = MailApp.getRemainingDailyQuota();
  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);

  var result = {
    status: "ok",
    spreadsheet: spreadsheet.getName(),
    sheet: sheet.getName(),
    emailQuota: emailQuota,
    version: CONFIG.APP_VERSION
  };

  console.log(JSON.stringify(result));
  return result;
}

// Backward-compatible test name from the previous file.
function tesKoneksi() {
  return setupNutrisme();
}

function readPayload_(e) {
  if (!e) {
    throw new Error("Request event tidak tersedia.");
  }

  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (!e.postData || !e.postData.contents) {
    throw new Error("Body request kosong.");
  }

  var raw = String(e.postData.contents).trim();
  var contentType = String(e.postData.type || "").toLowerCase();

  if (contentType.indexOf("application/x-www-form-urlencoded") === 0) {
    return parseFormBody_(raw);
  }

  try {
    return JSON.parse(raw);
  } catch (jsonError) {
    throw new Error("Format body tidak valid. Gunakan form URL encoded atau JSON.");
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

function validateOrder_(data) {
  var name = cleanText_(data.nama, 100);
  var address = cleanText_(data.alamat, 1000);
  var phone = normalizePhone_(data.telepon);
  var consent = String(data.consent || "").toLowerCase();
  var legacyRequest = typeof data.consent === "undefined" && Boolean(data.waktu);

  if (name.length < 3) {
    throw new Error("Nama lengkap minimal 3 karakter.");
  }

  if (address.length < 10) {
    throw new Error("Alamat minimal 10 karakter.");
  }

  if (!legacyRequest && consent !== "yes" && consent !== "true" && consent !== "1") {
    throw new Error("Persetujuan Privacy & Policy belum diberikan.");
  }

  return {
    name: name,
    address: address,
    phone: phone,
    requestId: cleanText_(data.requestId, 120) || Utilities.getUuid(),
    source: cleanText_(data.source, 500),
    clientTime: cleanText_(data.waktuKlien, 100),
    createdAt: new Date()
  };
}

function normalizePhone_(value) {
  var digits = String(value || "").replace(/\D/g, "");

  if (digits.indexOf("62") === 0) digits = digits.substring(2);
  if (digits.indexOf("0") === 0) digits = digits.substring(1);

  if (!/^8\d{7,14}$/.test(digits)) {
    throw new Error("Nomor handphone tidak valid.");
  }

  return "+62" + digits;
}

function cleanText_(value, maxLength) {
  var text = String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text.substring(0, maxLength);
}

function getOrCreateSheet_() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID.indexOf("GANTI_") === 0) {
    throw new Error("SPREADSHEET_ID belum diisi.");
  }

  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else {
    var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
    var headerIsEmpty = firstRow.join("").trim() === "";
    if (headerIsEmpty) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
  }

  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#0d5b48");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  return sheet;
}

function sendNotificationEmail_(order, orderNumber) {
  var subject = "Pesanan Baru #" + orderNumber + " - " + order.name;
  var body =
    "Halo Tim Nutrisme,\n\n" +
    "Ada pesanan baru masuk. Berikut detailnya:\n\n" +
    "No. Pesanan : #" + orderNumber + "\n" +
    "Waktu        : " + Utilities.formatDate(order.createdAt, CONFIG.TIME_ZONE, "dd/MM/yyyy HH:mm:ss") + "\n" +
    "Nama         : " + order.name + "\n" +
    "Alamat       : " + order.address + "\n" +
    "No. HP       : " + order.phone + "\n" +
    "ID Request   : " + order.requestId + "\n\n" +
    "Silakan tindak lanjuti segera.\n\n" +
    "- Sistem Nutrisme";

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body,
    name: "Nutrisme Order"
  });
}

function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error);
}
