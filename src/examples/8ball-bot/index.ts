import { GatewayIntentBits } from "discord.js";
import { NekoClient } from "../../index.js";

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
