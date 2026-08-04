(function () {
  "use strict";

  /* ---- Header shrink on scroll + active nav (scrollspy) ---- */
  var header = document.getElementById("site-header");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);
  var toTop = document.getElementById("to-top");

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", y > 30);
    toTop.classList.toggle("is-visible", y > 600);

    var current = sections[0];
    sections.forEach(function (sec) {
      if (y >= sec.offsetTop - 140) current = sec;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("is-active", current && link.getAttribute("href") === "#" + current.id);
    });
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav toggle ---- */
  var navToggle = document.getElementById("nav-toggle");
  var primaryNav = document.getElementById("primary-nav");
  navToggle.addEventListener("click", function () {
    var isOpen = primaryNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      primaryNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---- Menu tabs ---- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".menu-tab"));
  var panels = Array.prototype.slice.call(document.querySelectorAll(".menu-panel"));
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");

      var target = tab.getAttribute("data-target");
      panels.forEach(function (panel) {
        var match = panel.id === target;
        panel.classList.toggle("is-active", match);
        panel.hidden = !match;
      });
    });
  });

  /* ---- Reveal on scroll ---- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- Live open/closed status (Europe/Rome) ---- */
  // dayOfWeek: 0=Sun .. 6=Sat. Ranges in minutes from midnight.
  var SCHEDULE = {
    0: [[720, 960]],          // Sunday 12:00-16:00
    1: [[720, 960], [1170, 1440]], // Monday 12:00-16:00 / 19:30-24:00
    2: [],                    // Tuesday closed
    3: [[720, 960], [1170, 1440]],
    4: [[720, 960], [1170, 1440]],
    5: [[720, 960], [1170, 1440]],
    6: [[720, 900], [1170, 1440]]  // Saturday 12:00-15:00 / 19:30-24:00
  };
  var DAY_NAMES = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

  function romeNow() {
    var parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Rome",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date());
    var map = {};
    parts.forEach(function (p) { map[p.type] = p.value; });
    var weekdayIdx = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[map.weekday];
    var hour = parseInt(map.hour, 10) % 24;
    var minute = parseInt(map.minute, 10);
    return { day: weekdayIdx, minutes: hour * 60 + minute };
  }

  function formatMinutes(m) {
    var h = Math.floor(m / 60) % 24;
    var mi = m % 60;
    return (h < 10 ? "0" + h : h) + ":" + (mi < 10 ? "0" + mi : mi);
  }

  function updateStatus() {
    var dot = document.getElementById("status-dot");
    var text = document.getElementById("status-text");
    if (!dot || !text) return;

    var now = romeNow();
    var todayRanges = SCHEDULE[now.day];
    var openNow = null;
    todayRanges.forEach(function (range) {
      if (now.minutes >= range[0] && now.minutes < range[1]) openNow = range;
    });

    if (openNow) {
      dot.classList.remove("is-closed");
      text.textContent = "Aperti ora — chiude alle " + formatMinutes(openNow[1] === 1440 ? 0 : openNow[1]);
      return;
    }

    // find next opening within the next 7 days
    for (var offset = 0; offset <= 7; offset++) {
      var day = (now.day + offset) % 7;
      var ranges = SCHEDULE[day];
      for (var i = 0; i < ranges.length; i++) {
        var opens = ranges[i][0];
        if (offset === 0 && opens <= now.minutes) continue;
        dot.classList.add("is-closed");
        var when = offset === 0 ? "oggi alle " + formatMinutes(opens)
          : offset === 1 ? "domani alle " + formatMinutes(opens)
          : DAY_NAMES[day] + " alle " + formatMinutes(opens);
        text.textContent = "Chiuso ora — riapre " + when;
        return;
      }
    }
    dot.classList.add("is-closed");
    text.textContent = "Chiuso ora";
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* ---- Footer year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
