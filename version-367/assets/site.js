(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function renderSearchResults(container, query) {
    var data = window.MOVIE_SEARCH_INDEX || [];
    var value = normalize(query);
    container.innerHTML = "";
    if (!value) {
      container.classList.remove("is-open");
      return [];
    }
    var results = [];
    for (var i = 0; i < data.length; i += 1) {
      var item = data[i];
      var text = normalize(item.title + " " + item.region + " " + item.type + " " + item.year + " " + item.genre + " " + item.tags);
      if (text.indexOf(value) !== -1) {
        results.push(item);
      }
      if (results.length >= 12) {
        break;
      }
    }
    if (!results.length) {
      container.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
      container.classList.add("is-open");
      return [];
    }
    var html = results.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, "&quot;") + '">' +
        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.type + '</span></span>' +
        '</a>';
    }).join("");
    container.innerHTML = html;
    container.classList.add("is-open");
    return results;
  }

  function setupGlobalSearch() {
    var forms = document.querySelectorAll("[data-global-search]");
    forms.forEach(function (form) {
      var input = form.querySelector("[data-search-input]");
      var resultsBox = form.querySelector("[data-search-results]");
      var currentResults = [];
      if (!input || !resultsBox) {
        return;
      }
      input.addEventListener("input", function () {
        currentResults = renderSearchResults(resultsBox, input.value);
      });
      input.addEventListener("focus", function () {
        currentResults = renderSearchResults(resultsBox, input.value);
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        currentResults = renderSearchResults(resultsBox, input.value);
        if (currentResults.length) {
          window.location.href = currentResults[0].url;
        }
      });
      document.addEventListener("click", function (event) {
        if (!form.contains(event.target)) {
          resultsBox.classList.remove("is-open");
        }
      });
    });
  }

  function setupLocalFilter() {
    var panels = document.querySelectorAll("[data-local-filter]");
    panels.forEach(function (panel) {
      var list = panel.parentElement.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var keyword = panel.querySelector("[data-filter-keyword]");
      var type = panel.querySelector("[data-filter-type]");
      var year = panel.querySelector("[data-filter-year]");
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      function apply() {
        var key = normalize(keyword && keyword.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre")
          ].join(" "));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var visible = true;
          if (key && text.indexOf(key) === -1) {
            visible = false;
          }
          if (typeValue && cardType.indexOf(typeValue) === -1) {
            visible = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            visible = false;
          }
          card.classList.toggle("is-filter-hidden", !visible);
        });
      }
      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      panel.addEventListener("reset", function () {
        window.setTimeout(apply, 0);
      });
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    show(0);
    start();
  }

  window.initMoviePlayer = function (source) {
    ready(function () {
      var video = document.querySelector(".movie-video");
      var overlay = document.querySelector(".play-overlay");
      var loaded = false;
      var hlsInstance = null;
      if (!video || !overlay || !source) {
        return;
      }
      function playVideo() {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }
      function loadVideo() {
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        overlay.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
          return;
        }
        video.src = source;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        playVideo();
      }
      overlay.addEventListener("click", loadVideo);
      video.addEventListener("click", function () {
        if (!loaded) {
          loadVideo();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupGlobalSearch();
    setupLocalFilter();
    setupHero();
  });
}());
