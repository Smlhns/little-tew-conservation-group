(function () {
  "use strict";

  var STORAGE_KEY = "ltcg_signup_dismissed";
  var STORAGE_SUBMITTED = "ltcg_signup_submitted";

  var overlay = document.getElementById("signup-modal");
  var modalBody = overlay ? overlay.querySelector(".modal-body") : null;
  var modalSuccess = overlay ? overlay.querySelector(".form-success") : null;
  var form = document.getElementById("signup-form");
  var joinBar = document.getElementById("join-bar");
  var nav = document.querySelector(".nav");
  var navToggle = document.querySelector(".nav-toggle");

  function openModal() {
    if (!overlay) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    var firstField = overlay.querySelector("input");
    if (firstField) firstField.focus();
  }

  function closeModal(remember) {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (remember) {
      try { sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) {}
      showJoinBar();
    }
  }

  function showJoinBar() {
    if (joinBar) joinBar.classList.add("is-visible");
  }

  function hideJoinBar() {
    if (joinBar) joinBar.classList.remove("is-visible");
  }

  // Open automatically on first visit this session, after a short delay.
  var alreadyDismissed = false;
  var alreadySubmitted = false;
  try {
    alreadyDismissed = sessionStorage.getItem(STORAGE_KEY) === "1";
    alreadySubmitted = localStorage.getItem(STORAGE_SUBMITTED) === "1";
  } catch (e) {}

  if (!alreadyDismissed && !alreadySubmitted) {
    window.setTimeout(openModal, 900);
  } else {
    showJoinBar();
  }

  // Close controls
  document.querySelectorAll("[data-modal-close]").forEach(function (el) {
    el.addEventListener("click", function () { closeModal(true); });
  });

  if (overlay) {
    overlay.addEventListener("click", function (evt) {
      if (evt.target === overlay) closeModal(true);
    });
  }

  document.addEventListener("keydown", function (evt) {
    if (evt.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
      closeModal(true);
    }
  });

  // Any element with data-open-signup reopens the modal
  document.querySelectorAll("[data-open-signup]").forEach(function (el) {
    el.addEventListener("click", function (evt) {
      evt.preventDefault();
      hideJoinBar();
      openModal();
    });
  });

  if (joinBar) {
    var joinBarClose = joinBar.querySelector(".join-bar-close");
    if (joinBarClose) {
      joinBarClose.addEventListener("click", hideJoinBar);
    }
  }

  // Sign-up form submit handling.
  // NOTE FOR THE COMMITTEE: this static site has no backend. Point the form's
  // `action` attribute (in index.html) at a form service such as Formspree,
  // Netlify Forms, or Google Forms to start receiving real submissions.
  // Until then, submissions are only kept locally in the visitor's browser.
  if (form) {
    form.addEventListener("submit", function (evt) {
      var action = form.getAttribute("action");
      var isConfigured = action && action.indexOf("FORM_ENDPOINT") === -1;

      if (!isConfigured) {
        evt.preventDefault();
        try { localStorage.setItem(STORAGE_SUBMITTED, "1"); } catch (e) {}
        if (modalBody && modalSuccess) {
          modalBody.classList.add("is-hidden");
          modalSuccess.classList.add("is-visible");
        }
        window.setTimeout(function () { closeModal(false); }, 2600);
      }
      // If a real endpoint is configured, let the form submit normally.
    });
  }

  // Mobile nav toggle
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      var expanded = nav.classList.contains("is-open");
      navToggle.setAttribute("aria-expanded", expanded ? "true" : "false");
    });

    document.querySelectorAll(".nav-links a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
