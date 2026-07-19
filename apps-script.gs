// Nutrisme - Google Apps Script backend
// Build 2026-07-19-16
// Paste this file into the Apps Script project, save it, run setupNutrisme(),
// then deploy a new web-app version.

var CONFIG = {
  SPREADSHEET_ID: "1rhOPKMv0HSPlpb_Gl4RpNKdxRd0Y6_qFaTZbMfg8bl0",
  SHEET_NAME: "Order Nutrisme",
  NOTIFICATION_EMAILS: ["nutrismeindonesia@gmail.com"],
  EMAIL_SENDER_NAME: "Nutrisme Indonesia",
  SEND_EMAIL_FOR_HERO_LEAD: true,
  SEND_EMAIL_FOR_FULL_SUBSCRIPTION: false,
  TIME_ZONE: "Asia/Jakarta",
  APP_VERSION: "2026-07-19-16",
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
  "Waktu Klien",
  "Email Notification",
  "Email Sent At"
];

function doGet(e) {
  var parameters = e && e.parameter ? e.parameter : {};
  var callback = cleanText_(parameters.callback, 180);

  try {
    var action = cleanText_(parameters.action || "health", 40);

    if (action === "status") {
      var requestId = cleanText_(parameters.requestId, 120);
      if (!requestId) throw new Error("Request ID wajib diisi.");

      var statusSpreadsheet = getSpreadsheet_();
      var statusSheet = statusSpreadsheet.getSheetByName(CONFIG.SHEET_NAME);
      var existing = statusSheet ? findExistingRequest_(statusSheet, requestId) : null;

      return webOutput_({
        status: "ok",
        connected: true,
        found: Boolean(existing),
        orderNumber: existing ? existing.orderNumber : null,
        promoEligible: existing ? existing.promoEligible : null,
        version: CONFIG.APP_VERSION
      }, callback);
    }

    var sheet = getOrCreateSheet_();
    return webOutput_({
      status: "ok",
      connected: true,
      service: "Nutrisme subscription endpoint",
      sheet: sheet.getName(),
      version: CONFIG.APP_VERSION,
      promotion: {
        amount: CONFIG.NEW_CUSTOMER_DISCOUNT,
        appliesTo: "first monthly payment",
        blockingStatuses: CONFIG.PROMO_BLOCKING_STATUSES
      },
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

    // Honeypot: silently ignore automated submissions that fill hidden fields.
    if (cleanText_(data.website, 200) !== "") {
      return jsonOutput_({ status: "ok", ignored: true, version: CONFIG.APP_VERSION });
    }

    var action = data.action || "createOrder";
    if (action !== "createHeroLead") {
      throw new Error("Aksi tidak dikenal.");
    }

    var order = validateHeroLead_(data);

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
      safeSheetText_(order.clientTime),
      shouldSendNotification_(order) ? "PENDING" : "DISABLED",
      ""
    ]]);

    sheet.getRange(nextRow, 2).setNumberFormat("dd/MM/yyyy HH:mm:ss");
    sheet.getRange(nextRow, 6).setNumberFormat("@");
    sheet.getRange(nextRow, 10, 1, 3).setNumberFormat('"Rp"#,##0');
    SpreadsheetApp.flush();

    lock.releaseLock();
    lock = null;

    var emailStatus = "disabled";
    if (shouldSendNotification_(order)) {
      try {
        sendNotificationEmail_(order, promo, orderNumber);
        emailStatus = "sent";
        updateEmailStatus_(sheet, nextRow, "SENT", new Date());
      } catch (mailError) {
        emailStatus = "failed";
        updateEmailStatus_(sheet, nextRow, "FAILED: " + cleanText_(errorMessage_(mailError), 220), "");
        console.error("Email notification failed: " + errorMessage_(mailError));
      }
    } else {
      updateEmailStatus_(sheet, nextRow, "DISABLED", "");
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
  sheet.setColumnWidth(18, 250);
  sheet.setColumnWidth(19, 165);

  var result = {
    status: "ok",
    spreadsheet: getSpreadsheet_().getName(),
    sheet: sheet.getName(),
    columns: HEADERS.length,
    emailRecipients: getNotificationRecipients_(),
    emailQuota: MailApp.getRemainingDailyQuota(),
    version: CONFIG.APP_VERSION
  };

  console.log(JSON.stringify(result));
  return result;
}

// Run once from the Apps Script editor to authorize MailApp and verify delivery.
function testNotificationEmailNutrisme() {
  var recipients = getNotificationRecipients_();
  if (!recipients.length) throw new Error("Email penerima notifikasi belum dikonfigurasi.");

  var quota = MailApp.getRemainingDailyQuota();
  if (quota < recipients.length) {
    throw new Error("Kuota email harian tidak mencukupi. Sisa kuota: " + quota);
  }

  var now = new Date();
  var subject = "Tes Notifikasi Order Nutrisme - " + Utilities.formatDate(now, CONFIG.TIME_ZONE, "dd/MM/yyyy HH:mm:ss");
  var spreadsheetUrl = getSpreadsheet_().getUrl();
  var body =
    "Halo Tim Nutrisme,\n\n" +
    "Email ini adalah tes notifikasi order dari Google Apps Script Nutrisme.\n" +
    "Jika email ini diterima, izin MailApp dan alamat penerima sudah benar.\n\n" +
    "Spreadsheet: " + spreadsheetUrl + "\n" +
    "Versi backend: " + CONFIG.APP_VERSION + "\n\n" +
    "- Sistem Nutrisme";

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    body: body,
    htmlBody:
      '<div style="font-family:Arial,sans-serif;color:#18342d;line-height:1.6">' +
      '<h2 style="color:#07563f;margin:0 0 12px">Tes Notifikasi Order Nutrisme</h2>' +
      '<p>Email ini adalah tes notifikasi order dari Google Apps Script Nutrisme.</p>' +
      '<p>Jika email ini diterima, izin MailApp dan alamat penerima sudah benar.</p>' +
      '<p><a href="' + htmlEscape_(spreadsheetUrl) + '" style="color:#07563f;font-weight:700">Buka Spreadsheet Nutrisme</a></p>' +
      '<p style="font-size:12px;color:#64766f">Versi backend: ' + htmlEscape_(CONFIG.APP_VERSION) + '</p>' +
      '</div>',
    name: CONFIG.EMAIL_SENDER_NAME
  });

  var result = {
    status: "ok",
    recipients: recipients,
    remainingQuota: MailApp.getRemainingDailyQuota(),
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

function testConnectionNutrisme() {
  var spreadsheet = getSpreadsheet_();
  var sheet = getOrCreateSheet_();
  var result = {
    status: "ok",
    spreadsheet: spreadsheet.getName(),
    spreadsheetId: spreadsheet.getId(),
    sheet: sheet.getName(),
    lastRow: sheet.getLastRow(),
    version: CONFIG.APP_VERSION
  };
  console.log(JSON.stringify(result));
  return result;
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

function getSpreadsheet_() {
  var configuredId = cleanText_(CONFIG.SPREADSHEET_ID, 180);
  var configuredError = null;

  if (configuredId && configuredId.indexOf("GANTI_") !== 0) {
    try {
      return SpreadsheetApp.openById(configuredId);
    } catch (error) {
      configuredError = error;
    }
  }

  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) return activeSpreadsheet;

  if (configuredError) {
    throw new Error("Spreadsheet tidak dapat dibuka. Periksa SPREADSHEET_ID dan izin akun Apps Script. Detail: " + errorMessage_(configuredError));
  }

  throw new Error("SPREADSHEET_ID belum diisi dan project Apps Script tidak terikat ke Spreadsheet.");
}

function ensureSheetSchema_(sheet) {
  var existingWidth = Math.max(sheet.getLastColumn(), 1);
  var existingHeaders = sheet.getRange(1, 1, 1, existingWidth).getDisplayValues()[0]
    .map(function(value) { return String(value || "").trim(); });
  var hasExistingHeaders = existingHeaders.some(function(value) { return value !== ""; });
  var schemaMatches = HEADERS.every(function(header, index) {
    return existingHeaders[index] === header;
  });

  if (hasExistingHeaders && !schemaMatches) {
    var oldHeaderMap = {};
    existingHeaders.forEach(function(header, index) {
      if (header) oldHeaderMap[header] = index;
    });

    var rowCount = Math.max(sheet.getLastRow() - 1, 0);
    var oldRows = rowCount > 0
      ? sheet.getRange(2, 1, rowCount, existingWidth).getValues()
      : [];

    var migratedRows = oldRows.map(function(row, rowIndex) {
      return HEADERS.map(function(header) {
        if (Object.prototype.hasOwnProperty.call(oldHeaderMap, header)) {
          return row[oldHeaderMap[header]];
        }
        if (header === "No") return rowIndex + 1;
        if (header === "Status Pelanggan") return "LEAD";
        if (header === "Promo Eligible") return "BELUM DIVERIFIKASI";
        return "";
      });
    });

    sheet.clearContents();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    if (migratedRows.length > 0) {
      sheet.getRange(2, 1, migratedRows.length, HEADERS.length).setValues(migratedRows);
    }
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function getOrCreateSheet_() {
  var spreadsheet = getSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);

  ensureSheetSchema_(sheet);

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

function getNotificationRecipients_() {
  var values = CONFIG.NOTIFICATION_EMAILS || [];
  if (!Array.isArray(values)) values = [values];

  return values
    .map(function(value) { return cleanText_(value, 180).toLowerCase(); })
    .filter(function(value, index, array) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && array.indexOf(value) === index;
    });
}

function shouldSendNotification_(order) {
  if (!CONFIG.SEND_EMAIL || !getNotificationRecipients_().length) return false;
  if (order.type === "HERO_LEAD") return CONFIG.SEND_EMAIL_FOR_HERO_LEAD !== false;
  return CONFIG.SEND_EMAIL_FOR_FULL_SUBSCRIPTION !== false;
}

function updateEmailStatus_(sheet, rowNumber, status, sentAt) {
  var headerMap = getHeaderMap_(sheet);
  var statusColumn = headerMap["Email Notification"];
  var timeColumn = headerMap["Email Sent At"];

  if (statusColumn) sheet.getRange(rowNumber, statusColumn).setValue(status);
  if (timeColumn) {
    var cell = sheet.getRange(rowNumber, timeColumn);
    cell.setValue(sentAt || "");
    if (sentAt) cell.setNumberFormat("dd/MM/yyyy HH:mm:ss");
  }
  SpreadsheetApp.flush();
}

function sendNotificationEmail_(order, promo, orderNumber) {
  var recipients = getNotificationRecipients_();
  if (!recipients.length) throw new Error("Email penerima notifikasi belum dikonfigurasi.");

  var quota = MailApp.getRemainingDailyQuota();
  if (quota < recipients.length) {
    throw new Error("Kuota email harian tidak mencukupi. Sisa kuota: " + quota);
  }

  var isHeroLead = order.type === "HERO_LEAD";
  var formattedTime = Utilities.formatDate(order.createdAt, CONFIG.TIME_ZONE, "dd/MM/yyyy HH:mm:ss");
  var subject = (isHeroLead ? "Lead Hero Baru #" : "Order Langganan Baru #") + orderNumber + " - " + order.name;
  var spreadsheetUrl = getSpreadsheet_().getUrl();

  var plainDetails =
    "No. Permintaan : #" + orderNumber + "\n" +
    "Waktu          : " + formattedTime + "\n" +
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
    "Sumber         : " + order.source + "\n";

  var body =
    "Halo Tim Nutrisme,\n\n" +
    (isHeroLead
      ? "Ada calon pelanggan yang mengisi form singkat di Hero.\n\n"
      : "Ada order langganan baru. Berikut detailnya:\n\n") +
    plainDetails + "\n" +
    "Buka Spreadsheet: " + spreadsheetUrl + "\n\n" +
    (isHeroLead
      ? "Hubungi calon pelanggan melalui Instagram untuk meminta detail berikutnya.\n\n"
      : "Ubah Status Pelanggan menjadi PAID setelah pembayaran pertama diterima, atau ACTIVE ketika langganan aktif.\n\n") +
    "- Sistem Nutrisme";

  var htmlRows = [
    ["No. Permintaan", "#" + orderNumber],
    ["Waktu", formattedTime],
    ["Jenis Form", isHeroLead ? "HERO LEAD" : "FULL SUBSCRIPTION"],
    ["Nama", order.name],
    ["Instagram", order.instagram]
  ];

  if (isHeroLead) {
    htmlRows.push(["Status", "LEAD"]);
    htmlRows.push(["Promo", "Belum diverifikasi"]);
  } else {
    htmlRows.push(["Alamat", order.address]);
    htmlRows.push(["No. Handphone", order.phone]);
    htmlRows.push(["Paket", order.plan]);
    htmlRows.push(["Status", "LEAD"]);
    htmlRows.push(["Promo Eligible", promo.eligible ? "YA" : "TIDAK"]);
    htmlRows.push(["Diskon", formatRupiah_(promo.discount)]);
    htmlRows.push(["Harga Bulan Pertama", formatRupiah_(promo.firstMonthPrice)]);
    htmlRows.push(["Harga Normal", formatRupiah_(promo.normalPrice) + "/bulan"]);
    htmlRows.push(["Alasan Promo", promo.reason]);
  }

  htmlRows.push(["Bahasa", order.language.toUpperCase()]);
  htmlRows.push(["ID Request", order.requestId]);
  htmlRows.push(["Sumber", order.source]);

  var tableHtml = htmlRows.map(function(row) {
    return '<tr>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #e6eee9;color:#64766f;vertical-align:top;white-space:nowrap">' + htmlEscape_(row[0]) + '</td>' +
      '<td style="padding:8px 10px;border-bottom:1px solid #e6eee9;color:#18342d;font-weight:600">' + htmlEscape_(row[1]) + '</td>' +
      '</tr>';
  }).join("");

  var htmlBody =
    '<div style="font-family:Arial,sans-serif;color:#18342d;line-height:1.6;max-width:680px;margin:0 auto">' +
      '<div style="background:#07563f;color:#fff;padding:20px 24px;border-radius:14px 14px 0 0">' +
        '<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.82">Nutrisme Indonesia</div>' +
        '<h2 style="margin:5px 0 0;font-size:22px">' + htmlEscape_(isHeroLead ? "Lead Hero Baru" : "Order Langganan Baru") + '</h2>' +
      '</div>' +
      '<div style="border:1px solid #dce8e1;border-top:0;padding:22px 24px;border-radius:0 0 14px 14px;background:#fff">' +
        '<p style="margin:0 0 16px">' + htmlEscape_(isHeroLead
          ? "Ada calon pelanggan yang mengisi form singkat di Hero."
          : "Ada order langganan baru. Berikut detailnya:") + '</p>' +
        '<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">' + tableHtml + '</table>' +
        '<p style="margin:20px 0 0">' +
          '<a href="' + htmlEscape_(spreadsheetUrl) + '" style="display:inline-block;background:#f28a3b;color:#fff;text-decoration:none;font-weight:700;padding:11px 18px;border-radius:999px">Buka Spreadsheet</a>' +
        '</p>' +
        '<p style="margin:18px 0 0;color:#64766f;font-size:13px">' + htmlEscape_(isHeroLead
          ? "Hubungi calon pelanggan melalui Instagram untuk meminta detail berikutnya."
          : "Ubah Status Pelanggan menjadi PAID setelah pembayaran pertama diterima, atau ACTIVE ketika langganan aktif.") + '</p>' +
      '</div>' +
    '</div>';

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: CONFIG.EMAIL_SENDER_NAME
  });
}

function htmlEscape_(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatRupiah_(amount) {
  return "Rp" + Number(amount || 0).toLocaleString("id-ID");
}

function errorMessage_(error) {
  return error && error.message ? error.message : String(error || "Unknown error");
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
