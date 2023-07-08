import { ApplicationCommandOptionChoiceData, ApplicationCommandOptionData, ApplicationCommandOptionType, AutocompleteInteraction, ChannelType, ChatInputCommandInteraction } from "discord.js";
import { ArgType } from "../typings/enums/ArgType.js";
import { NekoClient } from "../core/NekoClient.js";
import { getNekoClient } from "../functions/getNekoClient.js";
import { handleInteractionError as handleError } from "../functions/handleInteractionError.js";
import { getInteractionName } from "../index.js";

export type EnumLike<T = any> = {
    [id: string]: T | string;
    [nu: number]: string;
};

export type GetEnum<T> = T extends EnumLike<infer P> ? P : never;

export interface IArgData {
    type: ArgType
    name: string
    customType: unknown
    realArgType: ApplicationCommandOptionType
    required?: boolean
    autocomplete?: (this: NekoClient, i: AutocompleteInteraction<"cached">, raw: string) => ApplicationCommandOptionChoiceData[] | Promise<ApplicationCommandOptionChoiceData[]>
    min?: number
    max?: number
    channelTypes?: ChannelType[]
    enum?: EnumLike
    default?: unknown
    description: string
}

export class NekoArg<Name extends string = string, Type = unknown> {
    public readonly data = {} as IArgData;

    constructor(name?: Name) {
        if (name) this.data.name = name;
    }

    static string<K extends string>(name: K) {
        return new this(name).string;
    }

    setName<T extends string>(name: T): NekoArg<T, Type> {
        this.data.name = name;
        return this.cast();
    }

    setAutocomplete(handler: IArgData["autocomplete"]) {
        this.data.autocomplete = handler;
        return this;
    }

    setDescription(desc: string) {
        this.data.description = desc;
        return this;
    }

    setEnum<T extends EnumLike>(en: T): NekoArg<Name, GetEnum<T>> {
        this.data.enum = en;
        this.data.type = ArgType.Enum;
        this.data.realArgType = Object.keys(en).some(x => !isNaN(Number(x))) ? ApplicationCommandOptionType.Integer : ApplicationCommandOptionType.String;
        return this.cast();
    }

    get required(): NekoArg<Name, Exclude<Type, null>> {
        this.data.required = true;
        return this.cast();
    }

    get optional(): NekoArg<Name, Type | null> {
        this.data.required = false;
        return this.cast();
    }

    get float(): NekoArg<Name, number> {
        this.data.type = ArgType.Float;
        this.data.realArgType = ApplicationCommandOptionType.Number;
        return this.cast();
    }

    get string(): NekoArg<Name, string> {
        this.data.type = ArgType.String;
        this.data.realArgType = ApplicationCommandOptionType.String;
        return this.cast();
    }

    get integer(): NekoArg<Name, number> {
        this.data.type = ArgType.Integer;
        this.data.realArgType = ApplicationCommandOptionType.Integer;
        return this.cast();
    }

    setCustom<Type>(customTypeName: unknown): NekoArg<Name, Type> {
        this.data.type = ArgType.Custom;
        this.data.customType = customTypeName;
        return this.cast();
    }

    setDefault(v: this["data"]["default"]): NekoArg<Name, Exclude<Type, null>> {
        this.data.default = v;
        return this.cast();
    }

    getRealArgType(client: NekoClient) {
        if (this.data.type === ArgType.Custom) {
            return client.manager.getCustomArgType(this.data.customType).realType;
        }
        return this.data.realArgType;
    }

    private cast<Name extends string, Type>(): NekoArg<Name, Type> {
        return this as unknown as NekoArg<Name, Type>;
    }

    public static async handleAutocomplete(input: AutocompleteInteraction<"cached">) {
        const client = getNekoClient(input);
        const command = client.manager.getCommand(input);
        if (!command) return;

        const { name, value } = input.options.getFocused(true);
        const arg = command.data.args?.find((x: NekoArg) => x.data.name === name) as NekoArg | undefined;
        if (!arg?.data.autocomplete) return;

        try {
            const choices = await arg.data.autocomplete.call(client, input, value)
            await input.respond(choices.slice(0, 25));
        } catch (error) {
            await handleError(input, error);
            console.error(error);
        }
    }

    public static async handle<T>(input: ChatInputCommandInteraction<"cached">, args?: NekoArg[] | null): Promise<T | null> {
        if (!args?.length) return {} as T;

        const result: Record<PropertyKey, unknown> = {};

        for (const arg of args) {
            const resolved = await arg.handle(input);
            if (resolved === undefined) return null;
            result[arg.data.name] = resolved;
        }

        return result as T;
    }

    public async handle(input: ChatInputCommandInteraction<"cached">) : Promise<Type | undefined> {
        const client = input.client as NekoClient;
        let value: unknown = null;

        switch (this.data.type) {
            case ArgType.Enum: {
                value = input.options[`get${this.data.realArgType === ApplicationCommandOptionType.String ? "String" : "Integer"}`](this.data.name, this.data.required);
                break;
            }

            case ArgType.Custom: {
                const got = input.options.get(this.data.name, this.data.required)?.value ?? null;
                if (got === null) break;
                value = await client.manager.getCustomArgType(this.data.customType).handle.call(client, input, got);
                break;
            }

            case ArgType.Float: {
                value = input.options.getNumber(this.data.name, this.data.required);
                break;
            }

            case ArgType.Integer: {
                value = input.options.getInteger(this.data.name, this.data.required);
                break;
            }

            case ArgType.String: {
                value = input.options.getString(this.data.name, this.data.required);
                break;
            }
        }

        if (value === null && this.data.default !== undefined) {
            value = typeof this.data.default === "function" ? await this.data.default.call(client, input) : this.data.default;
        }

        if (value === undefined) {
            const err = await client.options.factories?.argErrorMessage?.call(client, input, this, getInteractionName(input));
            if (err) await input[input.deferred ? "editReply" : "reply"](err);
            return value;
        }

        return value as Type;
    }

    setChannelTypes(...channels: ChannelType[]) {
        this.data.channelTypes = channels;
        return this;
    }

    setMin(n: number) {
        this.data.min = n;
        return this;
    }

    setMax(n: number) {
        this.data.max = n;
        return this;
    }

    toJSON(client: NekoClient) {
        return {
            name: this.data.name,
            description: this.data.description,
            autocomplete: !!this.data.autocomplete,
            required: this.data.required,
            min_length: this.data.min,
            max_length: this.data.max,
            max_value: this.data.max,
            min_value: this.data.min,
            choices: this.data.type === ArgType.Enum ? Object.keys(this.data.enum!).filter(x => isNaN(Number(x))).map(key => ({
                name: key,
                value: this.data.enum![key]
            })) : undefined,
            channelTypes: this.data.channelTypes,
            type: this.getRealArgType(client),
        } as ApplicationCommandOptionData;
    }
}
