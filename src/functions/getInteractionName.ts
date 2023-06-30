import { Interaction } from "discord.js";
import { NekoInteractionEvent } from "../classes/NekoInteractionEvent.js";

export default function getInteractionName(i: Interaction<'cached'>) {
    if (i.isCommand()) {
        return i.isChatInputCommand() ? i.options.getSubcommandGroup(false) ?? i.options.getSubcommand(false) ?? i.commandName : i.commandName
    } else {
        const customId = Reflect.get(i, 'customId') as string | undefined
        return customId ?? NekoInteractionEvent.getInteractionType(i)!
    }
}