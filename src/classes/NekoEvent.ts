import { ClientEvents } from "discord.js";
import { NekoClient } from "../core/NekoClient.js";

export type EventHandler<T extends keyof ClientEvents> = (this: NekoClient, ...args: ClientEvents[T]) => void | Promise<void>

export class NekoEvent<T extends keyof ClientEvents = keyof ClientEvents> {
    public handle!: EventHandler<T>;
    public listener!: T;

    // eslint-disable-next-line no-useless-constructor
    constructor(public readonly once: boolean) {}

    setListener<K extends keyof ClientEvents>(listener: K) {
        this.listener = listener as unknown as T;
        return this as unknown as NekoEvent<K>;
    }

    setHandle(fn: EventHandler<T>) {
        this.handle = fn;
        return this;
    }
}
