(() => {
  "use strict";

  const tracks = [
    ["01", "Into the Light", "02:31"],
    ["02", "Fading Echoes", "04:12"],
    ["03", "Lost in Time", "03:48"],
    ["04", "Between the Lines", "04:05"],
    ["05", "Silent Thunder", "03:57"],
    ["06", "Home Again", "04:21"],
    ["07", "After the Rain", "03:33"],
    ["08", "Gravity", "04:46"],
    ["09", "Last Signal", "04:18"],
    ["10", "Echoes Within", "07:06"]
  ];

  const $ = (selector, root = document) => root.querySelector(selector);

  const trackList = $("#track-list");
  const trackSearch = $("#track-search");
  const searchForm = $("#track-search-form");
  const trackLoading = $("#track-loading");
  const trackEmpty = $("#track-empty");
  const trackStatus = $("#track-status");
  const viewAllButton = $("#view-all-tracks");
  const totalTracks = $("#total-tracks");

  const contactForm = $("#contact-form");
  const submitButton = $("#submit-button");
  const submitLabel = $("#submit-label");
  const submitSpinner = $("#submit-spinner");
  const formSuccess = $("#form-success");

  const menuToggle = $(".menu-toggle");
  const primaryNav = $("#primary-navigation");

  const trailerButton = $("#trailer-button");
  const trailerModal = $("#trailer-modal");
  const trailerClose = $("#trailer-close");

  let showAll = false;
  let lastFocusedElement = null;

  totalTracks.textContent = `${tracks.length} songs`;

  // Keep user input as plain text. DOM textContent is used for output, never innerHTML.
  const cleanText = (value) => String(value)
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const analytics = () => {
    console.log("[Analytics] User interacted with Promotional Page");
  };

  const setTrackState = ({ loading = false, empty = false }) => {
    trackLoading.hidden = !loading;
    trackEmpty.hidden = !empty;
  };

  const filteredTracks = () => {
    const query = cleanText(trackSearch.value).toLowerCase();
    return tracks.filter(([, title]) => title.toLowerCase().includes(query));
  };

  const createTrackRow = ([number, title, duration]) => {
    const item = document.createElement("li");
    item.className = "track-row";

    const numberCell = document.createElement("span");
    numberCell.className = "track-number";
    numberCell.textContent = number;

    const titleCell = document.createElement("span");
    titleCell.className = "track-name";
    titleCell.textContent = cleanText(title);

    const durationCell = document.createElement("span");
    durationCell.className = "track-duration";
    durationCell.textContent = duration;

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.className = "track-play";
    playButton.setAttribute("aria-label", `Preview ${cleanText(title)}`);

    const icon = document.createElement("img");
    icon.src = "assets/icons/play.svg";
    icon.alt = "";
    icon.width = 18;
    icon.height = 18;
    playButton.appendChild(icon);

    playButton.addEventListener("click", () => {
      analytics();
      playButton.disabled = true;
      playButton.setAttribute("aria-label", `Playing preview of ${cleanText(title)}`);
      icon.src = "assets/icons/check.svg";

      window.setTimeout(() => {
        playButton.disabled = false;
        playButton.setAttribute("aria-label", `Preview ${cleanText(title)}`);
        icon.src = "assets/icons/play.svg";
      }, 900);
    });

    item.append(numberCell, titleCell, durationCell, playButton);
    return item;
  };

  const renderTracks = (items) => {
    trackList.replaceChildren();

    if (!items.length) {
      trackList.hidden = true;
      viewAllButton.hidden = true;
      setTrackState({ empty: true });
      trackStatus.textContent = "No data found. Try another track name.";
      return;
    }

    setTrackState({});
    trackList.hidden = false;

    const visible = showAll ? items : items.slice(0, 5);
    visible.forEach((track) => trackList.appendChild(createTrackRow(track)));

    viewAllButton.hidden = items.length <= 5 || showAll;
    trackStatus.textContent = showAll
      ? `${items.length} tracks shown.`
      : `${visible.length} of ${items.length} tracks shown.`;
  };

  const loadTracks = (callback) => {
    setTrackState({ loading: true });
    trackList.hidden = true;
    viewAllButton.disabled = true;

    window.setTimeout(() => {
      viewAllButton.disabled = false;
      callback();
    }, 350);
  };

  const refreshTracks = () => {
    showAll = false;
    loadTracks(() => renderTracks(filteredTracks()));
  };

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    refreshTracks();
  });

  trackSearch.addEventListener("input", refreshTracks);

  viewAllButton.addEventListener("click", () => {
    showAll = true;
    loadTracks(() => {
      renderTracks(filteredTracks());
      analytics();
    });
  });

  loadTracks(() => renderTracks(tracks));

  const setError = (field, message) => {
    const error = $(`#${field.id}-error`);
    const hasError = Boolean(message);
    field.classList.toggle("invalid", hasError);
    field.setAttribute("aria-invalid", String(hasError));
    error.textContent = message;
  };

  const validateForm = () => {
    const name = cleanText($("#name").value);
    const email = cleanText($("#email").value);
    const message = cleanText($("#message").value);

    $("#name").value = name;
    $("#email").value = email;
    $("#message").value = message;

    let valid = true;

    if (!name) {
      setError($("#name"), "Name is required.");
      valid = false;
    } else {
      setError($("#name"), "");
    }

    if (!email) {
      setError($("#email"), "Email is required.");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError($("#email"), "Please enter a valid email address.");
      valid = false;
    } else {
      setError($("#email"), "");
    }

    if (!message) {
      setError($("#message"), "Message is required.");
      valid = false;
    } else {
      setError($("#message"), "");
    }

    return valid;
  };

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    formSuccess.hidden = true;

    if (!validateForm()) {
      $(".invalid", contactForm)?.focus();
      return;
    }

    submitButton.disabled = true;
    submitLabel.textContent = "Sending...";
    submitSpinner.hidden = false;

    window.setTimeout(() => {
      submitButton.disabled = false;
      submitLabel.textContent = "Send message";
      submitSpinner.hidden = true;
      contactForm.reset();
      formSuccess.hidden = false;
      analytics();
      formSuccess.focus();
    }, 700);
  });

  ["#name", "#email", "#message"].forEach((selector) => {
    $(selector).addEventListener("input", (event) => {
      if (event.currentTarget.classList.contains("invalid")) validateForm();
    });
  });

  const closeMobileMenu = () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNav.classList.remove("is-open");
  };

  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    menuToggle.setAttribute("aria-label", open ? "Open navigation menu" : "Close navigation menu");
    primaryNav.classList.toggle("is-open", !open);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });

  const closeTrailer = () => {
    trailerModal.hidden = true;
    document.body.style.overflow = "";
    lastFocusedElement?.focus();
  };

  trailerButton.addEventListener("click", () => {
    lastFocusedElement = document.activeElement;
    trailerModal.hidden = false;
    document.body.style.overflow = "hidden";
    trailerClose.focus();
    analytics();
  });

  trailerClose.addEventListener("click", closeTrailer);
  trailerModal.addEventListener("click", (event) => {
    if (event.target === trailerModal) closeTrailer();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!trailerModal.hidden) closeTrailer();
      if (primaryNav.classList.contains("is-open")) closeMobileMenu();
    }
  });

  document.querySelectorAll("[data-action='listen-now']").forEach((element) => {
    element.addEventListener("click", analytics);
  });

  document.querySelectorAll("[data-platform]").forEach((element) => {
    element.addEventListener("click", analytics);
  });
})();