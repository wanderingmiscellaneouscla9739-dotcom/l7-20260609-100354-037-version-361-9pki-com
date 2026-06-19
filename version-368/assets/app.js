(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var index = 0;
        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var select = root.querySelector("[data-filter-select]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
            var empty = root.querySelector("[data-empty-state]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q") || "";
            if (input && initialQuery) {
                input.value = initialQuery;
            }
            function apply() {
                var query = normalize(input ? input.value : "");
                var type = normalize(select ? select.value : "");
                var visible = 0;
                cards.forEach(function (card) {
                    var search = normalize(card.getAttribute("data-search"));
                    var cardType = normalize(card.getAttribute("data-type"));
                    var queryOk = !query || search.indexOf(query) !== -1;
                    var typeOk = !type || cardType.indexOf(type) !== -1 || search.indexOf(type) !== -1;
                    var isVisible = queryOk && typeOk;
                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            if (input) {
                input.addEventListener("input", apply);
            }
            if (select) {
                select.addEventListener("change", apply);
            }
            apply();
        });
    }

    function attachStream(player) {
        if (player.getAttribute("data-ready") === "1") {
            return;
        }
        var video = player.querySelector("video");
        var streamUrl = player.getAttribute("data-stream");
        if (!video || !streamUrl) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            player._hls = hls;
        } else {
            video.src = streamUrl;
        }
        player.setAttribute("data-ready", "1");
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".js-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-button]");
            if (!video || !button) {
                return;
            }
            function playVideo() {
                attachStream(player);
                player.classList.add("is-playing");
                var request = video.play();
                if (request && typeof request.catch === "function") {
                    request.catch(function () {});
                }
            }
            button.addEventListener("click", function (event) {
                event.preventDefault();
                playVideo();
            });
            video.addEventListener("play", function () {
                player.classList.add("is-playing");
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
