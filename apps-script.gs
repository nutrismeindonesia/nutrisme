// Nutrisme - Google Apps Script backend
// Build 2026-07-19-7
// Paste this file into the Apps Script project, save it, run setupNutrisme(),
// then deploy a new web-app version.

var CONFIG = {
  SPREADSHEET_ID: "1qy4hSkdrHZZXTSdwcZJNLyu-ffRtQiXA58PmHHaNqhc",
  SHEET_NAME: "Order",
  NOTIFICATION_EMAIL: "nutrismeindonesia@gmail.com",
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-19-7",
  SEND_EMAIL: true,
  NEW_CUSTOMER_DISCOUNT: 100000,
  PROMO_BLOCKING_STATUSES: ["PAID", "ACTIVE"],
  PLAN_PRICES: {
    "Nutrisme Daily": 1120000,
    "Nutrisme Ready": 820000,
    "Nutrisme Cook": 700000
  }
};

// The first seven columns intentionally remain compatible with the previous sheet.
var HEADERS = [
  "No",
  "Waktu",
  "Nama Lengkap",
  "Username Instagram",
  "Alamat",
  "No. Handphone",
  "Paket Pilihan",
  "Status Pelanggan",
  "Promo Eligible",
  "Diskon",
  "Harga Bulan Pertama",
  "Harga Normal/Bulan",
  "Alasan Promo",
  "Bahasa",
  "Request ID",
  "Sumber",
  "Waktu Klien"
];

function doGet() {
  return jsonOutput_({
    status: "ok",
    service: "Nutrisme subscription endpoint",
    version: CONFIG.APP_VERSION,
    promotion: {
      amount: CONFIG.NEW_CUSTOMER_DISCOUNT,
      appliesTo: "first monthly payment",
      blockingStatuses: CONFIG.PROMO_BLOCKING_STATUSES
    },
    time: Utilities.formatDate(new Date(), CONFIG.TIME_ZONE, "yyyy-MM-dd HH:mm:ss")
  });
}

function doPost(e) {
  var lock = null;

  try {
    var data = readPayload_(e);

    // Honeypot: silently ignore automated submissions that fill hidden fields.
    if (cleanText_(data.website, 200) !== "") {
      return jsonOutput_({ status: "ok", ignored: true, version: CONFIG.APP_VERSION });
    }

    var action = data.action || "createOrder";
    if (["createOrder", "createHeroLead"].indexOf(action) === -1) {
      throw new Error("Aksi tidak dikenal.");
    }

    var order = action === "createHeroLead" ? validateHeroLead_(data) : validateOrder_(data);

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = getOrCreateSheet_();
    var duplicate = findExistingRequest_(sheet, order.requestId);

    if (duplicate) {
      lock.releaseLock();
      lock = null;
      return jsonOutput_({
        status: "ok",
        duplicate: true,
        orderNumber: duplicate.orderNumber,
        promoEligible: duplicate.promoEligible,
        version: CONFIG.APP_VERSION
      });
    }

    var promo = order.type === "HERO_LEAD"
      ? {
          eligible: null,
          discount: "",
          normalPrice: "",
          firstMonthPrice: "",
          reason: "Belum diverifikasi: nomor WhatsApp dan paket belum tersedia"
        }
      : determinePromo_(sheet, order.phone, order.plan);
    var lastRow = Math.max(sheet.getLastRow(), 1);
    var nextRow = lastRow + 1;
    var orderNumber = nextRow - 1;

    sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([[
      orderNumber,
      order.createdAt,
      safeSheetText_(order.name),
      safeSheetText_(order.instagram),
      safeSheetText_(order.address),
      safeSheetText_(order.phone),
      order.plan,
      "LEAD",
      order.type === "HERO_LEAD" ? "BELUM DIVERIFIKASI" : (promo.eligible ? "YA" : "TIDAK"),
      promo.discount,
      promo.firstMonthPrice,
      promo.normalPrice,
      promo.reason,
      order.language,
      order.requestId,
      safeSheetText_(order.source),
      safeSheetText_(order.clientTime)
    ]]);

    sheet.getRange(nextRow, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    sheet.getRange(nextRow, 6).setNumberFormat("@");
    sheet.getRange(nextRow, 10, 1, 3).setNumberFormat('"Rp"#,##0');
    SpreadsheetApp.flush();

    lock.releaseLock();
    lock = null;

    var emailStatus = "not-sent";
    if (CONFIG.SEND_EMAIL && CONFIG.NOTIFICATION_EMAIL) {
      try {
        sendNotificationEmail_(order, promo, orderNumber);
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
      customerStatus: "LEAD",
      leadType: order.type,
      promoEligible: promo.eligible,
      discount: promo.discount,
      firstMonthPrice: promo.firstMonthPrice,
      normalPrice: promo.normalPrice,
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

    console.error("Subscription request failed: " + errorMessage_(error));
    return jsonOutput_({
      status: "error",
      message: errorMessage_(error),
      version: CONFIG.APP_VERSION
    });
  }
}

// Run once from the Apps Script editor before deploying a new web-app version.
function setupNutrisme() {
  var sheet = getOrCreateSheet_();
  sheet.autoResizeColumns(1, HEADERS.length);
  sheet.setColumnWidth(5, 320);
  sheet.setColumnWidth(13, 280);
  sheet.setColumnWidth(16, 260);

  var result = {
    status: "ok",
    spreadsheet: SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getName(),
    sheet: sheet.getName(),
    columns: HEADERS.length,
    emailQuota: MailApp.getRemainingDailyQuota(),
    version: CONFIG.APP_VERSION
  };

  console.log(JSON.stringify(result));
  return result;
}

// Manual write test. It creates a LEAD row and does not send email.
function testWriteNutrisme() {
  var previousSendEmail = CONFIG.SEND_EMAIL;
  CONFIG.SEND_EMAIL = false;

  try {
    return doPost({
      parameter: {
        action: "createOrder",
        requestId: "manual-test-" + new Date().getTime(),
        bahasa: "id",
        nama: "TEST NUTRISME",
        instagram: "nutrisme.test",
        alamat: "Baris uji manual dari Google Apps Script",
        telepon: "81234567890",
        paket: "Nutrisme Ready",
        consent: "yes",
        source: "Apps Script editor",
        waktuKlien: new Date().toISOString(),
        website: ""
      }
    });
  } finally {
    CONFIG.SEND_EMAIL = previousSendEmail;
  }
}

function testHeroLeadNutrisme() {
  var previousSendEmail = CONFIG.SEND_EMAIL;
  CONFIG.SEND_EMAIL = false;

  try {
    return doPost({
      parameter: {
        action: "createHeroLead",
        requestId: "manual-hero-test-" + new Date().getTime(),
        bahasa: "id",
        nama: "TEST HERO NUTRISME",
        instagram: "nutrisme.hero.test",
        consent: "yes",
        source: "Apps Script editor - hero quick form",
        waktuKlien: new Date().toISOString(),
        website: ""
      }
    });
  } finally {
    CONFIG.SEND_EMAIL = previousSendEmail;
  }
}

function tesKoneksi() {
  return setupNutrisme();
}

function readPayload_(e) {
  if (!e) throw new Error("Request event tidak tersedia.");

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
  var instagram = normalizeInstagram_(data.instagram);
  var address = cleanText_(data.alamat, 1000);
  var phone = normalizePhone_(data.telepon);
  var plan = cleanText_(data.paket, 100);
  var consent = String(data.consent || "").toLowerCase();
  var language = String(data.bahasa || "id").toLowerCase() === "en" ? "en" : "id";

  if (name.length < 3) throw new Error("Nama lengkap minimal 3 karakter.");
  if (!/^[A-Za-z0-9._]{2,50}$/.test(instagram)) throw new Error("Username Instagram tidak valid.");
  if (address.length < 10) throw new Error("Alamat minimal 10 karakter.");
  if (!Object.prototype.hasOwnProperty.call(CONFIG.PLAN_PRICES, plan)) throw new Error("Paket Nutrisme wajib dipilih.");
  if (consent !== "yes" && consent !== "true" && consent !== "1") throw new Error("Persetujuan Privacy Policy belum diberikan.");

  return {
    type: "FULL_SUBSCRIPTION",
    name: name,
    instagram: "@" + instagram,
    address: address,
    phone: phone,
    plan: plan,
    language: language,
    requestId: cleanText_(data.requestId, 120) || Utilities.getUuid(),
    source: cleanText_(data.source, 500),
    clientTime: cleanText_(data.waktuKlien, 100),
    createdAt: new Date()
  };
}

function validateHeroLead_(data) {
  var name = cleanText_(data.nama, 100);
  var instagram = normalizeInstagram_(data.instagram);
  var consent = String(data.consent || "").toLowerCase();
  var language = String(data.bahasa || "id").toLowerCase() === "en" ? "en" : "id";

  if (name.length < 3) throw new Error("Nama lengkap minimal 3 karakter.");
  if (!/^[A-Za-z0-9._]{2,50}$/.test(instagram)) throw new Error("Username Instagram tidak valid.");
  if (consent !== "yes" && consent !== "true" && consent !== "1") throw new Error("Persetujuan Privacy Policy belum diberikan.");

  return {
    type: "HERO_LEAD",
    name: name,
    instagram: "@" + instagram,
    address: "",
    phone: "",
    plan: "",
    language: language,
    requestId: cleanText_(data.requestId, 120) || Utilities.getUuid(),
    source: cleanText_(data.source, 500) || "Hero quick form",
    clientTime: cleanText_(data.waktuKlien, 100),
    createdAt: new Date()
  };
}

function determinePromo_(sheet, phone, plan) {
  var normalPrice = CONFIG.PLAN_PRICES[plan];
  var hasBlockingHistory = hasBlockingPaymentHistory_(sheet, phone);
  var eligible = !hasBlockingHistory;
  var discount = eligible ? CONFIG.NEW_CUSTOMER_DISCOUNT : 0;

  return {
    eligible: eligible,
    discount: discount,
    normalPrice: normalPrice,
    firstMonthPrice: Math.max(0, normalPrice - discount),
    reason: eligible
      ? "Eligible: tidak ditemukan riwayat PAID/ACTIVE pada nomor ini"
      : "Tidak eligible: ditemukan riwayat PAID/ACTIVE pada nomor ini"
  };
}

function hasBlockingPaymentHistory_(sheet, phone) {
  if (sheet.getLastRow() < 2) return false;

  var headerMap = getHeaderMap_(sheet);
  var phoneColumn = headerMap["No. Handphone"];
  var statusColumn = headerMap["Status Pelanggan"];
  if (!phoneColumn || !statusColumn) return false;

  var rowCount = sheet.getLastRow() - 1;
  var width = Math.max(phoneColumn, statusColumn);
  var values = sheet.getRange(2, 1, rowCount, width).getDisplayValues();
  var normalizedTarget = normalizePhoneForComparison_(phone);

  return values.some(function(row) {
    var existingPhone = normalizePhoneForComparison_(row[phoneColumn - 1]);
    var status = String(row[statusColumn - 1] || "").trim().toUpperCase();
    return existingPhone === normalizedTarget && CONFIG.PROMO_BLOCKING_STATUSES.indexOf(status) !== -1;
  });
}

function findExistingRequest_(sheet, requestId) {
  if (!requestId || sheet.getLastRow() < 2) return null;

  var headerMap = getHeaderMap_(sheet);
  var requestColumn = headerMap["Request ID"];
  var numberColumn = headerMap["No"];
  var promoColumn = headerMap["Promo Eligible"];
  if (!requestColumn) return null;

  var rowCount = sheet.getLastRow() - 1;
  var width = Math.max(requestColumn, numberColumn || 1, promoColumn || 1);
  var values = sheet.getRange(2, 1, rowCount, width).getDisplayValues();

  for (var index = 0; index < values.length; index += 1) {
    if (String(values[index][requestColumn - 1] || "") === requestId) {
      return {
        orderNumber: numberColumn ? values[index][numberColumn - 1] : index + 1,
        promoEligible: promoColumn ? values[index][promoColumn - 1] === "YA" : null
      };
    }
  }

  return null;
}

function normalizeInstagram_(value) {
  return String(value || "").trim().replace(/^@/, "").substring(0, 50);
}

function normalizePhone_(value) {
  var digits = normalizePhoneForComparison_(value);
  if (!/^8\d{7,14}$/.test(digits)) throw new Error("Nomor handphone tidak valid.");
  return "+62" + digits;
}

function normalizePhoneForComparison_(value) {
  var digits = String(value || "").replace(/\D/g, "");
  if (digits.indexOf("62") === 0) digits = digits.substring(2);
  if (digits.indexOf("0") === 0) digits = digits.substring(1);
  return digits.substring(0, 15);
}

function cleanText_(value, maxLength) {
  return String(value == null ? "" : value)
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, maxLength);
}

function safeSheetText_(value) {
  var text = String(value == null ? "" : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getHeaderMap_(sheet) {
  var values = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), HEADERS.length)).getDisplayValues()[0];
  var map = {};
  values.forEach(function(header, index) {
    if (header) map[String(header).trim()] = index + 1;
  });
  return map;
}

function getOrCreateSheet_() {
  if (!CONFIG.SPREADSHEET_ID || CONFIG.SPREADSHEET_ID.indexOf("GANTI_") === 0) {
    throw new Error("SPREADSHEET_ID belum diisi.");
  }

  var spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground("#07563f");
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);

  var statusColumn = HEADERS.indexOf("Status Pelanggan") + 1;
  var statusValidation = SpreadsheetApp.newDataValidation()
    .requireValueInList(["LEAD", "CONTACTED", "PAID", "ACTIVE", "CANCELLED"], true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(2, statusColumn, Math.max(sheet.getMaxRows() - 1, 1), 1).setDataValidation(statusValidation);

  return sheet;
}

function sendNotificationEmail_(order, promo, orderNumber) {
  var isHeroLead = order.type === "HERO_LEAD";
  var subject = (isHeroLead ? "Lead Hero Baru #" : "Langganan Baru #") + orderNumber + " - " + order.name;
  var body =
    "Halo Tim Nutrisme,\n\n" +
    (isHeroLead
      ? "Ada calon pelanggan yang mengisi form singkat di Hero.\n\n"
      : "Ada permintaan langganan baru. Berikut detailnya:\n\n") +
    "No. Permintaan : #" + orderNumber + "\n" +
    "Waktu          : " + Utilities.formatDate(order.createdAt, CONFIG.TIME_ZONE, "dd/MM/yyyy HH:mm:ss") + "\n" +
    "Jenis Form     : " + (isHeroLead ? "HERO LEAD" : "FULL SUBSCRIPTION") + "\n" +
    "Nama           : " + order.name + "\n" +
    "Instagram      : " + order.instagram + "\n" +
    (isHeroLead
      ? "Status         : LEAD\nPromo          : Belum diverifikasi\n"
      : "Alamat         : " + order.address + "\n" +
        "No. HP         : " + order.phone + "\n" +
        "Paket          : " + order.plan + "\n" +
        "Status         : LEAD\n" +
        "Promo Eligible : " + (promo.eligible ? "YA" : "TIDAK") + "\n" +
        "Diskon         : " + formatRupiah_(promo.discount) + "\n" +
        "Bulan Pertama  : " + formatRupiah_(promo.firstMonthPrice) + "\n" +
        "Harga Normal   : " + formatRupiah_(promo.normalPrice) + "/bulan\n" +
        "Alasan Promo   : " + promo.reason + "\n") +
    "Bahasa         : " + order.language.toUpperCase() + "\n" +
    "ID Request     : " + order.requestId + "\n" +
    "Sumber         : " + order.source + "\n\n" +
    (isHeroLead
      ? "Hubungi calon pelanggan melalui Instagram untuk meminta detail berikutnya.\n\n"
      : "Ubah kolom Status Pelanggan menjadi PAID setelah pembayaran pertama diterima, atau ACTIVE ketika langganan aktif.\n\n") +
    "- Sistem Nutrisme";

  MailApp.sendEmail({
    to: CONFIG.NOTIFICATION_EMAIL,
    subject: subject,
    body: body,
    name: "Nutrisme Subscription"
  });
}

function formatRupiah_(amount) {
  return "Rp" + Number(amount || 0).toLocaleString("id-ID");
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error || "Unknown error");
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
