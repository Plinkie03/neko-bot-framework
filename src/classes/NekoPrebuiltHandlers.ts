import { ApplicationCommandOptionType, ChatInputCommandInteraction, EmbedBuilder, Interaction, codeBlock } from "discord.js";
import { getNekoClient } from "../functions/getNekoClient.js";
import { NekoCommand } from "./NekoCommand.js";
import { IFactoriesData, NekoClient, SendableArgs } from "../core/NekoClient.js";
import { NekoInteractionEvent } from "./NekoInteractionEvent.js";
import { NekoArg } from "./NekoArg.js";
import { EventHandler } from "./NekoEvent.js";
import { handleInteractionError as handleError } from "../functions/handleInteractionError.js";
import { replyInteraction } from "../index.js";

export class NekoPrebuiltHandlers {
    // eslint-disable-next-line no-useless-constructor
    private constructor() {}

    static argErrorMessage(...[ input, arg, name ]: Parameters<Exclude<IFactoriesData["argErrorMessage"], undefined>>): SendableArgs {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Arg Error")
                    .setAuthor({
                        name: input.user.username,
                        iconURL: input.user.displayAvatarURL()
                    })
                    .setFields([
                        {
                            name: "Expected",
                            value: `${arg.data.customType ?? ApplicationCommandOptionType[arg.data.realArgType]}`
                        }
                    ])
                    .setTimestamp()
                    .setDescription(`Given value does not meet the argument criteria for \`${arg.data.name}\``)
                    .setFooter({
                        text: "Please supply a valid value!"
                    })
            ]
        };
    }

    private static async verifyGlobalConditions(...[ input ]: Parameters<EventHandler<"interactionCreate">>): Promise<boolean> {
        if (!input.inCachedGuild()) return false;
        const client = getNekoClient(input);
        // eslint-disable-next-line dot-notation
        for (const condition of client.manager["globalConditions"]) {
            const run = await condition.handle.call(client, input);
            if (run === true) continue;
            else if (run) {
                await replyInteraction(input, run);
            }
            return false;
        }
        return true;
    }

    static async interactionHandler(...[ input ]: Parameters<EventHandler<"interactionCreate">>) {
        if (input.inCachedGuild()) {
            if (!(await NekoPrebuiltHandlers.verifyGlobalConditions(input))) return;

            const type = NekoInteractionEvent.getInteractionType(input);
            if (!type) return;

            const client = getNekoClient(input);

            const handlers = client.manager.getInteractionHandlers(type);

            if (!handlers?.length) return;

            const customId = Reflect.get(input, "customId") as string | undefined;

            for (let i = 0, len = handlers.length;i < len;i++) {
                const handler = handlers[i];
                if (
                    (
                        customId && (
                            (handler.data.equals && customId !== handler.data.equals) ||
                            (handler.data.startsWith && !customId.startsWith(handler.data.startsWith)) ||
                            (handler.data.endsWith && !customId.endsWith(handler.data.endsWith)) ||
                            (handler.data.includes && !customId.includes(handler.data.includes)) ||
                            (handler.data.ownerOnly && !customId.includes(input.user.id)) ||
                            (handler.data.matches && !handler.data.matches.some(x => x.test(customId)))
                        )
                    ) || (
                        handler.data.check && !(await handler.data.check.call(client, input as any))
                    )
                ) continue;

                if (input.isRepliable()) {
                    if (handler.data.defer !== undefined) await input.deferReply({ ephemeral: handler.data.defer });
                    else if (handler.data.deferUpdate !== undefined && "deferUpdate" in input) await input.deferUpdate();
                }

                try {
                    await handler.data.handle.call(client, input as any, await handler.data.extras?.call(client, input as any));
                } catch (error) {
                    await handleError(input, error);
                } finally {
                    break;
                }
            }
        }
    }

    static async commandHandler(...[ input ]: Parameters<EventHandler<"interactionCreate">>) {
        if (input.inCachedGuild()) {
            if (!(await NekoPrebuiltHandlers.verifyGlobalConditions(input))) return;
            if (input.isChatInputCommand()) await NekoCommand.handle(input);
            else if (input.isAutocomplete()) await NekoArg.handleAutocomplete(input);
        }
    }

    static async registerCommands(...[ raw ]: Parameters<EventHandler<"ready">>) {
        const client = raw as NekoClient;
        await client.application.commands.set(client.manager.getJSONCommands());
    }

    static knownErrorMessage(...[ input, command, error ]: Parameters<IFactoriesData["knownErrorMessage"]>): SendableArgs {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTimestamp()
                    .setAuthor({
                        name: input.user.username,
                        iconURL: input.user.displayAvatarURL()
                    })
                    .setTitle("Command Error")
                    .setDescription(error.message)
            ]
        };
    }

    static unknownErrorMessage(...[ input, command, error ]: Parameters<IFactoriesData["unknownErrorMessage"]>): SendableArgs {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setTimestamp()
                    .setAuthor({
                        name: input.user.username,
                        iconURL: input.user.displayAvatarURL()
                    })
                    .setTitle("Unknown Error")
                    .setDescription(`An error has occurred whilst executing \`${command}\`:\n${codeBlock("js", error.message)}\nThe developers have been notified.`)
            ]
        };
    }

    static cooldownMessage(...[ input, command, timeLeft ]: Parameters<IFactoriesData["cooldownMessage"]>): SendableArgs {
        return {
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                    .setColor("Red")
                    .setAuthor({
                        name: input.user.username,
                        iconURL: input.user.displayAvatarURL()
                    })
                    .setTimestamp()
                    .setDescription(`You will be able to use \`${command}\` again after \`${(timeLeft / 1e3).toFixed(2)} seconds\``)
                    .setTitle("Cooldown Active")
            ]
        };
    }
}
