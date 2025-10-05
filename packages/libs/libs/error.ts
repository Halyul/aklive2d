export const handle = (err: string[]) => {
    if (err?.length > 0) {
        const str = `${err.length} error${err.length > 1 ? 's were' : ' was'} found:\n${err.join('\n')}`
        throw new Error(str)
    }
}
