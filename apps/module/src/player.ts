import { spine } from '../spine-ts/build/spine-webgl.js'

/**
 * Adapted from 'spine-ts/player/src/Player.ts'
 */
interface Viewport {
    x: number
    y: number
    width: number
    height: number
    padLeft: string | number
    padRight: string | number
    padTop: string | number
    padBottom: string | number
}

export interface PlayerConfig {
    /* the URL of the skeleton .json file */
    jsonUrl: string | undefined

    /* the URL of the skeleton .skel file */
    skelUrl: string | undefined

    /* the URL of the skeleton .atlas file. Atlas page images are automatically resolved. */
    atlasUrl: string

    /* Raw data URIs, mapping from a path to base 64 encoded raw data. When the player
   resolves a path of the `jsonUrl`, `skelUrl`, `atlasUrl`, or the image paths
   referenced in the atlas, it will first look for that path in this array of
   raw data URIs. This allows embedding of resources directly in HTML/JS. */
    rawDataURIs: spine.Map<string> | undefined

    fps: number

    scale: number

    /* Optional: the name of the animation to be played. Default: first animation in the skeleton. */
    animation: string | undefined

    /* Optional: list of animation names from which the user can choose. */
    animations: string[] | undefined

    /* Optional: the default mix time used to switch between two animations. */
    defaultMix: number

    /* Optional: the name of the skin to be set. Default: the default skin. */
    skin: string | undefined

    /* Optional: list of skin names from which the user can choose. */
    skins: string[] | undefined

    /* Optional: whether the skeleton uses premultiplied alpha. Default: true. */
    premultipliedAlpha: boolean

    /* Optional: the position and size of the viewport in world coordinates of the skeleton. Default: the setup pose bounding box. */
    viewport: {
        x: number
        y: number
        width: number
        height: number
        padLeft: string | number
        padRight: string | number
        padTop: string | number
        padBottom: string | number
        animations: spine.Map<Viewport>
        transitionTime: number
    }

    /* Optional: whether the canvas should be transparent. Default: false. */
    alpha: boolean

    /* Optional: the background color. Must be given in the format #rrggbbaa. Default: #000000ff. */
    backgroundColor: string

    /* Optional: callback when the widget and its assets have been successfully loaded. */
    success: (widget: Player) => void

    /* Optional: callback when the widget could not be loaded. */
    error: (widget: Player, msg: string) => void
}

export class Player {
    static HOVER_COLOR_INNER = new spine.Color(0.478, 0, 0, 0.25)
    static HOVER_COLOR_OUTER = new spine.Color(1, 1, 1, 1)
    static NON_HOVER_COLOR_INNER = new spine.Color(0.478, 0, 0, 0.5)
    static NON_HOVER_COLOR_OUTER = new spine.Color(1, 0, 0, 0.8)

    private sceneRenderer!: spine.webgl.SceneRenderer
    private dom!: HTMLElement
    private canvas!: HTMLCanvasElement
    private config!: PlayerConfig

    private context!: spine.webgl.ManagedWebGLRenderingContext
    private assetManager!: spine.webgl.AssetManager

    // Whether the skeleton was loaded
    public loaded: boolean = false
    // The loaded skeleton
    public skeleton!: spine.Skeleton
    // The animation state controlling the skeleton
    public animationState!: spine.AnimationState

    public scale = 1

    private paused = false
    private playTime = 0
    private speed = 1
    private time = new spine.TimeKeeper()
    private currentViewport!: Viewport
    private previousViewport!: Viewport
    private viewportTransitionStart = 0
    private parent: HTMLElement

    private devicePixelRatio = window.devicePixelRatio || 1
    private lastFrameTime: number = 0
    private disposed = false
    private eventListeners: {
        target: HTMLElement | Document | Window
        event: keyof HTMLElementEventMap
        func: (this: HTMLElement, ev: Event) => any
    }[] = []

    constructor(parent: HTMLElement | string, config: Partial<PlayerConfig>) {
        if (typeof parent === 'string')
            this.parent = document.getElementById(parent)!
        else this.parent = parent
        const style = document.createElement('style')
        style.appendChild(
            document.createTextNode(`
                .spine-player {
                    box-sizing: border-box;
                    width: 100%;
                    height: 100%;
                    background: none;
                    position: relative;
                }
                .spine-player-error {
                    font-size: 14px;
                    display: flex;
                    justify-content: center;
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: black;
                    z-index: 10;
                    overflow: auto;
                }
                .spine-player-hidden {
                    display: none;
                }
                .spine-player canvas {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            `)
        )
        document.head.appendChild(style)
        this.parent.appendChild(this.render(config))
    }

    private validateConfig(config: Partial<PlayerConfig>): PlayerConfig {
        if (!config)
            throw new Error(
                'Please pass a configuration to new.spine.SpinePlayer().'
            )
        if (!config.jsonUrl && !config.skelUrl)
            throw new Error(
                'Please specify the URL of the skeleton JSON or .skel file.'
            )
        if (!config.atlasUrl)
            throw new Error('Please specify the URL of the atlas file.')

        if (config.animations && config.animation) {
            if (config.animations.indexOf(config.animation) < 0)
                throw new Error(
                    "Default animation '" +
                        config.animation +
                        "' is not contained in the list of selectable animations " +
                        escapeHtml(JSON.stringify(this.config.animations)) +
                        '.'
                )
        }

        if (config.skins && config.skin) {
            if (config.skins.indexOf(config.skin) < 0)
                throw new Error(
                    "Default skin '" +
                        config.skin +
                        "' is not contained in the list of selectable skins " +
                        escapeHtml(JSON.stringify(this.config.skins)) +
                        '.'
                )
        }

        const fullConfig: PlayerConfig = {
            jsonUrl: config.jsonUrl,
            skelUrl: config.skelUrl,
            atlasUrl: config.atlasUrl,
            rawDataURIs: config.rawDataURIs,
            alpha: config.alpha ? config.alpha : false,
            backgroundColor: config.backgroundColor
                ? config.backgroundColor
                : '#000000',
            premultipliedAlpha:
                typeof config.premultipliedAlpha === 'undefined'
                    ? true
                    : config.premultipliedAlpha,
            fps: config.fps ? config.fps : 60,
            scale: config.scale ? config.scale : 1,
            success: config.success ? config.success : (_widget) => {},
            error: config.error ? config.error : (_widget, _msg) => {},
            defaultMix:
                typeof config.defaultMix === 'undefined'
                    ? 0.25
                    : config.defaultMix,
            animations: config.animations,
            animation: config.animation,
            skin: config.skin,
            skins: config.skins,
            viewport: config.viewport!, // could be undefined, but doesnt matter
        }

        return fullConfig
    }

    private showError(error: string) {
        let errorDom = findWithClass(this.dom, 'spine-player-error')[0]
        errorDom.classList.remove('spine-player-hidden')
        errorDom.innerHTML = `<p style="text-align: center; align-self: center;">${error}</p>`
        this.config.error(this, error)
    }

    private render(config: Partial<PlayerConfig>): HTMLElement {
        let dom = (this.dom = createElement(`
            <div class="spine-player">
                <canvas class="spine-player-canvas"></canvas>
                <div class="spine-player-error spine-player-hidden"></div>
            </div>
        `))

        try {
            // Validate the configuration
            this.config = this.validateConfig(config)
        } catch (e: any) {
            this.showError(e)
            return dom
        }

        try {
            // Setup the scene renderer and OpenGL context
            this.canvas = findWithClass(
                dom,
                'spine-player-canvas'
            )[0] as HTMLCanvasElement
            var webglConfig = { alpha: this.config.alpha }
            this.context = new spine.webgl.ManagedWebGLRenderingContext(
                this.canvas,
                webglConfig
            )
            // Setup the scene renderer and loading screen
            this.sceneRenderer = new spine.webgl.SceneRenderer(
                this.canvas,
                this.context,
                true
            )
        } catch (e) {
            this.showError(
                'Sorry, your browser does not support WebGL.<br><br>Please use the latest version of Firefox, Chrome, Edge, or Safari.'
            )
            return dom
        }

        // Load the assets
        this.assetManager = new spine.webgl.AssetManager(this.context)
        if (this.config.rawDataURIs) {
            for (let path in this.config.rawDataURIs) {
                let data = this.config.rawDataURIs[path]
                this.assetManager.setRawDataURI(path, data)
            }
        }
        if (this.config.jsonUrl) this.assetManager.loadText(this.config.jsonUrl)
        else this.assetManager.loadBinary(this.config.skelUrl!)
        this.assetManager.loadTextureAtlas(this.config.atlasUrl)

        // Setup rendering loop
        requestAnimationFrame(() => this.drawFrame())

        // Register a global resize handler to redraw and avoid flicker
        this.addEventListener(window, 'resize', () => this.drawFrame(false))

        return dom
    }

    private resize = (resizeMode: spine.webgl.ResizeMode) => {
        const w = this.canvas.clientWidth
        const h = this.canvas.clientHeight
        if (
            this.canvas.width != Math.floor(w * this.devicePixelRatio) ||
            this.canvas.height != Math.floor(h * this.devicePixelRatio)
        ) {
            this.canvas.width = Math.floor(w * this.devicePixelRatio)
            this.canvas.height = Math.floor(h * this.devicePixelRatio)
        }
        this.context.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
        if (resizeMode === spine.webgl.ResizeMode.Stretch) {
        } else if (resizeMode === spine.webgl.ResizeMode.Expand) {
            this.sceneRenderer.camera.setViewport(w, h)
        } else if (resizeMode === spine.webgl.ResizeMode.Fit) {
            var sourceWidth = this.canvas.width,
                sourceHeight = this.canvas.height
            var targetWidth = this.sceneRenderer.camera.viewportWidth,
                targetHeight = this.sceneRenderer.camera.viewportHeight
            var targetRatio = targetHeight / targetWidth
            var sourceRatio = sourceHeight / sourceWidth
            var scale =
                targetRatio < sourceRatio
                    ? targetWidth / sourceWidth
                    : targetHeight / sourceHeight
            this.sceneRenderer.camera.viewportWidth = sourceWidth * scale
            this.sceneRenderer.camera.viewportHeight = sourceHeight * scale
        }
        this.sceneRenderer.camera.update()
    }

    private drawFrame(requestNextFrame = true) {
        if (this.disposed) return
        if (requestNextFrame) requestAnimationFrame(() => this.drawFrame())

        // Have we finished loading the asset? Then set things up
        if (this.assetManager.isLoadingComplete() && this.skeleton == null)
            this.loadSkeleton()

        // Resize the canvas
        this.resize(spine.webgl.ResizeMode.Expand)

        // Update and draw the skeleton

        if (this.loaded) {
            const fpsInterval = 1 / this.config.fps
            const now = performance.now() / 1000
            // Update animation and skeleton based on user selections
            if (
                !this.paused &&
                this.config.animation &&
                now - this.lastFrameTime > fpsInterval
            ) {
                let ctx = this.context
                let gl = ctx.gl

                // Clear the viewport
                let bg = new spine.Color().setFromString(
                    this.config.backgroundColor
                )
                gl.clearColor(bg.r, bg.g, bg.b, bg.a)
                gl.clear(gl.COLOR_BUFFER_BIT)

                this.lastFrameTime = now
                this.time.update()
                let delta = this.time.delta * this.speed

                let animationDuration =
                    this.animationState.getCurrent(0).animation.duration
                this.playTime += delta
                while (
                    this.playTime >= animationDuration &&
                    animationDuration != 0
                ) {
                    this.playTime -= animationDuration
                }
                this.playTime = Math.max(
                    0,
                    Math.min(this.playTime, animationDuration)
                )

                this.animationState.update(delta)
                this.animationState.apply(this.skeleton)
            }

            this.skeleton.updateWorldTransform()

            let viewport = {
                x:
                    this.currentViewport.x -
                    (this.currentViewport.padLeft as number),
                y:
                    this.currentViewport.y -
                    (this.currentViewport.padBottom as number),
                width:
                    this.currentViewport.width +
                    (this.currentViewport.padLeft as number) +
                    (this.currentViewport.padRight as number),
                height:
                    this.currentViewport.height +
                    (this.currentViewport.padBottom as number) +
                    (this.currentViewport.padTop as number),
            }

            let transitionAlpha =
                (performance.now() - this.viewportTransitionStart) /
                1000 /
                this.config.viewport.transitionTime
            if (this.previousViewport && transitionAlpha < 1) {
                let oldViewport = {
                    x:
                        this.previousViewport.x -
                        (this.previousViewport.padLeft as number),
                    y:
                        this.previousViewport.y -
                        (this.previousViewport.padBottom as number),
                    width:
                        this.previousViewport.width +
                        (this.previousViewport.padLeft as number) +
                        (this.previousViewport.padRight as number),
                    height:
                        this.previousViewport.height +
                        (this.previousViewport.padBottom as number) +
                        (this.previousViewport.padTop as number),
                }

                viewport = {
                    x:
                        oldViewport.x +
                        (viewport.x - oldViewport.x) * transitionAlpha,
                    y:
                        oldViewport.y +
                        (viewport.y - oldViewport.y) * transitionAlpha,
                    width:
                        oldViewport.width +
                        (viewport.width - oldViewport.width) * transitionAlpha,
                    height:
                        oldViewport.height +
                        (viewport.height - oldViewport.height) *
                            transitionAlpha,
                }
            }

            let viewportSize = this.scaleViewport(
                viewport.width,
                viewport.height,
                this.canvas.width,
                this.canvas.height
            )

            this.sceneRenderer.camera.zoom =
                ((viewport.width * this.devicePixelRatio) / viewportSize.x) *
                this.scale
            this.sceneRenderer.camera.position.x =
                viewport.x + viewport.width / 2
            this.sceneRenderer.camera.position.y =
                viewport.y + viewport.height / 2

            this.sceneRenderer.begin()

            // Draw skeleton and debug output
            this.sceneRenderer.drawSkeleton(
                this.skeleton,
                this.config.premultipliedAlpha
            )

            this.sceneRenderer.end()

            this.sceneRenderer.camera.zoom = 0
        }
    }

    private scaleViewport(
        sourceWidth: number,
        sourceHeight: number,
        targetWidth: number,
        targetHeight: number
    ): spine.Vector2 {
        let targetRatio = targetHeight / targetWidth
        let sourceRatio = sourceHeight / sourceWidth
        let scale =
            targetRatio > sourceRatio
                ? targetWidth / sourceWidth
                : targetHeight / sourceHeight
        let temp = new spine.Vector2()
        temp.x = sourceWidth * scale
        temp.y = sourceHeight * scale
        return temp
    }

    private loadSkeleton() {
        if (this.loaded) return

        if (this.assetManager.hasErrors()) {
            this.showError(
                'Error: assets could not be loaded.<br><br>' +
                    escapeHtml(JSON.stringify(this.assetManager.getErrors()))
            )
            return
        }

        let atlas = this.assetManager.get(this.config.atlasUrl)
        let skeletonData: spine.SkeletonData
        if (this.config.jsonUrl) {
            let jsonText = this.assetManager.get(this.config.jsonUrl)
            let json = new spine.SkeletonJson(
                new spine.AtlasAttachmentLoader(atlas)
            )
            try {
                skeletonData = json.readSkeletonData(jsonText)
            } catch (e: any) {
                this.showError(
                    'Error: could not load skeleton .json.<br><br>' +
                        e.toString()
                )
                return
            }
        } else {
            let binaryData = this.assetManager.get(this.config.skelUrl!)
            let binary = new spine.SkeletonBinary(
                new spine.AtlasAttachmentLoader(atlas)
            )
            try {
                skeletonData = binary.readSkeletonData(binaryData)
            } catch (e: any) {
                this.showError(
                    'Error: could not load skeleton .skel.<br><br>' +
                        e.toString()
                )
                return
            }
        }
        this.skeleton = new spine.Skeleton(skeletonData)
        let stateData = new spine.AnimationStateData(skeletonData)
        stateData.defaultMix = this.config.defaultMix
        this.animationState = new spine.AnimationState(stateData)

        // Setup skin
        if (!this.config.skin) {
            if (skeletonData.skins.length > 0) {
                this.config.skin = skeletonData.skins[0].name
            }
        }

        if (
            this.config.skins &&
            this.config.skin &&
            this.config.skin.length > 0
        ) {
            this.config.skins.forEach((skin) => {
                if (!this.skeleton.data.findSkin(skin)) {
                    this.showError(
                        `Error: skin '${skin}' in selectable skin list does not exist in skeleton.`
                    )
                    return
                }
            })
        }

        if (this.config.skin) {
            if (!this.skeleton.data.findSkin(this.config.skin)) {
                this.showError(
                    `Error: skin '${this.config.skin}' does not exist in skeleton.`
                )
                return
            }
            this.skeleton.setSkinByName(this.config.skin)
            this.skeleton.setSlotsToSetupPose()
        }

        // Setup empty viewport if none is given and check
        // if all animations for which viewports where given
        // exist.
        if (!this.config.viewport) {
            ;(this.config.viewport as any) = {
                animations: {},
                transitionTime: 0.2,
            }
        }

        if (typeof this.config.viewport.transitionTime === 'undefined')
            this.config.viewport.transitionTime = 0.2
        if (!this.config.viewport.animations) {
            this.config.viewport.animations = {}
        } else {
            Object.getOwnPropertyNames(this.config.viewport.animations).forEach(
                (animation: string) => {
                    if (!skeletonData.findAnimation(animation)) {
                        this.showError(
                            `Error: animation '${animation}' for which a viewport was specified does not exist in skeleton.`
                        )
                        return
                    }
                }
            )
        }

        // Setup the animations after viewport, so default bounds don't get messed up.
        if (this.config.animations && this.config.animations.length > 0) {
            this.config.animations.forEach((animation) => {
                if (!this.skeleton.data.findAnimation(animation)) {
                    this.showError(
                        `Error: animation '${animation}' in selectable animation list does not exist in skeleton.`
                    )
                    return
                }
            })

            if (!this.config.animation) {
                this.config.animation = this.config.animations[0]
            }
        }

        if (!this.config.animation) {
            if (skeletonData.animations.length > 0) {
                this.config.animation = skeletonData.animations[0].name
            }
        }

        if (this.config.animation) {
            if (!skeletonData.findAnimation(this.config.animation)) {
                this.showError(
                    `Error: animation '${this.config.animation}' does not exist in skeleton.`
                )
                return
            }
            this.play()
        }

        this.config.success(this)
        this.lastFrameTime = performance.now() / 1000
        this.loaded = true
    }

    public play() {
        this.paused = false

        if (this.config.animation) {
            if (!this.animationState.getCurrent(0)) {
                this.setAnimation(this.config.animation)
            }
        }
    }

    public pause() {
        this.paused = true
    }

    public setAnimation(animation: string, loop: boolean = true) {
        // Determine viewport
        this.previousViewport = this.currentViewport
        let animViewport = this.calculateAnimationViewport(animation)

        // The calculated animation viewport is the base
        let viewport: Viewport = {
            x: animViewport.x,
            y: animViewport.y,
            width: animViewport.width,
            height: animViewport.height,
            padLeft: '10%',
            padRight: '10%',
            padTop: '10%',
            padBottom: '10%',
        }

        // Override with global viewport settings if they exist
        let globalViewport = this.config.viewport
        if (
            typeof globalViewport.x !== 'undefined' &&
            typeof globalViewport.y !== 'undefined' &&
            typeof globalViewport.width !== 'undefined' &&
            typeof globalViewport.height !== 'undefined'
        ) {
            viewport.x = globalViewport.x
            viewport.y = globalViewport.y
            viewport.width = globalViewport.width
            viewport.height = globalViewport.height
        }
        if (typeof globalViewport.padLeft !== 'undefined')
            viewport.padLeft = globalViewport.padLeft
        if (typeof globalViewport.padRight !== 'undefined')
            viewport.padRight = globalViewport.padRight
        if (typeof globalViewport.padTop !== 'undefined')
            viewport.padTop = globalViewport.padTop
        if (typeof globalViewport.padBottom !== 'undefined')
            viewport.padBottom = globalViewport.padBottom

        // Override with animation viewport settings given by user for final result.
        let userAnimViewport = this.config.viewport.animations[animation]
        if (userAnimViewport) {
            if (
                typeof userAnimViewport.x !== 'undefined' &&
                typeof userAnimViewport.y !== 'undefined' &&
                typeof userAnimViewport.width !== 'undefined' &&
                typeof userAnimViewport.height !== 'undefined'
            ) {
                viewport.x = userAnimViewport.x
                viewport.y = userAnimViewport.y
                viewport.width = userAnimViewport.width
                viewport.height = userAnimViewport.height
            }
            if (typeof userAnimViewport.padLeft !== 'undefined')
                viewport.padLeft = userAnimViewport.padLeft
            if (typeof userAnimViewport.padRight !== 'undefined')
                viewport.padRight = userAnimViewport.padRight
            if (typeof userAnimViewport.padTop !== 'undefined')
                viewport.padTop = userAnimViewport.padTop
            if (typeof userAnimViewport.padBottom !== 'undefined')
                viewport.padBottom = userAnimViewport.padBottom
        }

        // Translate percentage paddings to world units
        viewport.padLeft = this.percentageToWorldUnit(
            viewport.width,
            viewport.padLeft
        )
        viewport.padRight = this.percentageToWorldUnit(
            viewport.width,
            viewport.padRight
        )
        viewport.padBottom = this.percentageToWorldUnit(
            viewport.height,
            viewport.padBottom
        )
        viewport.padTop = this.percentageToWorldUnit(
            viewport.height,
            viewport.padTop
        )

        // Adjust x, y, width, and height by padding.
        this.currentViewport = viewport
        this.viewportTransitionStart = performance.now()

        this.animationState.clearTracks()
        this.skeleton.setToSetupPose()
        this.animationState.setAnimation(0, animation, loop)
    }

    private percentageToWorldUnit(
        size: number,
        percentageOrAbsolute: string | number
    ): number {
        if (typeof percentageOrAbsolute === 'string') {
            return (
                (size *
                    parseFloat(
                        percentageOrAbsolute.substr(
                            0,
                            percentageOrAbsolute.length - 1
                        )
                    )) /
                100
            )
        } else {
            return percentageOrAbsolute
        }
    }

    private calculateAnimationViewport(animationName: string) {
        let animation = this.skeleton.data.findAnimation(animationName)
        this.animationState.clearTracks()
        this.skeleton.setToSetupPose()
        this.animationState.setAnimationWith(0, animation, true)

        let steps = 100
        let stepTime = animation.duration > 0 ? animation.duration / steps : 0
        let minX = 100000000
        let maxX = -100000000
        let minY = 100000000
        let maxY = -100000000
        let offset = new spine.Vector2()
        let size = new spine.Vector2()

        for (var i = 0; i < steps; i++) {
            this.animationState.update(stepTime)
            this.animationState.apply(this.skeleton)
            this.skeleton.updateWorldTransform()
            this.skeleton.getBounds(offset, size)

            if (
                !isNaN(offset.x) &&
                !isNaN(offset.y) &&
                !isNaN(size.x) &&
                !isNaN(size.y)
            ) {
                minX = Math.min(offset.x, minX)
                maxX = Math.max(offset.x + size.x, maxX)
                minY = Math.min(offset.y, minY)
                maxY = Math.max(offset.y + size.y, maxY)
            } else {
                console.log('Bounds of animation ' + animationName + ' are NaN')
            }
        }

        offset.x = minX
        offset.y = minY
        size.x = maxX - minX
        size.y = maxY - minY

        return {
            x: offset.x,
            y: offset.y,
            width: size.x,
            height: size.y,
        }
    }

    private addEventListener(
        target: HTMLElement | Document | Window,
        event: keyof HTMLElementEventMap,
        func: (this: HTMLElement, ev: Event) => any
    ) {
        this.eventListeners.push({ target: target, event: event, func: func })
        target.addEventListener(event, func)
    }

    public dispose() {
        this.sceneRenderer.dispose()
        this.assetManager.dispose()
        for (var i = 0; i < this.eventListeners.length; i++) {
            var eventListener = this.eventListeners[i]
            eventListener.target.removeEventListener(
                eventListener.event,
                eventListener.func
            )
        }
        this.disposed = true
    }

    public updateViewport(viewport: Viewport) {
        var _currentViewport = this.currentViewport
        _currentViewport.padLeft = this.percentageToWorldUnit(
            _currentViewport.width,
            viewport.padLeft
        )
        _currentViewport.padRight = this.percentageToWorldUnit(
            _currentViewport.width,
            viewport.padRight
        )
        _currentViewport.padBottom = this.percentageToWorldUnit(
            _currentViewport.height,
            viewport.padBottom
        )
        _currentViewport.padTop = this.percentageToWorldUnit(
            _currentViewport.height,
            viewport.padTop
        )
        this.currentViewport = _currentViewport
    }

    get fps() {
        return this.config.fps
    }

    set fps(v) {
        this.config.fps = v
    }
}

const findWithClass = (dom: HTMLElement, className: string): HTMLElement[] => {
    let found = new Array<HTMLElement>()
    let findRecursive = (
        dom: HTMLElement,
        className: string,
        found: HTMLElement[]
    ) => {
        for (var i = 0; i < dom.children.length; i++) {
            let child = dom.children[i] as HTMLElement
            if (child.classList.contains(className)) found.push(child)
            findRecursive(child, className, found)
        }
    }
    findRecursive(dom, className, found)
    return found
}

const createElement = (html: string): HTMLElement => {
    let dom = document.createElement('div')
    dom.innerHTML = html
    return dom.children[0] as HTMLElement
}

const escapeHtml = (str: string) => {
    if (!str) return ''
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&#34;')
        .replace(/'/g, '&#39;')
}
