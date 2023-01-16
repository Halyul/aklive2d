export default class Matcher {
  #start
  #end
  #content
  #reExp
  #config

  constructor(content, start, end, config) {
    this.#start = start
    this.#end = end
    this.#content = content
    this.#reExp = new RegExp(`\\${start}.+?${end}`, 'g')
    this.#config = config
  }

  match() {
    return this.#content.match(this.#reExp)
  }

  process() {
    const matches = this.match()
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
              this.#content = this.#content.replace(match, replaceValue)
            })
            break
          case 'func':
            try {
              this.#content = this.#content.replace(match, (new Function('Evalable', 'config', `return new Evalable(config).${name}`))(Evalable, this.#config))
            } catch (e) {
              throw new Error(e)
            }
            break
          default:
            throw new Error(`Cannot find type ${type}.`)
        }
      })
    }
    return this.#content
  }
}

class Evalable {
  #config

  constructor(config) {
    this.#config = config
  }

  split(varName, separator) {
    varName.split("->").forEach((item) => {
      try {
        this.#config = this.#config[item]
      } catch (e) {
        throw new Error(`Cannot split ${varName} with separator ${separator}.`)
      }
    })
    return this.#config.split(separator)
  }
}