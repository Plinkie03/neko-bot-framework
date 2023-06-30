import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js"
import { NekoClient } from "../core/NekoClient.js"

export class NekoArgType<T = any, V = any> {
    public type!: T
    public realType!: ApplicationCommandOptionType
    public handle!: (this: NekoClient, input: ChatInputCommandInteraction<'cached'>, value: string | null | boolean | number) => V | Promise<V>

    constructor() {}

    setType<T>(type: T) {
        Reflect.set(this, 'type', type)
        return this.cast<T, V>()
    }

    setRealType(type: ApplicationCommandOptionType) {
        Reflect.set(this, 'realType', type)
        return this
    }

    setHandle<V>(fn: NekoArgType<T, V>['handle']) {
        Reflect.set(this, 'handle', fn)
        return this.cast<T, V>()
    }

    private cast<T, V>(): NekoArgType<T, V> {
        return this as unknown as NekoArgType<T, V>
    }
}