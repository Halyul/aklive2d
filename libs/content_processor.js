export default class Matcher {
  #start
  #end
  #reExp
  #config
  #assets

  constructor(start, end, config, assets) {
    this.#start = start
    this.#end = end
    this.#reExp = new RegExp(`${start}.+?${end}`, 'g')
    this.#config = config
    this.#assets = assets
  }

  get result() {
    const matches = this.content.match(this.#reExp)
    if (matches !== null) {
      matches.forEach((match) => {
        const name = match.replace(this.#start, '').replace(this.#end, '')
        const result = (new Function(
          'Evalable',
          'config',
          'assets',
          `return new Evalable(config, assets).${name}`)
        )(Evalable, this.#config, this.#assets)
        this.content = matches.length > 1 ? this.content.replace(match, result) : result
      })
    }
    return this.content
  }
}

class Evalable {
  #config
  #assets

  constructor(config, assets) {
    this.#config = config
    this.#assets = assets
  }

  split(location, varName, separator) {
    return this.#step(location, varName).split(separator)
  }

  var(location, varName) {
    return this.#step(location, varName)
  }

  version(prefix, suffix) {
    return `${prefix}${__config.version.showcase}${suffix}`
  }

  #step(location, varName) {
    let content = this.#config
    if (location === 'assets') content = this.#assets
    varName.split("->").forEach((item) => {
      try {
        content = content[item]
      } catch (e) {
        throw new Error(`Cannot step ${varName}.`)
      }
    })
    return content
  }
}