import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle } from "discord.js";
import { NekoArg } from "../../classes/NekoArg.js";
import { NekoCommand } from "../../classes/NekoCommand.js";
import { NekoCommandError } from "../../classes/NekoCommandError.js";
import { CustomArgType } from "../custom/bool.js";

enum Uwu {
    Owo = "one",
    Three = "three"
}

export default new NekoCommand()
    .setName("uwu")
    .setDescription("yes bro")
    .setCooldown(15000)
    .setExtras(i => {
        return {
            userId: i.user.id
        };
    })
    .defer(false)
    .addArg(
        new NekoArg("bro")
            .setDescription("yes")
            .setEnum(Uwu).optional
    )
    .setHandle(async function(input, args, extras) {
        await input.editReply("cope");
        return true;
    });
