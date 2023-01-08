import { publish } from '@/libs/events'

window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            // use custom event
            publish('fps', properties.fps.value)
        }
    },
    applyUserProperties: function (properties) {
        if (properties.logo) {
            publish('logo', properties.logo.value)
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                publish('logoratio', properties.logoratio.value)
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                publish('logoopacity', properties.logoopacity.value)
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                publish('logoimage', properties.logoimage.value)
                // var logoImage = 'file:///' + properties.logoimage.value;
                // settings.setLogo(logoImage, true);
            } else {
                publish('logoimage', null)
                // settings.resetLogo();
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                publish('background', properties.background.value)
                // var background = 'file:///' + properties.background.value;
                // settings.setBackground(background);
            } else {
                publish('background', null)
                // settings.resetBackground();
            }
        }
        if (properties.position) {
            if (!properties.position.value) {
                publish('position', null)
                // settings.positionReset();
            }
        }
        if (properties.paddingleft) {
            publish('paddingleft', properties.paddingleft.value)
            // settings.positionPadding("padLeft", properties.paddingleft.value)
        }
        if (properties.paddingright) {
            publish('paddingright', properties.paddingright.value)
            // settings.positionPadding("padRight", properties.paddingright.value)
        }
        if (properties.paddingtop) {
            publish('paddingtop', properties.paddingtop.value)
            // settings.positionPadding("padTop", properties.paddingtop.value)
        }
        if (properties.paddingbottom) {
            publish('paddingbottom', properties.paddingbottom.value)
            // settings.positionPadding("padBottom", properties.paddingbottom.value)
        }
    },
};