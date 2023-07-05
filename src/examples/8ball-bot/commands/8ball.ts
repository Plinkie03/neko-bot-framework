import { NekoArg, NekoCommand } from "../../../index.js";

const Responses = [
    "Maybe?",
    "Yes",
    "No",
    "Try again"
] as const;

export default new NekoCommand()
    .setName("eightball")
    .setDescription("I don't know what to say.")
    .setCooldown(1e4)
    .addArg(
        new NekoArg().string.required
            .setName("question")
            .setDescription("The question to ask me")
    )
    .defer(true)
    .setHandle(async function(i, { question }) {
        const response = Responses[Math.floor(Math.random() * Responses.length)];
        await i.editReply(response);
        return true;
    });
