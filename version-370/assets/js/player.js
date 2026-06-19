function bindMoviePlayer(streamUrl) {
    var video = document.querySelector(".movie-player-video");
    var overlay = document.querySelector(".player-overlay");
    var hls = null;
    var loaded = false;
    var pendingPlay = false;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                overlay.classList.remove("hidden");
            });
        }
    }

    function loadVideo() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.addEventListener("loadedmetadata", function () {
                if (pendingPlay) {
                    playVideo();
                }
            }, { once: true });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                if (pendingPlay) {
                    playVideo();
                }
            });
            return;
        }

        video.src = streamUrl;
        video.addEventListener("loadedmetadata", function () {
            if (pendingPlay) {
                playVideo();
            }
        }, { once: true });
    }

    function startPlayback() {
        pendingPlay = true;
        overlay.classList.add("hidden");
        video.setAttribute("controls", "controls");
        loadVideo();

        if (video.readyState > 0) {
            playVideo();
        }
    }

    overlay.addEventListener("click", startPlayback);
    video.addEventListener("click", function () {
        if (!loaded) {
            startPlayback();
        }
    });
}
