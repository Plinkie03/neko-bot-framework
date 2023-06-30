import { ChatInputCommandInteraction, Interaction } from "discord.js";
import { SendableArgs } from "../core/NekoClient.js";
import getNekoClient from "./getNekoClient.js";
import { NekoCommandError } from "../classes/NekoCommandError.js";
import getInteractionName from "./getInteractionName.js";

export default async function handleError(input: Interaction<'cached'>, error: unknown) {
    const client = getNekoClient(input)
    const name = getInteractionName(input)

    const reply = async (args?: SendableArgs) => {
        if (!args) return;

        if (input.isRepliable()) {
            if (!input.replied) {
                await input.reply(args)
            } else {
                await input.editReply(args)
            }
        }
    }

    if (error instanceof NekoCommandError) {
        const msg = await client.options.factories?.knownErrorMessage?.call(client, input, name, error)
        await reply(msg)
    } else if (error instanceof Error) {
        const msg = await client.options.factories?.unknownErrorMessage?.call(client, input, name, error)
        await reply(msg)
    } 
}