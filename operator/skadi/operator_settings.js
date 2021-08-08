let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: {# fallbackImage_width #},
        height: {# fallbackImage_height #},
    },
    viewport: {
        debugRender: false,
        padLeft: "{# viewport_left #}%",
        padRight: "{# viewport_right #}%",
        padTop: "{# viewport_top #}%",
        padBottom: "{# viewport_bottom #}%",
        x: 0,
        y: 0,
    },
    fps: {# fps #},
    animation: "Idle",
    // jsonUrl: "./operator/{# filename #}.json",
    skelUrl: "./operator/{# filename #}.skel",
    atlasUrl: "./operator/{# filename #}.atlas",
    defaultMix: 0,
    success: function (widget) {
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
                    entry.mixDuration = 0.8;
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
            entry.mixDuration = 0.8;
            widget.animationState.addAnimation(0, "Idle", true, 0);
        }
    },
}