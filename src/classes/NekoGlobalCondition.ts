import { EventHandler, NekoClient, SendableArgs } from "../index.js";

export class NekoGlobalCondition {
    // eslint-disable-next-line no-useless-constructor
    public constructor(
        public readonly handle: (this: NekoClient, ...params: Parameters<EventHandler<"interactionCreate">>) => SendableArgs | true | Promise<true>
    ) {}
}
