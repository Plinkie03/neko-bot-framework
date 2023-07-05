import { NekoEvent } from "../../../index.js";

export default new NekoEvent(true)
    .setListener("ready")
    .setHandle(function() {
        console.log(`Ready on client ${this.user.tag}!`);
    });
