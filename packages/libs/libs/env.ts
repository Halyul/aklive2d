export function generate(
    values: {
        key: string
        value: string
    }[]
) {
    return values
        .map((value) => {
            return `VITE_${value.key.toUpperCase()}=${value.value}`
        })
        .join('\n')
}
