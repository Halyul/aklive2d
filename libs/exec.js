import { execSync } from 'child_process'
import { createServer, build } from 'vite'

export function buildAll(config) {
    for (const [key, _] of Object.entries(config.operators)) {
        if (key.startsWith('_')) break;
        console.log(execSync(`node runner.js --build ${key}`).toString());
    }
}

export function runDev(rootDir) {
    ; (async () => {
        const server = await createServer({
            root: rootDir,
        })
        await server.listen()

        server.printUrls()
    })()
}

export function runBuild(rootDir) {
    ; (async () => {
        await build({
            root: rootDir,
        })
    })()
}