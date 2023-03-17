export default class EnvGenerator {
  generate(values) {
    return values.map((value) => {
      return `VITE_${value.key.toUpperCase()}=${value.value}`
    }).join('\n')
  }
}