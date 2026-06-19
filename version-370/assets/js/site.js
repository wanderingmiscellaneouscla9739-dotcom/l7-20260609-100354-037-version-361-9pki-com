(function () {
    var mobileButton = document.querySelector(".mobile-toggle");
    var mobileNav = document.querySelector(".mobile-nav");

    if (mobileButton && mobileNav) {
        mobileButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("open");
            mobileButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    var searchBox = document.querySelector("[data-search-box]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

    if (searchBox && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q");

        if (initialQuery) {
            searchBox.value = initialQuery;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().replace(/\s+/g, "");
        }

        function filterCards() {
            var query = normalize(searchBox.value);
            cards.forEach(function (card) {
                var text = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.type,
                    card.dataset.genre,
                    card.dataset.year,
                    card.dataset.category,
                    card.textContent
                ].join(" "));
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        }

        searchBox.addEventListener("input", filterCards);
        filterCards();
    }
})();
