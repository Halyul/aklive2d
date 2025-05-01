import process from 'node:process'

type Args = {
    [name: string]: {
        type?: string
        default?: unknown
        multiple?: boolean
        short?: string
    }
}

export const parse = (args: Args) => {
    const envVars = process.env
    const argKeys = Object.keys(args)
    const values: Record<string, unknown | unknown[]> = {}
    argKeys.map((key) => {
        let noInput = false
        let value: unknown
        const type = args[key].type || 'string',
            defaultVal = args[key].default,
            multiple = args[key].multiple || false,
            short = args[key].short
        value = short
            ? envVars[short]
                ? envVars[short]
                : envVars[key]
            : envVars[key]
        if (!value) noInput = true
        value = noInput ? defaultVal : value
        if (noInput) {
            values[key] = value
        } else {
            const cValue = multiple ? (value as string).split(',') : value
            if (multiple) {
                values[key] = (cValue as string[]).map((item: string) =>
                    typeCast(type, item)
                )
            } else {
                values[key] = typeCast(type, value)
            }
        }
    })
    return values
}

const typeCast = (type: 'number' | 'boolean' | string, value: unknown) => {
    switch (type) {
        case 'number':
            return Number(value)
        case 'boolean':
            return Boolean(value)
        default:
            return value
    }
}
