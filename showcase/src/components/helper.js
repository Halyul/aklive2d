export const insertChild = (parent, child) => {
    parent.appendChild(child)
}

const getIntPx = (value) => parseInt(value.replace("px", ""))
export const updateElementPosition = (el, x, y) => {
    const computedStyle = getComputedStyle(el)
    const elWidth = getIntPx(computedStyle.width)
    const elHeight = getIntPx(computedStyle.height)
    const elMarginLeft = getIntPx(computedStyle.marginLeft)
    const elMarginRight = getIntPx(computedStyle.marginRight)
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const xRange = windowWidth - (elWidth + elMarginLeft + elMarginRight)
    const yRange = windowHeight - elHeight
    const xpx = x * xRange / 100
    const ypx = y * yRange / 100
    el.style.transform = `translate(${xpx}px, ${ypx}px)`
}
