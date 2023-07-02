import { NekoCommand, TimeParser } from "../../../src/index.js";

export default new NekoCommand()
    .setName("ping")
    .setDescription("A very simple discord command!")
    .setCooldown(TimeParser.parseToMS("5s"))
    .setHandle(async function(i) {
        await i.reply({
            ephemeral: true,
            content: `Pong! ${this.ws.ping}ms`
        });

        return true;
    });
