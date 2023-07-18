import { inspect } from "util";
import { NekoClient } from "../core/NekoClient.js";
import dotenv from "dotenv";
import { Locale } from "discord.js";

dotenv.config();

const client = new NekoClient({
    intents: [
        "Guilds"
    ],
    useInteractionHandler: true,
    gcEvery: 10_000,
    registerCommandsOnReady: true,
    paths: {
        interactionEvents: "./dist/__tests__/handlers",
        argDefinitions: "./dist/__tests__/custom",
        commands: "./dist/__tests__/commands",
        events: "./dist/__tests__/events"
    }
});

client.login(process.env.TOKEN);
