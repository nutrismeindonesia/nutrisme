/* Nutrisme landing page.
   The order form sends a simple cross-origin POST to Google Apps Script.
   Do not use application/json together with mode: "no-cors" here. */

const NUTRISME_BUILD = "2026-07-17-2";
console.info(`[Nutrisme] build ${NUTRISME_BUILD}`);

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
  const websiteTrap = document.getElementById("website");

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

  const normalizePhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");
    if (digits.startsWith("62")) digits = digits.slice(2);
    if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 15);
  };

  phone.addEventListener("input", () => {
    phone.value = normalizePhone(phone.value);
  });

  const validators = {
    fullName: () => fullName.value.trim().length >= 3,
    address: () => address.value.trim().length >= 10,
    phone: () => /^8\d{7,14}$/.test(normalizePhone(phone.value)),
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
    formStatus.textContent = submitOrder.disabled
      ? "Lengkapi seluruh field dan centang persetujuan untuk mengaktifkan Submit."
      : "Semua data sudah lengkap. Silakan tekan Submit.";
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

  // Keep the /exec URL. If Apps Script creates a new deployment URL, replace it here.
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxdVC6gk2-e2s6htjQPtMd8iX4fTWzCqdZEb2jO0BYKmoYZRA6xB-9ObyEGsqsl51w/exec";
  const SUBMIT_TIMEOUT_MS = 20000;

  const createRequestId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const sendOrder = async (payload) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
      // URLSearchParams creates application/x-www-form-urlencoded, which is safe
      // for a simple no-cors POST and is read by Apps Script through e.parameter.
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        cache: "no-store",
        redirect: "follow",
        body: new URLSearchParams(payload),
        signal: controller.signal
      });
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

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
      formStatus.style.color = "#b44729";
      const firstInvalid = [fullName, address, phone, consent].find((element) => !element.checkValidity());
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitOrder.disabled = true;
    submitOrder.setAttribute("aria-busy", "true");
    formStatus.textContent = "Mengirim data...";
    formStatus.style.color = "#167a4d";

    try {
      await sendOrder({
        action: "createOrder",
        build: NUTRISME_BUILD,
        requestId: createRequestId(),
        nama: fullName.value.trim(),
        alamat: address.value.trim(),
        telepon: normalizePhone(phone.value),
        consent: consent.checked ? "yes" : "no",
        source: window.location.href,
        waktuKlien: new Date().toISOString(),
        website: websiteTrap ? websiteTrap.value.trim() : ""
      });
    } catch (error) {
      console.error("Gagal mengirim data ke Google Apps Script:", error);
      submitOrder.removeAttribute("aria-busy");
      submitOrder.disabled = false;
      formStatus.textContent = error && error.name === "AbortError"
        ? "Pengiriman terlalu lama. Periksa koneksi internet lalu coba lagi."
        : "Data belum berhasil dikirim. Periksa koneksi internet lalu coba lagi.";
      formStatus.style.color = "#b44729";
      return;
    }

    submitOrder.removeAttribute("aria-busy");
    formStatus.textContent = "";
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
    submitOrder.removeAttribute("aria-busy");
    updateSubmitState();
    fullName.focus();
  });
});
