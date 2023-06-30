import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { NekoArg } from "../../classes/NekoArg.js";
import { NekoCommand } from "../../classes/NekoCommand.js";
import { NekoCommandError } from "../../classes/NekoCommandError.js";
import { CustomArgType } from "../custom/bool.js";

export default new NekoCommand()
    .setName('uwu')
    .setDescription('yes bro')
    .setCooldown(15000)
    .setExtras(i => {
        return {
            userId: i.user.id 
        }
    })
    .addArg(
        new NekoArg("bro")
            .setDescription('yes')
            .integer.optional
            .setAutocomplete((i, value) => {
                if (!value) return []
                return [
                    {
                        name: value,
                        value: +value || 0
                    }
                ]
            })
    )
    .setHandle(async function(input, args, extras) {
        console.log(args, extras)
        await input.reply({
            ephemeral: true, 
            content: `hello`,
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId('gm')
                    .setLabel('Yo')
                    .setStyle(ButtonStyle.Primary)
                )
            ] 
        })
        return true
    })