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
  // Submits to Formspree (https://formspree.io/f/mkjnbrlb) via fetch, so we
  // stay on the page and can show our own success/error state inside the
  // modal instead of redirecting to Formspree's hosted thank-you page.
  var formError = form ? form.querySelector(".form-error") : null;
  var formSubmitBtn = form ? form.querySelector(".form-submit") : null;

  function setFormError(message) {
    if (!formError) return;
    if (message) {
      formError.textContent = message;
      formError.hidden = false;
    } else {
      formError.textContent = "";
      formError.hidden = true;
    }
  }

  function setFormSubmitting(isSubmitting) {
    if (!formSubmitBtn) return;
    formSubmitBtn.disabled = isSubmitting;
    formSubmitBtn.textContent = isSubmitting ? "Sending…" : "Keep Me Informed";
  }

  if (form) {
    form.addEventListener("submit", function (evt) {
      evt.preventDefault();
      setFormError(null);
      setFormSubmitting(true);

      fetch(form.getAttribute("action"), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            try { localStorage.setItem(STORAGE_SUBMITTED, "1"); } catch (e) {}
            form.reset();
            if (modalBody && modalSuccess) {
              modalBody.classList.add("is-hidden");
              modalSuccess.classList.add("is-visible");
            }
            window.setTimeout(function () { closeModal(false); }, 2600);
            return;
          }
          return response.json().catch(function () { return null; }).then(function (data) {
            var message = data && data.errors && data.errors.length
              ? data.errors.map(function (e) { return e.message; }).join(", ")
              : "Something went wrong sending that — please try again, or email us directly.";
            setFormError(message);
          });
        })
        .catch(function () {
          setFormError("Couldn't reach the server — check your connection and try again.");
        })
        .finally(function () {
          setFormSubmitting(false);
        });
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
