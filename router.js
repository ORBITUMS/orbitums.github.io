(function () {
  "use strict";

  let clockInterval = null;
  let scrollAbort = null;

  function initClock() {
    const el = document.getElementById("minsk-time");
    if (clockInterval) {
      clearInterval(clockInterval);
      clockInterval = null;
    }
    if (!el) return;

    function update() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const minsk = new Date(utc + 3 * 3600000);
      const hh = String(minsk.getHours()).padStart(2, "0");
      const mm = String(minsk.getMinutes()).padStart(2, "0");
      el.textContent = hh + ":" + mm;
      el.setAttribute("datetime", minsk.toISOString());
    }

    update();
    clockInterval = setInterval(update, 10000);
  }

  function initScrollTrigger() {
    if (scrollAbort) scrollAbort.abort();
    scrollAbort = new AbortController();
    const signal = scrollAbort.signal;

    const card = document.querySelector(".home__card, .about__card");
    if (!card) return;

    const STEP_1_DOWN = 30;
    const STEP_2_DOWN = 200;
    const STEP_2_UP = 160;
    const STEP_1_UP = 20;

    let isExpanded = false;
    let isVideoVisible = false;
    let ticking = false;

    function onScroll() {
      const y = window.scrollY || window.pageYOffset;

      if (!isExpanded && y > STEP_1_DOWN) {
        isExpanded = true;
        card.classList.add("is-expanded");
      } else if (isExpanded && y < STEP_1_UP) {
        isExpanded = false;
        card.classList.remove("is-expanded");
      }

      if (!isVideoVisible && y > STEP_2_DOWN) {
        isVideoVisible = true;
        card.classList.add("is-video-visible");
      } else if (isVideoVisible && y < STEP_2_UP) {
        isVideoVisible = false;
        card.classList.remove("is-video-visible");
      }

      ticking = false;
    }

    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          window.requestAnimationFrame(onScroll);
          ticking = true;
        }
      },
      { passive: true, signal },
    );

    onScroll();
  }

  function initYouTube() {
    const homeEl = document.getElementById("yt-player-home");
    const aboutEl = document.getElementById("yt-player");

    if (typeof YT === "undefined" || !YT.Player) {
      setTimeout(initYouTube, 100);
      return;
    }

    if (homeEl && !homeEl.dataset.ytReady) {
      homeEl.dataset.ytReady = "1";
      new YT.Player("yt-player-home", {
        videoId: "Yb5ivvcTvRQ",
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: function (event) {
            event.target.setVolume(25);
          },
        },
      });
    }

    if (aboutEl && !aboutEl.dataset.ytReady) {
      aboutEl.dataset.ytReady = "1";

      const videoIds = ["AcQ3Di2Gewc", "Gk0JszYHSus", "pogzLhe13FQ"];
      let currentVideoIndex = 0;
      let player;

      player = new YT.Player("yt-player", {
        videoId: videoIds[0],
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: function (event) {
            event.target.setVolume(5);

            const prevBtn = document.getElementById("prev-video");
            const randomBtn = document.getElementById("random-video");
            const nextBtn = document.getElementById("next-video");

            if (prevBtn && nextBtn && randomBtn) {
              // Убираем старые события, чтобы не было дублей при повторном заходе
              const newPrev = prevBtn.cloneNode(true);
              const newRandom = randomBtn.cloneNode(true);
              const newNext = nextBtn.cloneNode(true);

              prevBtn.replaceWith(newPrev);
              randomBtn.replaceWith(newRandom);
              nextBtn.replaceWith(newNext);

              // Стрелочка влево
              newPrev.addEventListener("click", (e) => {
                e.preventDefault();
                currentVideoIndex =
                  (currentVideoIndex - 1 + videoIds.length) % videoIds.length;
                player.loadVideoById(videoIds[currentVideoIndex]);
              });

              // Стрелочка вправо
              newNext.addEventListener("click", (e) => {
                e.preventDefault();
                currentVideoIndex = (currentVideoIndex + 1) % videoIds.length;
                player.loadVideoById(videoIds[currentVideoIndex]);
              });

              // Кнопка случайного момента
              newRandom.addEventListener("click", (e) => {
                e.preventDefault();
                // Получаем длительность текущего видео в секундах
                const duration = player.getDuration();
                if (duration > 0) {
                  // Генерируем случайное число от 0 до длительности (минус 5 секунд, чтобы не перескочить в самый конец)
                  const randomTime = Math.random() * Math.max(0, duration - 5);
                  player.seekTo(randomTime, true); // true = разрешить перемотку по сети
                }
              });
            }
          },
          onStateChange: function (event) {
            if (event.data === 0) {
              // Автоматически переключаем на следующее видео по окончании
              currentVideoIndex = (currentVideoIndex + 1) % videoIds.length;
              player.loadVideoById(videoIds[currentVideoIndex]);
            }
          },
        },
      });
    }
  }

  function initPage() {
    initClock();
    initScrollTrigger();
    setTimeout(initYouTube, 50);
  }

  function isInternalLink(a) {
    if (!a) return false;
    if (a.target && a.target !== "" && a.target !== "_self") return false;
    if (a.hasAttribute("download")) return false;

    const href = a.getAttribute("href");
    if (!href) return false;
    if (href.startsWith("#")) return false;
    if (href.startsWith("mailto:")) return false;
    if (href.startsWith("tel:")) return false;

    if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const url = new URL(href);
        return url.origin === window.location.origin;
      } catch (e) {
        return false;
      }
    }

    return true;
  }

  async function navigateTo(url, push) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error("fetch failed");
      const text = await res.text();
      const doc = new DOMParser().parseFromString(text, "text/html");

      const newMain = doc.querySelector("main");
      const newTitle = doc.querySelector("title");
      const currentMain = document.querySelector("main");

      if (!newMain || !currentMain) throw new Error("no main");

      newMain.style.opacity = "0";
      newMain.style.transition = "opacity 0.28s ease";

      currentMain.style.transition = "opacity 0.24s ease";
      currentMain.style.opacity = "0";
      currentMain.style.pointerEvents = "none";

      await new Promise((r) => setTimeout(r, 240));

      currentMain.replaceWith(newMain);

      if (newTitle) document.title = newTitle.textContent;

      const metaKeys = [
        ["name", "description"],
        ["property", "og:title"],
        ["property", "og:description"],
        ["name", "twitter:title"],
        ["name", "twitter:description"],
      ];
      metaKeys.forEach(([attr, val]) => {
        const oldMeta = document.querySelector(`meta[${attr}="${val}"]`);
        const newMeta = doc.querySelector(`meta[${attr}="${val}"]`);
        if (oldMeta && newMeta) {
          oldMeta.setAttribute("content", newMeta.getAttribute("content"));
        }
      });

      if (push) history.pushState({}, "", url);

      window.scrollTo(0, 0);
      initPage();

      requestAnimationFrame(() => {
        newMain.style.opacity = "1";
        setTimeout(() => {
          newMain.style.transition = "";
          newMain.style.opacity = "";
        }, 320);
      });
    } catch (err) {
      window.location.href = url;
    }
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const a = e.target.closest("a");
    if (!isInternalLink(a)) return;

    const href = a.getAttribute("href");
    e.preventDefault();

    const url = new URL(href, window.location.href).href;
    if (url === window.location.href) return;
    navigateTo(url, true);
  });

  window.addEventListener("popstate", function () {
    navigateTo(window.location.href, false);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }
})();
