import type { OperatorConfig, Codename } from '@aklive2d/operator/types'
import type { Assets } from '../types.ts'

export default class Matcher {
    #start
    #end
    #reExp
    #config
    #assets
    content: string = ''

    constructor(
        start: string,
        end: string,
        config: OperatorConfig,
        assets: Assets
    ) {
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
                const name = match
                    .replace(this.#start, '')
                    .replace(this.#end, '')
                const result = new Function(
                    'Evalable',
                    'config',
                    'assets',
                    `return new Evalable(config, assets).${name}`
                )(Evalable, this.#config, this.#assets)
                this.content =
                    matches.length > 1
                        ? this.content.replace(match, result)
                        : result
            })
        }
        return this.content
    }
}

class Evalable {
    #config
    #assets

    constructor(config: OperatorConfig, assets: Assets) {
        this.#config = config
        this.#assets = assets
    }

    split(location: 'config' | 'assets', varName: string, separator: string) {
        return (this.#step(location, varName) as string).split(separator)
    }

    var(location: 'config' | 'assets', varName: string) {
        return this.#step(location, varName)
    }

    #step(
        location: 'config' | 'assets',
        varName: string
    ):
        | OperatorConfig
        | Assets
        | string
        | number
        | boolean
        | Codename
        | string[] {
        let content:
            | OperatorConfig
            | Assets
            | string
            | number
            | boolean
            | Codename
            | string[] = this.#config
        if (location === 'assets') content = this.#assets
        varName.split('->').forEach((item) => {
            try {
                if (location === 'config') {
                    content = (content as OperatorConfig)[
                        item as keyof OperatorConfig
                    ]
                } else {
                    content = (content as Assets)[item as keyof Assets]
                }
            } catch (e: unknown) {
                throw new Error(`Cannot step ${varName}. ${e}`)
            }
        })
        return content
    }
}
