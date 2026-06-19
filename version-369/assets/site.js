(function () {
    var hlsScriptPromise = null;

    function loadHlsScript() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsScriptPromise) {
            return hlsScriptPromise;
        }

        hlsScriptPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });

        return hlsScriptPromise;
    }

    window.initMoviePlayer = function (videoId, sourceUrl, overlayId) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var attached = false;
        var hlsInstance = null;

        if (!video || !sourceUrl) {
            return;
        }

        function attachSource() {
            if (attached) {
                return Promise.resolve();
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return Promise.resolve();
            }

            return loadHlsScript().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = sourceUrl;
                }
            }).catch(function () {
                video.src = sourceUrl;
            });
        }

        function startPlay() {
            attachSource().then(function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            });
        }

        if (overlay) {
            overlay.addEventListener("click", startPlay);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                startPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    };

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");

        if (!toggle || !mobileNav) {
            return;
        }

        toggle.addEventListener("click", function () {
            var open = mobileNav.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function setupHero() {
        var hero = document.querySelector(".hero");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        function run() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                show(idx);
                run();
            });
        });

        if (slides.length) {
            show(0);
            run();
        }
    }

    function setupSearch() {
        var page = document.querySelector("[data-search-page]");
        if (!page) {
            return;
        }

        var input = page.querySelector("[data-search-input]");
        var year = page.querySelector("[data-year-filter]");
        var region = page.querySelector("[data-region-filter]");
        var type = page.querySelector("[data-type-filter]");
        var cards = Array.prototype.slice.call(page.querySelectorAll(".movie-card"));
        var empty = page.querySelector(".no-result");

        function valueOf(control) {
            return control ? control.value.trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = valueOf(input);
            var yearValue = valueOf(year);
            var regionValue = valueOf(region);
            var typeValue = valueOf(type);
            var visible = 0;

            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" ").toLowerCase();

                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesYear = !yearValue || String(card.getAttribute("data-year")) === yearValue;
                var matchesRegion = !regionValue || String(card.getAttribute("data-region")).toLowerCase().indexOf(regionValue) !== -1;
                var matchesType = !typeValue || String(card.getAttribute("data-type")).toLowerCase().indexOf(typeValue) !== -1;
                var show = matchesKeyword && matchesYear && matchesRegion && matchesType;

                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [input, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });

        apply();
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
