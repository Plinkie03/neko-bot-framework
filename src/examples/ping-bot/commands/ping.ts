import { NekoCommand } from "../../../index.js";

export default new NekoCommand()
    .setName("ping")
    .setDescription("A very simple discord command!")
    .setCooldown(5e3)
    .setHandle(async function(i) {
        await i.reply({
            ephemeral: true,
            content: `Pong! ${this.ws.ping}ms`
        });

        return true;
    });
