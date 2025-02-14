import { build, update } from "./index.js";
import { envParser, error } from "@aklive2d/libs"

async function main() {
    let err = [];
    const { mode, name } = envParser.parse({
        mode: {
            type: "string",
            short: "m",
        },
        name: {
            type: "string",
            short: "n",
            multiple: true,
            default: []
        }
    })
    switch (mode) {
        case "build":
            err = await build(name)
            break
        case "update":
            await update()
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
    error.handle(err)
}

main()