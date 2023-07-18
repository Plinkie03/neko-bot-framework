import { Interaction } from "discord.js";
import { SendableArgs } from "../index.js";

export function replyInteraction(input: Interaction<"cached">, args: Awaited<SendableArgs>) {
    if (!args) return;
    if (input.isRepliable()) {
        if (!input.replied && !input.deferred) {
            return input.reply(args);
        } else {
            return input.editReply(args);
        }
    }
    return null;
}
