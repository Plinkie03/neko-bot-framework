import { Locale } from "discord.js";
import { NekoCommand } from "../classes/NekoCommand.js";
import { NekoArg } from "../classes/NekoArg.js";

const cmd = new NekoCommand()
    .setName("attack")
    .setDescription("Attacks the closest user in your zone")
    .addArg(NekoArg.string("bro"))
    .setHandle(function(input, args) {
        return true;
    });
