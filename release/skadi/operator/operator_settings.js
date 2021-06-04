let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: 2048,
        height: 1630,
    },
    viewport: {
        debugRender: false,
        padLeft: "-5%",
        padRight: "-10%",
        padTop: "0%",
        padBottom: "-12%",
        x: 0,
        y: 0,
    },
    fps: 60,
    animation: "Idle",
    // jsonUrl: "./operator/dyn_illust_char_1012_skadi2.json",
    skelUrl: "./operator/dyn_illust_char_1012_skadi2.skel",
    atlasUrl: "./operator/dyn_illust_char_1012_skadi2.atlas",
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