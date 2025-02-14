import process from "node:process"

export const parse = (args) => {
    const envVars = process.env
    const argKeys = Object.keys(args)
    const values = {}
    argKeys.map((key) => {
        let noInput = false
        let value, type = args[key].type || "string", defaultVal = args[key].default, multiple = args[key].multiple || false, short = args[key].short;
        value = envVars[key] || envVars[short];
        if (!value) noInput = true
        value = noInput ? defaultVal : value
        if (noInput) {
            values[key] = value
        } else {
            value = (multiple) ? value.split(',') : value
            if (multiple) {
                values[key] = []
                value.map(item => {
                    values[key].push(typeCast(type, item))
                })
            } else {
                values[key] = typeCast(type, value)
            }
        }
    })
    return values
}

const typeCast = (type, value) => {
    switch (type) {
        case "number":
            return Number(value)
        case "boolean":
            return Boolean(value)
        default:
            return value
    }
}