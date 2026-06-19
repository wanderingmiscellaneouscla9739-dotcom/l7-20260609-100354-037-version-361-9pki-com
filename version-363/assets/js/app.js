(function () {
    function findAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            var open = panel.classList.toggle('open');
            document.body.classList.toggle('menu-open', open);
            button.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        findAll('a', panel).forEach(function (link) {
            link.addEventListener('click', function () {
                panel.classList.remove('open');
                document.body.classList.remove('menu-open');
                button.setAttribute('aria-expanded', 'false');
            });
        });
    }

    function setupImageFallbacks() {
        document.addEventListener('error', function (event) {
            var target = event.target;
            if (!target || target.tagName !== 'IMG') {
                return;
            }
            target.classList.add('image-off');
            var shell = target.closest('.poster-shell, .hero-slide');
            if (shell) {
                shell.classList.add('no-image');
            }
        }, true);
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = findAll('[data-hero-slide]', hero);
        var dots = findAll('[data-hero-dot]', hero);
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
                dot.setAttribute('aria-current', i === index ? 'true' : 'false');
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }

    function textValue(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function setupSearchAreas() {
        findAll('[data-search-area]').forEach(function (area) {
            var input = area.querySelector('[data-search-input]');
            var buttons = findAll('[data-filter]', area);
            var cards = findAll('[data-card]', area);
            var empty = area.querySelector('[data-empty]');
            var activeFilter = 'all';

            function apply() {
                var q = textValue(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = textValue([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var filterOk = activeFilter === 'all' || haystack.indexOf(textValue(activeFilter)) !== -1;
                    var searchOk = !q || haystack.indexOf(q) !== -1;
                    var showCard = filterOk && searchOk;
                    card.style.display = showCard ? '' : 'none';
                    if (showCard) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter') || 'all';
                    buttons.forEach(function (item) {
                        item.classList.toggle('active', item === button);
                    });
                    apply();
                });
            });

            apply();
        });
    }

    function setupPlayers() {
        findAll('[data-player]').forEach(function (box) {
            var video = box.querySelector('video');
            var overlay = box.querySelector('[data-play-overlay]');
            var stream = box.getAttribute('data-stream');
            var attached = false;
            var hlsInstance = null;
            if (!video || !stream) {
                return;
            }

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add('hide');
                }
                video.controls = true;
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            video.addEventListener('click', function () {
                if (video.paused) {
                    play();
                } else {
                    video.pause();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    setupMenu();
    setupImageFallbacks();
    setupHero();
    setupSearchAreas();
    setupPlayers();
})();
