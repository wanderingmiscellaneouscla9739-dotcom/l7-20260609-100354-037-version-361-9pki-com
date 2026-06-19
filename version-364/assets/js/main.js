(function () {
    const navToggle = document.querySelector(".nav-toggle");
    const navLinks = document.querySelector(".nav-links");

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            const opened = navLinks.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(opened));
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll(".hero-dots button"));
        let current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
            });
        });

        show(0);

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    const searchInput = document.querySelector("[data-search-input]");
    const regionFilter = document.querySelector("[data-region-filter]");
    const sortSelect = document.querySelector("[data-sort-select]");
    const resultCount = document.querySelector("[data-result-count]");
    const cards = Array.from(document.querySelectorAll(".search-item"));

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const keyword = normalize(searchInput ? searchInput.value : "");
        const region = normalize(regionFilter ? regionFilter.value : "");
        let visible = 0;

        cards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags
            ].join(" "));
            const regionText = normalize(card.dataset.region);
            const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchedRegion = !region || regionText.indexOf(region) !== -1;
            const matched = matchedKeyword && matchedRegion;

            card.classList.toggle("is-hidden-by-filter", !matched);

            if (matched) {
                visible += 1;
            }
        });

        if (resultCount) {
            resultCount.textContent = String(visible);
        }
    }

    function applySort() {
        if (!sortSelect || !cards.length) {
            return;
        }

        const value = sortSelect.value;
        const containers = new Set(cards.map(function (card) {
            return card.parentElement;
        }));

        containers.forEach(function (container) {
            const items = Array.from(container.querySelectorAll(".search-item"));

            items.sort(function (a, b) {
                if (value === "year-desc") {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }

                if (value === "year-asc") {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }

                if (value === "title-asc") {
                    return String(a.dataset.title || "").localeCompare(String(b.dataset.title || ""), "zh-Hans-CN");
                }

                return 0;
            });

            items.forEach(function (item) {
                container.appendChild(item);
            });
        });
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyFilters);
    }

    if (regionFilter) {
        regionFilter.addEventListener("change", applyFilters);
    }

    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            applySort();
            applyFilters();
        });
    }

    applyFilters();
})();
