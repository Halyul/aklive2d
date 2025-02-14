import { envParser } from "@aklive2d/libs";
import { build } from "./index.js";

async function main() {
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
        },
    })
    switch (mode) {
        case "build":
            build(name)
            break
        default:
            throw new Error(`Unknown mode: ${mode}`)
    }
}

main()