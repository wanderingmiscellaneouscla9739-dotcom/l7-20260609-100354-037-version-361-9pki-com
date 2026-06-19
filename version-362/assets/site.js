(function () {
    const menuButton = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dots button"));
    let currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            const target = Number(dot.getAttribute("data-slide"));
            showSlide(target);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    document.querySelectorAll(".filter-panel").forEach(function (panel) {
        const input = panel.querySelector(".filter-input");
        const buttons = Array.from(panel.querySelectorAll(".filter-button"));
        const scope = panel.parentElement.querySelector("[data-filter-scope]");
        const cards = scope ? Array.from(scope.querySelectorAll(".movie-card")) : [];
        let activeFilter = "";

        function applyFilter() {
            const query = input ? input.value.trim().toLowerCase() : "";

            cards.forEach(function (card) {
                const text = (card.getAttribute("data-search") || "").toLowerCase();
                const kind = (card.getAttribute("data-kind") || "").toLowerCase();
                const year = (card.getAttribute("data-year") || "").toLowerCase();
                const filter = activeFilter.toLowerCase();
                const queryMatch = !query || text.indexOf(query) !== -1;
                const filterMatch = !filter || text.indexOf(filter) !== -1 || kind === filter || year === filter;
                card.classList.toggle("is-hidden", !(queryMatch && filterMatch));
            });
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeFilter = button.getAttribute("data-filter") || "";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });

    document.querySelectorAll(".player-box").forEach(function (box) {
        const video = box.querySelector("video");
        const trigger = box.querySelector(".play-trigger");
        let loaded = false;
        let hlsInstance = null;

        function attachStream() {
            if (!video || loaded) {
                return;
            }

            const stream = video.getAttribute("data-stream");
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function startPlayback() {
            if (!video) {
                return;
            }

            attachStream();
            box.classList.add("is-playing");

            const result = video.play();
            if (result && typeof result.catch === "function") {
                result.catch(function () {});
            }
        }

        if (trigger) {
            trigger.addEventListener("click", startPlayback);
        }

        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    startPlayback();
                }
            });

            video.addEventListener("play", function () {
                box.classList.add("is-playing");
            });
        }
    });
})();
