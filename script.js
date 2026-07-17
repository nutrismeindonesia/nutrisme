/* Nutrisme Landing Page
   Front-end preview only. The order form validates all required fields but does
   not send data to an external service until an endpoint/channel is configured. */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.getElementById("siteHeader");
  const nav = document.getElementById("mainNav");
  const menuToggle = document.getElementById("menuToggle");
  const currentYear = document.getElementById("currentYear");

  currentYear.textContent = new Date().getFullYear();

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeNavigation = () => {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Buka menu navigasi");
  };

  menuToggle.addEventListener("click", () => {
    const willOpen = !nav.classList.contains("is-open");
    nav.classList.toggle("is-open", willOpen);
    menuToggle.classList.toggle("is-open", willOpen);
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("click", (event) => {
    if (nav.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle.contains(event.target)) {
      closeNavigation();
    }
  });

  const navLinks = [...nav.querySelectorAll("a[href^='#']")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${visible.target.id}`);
        });
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: [0.05, 0.2, 0.5] }
    );
    sections.forEach((section) => navObserver.observe(section));
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-accordion]").forEach((accordion) => {
    accordion.querySelectorAll(".accordion-item > h3 > button").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".accordion-item");
        const panel = item.querySelector(".accordion-panel");
        const willOpen = !item.classList.contains("is-open");

        accordion.querySelectorAll(".accordion-item").forEach((otherItem) => {
          const otherButton = otherItem.querySelector("h3 > button");
          const otherPanel = otherItem.querySelector(".accordion-panel");
          otherItem.classList.remove("is-open");
          otherButton.setAttribute("aria-expanded", "false");
          otherPanel.hidden = true;
        });

        if (willOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  });

  const modal = document.getElementById("orderModal");
  const modalDialog = modal.querySelector(".modal__dialog");
  const openOrderButtons = document.querySelectorAll("[data-open-order]");
  const closeOrderButtons = modal.querySelectorAll("[data-close-order]");
  const orderFormView = document.getElementById("orderFormView");
  const orderSuccess = document.getElementById("orderSuccess");
  const orderForm = document.getElementById("orderForm");
  const submitOrder = document.getElementById("submitOrder");
  const formStatus = document.getElementById("formStatus");
  const resetOrder = document.getElementById("resetOrder");
  const policyToggle = document.getElementById("policyToggle");
  const policyNote = document.getElementById("policyNote");

  const fullName = document.getElementById("fullName");
  const address = document.getElementById("address");
  const phone = document.getElementById("phone");
  const consent = document.getElementById("consent");

  let lastFocusedElement = null;

  const openOrderModal = () => {
    lastFocusedElement = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    window.setTimeout(() => modalDialog.focus(), 40);
  };

  const closeOrderModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  openOrderButtons.forEach((button) => button.addEventListener("click", openOrderModal));
  closeOrderButtons.forEach((button) => button.addEventListener("click", closeOrderModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeOrderModal();
    }
  });

  modalDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...modalDialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )].filter((element) => !element.hidden && element.offsetParent !== null);

    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  policyToggle.addEventListener("click", () => {
    const willOpen = policyNote.hidden;
    policyNote.hidden = !willOpen;
    policyToggle.setAttribute("aria-expanded", String(willOpen));
  });

  phone.addEventListener("input", () => {
    phone.value = phone.value.replace(/\D/g, "").slice(0, 15);
  });

  const validators = {
    fullName: () => fullName.value.trim().length >= 3,
    address: () => address.value.trim().length >= 10,
    phone: () => /^\d{8,15}$/.test(phone.value),
    consent: () => consent.checked
  };

  const fields = {
    fullName: fullName.closest("[data-field]"),
    address: address.closest("[data-field]"),
    phone: phone.closest("[data-field]"),
    consent: consent.closest("[data-field]")
  };

  const markField = (key, forceMessage = false) => {
    const valid = validators[key]();
    const field = fields[key];

    if (key === "consent") return valid;

    const value = key === "phone" ? phone.value : document.getElementById(key).value.trim();
    const shouldShow = forceMessage || value.length > 0;
    field.classList.toggle("is-valid", valid);
    field.classList.toggle("is-invalid", !valid && shouldShow);
    return valid;
  };

  const updateSubmitState = () => {
    const validity = {
      fullName: validators.fullName(),
      address: validators.address(),
      phone: validators.phone(),
      consent: validators.consent()
    };

    submitOrder.disabled = !Object.values(validity).every(Boolean);
    formStatus.textContent = submitOrder.disabled ? "Lengkapi seluruh field dan centang persetujuan untuk mengaktifkan Submit." : "Semua data sudah lengkap. Silakan tekan Submit.";
    formStatus.style.color = submitOrder.disabled ? "#8b5c4d" : "#167a4d";
  };

  [fullName, address, phone].forEach((input) => {
    input.addEventListener("input", () => {
      markField(input.id);
      updateSubmitState();
    });
    input.addEventListener("blur", () => markField(input.id, true));
  });

  consent.addEventListener("change", updateSubmitState);
  updateSubmitState();

  // ─── Ganti URL ini dengan Web App URL dari Apps Script kamu ───
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5Baguaq8BknPBq5pFLtM9PxGJCk1bZDKi6CLqX0FYxASj0xwadM09O9nHfenSi8LQ/exec";

  orderForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const results = {
      fullName: markField("fullName", true),
      address: markField("address", true),
      phone: markField("phone", true),
      consent: validators.consent()
    };

    const isValid = Object.values(results).every(Boolean);
    updateSubmitState();

    if (!isValid) {
      formStatus.textContent = "Periksa kembali data yang belum valid.";
      const firstInvalid = [fullName, address, phone, consent].find((element) => !element.checkValidity());
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Nonaktifkan tombol submit saat proses pengiriman berlangsung
    submitOrder.disabled = true;
    formStatus.textContent = "Mengirim data...";
    formStatus.style.color = "#167a4d";

    try {
      // Kirim data ke Google Apps Script
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors", // diperlukan karena Apps Script tidak mendukung CORS penuh
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: fullName.value.trim(),
          alamat: address.value.trim(),
          telepon: phone.value.trim(),
          waktu: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
        })
      });
    } catch (error) {
      // Log error untuk debugging, tapi tetap lanjutkan ke halaman sukses
      console.error("Gagal mengirim data ke spreadsheet:", error);
    }

    // Tampilkan halaman sukses
    orderFormView.hidden = true;
    orderSuccess.hidden = false;
    modalDialog.scrollTop = 0;
  });

  resetOrder.addEventListener("click", () => {
    orderForm.reset();
    Object.values(fields).forEach((field) => field.classList.remove("is-valid", "is-invalid"));
    policyNote.hidden = true;
    policyToggle.setAttribute("aria-expanded", "false");
    orderSuccess.hidden = true;
    orderFormView.hidden = false;
    updateSubmitState();
    fullName.focus();
  });
});
