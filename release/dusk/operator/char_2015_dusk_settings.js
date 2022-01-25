let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: 2048,
        height: 2048,
    },
    viewport: {
        debugRender: false,
        padLeft: "0%",
        padRight: "0%",
        padTop: "0%",
        padBottom: "0%",
        x: 0,
        y: 0,
    },
    fps: 60,
    animation: "Idle",
    // jsonUrl: "./operator/dyn_illust_char_2015_dusk.json",
    skelUrl: "./operator/dyn_illust_char_2015_dusk.skel",
    atlasUrl: "./operator/dyn_illust_char_2015_dusk.atlas",
    defaultMix: 0,
    success: function (widget) {
        settings.disableInvertFilter();
        settings.opacityLogo(30);
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