import { envParser } from "@aklive2d/libs";

async function main() {
    const { mode } = envParser.parse({
        mode: {
            type: "string",
            short: "m",
        }
    })
    if (!mode) {
        throw new Error("Please set the mode.")
    }
}

main()