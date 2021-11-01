let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: 2048,
        height: 2048,
    },
    viewport: {
        debugRender: false,
        padLeft: "2%",
        padRight: "3%",
        padTop: "10%",
        padBottom: "0%",
        x: 0,
        y: 0,
    },
    fps: 60,
    animation: "Idle",
    // jsonUrl: "./operator/dyn_illust_char_1014_nearl2.json",
    skelUrl: "./operator/dyn_illust_char_1014_nearl2.skel",
    atlasUrl: "./operator/dyn_illust_char_1014_nearl2.atlas",
    defaultMix: 0,
    success: function (widget) {
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