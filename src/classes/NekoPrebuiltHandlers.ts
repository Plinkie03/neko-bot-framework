import { ChatInputCommandInteraction, EmbedBuilder, Interaction, codeBlock } from "discord.js";
import getNekoClient from "../functions/getNekoClient.js";
import { NekoCommand } from "./NekoCommand.js";
import { TimeParser } from "../constants.js";
import { IFactoriesData, NekoClient, SendableArgs } from "../core/NekoClient.js";
import { inspect } from "util";
import { NekoInteractionEvent } from "./NekoInteractionEvent.js";
import { NekoArg } from "./NekoArg.js";
import { EventHandler } from "./NekoEvent.js";
import handleError from "../functions/handleInteractionError.js";

export class NekoPrebuiltHandlers {
    private constructor() {}

    static async interactionHandler(...[ input ]: Parameters<EventHandler<'interactionCreate'>>) {
        if (input.inCachedGuild()) {
            const type = NekoInteractionEvent.getInteractionType(input)
            if (!type) return;

            const client = getNekoClient(input)

            const handlers = client.manager.getInteractionHandlers(type) 

            if (!handlers?.length) return;

            const customId = Reflect.get(input, 'customId') as string | undefined

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
                    if (handler.data.defer !== undefined) await input.deferReply({ ephemeral: handler.data.defer })
                    else if (handler.data.deferUpdate !== undefined && 'deferUpdate' in input) await input.deferUpdate()
                }

                try {
                    await handler.data.handle.call(client, input as any, await handler.data.extras?.call(client, input as any))
                } catch (error) {
                    await handleError(input, error)
                    console.error(error)
                } finally {
                    break;
                }
            }
        }
    }

    static async commandHandler(...[ input ]: Parameters<EventHandler<'interactionCreate'>>) {
        if (input.inCachedGuild()) {
            if (input.isChatInputCommand()) await NekoCommand.handle(input)
            else if (input.isAutocomplete()) await NekoArg.handleAutocomplete(input)
        }
    }

    static async registerCommands(...[ raw ]: Parameters<EventHandler<'ready'>>) {
        const client = raw as NekoClient;
        await client.application.commands.set(client.manager.getJSONCommands())
    }

    static knownErrorMessage(...[ input, command, error ]: Parameters<IFactoriesData['knownErrorMessage']>): SendableArgs {
        return {
            embeds: [
                new EmbedBuilder()
                .setColor('Red')
                .setTimestamp()
                .setAuthor({
                    name: input.user.username,
                    iconURL: input.user.displayAvatarURL()
                })
                .setTitle('Command Error')
                .setDescription(error.message)
            ]
        }
    }

    static unknownErrorMessage(...[ input, command, error ]: Parameters<IFactoriesData['unknownErrorMessage']>): SendableArgs {
        return {
            embeds: [
                new EmbedBuilder()
                .setColor('Red')
                .setTimestamp()
                .setAuthor({
                    name: input.user.username,
                    iconURL: input.user.displayAvatarURL()
                })
                .setTitle('Unknown Error')
                .setDescription(`An error has occurred whilst executing \`${command}\`:\n${codeBlock('js', error.message)}\nThe developers have been notified.`)
            ]
        }
    }

    static cooldownMessage(...[ input, command, timeLeft ]: Parameters<IFactoriesData['cooldownMessage']>): SendableArgs {
        return {
            ephemeral: true,
            embeds: [
                new EmbedBuilder()
                .setColor('Red')
                .setAuthor({
                    name: input.user.username,
                    iconURL: input.user.displayAvatarURL()
                })
                .setTimestamp()
                .setDescription(`You will be able to use \`${command}\` again after \`${TimeParser.parseToString(timeLeft)}\``)
                .setTitle('Cooldown Active')
            ]
        }
    }
}