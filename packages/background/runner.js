import { build } from "./index.js";
import { envParser, error } from "@aklive2d/libs"

async function main() {
    let err;
    const { mode } = envParser.parse({
        mode: {
            type: "string",
            short: "m",
        }
    })
    switch (mode) {
        case "build":
            err = await build()
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
    error.handle(err)
}

main()