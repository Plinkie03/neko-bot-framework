import { ApplicationCommandOptionType, Locale } from "discord.js";
import { NekoCommand } from "../classes/NekoCommand.js";
import { NekoArg } from "../classes/NekoArg.js";
import { NekoClient } from "../index.js";

const cmd = new NekoCommand()
    .setName("attack")
    .setDescription("Attacks the closest user in your zone")
    .addArg(NekoArg.string("bro"))
    .setHandle(function(input, args) {
        return true;
    });

enum Uwu {
    One = "one",
    Two = "two",
    Free = "free"
}

console.log(
    new NekoArg()
        .setName("bro")
        .setDescription("bro cope")
        .setEnum(Uwu)
        .toJSON({} as NekoClient)
);
