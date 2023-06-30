import { Client } from "discord.js";
import { NekoClient } from "../core/NekoClient.js";

export default function<T extends unknown & { client: Client }>(v: T): NekoClient {
    return v.client as NekoClient
}