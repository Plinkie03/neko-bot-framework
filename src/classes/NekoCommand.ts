import { ApplicationCommandOptionType, ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction, Collection, Locale, PermissionsString } from "discord.js";
import { NekoArg } from "./NekoArg.js";
import { NekoClient, SendableArgs } from "../core/NekoClient.js";
import { NekoCommandError } from "./NekoCommandError.js";
import { handleInteractionError as handleError } from "../functions/handleInteractionError.js";
import { replyInteraction } from "../functions/replyInteraction.js";

export type GetArgsRecord<T> = {
    [P in GetArgsData<T>[number] as P[0]]: P[1]
}

export type GetArgsData<T> = T extends [
    infer L,
    ...infer R
] ? [
    L extends NekoArg<infer Name, infer Type> ? [ Name, Type ] : never,
    ...GetArgsData<R>
] : []

export type CommandConditionFn<Args extends [...NekoArg[]], Extras> = (this: NekoClient, input: ChatInputCommandInteraction<"cached">, command: NekoCommand<Args, Extras>, extras: Extras) => Promise<boolean | SendableArgs> | boolean | SendableArgs

export interface ICommandData<Args extends [...NekoArg[]], Extras> {
    name: string
    description: string
    nsfw: boolean
    permissions?: PermissionsString[]
    defer?: boolean
    dmAllowed?: boolean
    conditions: CommandConditionFn<Args, Extras>[]
    cooldown?: number | ((this: NekoClient, input: ChatInputCommandInteraction<"cached">, command: NekoCommand<Args, Extras>) => number | Promise<number>)
    extras?: (this: NekoClient, input: ChatInputCommandInteraction<"cached">, command: NekoCommand<Args, Extras>) => Extras
    args?: [...Args]
    handle: (this: NekoClient, input: ChatInputCommandInteraction<"cached">, args: GetArgsRecord<Args>, extras: Extras) => boolean | Promise<boolean>
}

export class NekoCommand<Args extends [...NekoArg[]] = [], Extras = any> {
    public static readonly Error = NekoCommandError;
    public readonly data = {} as ICommandData<Args, Extras>;
    public cooldowns = new Collection<string, number>();

    setExtras<Extras>(cb: ICommandData<Args, Extras>["extras"]) {
        this.data.extras = cb as any;
        return this as unknown as NekoCommand<Args, Extras>;
    }

    /**
     * Toggles nsfw only channel for this command
     */
    get nsfw() {
        this.data.nsfw = true;
        return this;
    }

    /**
     * Toggles dm permission for this command.
     */
    get dmAllowed() {
        this.data.dmAllowed = true;
        return this;
    }

    /**
     * The name of the command
     * @param n
     * @returns
     */
    setName(n: string) {
        this.data.name = n;
        return this;
    }

    /**
     * The cooldown in milliseconds for this command before an user can run it again.
     * @param n
     * @returns
     * @example <NekoCommand>.setCooldown(TimeParser.parseToMS("1m"))
     */
    setCooldown(n: ICommandData<Args, Extras>["cooldown"]) {
        this.data.cooldown = n;
        return this;
    }

    addArg<Name extends string, Type>(arg: NekoArg<Name, Type>) {
        if (!this.data.args) this.data.args = [] as unknown as Args;
        this.data.args.push(arg);

        return this as unknown as NekoCommand<[
            ...Args,
            NekoArg<Name, Type>
        ], Extras>;
    }

    /**
     * Sets the description for this command.
     * @param desc
     * @returns
     */
    setDescription(desc: string) {
        this.data.description = desc;
        return this;
    }

    /**
     * The function that will be called when a user executes this command.
     * @param fn
     * @returns
     */
    setHandle(fn: ICommandData<Args, Extras>["handle"]) {
        this.data.handle = fn;
        return this;
    }

    /**
     * The conditions to meet for an user before the handle is executed.
     *
     * To meet a condition the function has to return true.
     *
     * To reject the condition, the function has to return false (for no command response) or a message response that will be used to reply to this interaction.
     * @param conditions
     */
    setConditions(...conditions: CommandConditionFn<Args, Extras>[]) {
        this.data.conditions = conditions;
        return this;
    }

    /**
     * The permissions an user must have to view/execute this command.
     * @param perms
     * @returns
     */
    setPermissions(...perms: PermissionsString[]) {
        this.data.permissions = perms;
        return this;
    }

    /**
     * The cooldown time left for an user.
     * @param userId
     * @param cooldown The cooldown of the command, this has to be given because the command cooldown might be dynamic.
     * @returns
     */
    getCooldownTimeLeft(userId: string, cooldown: number) {
        if (!cooldown) return 0;

        const endsAt = this.cooldowns.get(userId);

        if (!endsAt) return 0;

        return Math.max(endsAt - Date.now(), 0);
    }

    hasCooldown(userId: string, cooldown: number) {
        /**
         * We do not care about those cooldowns that are under a second.
         */
        return this.getCooldownTimeLeft(userId, cooldown) >= 1e3;
    }

    deleteCooldown(userId: string) {
        return this.cooldowns.delete(userId);
    }

    addCooldown(userId: string, cooldown: number) {
        this.cooldowns.set(userId, Date.now() + cooldown);
        return true;
    }

    /**
     * Defers all the command responses.
     * @param ephemeral
     * @returns
     */
    defer(ephemeral: boolean) {
        this.data.defer = ephemeral;
        return this;
    }

    toJSON(client: NekoClient, type?: ApplicationCommandOptionType): ChatInputApplicationCommandData {
        const data: ChatInputApplicationCommandData = {
            type: ApplicationCommandType.ChatInput,
            defaultMemberPermissions: this.data.permissions,
            name: this.data.name,
            dmPermission: this.data.dmAllowed,
            nsfw: this.data.nsfw,
            description: this.data.description,
            options: this.data.args?.map(x => x.toJSON(client))
        };

        if (type) Reflect.set(data, "type", type);

        return data;
    }

    static async handle(input: ChatInputCommandInteraction<"cached">) {
        const client = input.client as NekoClient;
        const command = client.manager.getCommand(input);
        if (!command) return;

        try {
            if (command.data.defer !== undefined) {
                await input.deferReply({ ephemeral: command.data.defer });
            }

            const cd = typeof command.data.cooldown === "function" ? await command.data.cooldown.call(client, input, command) : command.data.cooldown;

            if (cd) {
                if (command.hasCooldown(input.user.id, cd)) {
                    const error = await client.options.factories?.cooldownMessage?.call(client, input, command.data.name, command.getCooldownTimeLeft(input.user.id, cd));
                    if (!error) return;
                    await replyInteraction(input, error);
                    return;
                }

                command.deleteCooldown(input.user.id);
            }

            const args = await NekoArg.handle<{}>(input, command.data.args);
            if (args === null) return;

            const extras = await command.data.extras?.call(client, input, command);

            if (command.data.conditions.length) {
                for (const condition of command.data.conditions) {
                    const res = await condition.call(client, input, command, extras);
                    if (res !== true) {
                        if (!res) return;
                        return void await replyInteraction(input, res);
                    }
                }
            }

            const res = await command.data.handle.call(client, input, args, extras);

            if (res) {
                if (cd) command.addCooldown(input.user.id, cd);
            }
        } catch (error) {
            await handleError(input, error);
        }
    }
}
