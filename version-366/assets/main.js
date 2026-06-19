(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileMenu = document.querySelector('.mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobileMenu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var current = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }
    }

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var search = scope.querySelector('.movie-search');
        var select = scope.querySelector('.movie-filter-select');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-row'));

        if (!search && !select) {
            return;
        }

        function applyFilter() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var category = select ? select.value.trim().toLowerCase() : '';

            cards.forEach(function (card) {
                var text = card.textContent.toLowerCase();
                var dataText = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-genre') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var fullText = text + ' ' + dataText;
                var matchesQuery = !query || fullText.indexOf(query) !== -1;
                var matchesCategory = !category || fullText.indexOf(category) !== -1;

                card.classList.toggle('is-hidden', !(matchesQuery && matchesCategory));
            });
        }

        if (search) {
            search.addEventListener('input', applyFilter);
        }

        if (select) {
            select.addEventListener('change', applyFilter);
        }
    });
}());

function startMoviePlayer(source) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    var hlsInstance = null;
    var ready = false;

    if (!video || !source) {
        return;
    }

    function attachSource() {
        if (ready) {
            return;
        }

        ready = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
    }

    function beginPlayback() {
        attachSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', beginPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            beginPlayback();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
