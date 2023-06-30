import { NekoInteractionEvent } from "../classes/NekoInteractionEvent.js";

const event = new NekoInteractionEvent()
    .setListener('button')
    .setExtras(i => i.customId.split(/_/g))
    .setHandle(function(btn, extras) {
        
    })