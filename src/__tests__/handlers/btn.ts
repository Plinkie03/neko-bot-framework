import { NekoInteractionEvent } from "../../classes/NekoInteractionEvent.js";

export default new NekoInteractionEvent('button')
    .equals('gm')
    .setHandle(async (i) => {
        await i.reply({
            ephemeral: true,
            content: 'gm'
        })
    })