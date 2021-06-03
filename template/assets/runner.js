const params = new URLSearchParams(window.location.search);
var RATIO = 0.618;
var fps = 60;
var viewport = Object.assign({}, window.settings.viewport);

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
    var e = document.getElementById("container");
    e.classList.add("fallback");
    e.parentElement.classList.add("widget-wrapper");

    function fallback() {
        const scale = calculateScale(window.settings.fallbackImage.width, window.settings.fallbackImage.height);
        if (scale.x > scale.y) {
            e.style.width = window.settings.fallbackImage.width * scale.y + "px";
            e.style.height = window.settings.fallbackImage.height * scale.y + "px";
        } else if (scale.x < scale.y) {
            e.style.width = window.settings.fallbackImage.width * scale.x + "px";
            e.style.height = window.settings.fallbackImage.height * scale.x + "px";
        }
    }

    window.addEventListener('resize', fallback, true);
    fallback();
} else {
    var e = document.getElementById("container");
    var resetTime = window.performance.now();
	
	var spinePlayer = new spine.SpinePlayer(e, {
        jsonUrl: window.settings.jsonUrl,
        skelUrl: window.settings.skelUrl,
		atlasUrl: window.settings.atlasUrl,
        animation: window.settings.animation,
        rawDataURIs: window.operator,
		premultipliedAlpha: true,
		alpha: true,
		backgroundColor: "#00000000",
		fps: fps,
		viewport: window.settings.viewport,
        showControls: false,
        defaultMix: window.settings.defaultMix,
        success: window.settings.success,
    });
    
    
}

function resizeLogo() {
    document.getElementById("logo").width = window.innerWidth / 2 * RATIO
}
window.addEventListener('resize', resizeLogo, true);
resizeLogo()

window.addEventListener("contextmenu", e => e.preventDefault());
document.addEventListener("gesturestart", e => e.preventDefault());

// wallpaper engine
window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            spinePlayer.setFps(properties.fps);
        }
    },
    applyUserProperties: function (properties) {
        if (properties.logo) {
            if (!properties.logo.value) {
                document.getElementById("logo").style.display = "none";
            } else {
                document.getElementById("logo").style.display = "inherit";
            }
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                RATIO = properties.logoratio.value / 100;
                resizeLogo();
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                var opacity= properties.logoopacity.value / 100;
                document.getElementById('logo').style.opacity = opacity;
            }
        }
        if (properties.logoimage) {
            var logoImage;
            const e = document.getElementById('logo');
            if (properties.logoimage.value) {
                logoImage = 'file:///' + properties.logoimage.value;
                e.style.filter = "invert(0)";
            } else {
                logoImage = "./operator/operator_logo.png"
                e.style.filter = "invert(1)";
            }
            e.src = logoImage;
            resizeLogo();
        }
        if (properties.background) {
            var background;
            if (properties.background.value) {
                background = 'file:///' + properties.background.value;
            } else {
                background = "./operator/operator_bg.png"
            }
            document.body.style.backgroundImage = `url(${background})`
        }
        if (properties.position) {
            if (!properties.position.value) {
                spinePlayer.updateViewport(window.settings.viewport)
            }
        }
        if (properties.paddingleft) {
            viewport.padLeft = `${properties.paddingleft.value}%`
            spinePlayer.updateViewport(viewport)
        }
        if (properties.paddingright) {
            viewport.padRight = `${properties.paddingright.value}%`
            spinePlayer.updateViewport(viewport)
        }
        if (properties.paddingtop) {
            viewport.padTop = `${properties.paddingtop.value}%`
            spinePlayer.updateViewport(viewport)
        }
        if (properties.paddingbottom) {
            viewport.padBottom = `${properties.paddingbottom.value}%`
            spinePlayer.updateViewport(viewport)
        }
    },
};

console.log("All resources are extracted from Arknights. Github: https://github.com/Halyul/aklive2d")