export const isWebGLSupported = () => {
    try {
        const canvas = document.createElement('canvas')
        const ctx =
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl')
        return ctx != null
    } catch {
        return false
    }
}

export const insertHTMLChild = (parent, child) => {
    parent.appendChild(child)
}

export const insertHTMLNodeBefore = (parent, sibling, child) => {
    parent.insertBefore(child, sibling)
}

const getIntPx = (value) => parseInt(value.replace('px', ''))
export const updateElementPosition = (el, position) => {
    const computedStyle = getComputedStyle(el)
    const elWidth = getIntPx(computedStyle.width)
    const elHeight = getIntPx(computedStyle.height)
    const elMarginLeft = getIntPx(computedStyle.marginLeft)
    const elMarginRight = getIntPx(computedStyle.marginRight)
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const xRange = windowWidth - (elWidth + elMarginLeft + elMarginRight)
    const yRange = windowHeight - elHeight
    const xpx = (position.x * xRange) / 100
    const ypx = (position.y * yRange) / 100
    el.style.transform = `translate(${xpx}px, ${ypx}px)`
}

export const updateHTMLOptions = (array, id = null) => {
    const value = array.map(
        (item) => `<option value="${item}">${item}</option>`
    )
    if (id) {
        document.getElementById(id).innerHTML = value.join('')
    }
    return value
}

export const addEventListeners = (listeners) => {
    listeners.forEach((listener) => {
        if (listener.id) {
            document
                .getElementById(listener.id)
                .addEventListener(listener.event, (e) => listener.handler(e))
        } else {
            document.addEventListener(listener.event, (e) =>
                listener.handler(e)
            )
        }
    })
}

export const showRelatedHTML = (e, relatedSettingsID, revert = false) => {
    const eRelatedSettings = document.getElementById(relatedSettingsID)
    const checked = revert ? !e.checked : e.checked
    if (checked) {
        eRelatedSettings.hidden = false
    } else {
        eRelatedSettings.hidden = true
    }
}

export const getCurrentHTMLOptions = (id, value) => {
    const e = document.getElementById(id)
    const options = [...e]
    const toSelecteIndex = options.findIndex(
        (i) => options.find((o) => o.value === value) === i
    )
    e.selectedIndex = toSelecteIndex
}

export const syncHTMLValue = (source, targetID) => {
    if (typeof source === 'string') source = document.getElementById(source)
    document.getElementById(targetID).value = source.value
}

export const readFile = (file, callback = () => {}) => {
    if (!file) return
    callback(URL.createObjectURL(file.slice()), file.type)
}

export const createCustomEvent = (name, withArg = false) => {
    const ret = {
        name,
    }
    if (withArg) {
        ret.handler = (detail) => new CustomEvent(name, { detail })
    } else {
        ret.handler = () => new Event(name)
    }
    return ret
}
