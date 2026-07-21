const NUTRISME_BUILD = "2026-07-21-21";

const TRANSLATIONS = {
  id: {
    "meta.title": "Nutrisme — Makan Sehat, Sesuai Caramu",
    "meta.description": "Nutrisme menghadirkan paket makanan sehat dengan nutrisi transparan, pilihan fleksibel, dan promo pelanggan baru.",
    "access.skip": "Lewati ke konten utama",
    "access.home": "Nutrisme beranda",
    "access.nav": "Navigasi utama",
    "access.language": "Pilih bahasa",
    "access.openMenu": "Buka menu",
    "access.closeMenu": "Tutup menu",
    "access.close": "Tutup",
    "access.products": "Pilihan produk Nutrisme",
    "nav.home": "Beranda",
    "nav.why": "Keunggulan",
    "nav.plans": "Paket",
    "nav.how": "Cara Kerja",
    "cta.subscribeShort": "Berlangganan",
    "cta.subscribeNow": "Berlangganan Sekarang",
    "cta.viewPlans": "Lihat Pilihan Paket",
    "cta.choosePlan": "Pilih Paket",
    "cta.startSubscribe": "Mulai Berlangganan",
    "hero.launching": "SEGERA HADIR — JAKARTA",
    "hero.eyebrow": "Meal plan sehat yang mengikuti ritme hidupmu",
    "hero.formKicker": "MULAI DARI SINI",
    "hero.formTitle": "Tertarik dengan Nutrisme?",
    "hero.formIntro": "Isi data singkat berikut dan tim kami akan menghubungimu melalui Instagram.",
    "hero.submit": "Submit",
    "hero.statusIncomplete": "Lengkapi nama, username Instagram, dan persetujuan Privacy Policy.",
    "hero.statusComplete": "Data siap dikirim.",
    "hero.statusSending": "Mengirim data...",
    "hero.statusInvalid": "Periksa kembali data yang belum valid.",
    "hero.statusFailed": "Data belum berhasil dikirim. Coba lagi.",
    "hero.statusTimeout": "Data belum terkonfirmasi di Spreadsheet. Periksa deployment Apps Script lalu coba lagi.",
    "hero.statusBackend": "Form belum terhubung ke Google Sheets. Periksa deployment Apps Script.",
    "hero.title": "Makan Sehat.<br><span>Sesuai Caramu</span>",
    "hero.description": "Ketahui kandungan gula, garam, lemak, serat, kalori, dan protein di setiap menu. Pilih Fresh Meal, Ready-to-Heat, atau Ready-to-Cook sesuai kebutuhanmu.",
    "promo.aria": "Promo pelanggan baru",
    "promo.badge": "PROMO PELANGGAN BARU",
    "promo.save": "HEMAT",
    "promo.detail": "Otomatis berlaku untuk pembayaran bulan pertama semua paket. Tanpa kode promo.",
    "promo.verification": "Kelayakan promo diverifikasi otomatis berdasarkan riwayat pembayaran pada nomor WhatsApp.",
    "formats.fresh.title": "Fresh Meal",
    "formats.fresh.short": "Dimasak segar dan diantar untukmu.",
    "formats.heat.title": "Ready-to-Heat",
    "formats.heat.short": "Panaskan dan nikmati dalam hitungan menit.",
    "formats.cook.title": "Ready-to-Cook",
    "formats.cook.short": "Masak praktis dengan bahan dan bumbu terukur.",
    "trust.transparent.title": "Nutrisi Transparan",
    "trust.transparent.text": "Informasi gizi lengkap di setiap menu.",
    "trust.balanced.title": "Seimbang & Lezat",
    "trust.balanced.text": "Menu nikmat dengan komposisi terencana.",
    "trust.delivery.title": "Pengiriman Fleksibel",
    "trust.delivery.text": "Disesuaikan dengan paket dan jadwalmu.",
    "trust.choice.title": "Pilihan Fleksibel",
    "trust.choice.text": "Fresh, siap dipanaskan, atau siap dimasak.",
    "why.kicker": "🌱 MENGAPA NUTRISME?",
    "why.title": "Alasan Pelanggan <span>Memilih Nutrisme</span>",
    "why.intro": "Kami membuat pola makan sehat terasa lebih mudah, jelas, dan fleksibel untuk dijalani setiap hari.",
    "why.card1.title": "Transparansi Nutrisi Lengkap",
    "why.card1.text": "Ketahui kalori, protein, karbohidrat, lemak, serat, serta informasi penting lain pada setiap menu.",
    "why.card2.title": "Pengalaman Makan Fleksibel",
    "why.card2.text": "Pilih Fresh Meal, Ready-to-Heat, atau Ready-to-Cook sesuai jadwal dan tingkat kepraktisanmu.",
    "why.card3.title": "Diawasi Ahli Gizi",
    "why.card3.text": "Menu dirancang agar seimbang, lengkap, dan tetap nikmat untuk dinikmati secara konsisten.",
    "why.card4.title": "Nutrisi Lebih Personal",
    "why.card4.text": "Sesuaikan pilihan makanan dengan target kalori, protein, serat, dan kebutuhan harianmu.",
    "why.bridge": "Sudah memahami manfaatnya? Sekarang pilih paket yang paling cocok untuk rutinitasmu.",
    "plans.kicker": "🌱 PILIH GAYA MAKANMU",
    "plans.title": "Paket Mana yang <span>Cocok Untukmu?</span>",
    "plans.intro": "Bandingkan tingkat kepraktisan, cara menikmati, dan harga untuk menemukan pilihan terbaik.",
    "plans.daily.subtitle": "Fresh Meal Diantar Setiap Hari",
    "plans.daily.description": "Menu sehat yang dimasak setiap hari dan dikirim langsung ke tempatmu berada.",
    "plans.daily.summary": "Cocok untuk kamu yang ingin makanan segar siap santap setiap hari.",
    "plans.ready.subtitle": "Makanan Sehat Siap dalam Hitungan Menit",
    "plans.ready.description": "Frozen meals yang cukup dipanaskan dalam beberapa menit dan praktis disimpan sebagai stok.",
    "plans.ready.summary": "Cocok untuk stok praktis yang tinggal dipanaskan saat dibutuhkan.",
    "plans.cook.subtitle": "Masak Segar Tanpa Repot Persiapan",
    "plans.cook.description": "Seluruh bahan dan bumbu telah dipersiapkan dengan takaran nutrisi yang tepat.",
    "plans.cook.summary": "Cocok untuk kamu yang tetap ingin memasak tanpa repot menyiapkan bahan.",
    "plans.firstMonth": "Bulan pertama pelanggan baru",
    "plans.firstMonthPeriod": "/bulan pertama",
    "plans.nextDaily": "Selanjutnya Rp1.120.000/bulan",
    "plans.nextReady": "Selanjutnya Rp820.000/bulan",
    "plans.nextCook": "Selanjutnya Rp700.000/bulan",
    "plans.promoNote": "Potongan Rp100.000 hanya berlaku bagi pelanggan tanpa riwayat pembayaran berstatus PAID atau ACTIVE.",
    "plans.bridge": "Sudah menemukan paket yang cocok? Proses berlangganan hanya membutuhkan empat langkah sederhana.",
    "steps.kicker": "🌱 CARA BERLANGGANAN",
    "steps.title": "Mulai dalam <span>4 Langkah</span>",
    "steps.intro": "Pilih paket, lengkapi data, atur pengiriman bersama tim kami, lalu nikmati makananmu.",
    "steps.card1.title": "Pilih Cara Makanmu",
    "steps.card1.text": "Tentukan Fresh Meal, Ready-to-Heat, atau Ready-to-Cook.",
    "steps.card2.title": "Pilih Paket dan Menu",
    "steps.card2.text": "Pilih paket yang sesuai, lalu tim kami membantu mengonfirmasi detail menu.",
    "steps.card3.title": "Atur Pengiriman",
    "steps.card3.text": "Konfirmasikan alamat, tanggal, dan jadwal pengiriman yang tersedia.",
    "steps.card4.title": "Nikmati Makananmu",
    "steps.card4.text": "Kami menyiapkan dan mengirimkan pesanan sesuai paket yang telah dikonfirmasi.",
    "final.title": "Mulai <span>Perjalanan Sehatmu</span> Hari Ini",
    "final.text": "Pilih paket yang sesuai, isi satu formulir, dan tim Nutrisme akan menghubungimu untuk konfirmasi berikutnya.",
    "footer.tagline": "Makanan sehat dibuat lebih sederhana.<br>Nutrisi transparan, diantar untukmu.",
    "footer.about": "Tentang",
    "footer.aboutUs": "Tentang Kami",
    "footer.how": "Cara Kerja",
    "footer.plans": "Paket",
    "footer.contact": "Kontak",
    "footer.follow": "Ikuti Kami",
    "footer.rights": "Seluruh hak dilindungi.",
    "form.kicker": "BERLANGGANAN SEKARANG",
    "form.title": "Lengkapi data pelanggan.",
    "form.intro": "Semua data wajib diisi agar tim Nutrisme dapat menghubungi dan memproses permintaan langgananmu.",
    "form.name": "Nama Lengkap",
    "form.namePlaceholder": "Masukkan nama lengkap",
    "form.instagram": "Username Instagram",
    "form.instagramPlaceholder": "username",
    "form.address": "Alamat Lengkap",
    "form.addressPlaceholder": "Masukkan alamat lengkap",
    "form.phone": "No. Handphone/WhatsApp",
    "form.plan": "Paket Pilihan",
    "form.planPlaceholder": "Pilih paket terlebih dahulu",
    "form.promoTitle": "Promo bulan pertama",
    "form.promoText": "Diskon Rp100.000 akan diperiksa otomatis. Pelanggan dengan riwayat PAID atau ACTIVE tidak memenuhi syarat promo pelanggan baru.",
    "form.consent": "Saya telah membaca dan menyetujui",
    "validation.name": "Minimal 3 karakter.",
    "validation.instagram": "Gunakan huruf, angka, titik, atau underscore.",
    "validation.address": "Minimal 10 karakter.",
    "validation.phone": "Nomor harus diawali angka 8 dan berisi 8–15 digit.",
    "validation.plan": "Silakan pilih salah satu paket Nutrisme.",
    "status.incomplete": "Lengkapi seluruh data, pilih paket, dan berikan persetujuan.",
    "status.complete": "Data lengkap. Silakan kirim formulir.",
    "status.invalid": "Periksa kembali data yang belum valid.",
    "status.sending": "Mengirim data...",
    "status.timeout": "Pengiriman terlalu lama. Coba lagi.",
    "status.failed": "Data belum berhasil dikirim. Coba lagi.",
    "success.title": "Terima kasih!",
    "success.fullText": "Data langgananmu sudah dikirim. Tim Nutrisme akan memverifikasi promo dan menghubungimu untuk konfirmasi.",
    "success.leadText": "Terima kasih! Data Anda sedang dikirim ke sistem Nutrisme.",
    "success.leadSaved": "Data Anda berhasil tercatat. Tim Nutrisme akan menghubungi melalui Instagram.",
    "success.leadFailed": "Data belum berhasil tersimpan. Silakan tutup pesan ini lalu kirim ulang.",
    "success.again": "Pesan Lagi",
    "success.close": "Tutup",
    "privacy.link": "Privacy Policy",
    "privacy.kicker": "PRIVACY POLICY",
    "privacy.title": "Kebijakan Privasi Nutrisme",
    "privacy.intro": "Kebijakan ini menjelaskan bagaimana data pada formulir berlangganan dikumpulkan, digunakan, dan disimpan.",
    "privacy.closeAria": "Tutup Privacy Policy",
    "privacy.close": "Tutup Privacy Policy",
    "privacy.s1.title": "1. Data yang dikumpulkan",
    "privacy.s1.text": "Form singkat mengumpulkan nama lengkap, username Instagram, persetujuan Privacy Policy, serta informasi teknis yang diperlukan untuk mengirim formulir. Persetujuan tidak dibuat sebagai kolom tersendiri di Spreadsheet.",
    "privacy.s2.title": "2. Tujuan penggunaan",
    "privacy.s2.text": "Data dari form singkat digunakan untuk menindaklanjuti minat calon pelanggan melalui Instagram serta mencegah spam atau pengiriman ganda.",
    "privacy.s3.title": "3. Verifikasi promo pelanggan baru",
    "privacy.s3.text": "Verifikasi promo belum dilakukan melalui form singkat karena nomor WhatsApp dan paket belum dikumpulkan. Tim Nutrisme akan mengonfirmasi detail tersebut saat menindaklanjuti calon pelanggan.",
    "privacy.s4.title": "4. Penyimpanan dan pihak yang memproses",
    "privacy.s4.text": "Data formulir diproses melalui Google Apps Script dan dicatat pada Google Sheets. Akses hanya diberikan kepada pihak Nutrisme atau mitra operasional yang membutuhkannya untuk memproses layanan.",
    "privacy.s5.title": "5. Keamanan dan masa penyimpanan",
    "privacy.s5.text": "Nutrisme menerapkan langkah yang wajar untuk menjaga data. Data disimpan selama diperlukan untuk memproses langganan, memenuhi kewajiban operasional atau hukum, dan menyelesaikan keluhan.",
    "privacy.s6.title": "6. Hak pelanggan",
    "privacy.s6.text": "Pelanggan dapat meminta akses, koreksi, pembaruan, atau penghapusan data dengan menghubungi Nutrisme melalui WhatsApp 0812-3456-7890 atau email nutrisme.indonesia@gmail.com.",
    "privacy.s7.title": "7. Persetujuan",
    "privacy.s7.text": "Dengan mencentang persetujuan dan menekan “Submit”, pengguna menyatakan telah membaca serta menyetujui pemrosesan data sesuai kebijakan ini."
  },
  en: {
    "meta.title": "Nutrisme — Eat Healthy, Your Way",
    "meta.description": "Nutrisme offers healthy meal plans with transparent nutrition, flexible formats, and an automatic new-customer discount.",
    "access.skip": "Skip to main content",
    "access.home": "Nutrisme home",
    "access.nav": "Main navigation",
    "access.language": "Choose language",
    "access.openMenu": "Open menu",
    "access.closeMenu": "Close menu",
    "access.close": "Close",
    "access.products": "Nutrisme product choices",
    "nav.home": "Home",
    "nav.why": "Benefits",
    "nav.plans": "Meal Plans",
    "nav.how": "How It Works",
    "cta.subscribeShort": "Subscribe",
    "cta.subscribeNow": "Subscribe Now",
    "cta.viewPlans": "View Meal Plans",
    "cta.choosePlan": "Choose Plan",
    "cta.startSubscribe": "Start Subscribing",
    "hero.launching": "LAUNCHING SOON — JAKARTA",
    "hero.eyebrow": "Healthy meal plans that fit your daily rhythm",
    "hero.formKicker": "START HERE",
    "hero.formTitle": "Interested in Nutrisme?",
    "hero.formIntro": "Leave your details and our team will contact you through Instagram.",
    "hero.submit": "Submit",
    "hero.statusIncomplete": "Complete your name, Instagram username, and Privacy Policy consent.",
    "hero.statusComplete": "Your details are ready to send.",
    "hero.statusSending": "Sending your details...",
    "hero.statusInvalid": "Please review the fields that are not valid.",
    "hero.statusFailed": "Your details could not be sent. Please try again.",
    "hero.statusTimeout": "The data was not confirmed in the Spreadsheet. Check the Apps Script deployment and try again.",
    "hero.statusBackend": "The form is not connected to Google Sheets. Check the Apps Script deployment.",
    "hero.title": "Eat Healthy.<br><span>Your Way</span>",
    "hero.description": "See the sugar, salt, fat, fibre, calories, and protein in every menu. Choose Fresh Meal, Ready-to-Heat, or Ready-to-Cook based on your needs.",
    "promo.aria": "New customer promotion",
    "promo.badge": "NEW CUSTOMER OFFER",
    "promo.save": "SAVE",
    "promo.detail": "Automatically applied to the first monthly payment for every plan. No promo code required.",
    "promo.verification": "Eligibility is verified automatically using the payment history linked to your WhatsApp number.",
    "formats.fresh.title": "Fresh Meal",
    "formats.fresh.short": "Freshly cooked and delivered to you.",
    "formats.heat.title": "Ready-to-Heat",
    "formats.heat.short": "Heat and enjoy in just a few minutes.",
    "formats.cook.title": "Ready-to-Cook",
    "formats.cook.short": "Cook easily with portioned ingredients and spices.",
    "trust.transparent.title": "Transparent Nutrition",
    "trust.transparent.text": "Complete nutrition information for every menu.",
    "trust.balanced.title": "Balanced & Delicious",
    "trust.balanced.text": "Enjoyable meals with planned portions.",
    "trust.delivery.title": "Flexible Delivery",
    "trust.delivery.text": "Adjusted to your plan and confirmed schedule.",
    "trust.choice.title": "Flexible Choices",
    "trust.choice.text": "Fresh, ready to heat, or ready to cook.",
    "why.kicker": "🌱 WHY NUTRISME?",
    "why.title": "Why Customers <span>Choose Nutrisme</span>",
    "why.intro": "We make healthy eating easier, clearer, and more flexible for everyday life.",
    "why.card1.title": "Complete Nutrition Transparency",
    "why.card1.text": "See calories, protein, carbohydrates, fat, fibre, and other important information for every menu.",
    "why.card2.title": "Flexible Meal Experience",
    "why.card2.text": "Choose Fresh Meal, Ready-to-Heat, or Ready-to-Cook based on your schedule and preferred convenience.",
    "why.card3.title": "Nutritionist Supervised",
    "why.card3.text": "Menus are designed to be balanced, complete, and enjoyable enough for consistent routines.",
    "why.card4.title": "More Personal Nutrition",
    "why.card4.text": "Match your choices with your calorie, protein, fibre, and daily nutrition goals.",
    "why.bridge": "Know the benefits? Now choose the plan that best fits your routine.",
    "plans.kicker": "🌱 CHOOSE YOUR MEAL STYLE",
    "plans.title": "Which Plan <span>Fits You?</span>",
    "plans.intro": "Compare convenience, meal format, and price to find the best choice for your lifestyle.",
    "plans.daily.subtitle": "Fresh Meals Delivered Daily",
    "plans.daily.description": "Healthy meals cooked daily and delivered directly to your location.",
    "plans.daily.summary": "Best for anyone who wants fresh, ready-to-eat meals every day.",
    "plans.ready.subtitle": "Healthy Meals Ready in Minutes",
    "plans.ready.description": "Frozen meals that are ready after a few minutes of heating and easy to keep in stock.",
    "plans.ready.summary": "Best for practical meal stock that only needs reheating when required.",
    "plans.cook.subtitle": "Cook Fresh Without the Prep",
    "plans.cook.description": "Ingredients and spices are prepared in portions with planned nutrition.",
    "plans.cook.summary": "Best for those who still want to cook without preparing every ingredient.",
    "plans.firstMonth": "First month for new customers",
    "plans.firstMonthPeriod": "/first month",
    "plans.nextDaily": "Then Rp1,120,000/month",
    "plans.nextReady": "Then Rp820,000/month",
    "plans.nextCook": "Then Rp700,000/month",
    "plans.promoNote": "The Rp100,000 discount is only available to customers without a previous PAID or ACTIVE payment record.",
    "plans.bridge": "Found the right plan? Starting your subscription only takes four simple steps.",
    "steps.kicker": "🌱 HOW TO SUBSCRIBE",
    "steps.title": "Start in <span>4 Steps</span>",
    "steps.intro": "Choose a plan, complete your details, arrange delivery with our team, and enjoy your meals.",
    "steps.card1.title": "Choose Your Meal Style",
    "steps.card1.text": "Select Fresh Meal, Ready-to-Heat, or Ready-to-Cook.",
    "steps.card2.title": "Choose a Plan and Menu",
    "steps.card2.text": "Select the right plan and our team will help confirm the menu details.",
    "steps.card3.title": "Arrange Delivery",
    "steps.card3.text": "Confirm your address, date, and an available delivery schedule.",
    "steps.card4.title": "Enjoy Your Meals",
    "steps.card4.text": "We prepare and deliver your order according to the confirmed plan.",
    "final.title": "Start Your <span>Healthy Journey</span> Today",
    "final.text": "Choose your plan, complete one form, and the Nutrisme team will contact you for confirmation.",
    "footer.tagline": "Healthy meals made simpler.<br>Transparent nutrition, delivered to you.",
    "footer.about": "About",
    "footer.aboutUs": "About Us",
    "footer.how": "How It Works",
    "footer.plans": "Meal Plans",
    "footer.contact": "Contact",
    "footer.follow": "Follow Us",
    "footer.rights": "All rights reserved.",
    "form.kicker": "SUBSCRIBE NOW",
    "form.title": "Complete your customer details.",
    "form.intro": "All fields are required so the Nutrisme team can contact you and process your subscription request.",
    "form.name": "Full Name",
    "form.namePlaceholder": "Enter your full name",
    "form.instagram": "Instagram Username",
    "form.instagramPlaceholder": "username",
    "form.address": "Full Address",
    "form.addressPlaceholder": "Enter your complete address",
    "form.phone": "Phone/WhatsApp Number",
    "form.plan": "Selected Plan",
    "form.planPlaceholder": "Choose a plan first",
    "form.promoTitle": "First-month offer",
    "form.promoText": "The Rp100,000 discount is checked automatically. Customers with a PAID or ACTIVE record are not eligible for the new-customer offer.",
    "form.consent": "I have read and agree to the",
    "validation.name": "Enter at least 3 characters.",
    "validation.instagram": "Use letters, numbers, periods, or underscores.",
    "validation.address": "Enter at least 10 characters.",
    "validation.phone": "The number must begin with 8 and contain 8–15 digits.",
    "validation.plan": "Please choose one Nutrisme plan.",
    "status.incomplete": "Complete all fields, choose a plan, and provide your consent.",
    "status.complete": "Your details are complete. You may submit the form.",
    "status.invalid": "Please review the fields that are not valid.",
    "status.sending": "Sending your details...",
    "status.timeout": "The data was not confirmed in the Spreadsheet. Check the Apps Script deployment and try again.",
    "status.backend": "The form is not connected to Google Sheets. Check the Apps Script deployment.",
    "status.failed": "Your details could not be sent. Please try again.",
    "success.title": "Thank you!",
    "success.fullText": "Your subscription request has been sent. The Nutrisme team will verify the offer and contact you for confirmation.",
    "success.leadText": "Thank you! Your data is being sent to the Nutrisme system.",
    "success.leadSaved": "Your data has been recorded. The Nutrisme team will contact you through Instagram.",
    "success.leadFailed": "Your data could not be saved. Please close this message and submit the form again.",
    "success.again": "Submit Another Request",
    "success.close": "Close",
    "privacy.link": "Privacy Policy",
    "privacy.kicker": "PRIVACY POLICY",
    "privacy.title": "Nutrisme Privacy Policy",
    "privacy.intro": "This policy explains how subscription-form data is collected, used, and stored.",
    "privacy.closeAria": "Close Privacy Policy",
    "privacy.close": "Close Privacy Policy",
    "privacy.s1.title": "1. Data we collect",
    "privacy.s1.text": "The short form collects your full name, Instagram username, Privacy Policy consent, and technical information required to submit the form. Consent is not stored as a separate Spreadsheet column.",
    "privacy.s2.title": "2. How we use the data",
    "privacy.s2.text": "Data from the short form is used to follow up with prospective customers through Instagram and prevent spam or duplicate submissions.",
    "privacy.s3.title": "3. New-customer offer verification",
    "privacy.s3.text": "Offer verification is not performed through the short form because a WhatsApp number and selected plan are not collected yet. The Nutrisme team will confirm these details during follow-up.",
    "privacy.s4.title": "4. Storage and processing parties",
    "privacy.s4.text": "Form data is processed through Google Apps Script and stored in Google Sheets. Access is limited to Nutrisme personnel or operational partners who need the data to provide the service.",
    "privacy.s5.title": "5. Security and retention",
    "privacy.s5.text": "Nutrisme applies reasonable safeguards. Data is kept as long as needed to process subscriptions, meet operational or legal obligations, and resolve complaints.",
    "privacy.s6.title": "6. Customer rights",
    "privacy.s6.text": "Customers may request access, correction, updates, or deletion by contacting Nutrisme through WhatsApp at 0812-3456-7890 or email at nutrisme.indonesia@gmail.com.",
    "privacy.s7.title": "7. Consent",
    "privacy.s7.text": "By checking the consent box and selecting “Submit,” the user confirms that they have read and agreed to the data processing described in this policy."
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("currentYear");
  const menu = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");
  const languageButtons = document.querySelectorAll("[data-language]");
  const descriptionMeta = document.querySelector('meta[name="description"]');

  const privacyModal = document.getElementById("privacyModal");
  const privacyDialog = privacyModal ? privacyModal.querySelector(".privacy-dialog") : null;
  const privacyOpeners = document.querySelectorAll("[data-open-privacy]");
  const privacyClosers = privacyModal ? privacyModal.querySelectorAll("[data-close-privacy]") : [];

  const heroLeadForm = document.getElementById("heroLeadForm");
  const heroFormScrollButtons = document.querySelectorAll("[data-scroll-hero-form]");
  const heroFullName = document.getElementById("heroFullName");
  const heroInstagram = document.getElementById("heroInstagram");
  const heroConsent = document.getElementById("heroConsent");
  const heroSubmit = document.getElementById("heroSubmit");
  const heroFormStatus = document.getElementById("heroFormStatus");
  const heroWebsite = document.getElementById("heroWebsite");

  const thankYouModal = document.getElementById("thankYouModal");
  const thankYouDialog = thankYouModal ? thankYouModal.querySelector(".thank-you-dialog") : null;
  const thankYouClosers = thankYouModal ? thankYouModal.querySelectorAll("[data-close-thank-you]") : [];
  const thankYouText = document.getElementById("thankYouText");

  let currentLanguage = localStorage.getItem("nutrisme-language") === "en" ? "en" : "id";
  let privacyLastFocus = null;
  let thankYouLastFocus = null;

  if (year) year.textContent = new Date().getFullYear();

  const t = (key) => TRANSLATIONS[currentLanguage][key] || TRANSLATIONS.id[key] || key;
  const normalizeIg = (value) => String(value || "").trim().replace(/^@/, "");

  const heroValidators = {
    heroFullName: () => heroFullName.value.trim().length >= 3,
    heroInstagram: () => /^[A-Za-z0-9._]{2,50}$/.test(normalizeIg(heroInstagram.value)),
    heroConsent: () => heroConsent.checked
  };

  const heroFields = {
    heroFullName: heroFullName.closest("[data-hero-field]"),
    heroInstagram: heroInstagram.closest("[data-hero-field]")
  };

  const markHero = (key, force = false) => {
    const valid = heroValidators[key]();
    const field = heroFields[key];
    if (field) {
      const input = document.getElementById(key);
      const hasValue = String(input.value || "").length > 0;
      field.classList.toggle("invalid", !valid && (force || hasValue));
      field.classList.toggle("valid", valid);
    }
    return valid;
  };

  const isHeroFormValid = () => heroValidators.heroFullName()
    && heroValidators.heroInstagram()
    && heroValidators.heroConsent();

  const updateHeroStatus = () => {
    if (heroSubmit.getAttribute("aria-busy") === "true") return;
    const valid = isHeroFormValid();
    heroSubmit.disabled = !valid;
    heroFormStatus.textContent = t(valid ? "hero.statusComplete" : "hero.statusIncomplete");
  };

  const applyLanguage = (language) => {
    currentLanguage = language === "en" ? "en" : "id";
    localStorage.setItem("nutrisme-language", currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.title = t("meta.title");
    if (descriptionMeta) descriptionMeta.setAttribute("content", t("meta.description"));

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
      element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder));
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    languageButtons.forEach((button) => {
      const active = button.dataset.language === currentLanguage;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    if (menu && nav) {
      menu.setAttribute("aria-label", nav.classList.contains("mobile-open") ? t("access.closeMenu") : t("access.openMenu"));
    }
    updateHeroStatus();
  };

  languageButtons.forEach((button) => button.addEventListener("click", () => applyLanguage(button.dataset.language)));

  if (menu && nav) {
    menu.addEventListener("click", () => {
      const open = nav.classList.toggle("mobile-open");
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? t("access.closeMenu") : t("access.openMenu"));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (nav) nav.classList.remove("mobile-open");
      if (menu) menu.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));

  heroFormScrollButtons.forEach((button) => {
    button.addEventListener("click", () => {
      heroLeadForm.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => heroFullName.focus({ preventScroll: true }), 650);
    });
  });

  const openPrivacy = (event) => {
    if (!privacyModal || !privacyDialog) return;
    privacyLastFocus = document.activeElement;
    privacyModal.classList.add("open");
    privacyModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    privacyDialog.scrollTop = 0;
    window.setTimeout(() => privacyDialog.focus(), 20);
    if (event) event.preventDefault();
  };

  const closePrivacy = () => {
    if (!privacyModal) return;
    privacyModal.classList.remove("open");
    privacyModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (privacyLastFocus instanceof HTMLElement) privacyLastFocus.focus();
  };

  privacyOpeners.forEach((button) => button.addEventListener("click", openPrivacy));
  Array.from(privacyClosers).forEach((button) => button.addEventListener("click", closePrivacy));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && privacyModal && privacyModal.classList.contains("open")) closePrivacy();
  });

  heroInstagram.addEventListener("input", () => {
    heroInstagram.value = normalizeIg(heroInstagram.value);
  });

  [heroFullName, heroInstagram].forEach((input) => {
    input.addEventListener("input", () => {
      markHero(input.id);
      updateHeroStatus();
    });
    input.addEventListener("blur", () => markHero(input.id, true));
  });
  heroConsent.addEventListener("change", updateHeroStatus);

  const appsScriptMeta = document.querySelector('meta[name="nutrisme-apps-script-url"]');
  const APPS_SCRIPT_URL = String(appsScriptMeta ? appsScriptMeta.content : "").trim();

  const jsonpRequest = (parameters, timeoutMs = 15000) => new Promise((resolve, reject) => {
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(APPS_SCRIPT_URL)) {
      const error = new Error("Apps Script URL tidak valid.");
      error.code = "BACKEND_CONFIG";
      reject(error);
      return;
    }

    const callbackName = `__nutrismeJsonp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    let timer = null;

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      script.remove();
      try { delete window[callbackName]; } catch (error) { window[callbackName] = undefined; }
    };

    window[callbackName] = (response) => {
      cleanup();
      resolve(response);
    };

    script.onerror = () => {
      cleanup();
      const error = new Error("Apps Script tidak dapat dijangkau.");
      error.code = "BACKEND_UNREACHABLE";
      reject(error);
    };

    const query = new URLSearchParams({
      ...parameters,
      callback: callbackName,
      _: String(Date.now())
    });

    script.src = `${APPS_SCRIPT_URL}?${query.toString()}`;
    script.async = true;

    timer = window.setTimeout(() => {
      cleanup();
      const error = new Error("Apps Script tidak merespons.");
      error.code = "BACKEND_TIMEOUT";
      reject(error);
    }, timeoutMs);

    document.head.appendChild(script);
  });

  const setThankYouText = (translationKey) => {
    if (!thankYouText) return;
    thankYouText.dataset.i18n = translationKey;
    thankYouText.textContent = t(translationKey);
  };

  const openThankYou = (translationKey = "success.leadText") => {
    if (!thankYouModal || !thankYouDialog) return;
    setThankYouText(translationKey);
    thankYouLastFocus = document.activeElement;
    thankYouModal.classList.add("open");
    thankYouModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    window.setTimeout(() => thankYouDialog.focus(), 20);
  };

  const closeThankYou = () => {
    if (!thankYouModal) return;
    thankYouModal.classList.remove("open");
    thankYouModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = privacyModal && privacyModal.classList.contains("open") ? "hidden" : "";
    if (thankYouLastFocus instanceof HTMLElement) thankYouLastFocus.focus();
  };

  thankYouClosers.forEach((element) => element.addEventListener("click", closeThankYou));

  if (thankYouDialog) {
    thankYouDialog.addEventListener("click", (event) => event.stopPropagation());
  }

  if (thankYouModal) {
    thankYouModal.addEventListener("click", (event) => {
      if (event.target === thankYouModal || event.target.matches(".modal-backdrop")) closeThankYou();
    });
  }

  const createRequestId = () => (window.crypto && typeof window.crypto.randomUUID === "function")
    ? window.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  heroLeadForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const checks = [
      markHero("heroFullName", true),
      markHero("heroInstagram", true),
      heroValidators.heroConsent()
    ];

    if (!checks.every(Boolean)) {
      heroFormStatus.textContent = t("hero.statusInvalid");
      const firstInvalid = [heroFullName, heroInstagram, heroConsent].find((element) => !element.checkValidity());
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const payload = {
      action: "createHeroLead",
      build: NUTRISME_BUILD,
      requestId: createRequestId(),
      bahasa: currentLanguage,
      nama: heroFullName.value.trim(),
      instagram: normalizeIg(heroInstagram.value),
      consent: "yes",
      source: `${window.location.href.split("#")[0]}#hero-quick-form`,
      waktuKlien: new Date().toISOString(),
      website: heroWebsite.value.trim()
    };

    heroSubmit.disabled = true;
    heroSubmit.setAttribute("aria-busy", "true");
    heroFormStatus.textContent = t("hero.statusSending");

    // The popup appears immediately, as requested. The JSONP request continues
    // in the background and updates the message when Google Sheets responds.
    openThankYou("success.leadText");
    heroLeadForm.reset();
    Object.values(heroFields).forEach((field) => field.classList.remove("invalid", "valid"));
    heroFormStatus.textContent = "";

    jsonpRequest(payload, 15000)
      .then((response) => {
        if (!response || response.status !== "ok") {
          const error = new Error(response && response.message ? response.message : "Data tidak tersimpan.");
          error.code = "BACKEND_ERROR";
          throw error;
        }
        document.documentElement.dataset.backend = "connected";
        setThankYouText("success.leadSaved");
      })
      .catch((error) => {
        document.documentElement.dataset.backend = "error";
        console.error("Hero lead gagal tersimpan:", error);
        setThankYouText("success.leadFailed");
      })
      .finally(() => {
        heroSubmit.removeAttribute("aria-busy");
        updateHeroStatus();
      });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && thankYouModal && thankYouModal.classList.contains("open")) {
      closeThankYou();
    }
  });

  jsonpRequest({ action: "health" }, 9000)
    .then((response) => {
      const connected = response && response.status === "ok" && response.connected === true;
      document.documentElement.dataset.backend = connected ? "connected" : "error";
      if (!connected || response.version !== NUTRISME_BUILD) console.warn("[Nutrisme] Apps Script deployment perlu diperbarui.", response);
    })
    .catch((error) => {
      document.documentElement.dataset.backend = "error";
      console.error("[Nutrisme] Google Sheets connection failed:", error);
    });

  applyLanguage(currentLanguage);
  updateHeroStatus();
});
