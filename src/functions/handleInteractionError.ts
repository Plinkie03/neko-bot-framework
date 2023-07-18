import { Interaction } from "discord.js";
import { SendableArgs } from "../core/NekoClient.js";
import { getNekoClient } from "./getNekoClient.js";
import { NekoCommandError } from "../classes/NekoCommandError.js";
import { getInteractionName } from "./getInteractionName.js";
import { replyInteraction } from "./replyInteraction.js";
import { Logger } from "../index.js";

export async function handleInteractionError(input: Interaction<"cached">, error: unknown) {
    const client = getNekoClient(input);
    const name = getInteractionName(input);

    const reply = async (args?: Awaited<SendableArgs>) => {
        if (!args) return;
        return replyInteraction(input, args);
    };

    if (error instanceof NekoCommandError) {
        const msg = await client.options.factories?.knownErrorMessage?.call(client, input, name, error);
        await reply(msg);
    } else if (error instanceof Error) {
        const msg = await client.options.factories?.unknownErrorMessage?.call(client, input, name, error);
        await reply(msg);
    }

    Logger.error(error);
}
