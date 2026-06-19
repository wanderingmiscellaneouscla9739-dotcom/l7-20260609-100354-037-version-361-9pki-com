(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }

        callback();
    }

    ready(function () {
        const toggle = document.querySelector('.mobile-toggle');
        const mobileNav = document.querySelector('.mobile-nav');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', String(!expanded));
                mobileNav.hidden = expanded;
            });
        }

        const hero = document.querySelector('[data-hero]');
        if (hero) {
            const slides = Array.from(hero.querySelectorAll('.hero-slide'));
            const dots = Array.from(hero.querySelectorAll('.hero-dot'));
            let current = 0;

            function showSlide(index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });

            if (slides.length > 1) {
                setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }
        }

        const filterPanel = document.querySelector('.movie-filter');
        if (filterPanel) {
            const input = filterPanel.querySelector('.filter-input');
            const region = filterPanel.querySelector('.filter-region');
            const type = filterPanel.querySelector('.filter-type');
            const year = filterPanel.querySelector('.filter-year');
            const cards = Array.from(document.querySelectorAll('.filter-card'));
            const empty = document.querySelector('.filter-empty');

            function valueOf(node) {
                return node ? node.value.trim().toLowerCase() : '';
            }

            function applyFilter() {
                const keyword = valueOf(input);
                const regionValue = valueOf(region);
                const typeValue = valueOf(type);
                const yearValue = valueOf(year);
                let visibleCount = 0;

                cards.forEach(function (card) {
                    const text = [
                        card.dataset.title || '',
                        card.dataset.region || '',
                        card.dataset.type || '',
                        card.dataset.year || '',
                        card.dataset.tags || ''
                    ].join(' ').toLowerCase();
                    const regionMatch = !regionValue || (card.dataset.region || '').toLowerCase().includes(regionValue);
                    const typeMatch = !typeValue || (card.dataset.type || '').toLowerCase().includes(typeValue);
                    const yearMatch = !yearValue || (card.dataset.year || '').toLowerCase() === yearValue;
                    const keywordMatch = !keyword || text.includes(keyword);
                    const matched = regionMatch && typeMatch && yearMatch && keywordMatch;

                    card.classList.toggle('is-filtered', !matched);
                    if (matched) {
                        visibleCount += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visibleCount !== 0;
                }
            }

            [input, region, type, year].forEach(function (node) {
                if (!node) {
                    return;
                }
                node.addEventListener('input', applyFilter);
                node.addEventListener('change', applyFilter);
            });
        }
    });
}());
