const params = new URLSearchParams(window.location.search);
const RATIO = 0.618;
var fps = 60;

if (params.has("fps")) {
    var tmp = parseInt(params.get("fps"));
    if (!isNaN(tmp)) {
        fps = tmp;
    }
}

function supportsWebGL() {
    try {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return ctx != null;
    } catch (e) {
        return false;
    }
}

function calculateScale(width, height) {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;
    let scaleX = windowWidth / width;
    let scaleY = windowHeight / height;
    return { x: scaleX, y: scaleY };
};

if (!supportsWebGL()) {
    alert('WebGL is unavailable. Fallback image will be used.');
    var e = document.getElementById("spine-widget");
    e.classList.add("fallback");
    e.parentElement.classList.add("widget-wrapper");
    document.getElementById("loader").style.display = "none";

    function fallback() {
        const scale = calculateScale(window.operator.fallbackImage.width, window.operator.fallbackImage.height);
        if (scale.x > scale.y) {
            e.style.width = window.operator.fallbackImage.width * scale.y;
            e.style.height = window.operator.fallbackImage.height * scale.y;
        } else if (scale.x < scale.y) {
            e.style.width = window.operator.fallbackImage.width * scale.x;
            e.style.height = window.operator.fallbackImage.height * scale.x;
        }
        document.getElementById("logo").width = window.innerWidth / 2 * RATIO
    }
    window.addEventListener('resize', fallback, true);
    fallback();
} else {
    var resetTime = window.performance.now();
    var e = document.getElementById("spine-widget");
    var spineWidget;
    window.isLoaded = false;

    function render() {
        let isPlayingInteract = false;

        var scale = calculateScale(window.operator.spineSize.width, window.operator.spineSize.height);

        spineWidget = new spine.SpineWidget(e, {
            atlasContent: atob(window.operator.atlasContent),
			json: "./assets/dyn_illust_char_1012_skadi2.json",
		    atlasPages: window.operator.atlasPages,
			atlasPagesContent: window.operator.atlasPagesContent,
            animation: "Idle",
            backgroundColor: "#00000000",
            loop: true,
            skin: "default",
            fps: fps,
            scale: Math.min(scale.x, scale.y),
            x: window.innerWidth / 2,
            y: calculateCenterY(scale.x, scale.y),
            fitToCanvas: false,
            premultipliedAlpha: true,
            success: function (widget) {
                widget.state.addListener({
                    end: (e) => {
                        if (e.animation.name == "Interact") {
                            isPlayingInteract = false;
                        }
                    },
                    complete: (e) => {
                        if (window.performance.now() - resetTime >= 8 * 1000 && Math.random() < 0.3) {
                            resetTime = window.performance.now();
                            let entry = widget.state.setAnimation(0, "Special", true, 0);
                            entry.mixDuration = 0.2;
                            widget.state.addAnimation(0, "Idle", true, 0);
                        }
                    },
                });
                widget.canvas.onclick = function () {
                    if (isPlayingInteract) {
                        return;
                    }
                    isPlayingInteract = true;
                    let entry = widget.state.setAnimation(0, "Interact", true, 0);
                    entry.mixDuration = 0.2;
                    widget.state.addAnimation(0, "Idle", true, 0);
                }
                document.getElementById("loader").style.display = "none";
                window.isLoaded = true;
            }
        });

        document.getElementById("logo").width = window.innerWidth / 2 * RATIO
    }

    function calculateCenterY(scaleX, scaleY) {
        var height = window.innerHeight;
        var offset = Math.min(window.operator.spineSize.offset, height / window.operator.spineSize.correctionFactor);
        if (scaleX < scaleY) {
            // constrained by width
            var scaledSpineHeight = window.operator.spineSize.height * scaleX;
            return (height - scaledSpineHeight) / 2 + offset;
        }
        return offset;
    }
    render();
    optimizedResize.add(function() {
        if (window.isLoaded) {
            window.isLoaded = false;
            document.getElementById("logo").width = window.innerWidth / 2 * RATIO
            document.getElementById("loader").style.display = "inherit";
            var scale = calculateScale(window.operator.spineSize.width, window.operator.spineSize.height);
            spineWidget.reRender({
                x: window.innerWidth / 2,
                y: calculateCenterY(scale.x, scale.y),
                scale: Math.min(scale.x, scale.y),
            });
        }
    });
}

window.addEventListener("contextmenu", e => e.preventDefault());

document.addEventListener("gesturestart", e => e.preventDefault());

// wallpaper engine
window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            spineWidget.setFps(properties.fps);
        }
    },
};

console.log("All resources are extracted from Arknights.")