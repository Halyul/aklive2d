import { publish } from '@/libs/events'

window.settings = {
    setFPS: (fps) => {
        publish('settings:fps', fps)
    },
    displayLogo: (flag) => {
        publish('settings:logo', !flag)
    },
    resizeLogo: (value) => {
        publish('settings:ratio', value)
    },
    opacityLogo: (value) => {
        publish('settings:opacity', value)
    },
    setLogo: (url) => {
        publish('settings:image:set', 'file:///' + url)
    },
    setBackground: (url) => {
        publish('settings:background:set', 'file:///' + url)
    },
    positionPadding: (location, value) => {
        publish('settings:position:set', {
            key: location,
            value: value
        })
    },
    open: () => {
        publish('settings:open')
    },
    close: () => {
        publish('settings:close')
    },
    reset: () => {
        publish('settings:reset')
    }
}