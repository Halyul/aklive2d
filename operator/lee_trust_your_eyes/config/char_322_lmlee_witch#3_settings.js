let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: ${format:fallbackImage_width},
        height: ${format:fallbackImage_height},
    },
    viewport: {
        debugRender: false,
        padLeft: "${format:viewport_left}%",
        padRight: "${format:viewport_right}%",
        padTop: "${format:viewport_top}%",
        padBottom: "${format:viewport_bottom}%",
        x: 0,
        y: 0,
    },
    fps: ${format:fps},
    animation: "Idle",
    // jsonUrl: "./operator/${format:filename}.json",
    skelUrl: "./operator/${format:filename}.skel",
    atlasUrl: "./operator/${format:filename}.atlas",
    defaultMix: 0,
    success: function (widget) {
        settings.disableInvertFilter();
        settings.opacityLogo(${format:opacity});
        widget.animationState.addListener({
            end: (e) => {
                if (e.animation.name == "Interact") {
                    isPlayingInteract = false;
                }
            },
            complete: (e) => {
                if (window.performance.now() - resetTime >= 8 * 1000 && Math.random() < 0.3) {
                    resetTime = window.performance.now();
                    let entry = widget.animationState.setAnimation(0, "Special", false, 0);
                    entry.mixDuration = 0.3;
                    widget.animationState.addAnimation(0, "Idle", true, 0);
                }
            },
        });
        widget.canvas.onclick = function () {
            if (isPlayingInteract) {
                return;
            }
            isPlayingInteract = true;
            let entry = widget.animationState.setAnimation(0, "Interact", false, 0);
            entry.mixDuration = 0.3;
            widget.animationState.addAnimation(0, "Idle", true, 0);
        }
    },
}