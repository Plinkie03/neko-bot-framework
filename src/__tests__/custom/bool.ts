import { ApplicationCommandOptionType } from "discord.js";
import { NekoArgType } from "../../classes/NekoArgType.js";

export enum CustomArgType { Bool = "bool" }

export default new NekoArgType()
    .setType(CustomArgType.Bool)
    .setRealType(ApplicationCommandOptionType.Boolean)
    .setHandle(function(input, raw) {
        return Boolean(raw);
    });
