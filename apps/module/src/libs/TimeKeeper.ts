/**
 * Adapted from 'spine-ts/core/src/Utils.ts'
 */
export class TimeKeeper {
    framesPerSecond = 0
    delta = 0
    totalTime = 0

    private lastTime = performance.now() / 1000
    private frameCount = 0
    private frameTime = 0
    private fpsInterval = 1 / 60

    update() {
        const now = performance.now() / 1000
        this.delta = now - this.lastTime
        if (this.delta > this.fpsInterval) {
            this.frameTime += this.delta
            this.totalTime += this.delta
            this.lastTime = now

            this.frameCount++
            if (this.frameTime > 1) {
                this.framesPerSecond = this.frameCount / this.frameTime
                this.frameTime = 0
                this.frameCount = 0
            }
        } else {
            this.delta = -1
        }
    }
    setFps(v: number) {
        this.fpsInterval = 1 / v
    }
}
