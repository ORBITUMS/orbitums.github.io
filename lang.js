(function () {
  "use strict";

  var STORAGE_KEY = "xd450-lang";
  var DEFAULT_LANG = "en";
  var SUPPORTED = ["en", "ru"];

  var WAVE_PX_FACTOR = 0.35;
  var WAVE_MAX_DELAY = 400;
  var FADE_MS = 350;

  var isAnimating = false;

  function getLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    return SUPPORTED.indexOf(stored) !== -1 ? stored : DEFAULT_LANG;
  }

  function setLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  /* Все переводимые элементы + сам блок часов .home__time
     (часы идут в общей волне, как один элемент). */
  function getTranslatables() {
    var items = Array.prototype.slice
      .call(document.querySelectorAll("[data-en][data-ru]"))
      .filter(function (el) {
        // Внутренности часов не трогаем — они пойдут как часть .home__time
        return !el.closest(".home__time");
      });

    var timeEl = document.querySelector(".home__time");
    if (timeEl) items.push(timeEl);

    return items;
  }

  /* Универсальная смена текста: для .home__time — только подпись,
     для остальных — textContent. */
  function setElementLang(el, lang) {
    if (el.classList && el.classList.contains("home__time")) {
      var span = el.querySelector("[data-en][data-ru]");
      if (!span) return;
      var tv = span.getAttribute("data-" + lang);
      if (tv !== null) span.textContent = tv;
      return;
    }
    var value = el.getAttribute("data-" + lang);
    if (value !== null) el.textContent = value;
  }

  function updateToggleButton(lang) {
    var btn = document.getElementById("lang-toggle");
    if (!btn) return;
    btn.textContent = lang === "en" ? "RU" : "EN";
    btn.setAttribute(
      "aria-label",
      lang === "en" ? "Switch to Russian" : "Переключить на английский",
    );
    btn.setAttribute("title", lang === "en" ? "Русский" : "English");
  }

  function applyLangInstant(lang) {
    document.documentElement.setAttribute("lang", lang);
    getTranslatables().forEach(function (el) {
      setElementLang(el, lang);
    });
    updateToggleButton(lang);
  }

  function applyLangAnimated(lang) {
    var items = getTranslatables();

    var plan = items.map(function (el) {
      var rect = el.getBoundingClientRect();
      var pos = Math.max(0, rect.top + rect.height / 2);
      var delay = Math.min(WAVE_MAX_DELAY, pos * WAVE_PX_FACTOR);
      return { el: el, delay: delay };
    });

    plan.forEach(function (item) {
      setTimeout(function () {
        item.el.classList.add("lang-fade-out");
      }, item.delay);
    });

    var lastDelay = plan.reduce(function (m, i) {
      return Math.max(m, i.delay);
    }, 0);

    setTimeout(function () {
      plan.forEach(function (item) {
        var el = item.el;
        setElementLang(el, lang);

        el.classList.remove("lang-fade-out");
        el.classList.add("lang-prepare-in");
      });

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          plan.forEach(function (item) {
            setTimeout(function () {
              item.el.classList.remove("lang-prepare-in");
            }, item.delay);
          });
        });
      });

      setTimeout(function () {
        isAnimating = false;
      }, lastDelay + FADE_MS);
    }, lastDelay + FADE_MS);
  }

  function switchLang() {
    if (isAnimating) return;

    var current = getLang();
    var next = current === "en" ? "ru" : "en";

    setLang(next);
    document.documentElement.setAttribute("lang", next);
    updateToggleButton(next);

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      applyLangInstant(next);
      return;
    }

    isAnimating = true;
    applyLangAnimated(next);
  }

  function applyCurrentLang() {
    applyLangInstant(getLang());
  }

  function init() {
    var lang = getLang();
    if (lang !== "en" && lang !== "ru") lang = DEFAULT_LANG;
    if (!localStorage.getItem(STORAGE_KEY)) {
      setLang(DEFAULT_LANG);
    }

    applyLangInstant(lang);

    var btn = document.getElementById("lang-toggle");
    if (btn && !btn.dataset.langBound) {
      btn.dataset.langBound = "1";
      btn.addEventListener("click", switchLang);
    }

    window.addEventListener("storage", function (e) {
      if (e.key === STORAGE_KEY) {
        applyLangInstant(getLang());
      }
    });
  }

  window.applyCurrentLang = applyCurrentLang;

  window.addEventListener("route:changed", function () {
    applyCurrentLang();

    var btn = document.getElementById("lang-toggle");
    if (btn && !btn.dataset.langBound) {
      btn.dataset.langBound = "1";
      btn.addEventListener("click", switchLang);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
