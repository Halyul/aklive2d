export default class Matcher {
  #start
  #end
  #reExp
  #config
  #assets

  constructor(start, end, config, assets) {
    this.#start = start
    this.#end = end
    this.#reExp = new RegExp(`\\${start}.+?${end}`, 'g')
    this.#config = config
    this.#assets = assets
  }

  get result() {
    const matches = this.content.match(this.#reExp)
    if (matches !== null) {
      matches.forEach((match) => {
        const matchTypeName = match.replace(this.#start, '').replace(this.#end, '')
        const type = matchTypeName.split(':')[0]
        const name = matchTypeName.split(':')[1]
        switch (type) {
          case 'var':
            let replaceValue = this.#config
            name.split('->').forEach((item) => {
              try {
                replaceValue = replaceValue[item]
              } catch (e) {
                throw new Error(`Cannot find variable ${name}.`)
              }
              this.content = this.content.replace(match, replaceValue)
            })
            break
          case 'replaceFunc':
            try {
              this.content = this.content.replace(match, (new Function('Evalable', 'config', 'assets', `return new Evalable(config, assets).${name}`))(Evalable, this.#config, this.#assets))
            } catch (e) {
              throw new Error(e)
            }
            break
          case 'directFunc':
            this.content = (new Function('Evalable', 'config', 'assets', `return new Evalable(config, assets).${name}`))(Evalable, this.#config, this.#assets)
            break
          default:
            throw new Error(`Cannot find type ${type}.`)
        }
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

  getVar(location, varName) {
    return this.#step(location, varName)
  }

  #step(location, varName) {
    let content = this.#config
    varName.split("->").forEach((item) => {
      try {
        if (location === 'assets') content = this.#assets
        content = content[item]
      } catch (e) {
        throw new Error(`Cannot step ${varName}.`)
      }
    })
    return content
  }
}