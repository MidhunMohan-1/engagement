(function () {
  const cfg = window.INVITATION_CONFIG;
  if (!cfg) return;

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    const el = $(id);
    if (el && text != null) el.textContent = text;
  }

  function initCopy() {
    setText("event-type", cfg.eventType);
    setText("name-1", cfg.person1);
    setText("name-2", cfg.person2);
    setText("date-display", cfg.dateDisplay);
    setText("venue-name", cfg.venueName);
    setText("venue-area", cfg.venueArea);
    setText("footer-names", `${cfg.person1} & ${cfg.person2}`);

    document.title = `${cfg.person1} & ${cfg.person2} - ${cfg.eventType}`;

    const mapsLink = $("maps-link");
    if (mapsLink) mapsLink.href = cfg.mapsUrl;
  }

  function initScrollReveal() {
    const scrollRoot = document.querySelector(".card");
    const targets = document.querySelectorAll(".reveal-on-scroll");
    if (!targets.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: scrollRoot,
        threshold: 0.12,
        rootMargin: "0px 0px -24px 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function renderProgram() {
    const list = $("program-list");
    if (!list || !cfg.program) return;
    list.innerHTML = "";
    cfg.program.forEach((item) => {
      const li = document.createElement("li");
      const time = document.createElement("span");
      time.className = "timeline-time";
      time.textContent = item.time;
      const title = document.createElement("div");
      title.className = "timeline-title";
      title.textContent = item.title;
      li.append(time, title);
      if (item.note) {
        const note = document.createElement("p");
        note.className = "timeline-note";
        note.textContent = item.note;
        li.appendChild(note);
      }
      list.appendChild(li);
    });
  }

  function initRsvpDialog() {
    const dialog = $("rsvp-dialog");
    const openBtn = $("rsvp-open");
    const closeBtn = $("rsvp-close");
    const form = $("rsvp-form");
    const status = $("rsvp-status");
    if (!dialog || !openBtn) return;

    function resetDialog() {
      if (status) {
        status.textContent = "";
        status.className = "rsvp-status";
      }
    }

    openBtn.addEventListener("click", (event) => {
      event.preventDefault();
      resetDialog();
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
      requestAnimationFrame(() => {
        const first = form?.querySelector("input");
        if (first) first.focus({ preventScroll: true });
      });
    });

    closeBtn?.addEventListener("click", () => dialog.close());

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener("close", () => {
      resetDialog();
      requestAnimationFrame(() => {
        openBtn.focus({ preventScroll: true });
      });
    });
  }

  function isFormSubmitSuccess(data) {
    return data && (data.success === "true" || data.success === true);
  }

  function rsvpFailureMessage(data) {
    if (window.location.protocol === "file:") {
      return (
        "RSVP needs a web address (hosted site or local server). " +
        "Run “npx serve .” in this folder, then open the localhost link — not the HTML file directly."
      );
    }
    const apiMessage = typeof data?.message === "string" ? data.message : "";
    if (/activation/i.test(apiMessage)) {
      return (
        `Check ${cfg.rsvpEmail} for FormSubmit’s “Activate Form” email, click the link once, then submit again.`
      );
    }
    if (/web server|html files/i.test(apiMessage)) {
      return (
        "Open this invitation from your hosted link or via a local server (npx serve .), not as a saved HTML file."
      );
    }
    if (apiMessage) return apiMessage;
    return (
      `Could not send right now. Please try again or email us at ${cfg.rsvpEmail}.`
    );
  }

  function initRsvpForm() {
    const form = $("rsvp-form");
    const formSubmitKey = cfg.formSubmitId || cfg.rsvpEmail;
    if (!form || !formSubmitKey) return;

    const dialog = $("rsvp-dialog");
    const status = $("rsvp-status");
    const submitBtn = $("rsvp-submit");
    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(formSubmitKey)}`;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (window.location.protocol === "file:") {
        if (status) {
          status.textContent = rsvpFailureMessage({});
          status.classList.add("rsvp-status--error");
        }
        return;
      }

      const payload = {
        name: form.name.value.trim(),
        guests: form.guests.value,
        _subject: cfg.rsvpSubject,
        _template: "table",
        _captcha: "false",
      };
      const comment = form.message?.value.trim();
      if (comment) payload.message = comment;

      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
      if (status) {
        status.textContent = "";
        status.className = "rsvp-status";
      }

      let data = {};
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        });
        data = await response.json().catch(() => ({}));
        if (!response.ok || !isFormSubmitSuccess(data)) {
          throw new Error("submit failed");
        }
        form.reset();
        form.guests.value = "1";
        if (status) {
          status.textContent = "Thank you! We received your RSVP.";
          status.classList.add("rsvp-status--success");
        }
        window.setTimeout(() => {
          if (dialog && typeof dialog.close === "function") dialog.close();
        }, 2200);
      } catch {
        if (status) {
          status.textContent = rsvpFailureMessage(data);
          status.classList.add("rsvp-status--error");
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send RSVP";
      }
    });
  }

  function initMusic() {
    const audio = $("bg-music");
    const toggle = $("music-toggle");
    if (!audio || !toggle || !cfg.musicSrc) return;

    audio.src = cfg.musicSrc;

    fetch(cfg.musicSrc, { method: "HEAD" })
      .then((res) => {
        if (res.ok) toggle.classList.remove("hidden");
      })
      .catch(() => {});

    toggle.addEventListener("click", async () => {
      const playing = toggle.getAttribute("aria-pressed") === "true";
      if (playing) {
        audio.pause();
        toggle.setAttribute("aria-pressed", "false");
        toggle.setAttribute("aria-label", "Play background music");
      } else {
        try {
          await audio.play();
          toggle.setAttribute("aria-pressed", "true");
          toggle.setAttribute("aria-label", "Pause background music");
        } catch {
          /* autoplay blocked until gesture - already on click */
        }
      }
    });
  }

  function initOgUrl() {
    if (cfg.siteUrl) {
      const url = cfg.siteUrl.replace(/\/$/, "");
      let meta = document.querySelector('meta[property="og:url"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", "og:url");
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", url);
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && !ogImage.content.startsWith("http")) {
        ogImage.setAttribute("content", `${url}/${ogImage.content}`);
      }
    }
  }

  initCopy();
  renderProgram();
  initScrollReveal();
  initRsvpDialog();
  initRsvpForm();
  initMusic();
  initOgUrl();
})();
