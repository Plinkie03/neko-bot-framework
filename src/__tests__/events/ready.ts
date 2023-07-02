import { Events } from "discord.js";
import { NekoEvent } from "../../classes/NekoEvent.js";
export default new NekoEvent(true)
    .setListener(Events.ClientReady)
    .setHandle(async function() {
        console.log(`Ready on client ${this.user?.tag}`);
    });
