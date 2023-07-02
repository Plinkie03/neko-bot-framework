import { GatewayIntentBits } from "discord.js";
import { NekoClient } from "../../src/index.js";

const client = new NekoClient({
    intents: [
        GatewayIntentBits.Guilds
    ],
    paths: {
        commands: "./commands",
        events: "./events"
    },
    useCommandHandler: true,
    useInteractionHandler: true,
    registerCommandsOnReady: true
});

client.login("token");
