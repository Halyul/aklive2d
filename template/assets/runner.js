const params = new URLSearchParams(window.location.search);

function supportsWebGL() {
    try {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        return ctx != null;
    } catch (e) {
        return false;
    }
};

if (!supportsWebGL()) {
    alert('WebGL is unavailable. Fallback image will be used.');
    var e = document.getElementById("container");
    e.classList.add("fallback");
    e.parentElement.classList.add("widget-wrapper");

    function calculateScale(width, height) {
        let windowWidth = window.innerWidth;
        let windowHeight = window.innerHeight;
        let scaleX = windowWidth / width;
        let scaleY = windowHeight / height;
        return { x: scaleX, y: scaleY };
    }

    function fallback() {
        const scale = calculateScale(window.operatorSettings.fallbackImage.width, window.operatorSettings.fallbackImage.height);
        if (scale.x > scale.y) {
            e.style.width = window.operatorSettings.fallbackImage.width * scale.y + "px";
            e.style.height = window.operatorSettings.fallbackImage.height * scale.y + "px";
        } else if (scale.x < scale.y) {
            e.style.width = window.operatorSettings.fallbackImage.width * scale.x + "px";
            e.style.height = window.operatorSettings.fallbackImage.height * scale.x + "px";
        }
    }

    window.addEventListener('resize', fallback, true);
    fallback();
} else {
    var e = document.getElementById("container");
    var settings;
	var spinePlayer = new spine.SpinePlayer(e, {
        jsonUrl: window.operatorSettings.jsonUrl,
        skelUrl: window.operatorSettings.skelUrl,
		atlasUrl: window.operatorSettings.atlasUrl,
        animation: window.operatorSettings.animation,
        rawDataURIs: window.operatorAssets,
		premultipliedAlpha: true,
		alpha: true,
		backgroundColor: "#00000000",
		viewport: window.operatorSettings.viewport,
        showControls: false,
        fps: window.operatorSettings.fps,
        defaultMix: window.operatorSettings.defaultMix,
        success: function (e) {
            window.operatorSettings.success(e);
            settings.spinePlayerLoaded = true;
            settings.loadViewport();
            if (params.has("settings")) {
                settings.open();
            }
        },
    });
    settings = new Settings({
        logo: document.getElementById("logo"),
        spinePlayer: spinePlayer,
        operatorSettings: window.operatorSettings
    });
}

settings.setup()

// wallpaper engine
window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            settings.setFPS(properties.fps);
        }
    },
    applyUserProperties: function (properties) {
        if (properties.logo) {
            settings.displayLogo(properties.logo.value)
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                settings.resizeLogo(properties.logoratio.value)
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                settings.opacityLogo(properties.logoopacity.value)
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                var logoImage = 'file:///' + properties.logoimage.value;
                settings.setLogo(logoImage, true);
            } else {
                settings.resetLogo();
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                var background = 'file:///' + properties.background.value;
                settings.setBackground(background);
            } else {
                settings.resetBackground();
            }
        }
        if (properties.position) {
            if (!properties.position.value) {
                settings.positionReset();
            }
        }
        if (properties.paddingleft) {
            settings.positionPadding("padLeft", properties.paddingleft.value)
        }
        if (properties.paddingright) {
            settings.positionPadding("padRight", properties.paddingright.value)
        }
        if (properties.paddingtop) {
            settings.positionPadding("padTop", properties.paddingtop.value)
        }
        if (properties.paddingbottom) {
            settings.positionPadding("padBottom", properties.paddingbottom.value)
        }
    },
};

console.log("All resources are extracted from Arknights. Github: https://github.com/Halyul/aklive2d")