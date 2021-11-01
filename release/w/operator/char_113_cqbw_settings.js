let isPlayingInteract = false;
let resetTime = window.performance.now();
window.operatorSettings = {
    fallbackImage: {
        width: 2048,
        height: 2048,
    },
    viewport: {
        debugRender: false,
        padLeft: "3%",
        padRight: "-3%",
        padTop: "0%",
        padBottom: "1%",
        x: 0,
        y: 0,
    },
    fps: 60,
    animation: "Idle",
    // jsonUrl: "./operator/dyn_illust_char_113_cqbw.json",
    skelUrl: "./operator/dyn_illust_char_113_cqbw.skel",
    atlasUrl: "./operator/dyn_illust_char_113_cqbw.atlas",
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