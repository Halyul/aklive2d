import { publish } from '@/libs/events'

window.wallpaperPropertyListener = {
    applyGeneralProperties: function (properties) {
        if (properties.fps) {
            publish('settings:fps', properties.fps.value)
        }
    },
    applyUserProperties: function (properties) {
        if (properties.logo) {
            publish('settings:logo', !properties.logo.value)
        }
        if (properties.logoratio) {
            if (properties.logoratio.value) {
                publish('settings:ratio', properties.logoratio.value)
            }
        }
        if (properties.logoopacity) {
            if (properties.logoopacity.value) {
                publish('settings:opacity', properties.logoopacity.value)
            }
        }
        if (properties.logoimage) {
            if (properties.logoimage.value) {
                publish('settings:image:set', 'file:///' + properties.logoimage.value)
            } else {
                publish('settings:image:reset')
            }
        }
        if (properties.background) {
            if (properties.background.value) {
                publish('settings:background:set', 'file:///' + properties.background.value)
            } else {
                publish('settings:background:reset')
            }
        }
        if (properties.position) {
            if (!properties.position.value) {
                publish('settings:position:reset')
            }
        }
        if (properties.paddingleft) {
            publish('settings:position:set', {
                key: "left",
                value: properties.paddingleft.value
            })
        }
        if (properties.paddingright) {
            publish('settings:position:set', {
                key: "right",
                value: properties.paddingright.value
            })
        }
        if (properties.paddingtop) {
            publish('settings:position:set', {
                key: "top",
                value: properties.paddingtop.value
            })
        }
        if (properties.paddingbottom) {
            publish('settings:position:set', {
                key: "bottom",
                value: properties.paddingbottom.value
            })
        }
    },
};