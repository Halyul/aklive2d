var Settings = (function () {
    function Settings(config) {
        this.logoEl = config.logo;
        this.spinePlayer = config.spinePlayer;
        this.operatorSettings = config.operatorSettings;
        this.validateConfig();
        
        this.fps = 60;
        this.ratio = this.defaultRatio = 0.618 * 100;
        this.viewport = Object.assign({}, window.operatorSettings.viewport);
        this.backgroundImage = getComputedStyle(document.body).backgroundImage;
        this.logoSrc = this.logoEl.src;
        this.opacity = parseFloat(getComputedStyle(this.logoEl).opacity) * 100;
        this.el = document.createElement("div");
        
    }
    Settings.prototype.validateConfig = function () {
        if (typeof this.logoEl === "string")
            this.logoEl = document.getElementById(this.logoEl);
		else
            this.logoEl = this.logoEl;
        if (typeof this.spinePlayer !== "object") {
            var message = "Invalid spine player, the showcase will not work properly.";
            alert(message);
            throw new Error(message);
        }
    };
    Settings.prototype.setFPS = function (value) {
        value = parseInt(value);
        this.spinePlayer.setFps(value);
    };
    Settings.prototype.displayLogo = function (bool) {
        if (bool) {
            this.logoEl.style.display = "inherit";
        } else {
            this.logoEl.style.display = "none";
        }
    };
    Settings.prototype.setBackground = function (url) {
        url = `url("${url}")`;
        document.body.style.backgroundImage = url
    };
    Settings.prototype.resetBackground = function () {
        document.body.style.backgroundImage = this.backgroundImage;
    };
    Settings.prototype.setLogo = function (url, removeInvert) {
        this.logoEl.src = url;
        this.resizeLogo(this.ratio);
        if (removeInvert) {
            this.logoEl.style.filter = "invert(0)";
        } else {
            this.logoEl.style.filter = "invert(1)";
        }
    };
    Settings.prototype.resetLogo = function () {
        this.setLogo(this.logoSrc, false);
    };
    Settings.prototype.resizeLogo = function (value) {
        this.ratio = parseFloat(value);
        this.logoEl.width = window.innerWidth / 2 * this.ratio / 100
    };
    Settings.prototype.opacityLogo = function (value) {
        var opacity = parseFloat(value);
        this.logoEl.style.opacity = opacity / 100;
    };
    Settings.prototype.positionReset = function () {
        this.spinePlayer.updateViewport(window.operatorSettings.viewport)
    };
    Settings.prototype.positionPadding = function (key, value) {
        switch (key) {
            case "padLeft":
                this.viewport.padLeft = `${value}%`;
                break;
            case "padRight":
                this.viewport.padRight = `${value}%`;
                break;
            case "padTop":
                this.viewport.padTop = `${value}%`;
                break;
            case "padBottom":
                this.viewport.padBottom = `${value}%`;
                break;
        }
        this.spinePlayer.updateViewport(this.viewport)
    };
    Settings.prototype.open = function () {
        this.el.classList.add("website-settings");
    };
    Settings.prototype.close = function () {
        this.el.classList.remove("website-settings");
    };
    Settings.prototype.reset = function () {
        this.setFPS(this.fps);
        this.displayLogo(true);
        this.resizeLogo(this.defaultRatio);
        this.opacityLogo(this.opacity);
        this.positionReset();
        this.resetBackground();
        this.resetLogo();
        this.spinePlayer.play();
        this._removeHTML();
        this._insertHTML();
    };
    Settings.prototype.setup = function () {
        var _this = this;

        _this._insertHTML();
        
        function resize() {
            document.getElementById("logo").width = window.innerWidth / 2 * _this.ratio / 100
        }
        window.addEventListener("resize", resize, true);
        resize()

        window.addEventListener("contextmenu", e => e.preventDefault());
        document.addEventListener("gesturestart", e => e.preventDefault());
    };
    Settings.prototype.sync = function (source, targetID) {
        document.getElementById(targetID).value = source.value;
    };
    Settings.prototype._showRelated = function (e, relatedSettingsID) {
        var eRelatedSettings = document.getElementById(relatedSettingsID)
        if (e.checked) {
            eRelatedSettings.style.display = "inherit";
        } else {
            eRelatedSettings.style.display = "none";
        }
    };
    Settings.prototype._removeHTML = function () {
        this.el.innerHTML = null;
    };
    Settings.prototype._insertHTML = function () {
        var htmldata =
        `
            <div>
                <label for="fps">FPS</label>
                <input type="range" min="1" max="60" value="${this.operatorSettings.fps}" step="1" id="fps_slider">
                <input type="number" id="fps_input" name="fps"  value="${this.operatorSettings.fps}">
            </div>
            <div>
                <label for="operator_logo">Operator Logo</label>
                <input type="checkbox" id="operator_logo" name="operator_logo" checked data-checked="true">
                <div id="operator_logo_realted">
                    <div>
                        <label for="logo_image">Logo Image (Store Locally)</label>
                        <input type="file" id="logo_image">
                        <button type="button" id="logo_image_clear" disabled>Clear</button>
                    </div>
                    <div>
                        <label for="logo_ratio">Logo Ratio</label>
                        <input type="range" min="0" max="100" step="0.1" id="logo_ratio_slider" value="${this.ratio}">
                        <input type="number" id="logo_ratio_input" name="logo_ratio" value="${this.ratio}">
                    </div>
                    <div>
                        <label for="logo_opacity">Logo Opacity</label>
                        <input type="range" min="0" max="100" data-css-class="logo" step="1" id="logo_opacity_slider" value="${this.opacity}">
                        <input type="number" id="logo_opacity_input" name="logo_opacity" value="${this.opacity}">
                    </div>
                </div>
            </div>
            <div>
                <label for="background_image">Background Image (Store Locally)</label>
                <input type="file" id="background_image">
                <button type="button" id="background_image_clear" disabled>Clear</button>
            </div>
            <div>
                <label for="position">Position</label>
                <input type="checkbox" id="position" name="position">
                <div id="position_realted" style="display: none;">
                    <div>
                        <label for="position_padding_left">Padding Left</label>
                        <input type="range" min="-100" max="100" id="position_padding_left_slider" value="${this._getPercentage(this.operatorSettings.viewport.padLeft)}">
                        <input type="number" id="position_padding_left_input" name="position_padding_left" value="${this._getPercentage(this.operatorSettings.viewport.padLeft)}">
                    </div>
                    <div>
                        <label for="position_padding_right">Padding Right</label>
                        <input type="range" min="-100" max="100" id="position_padding_right_slider" value="${this._getPercentage(this.operatorSettings.viewport.padRight)}">
                        <input type="number" id="position_padding_right_input" name="position_padding_right" value="${this._getPercentage(this.operatorSettings.viewport.padRight)}">
                    </div>
                    <div>
                        <label for="position_padding_Top">Padding Top</label>
                        <input type="range" min="-100" max="100" id="position_padding_top_slider" value="${this._getPercentage(this.operatorSettings.viewport.padTop)}">
                        <input type="number" id="position_padding_top_input" name="position_padding_top" value="${this._getPercentage(this.operatorSettings.viewport.padTop)}">
                    </div>
                    <div>
                        <label for="position_padding_bottom">Padding Bottom</label>
                        <input type="range" min="-100" max="100" id="position_padding_bottom_slider"  value="${this._getPercentage(this.operatorSettings.viewport.padBottom)}">
                        <input type="number" id="position_padding_bottom_input" name="position_padding_bottom" value="${this._getPercentage(this.operatorSettings.viewport.padBottom)}">
                    </div>
                </div>
            </div>
            <div>
                <button type="button" id="settings_play" disabled>Play</button>
                <button type="button" id="settings_pause">Pause</button>
                <button type="button" id="settings_reset">Reset</button>
                <button type="button" id="settings_close">Close</button>
            </div>
        `

        this.el.innerHTML = htmldata;
        document.body.appendChild(this.el);
        
        this._addEventListener();
    };
    Settings.prototype._addEventListener = function () {
        var _this = this;

        document.getElementById("fps_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "fps_input");
            _this.setFPS(e.currentTarget.value);
        })
        document.getElementById("fps_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "fps_slider");
            _this.setFPS(e.currentTarget.value);
        })

        document.getElementById("operator_logo").addEventListener("click", e => {
            _this._showRelated(e.currentTarget, "operator_logo_realted");
            _this.displayLogo(e.currentTarget.checked)
        })

        document.getElementById("logo_image").addEventListener("change", e => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = readerEvent => {
                var content = readerEvent.target.result;
                this.setLogo(content, true);
            }
            document.getElementById("logo_image_clear").disabled = false;
        })
        document.getElementById("logo_image_clear").addEventListener("click", e => {
            this.resetLogo();
            e.currentTarget.disabled = true;
        })

        document.getElementById("logo_ratio_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "logo_ratio_input");
            _this.resizeLogo(e.currentTarget.value);
        })
        document.getElementById("logo_ratio_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "logo_ratio_slider");
            _this.resizeLogo(e.currentTarget.value);
        })

        document.getElementById("logo_opacity_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "logo_opacity_input");
            _this.opacityLogo(e.currentTarget.value);
        })
        document.getElementById("logo_opacity_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "logo_opacity_slider");
            _this.opacityLogo(e.currentTarget.value);
        })

        document.getElementById("background_image").addEventListener("change", e => {
            var file = e.target.files[0];
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = readerEvent => {
                var content = readerEvent.target.result;
                this.setBackground(content);
            }
            document.getElementById("background_image_clear").disabled = false;
        })
        document.getElementById("background_image_clear").addEventListener("click", e => {
            this.resetBackground();
            e.currentTarget.disabled = true;
        })

        document.getElementById("position").addEventListener("click", e => {
            _this._showRelated(e.currentTarget, "position_realted");
            if (e.currentTarget.checked) _this.positionReset();
        })

        document.getElementById("position_padding_left_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "position_padding_left_input");
            _this.positionPadding("padLeft", e.currentTarget.value);
        })
        document.getElementById("position_padding_left_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "position_padding_left_slider");
            _this.positionPadding("padLeft", e.currentTarget.value);
        })

        document.getElementById("position_padding_right_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "position_padding_right_input");
            _this.positionPadding("padRight", e.currentTarget.value);
        })
        document.getElementById("position_padding_right_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "position_padding_right_slider");
            _this.positionPadding("padRight", e.currentTarget.value);
        })

        document.getElementById("position_padding_top_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "position_padding_top_input");
            _this.positionPadding("padTop", e.currentTarget.value);
        })
        document.getElementById("position_padding_top_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "position_padding_top_slider");
            _this.positionPadding("padTop", e.currentTarget.value);
        })

        document.getElementById("position_padding_bottom_slider").addEventListener("input", e => {
            _this.sync(e.currentTarget, "position_padding_bottom_input");
            _this.positionPadding("padBottom", e.currentTarget.value);
        })
        document.getElementById("position_padding_bottom_input").addEventListener("change", e => {
            _this.sync(e.currentTarget, "position_padding_bottom_slider");
            _this.positionPadding("padBottom", e.currentTarget.value);
        })

        document.getElementById("settings_play").addEventListener("click", e => {
            this.spinePlayer.play();
            e.currentTarget.disabled = true;
            document.getElementById("settings_pause").disabled = false;
        })
        document.getElementById("settings_pause").addEventListener("click", e => {
            this.spinePlayer.pause();
            e.currentTarget.disabled = true;
            document.getElementById("settings_play").disabled = false;
        })
        document.getElementById("settings_reset").addEventListener("click", e => {
            _this.reset();
        })
        document.getElementById("settings_reset").addEventListener("click", e => {
            _this.close();
        })
    };
    Settings.prototype._getPercentage = function (value) {
        return parseInt(value.replace("%", ""));
    };
    return Settings;
}());