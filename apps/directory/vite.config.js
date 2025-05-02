import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import config from '@aklive2d/config'
import * as showcaseDirs from '@aklive2d/showcase'
import { copyDirectoryData } from '@aklive2d/vite-helpers'

// https://vite.dev/config/
export default defineConfig(async () => {
    const dataDir = path.resolve(import.meta.dirname, config.dir_name.data)
    const releaseDir = path.resolve(showcaseDirs.DIST_DIR)
    await copyDirectoryData({ dataDir, publicDir: releaseDir })
    return {
        envDir: dataDir,
        plugins: [react()],
        publicDir: releaseDir,
        resolve: {
            alias: {
                '@': path.resolve('./src'),
                '!': dataDir,
            },
        },
        build: {
            emptyOutDir: false,
            outDir: path.resolve(
                import.meta.dirname,
                '..',
                '..',
                config.dir_name.dist
            ),
            rollupOptions: {
                output: {
                    entryFileNames: `${config.app.directory.assets}/[name].js`,
                    chunkFileNames: `${config.app.directory.assets}/[name].js`,
                    assetFileNames: `${config.app.directory.assets}/[name].[ext]`,
                    manualChunks: (id) => {
                        if (id.includes('node_modules')) {
                            return 'vendor' // all other package goes here
                        } else if (
                            id.includes('data') &&
                            id.includes('.json')
                        ) {
                            return 'assets'
                        }
                    },
                },
            },
        },
    }
})
