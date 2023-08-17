import { ApplicationCommandData, ApplicationCommandOptionType, ApplicationCommandType, AutocompleteInteraction, ChatInputApplicationCommandData, ChatInputCommandInteraction, ClientEvents, Collection } from "discord.js";
import { NekoClient } from "./NekoClient.js";
import { NekoResources } from "./NekoResources.js";
import { NekoCommand } from "../classes/NekoCommand.js";
import { lstatSync, readdirSync } from "fs";
import { NekoArgType } from "../classes/NekoArgType.js";
import { NekoEvent } from "../classes/NekoEvent.js";
import { NekoPrebuiltHandlers } from "../classes/NekoPrebuiltHandlers.js";
import { InteractionTypes, NekoInteractionEvent } from "../classes/NekoInteractionEvent.js";
import { NekoGlobalCondition } from "../classes/NekoGlobalCondition.js";

export class NekoManager {
    private readonly globalConditions = new Array<NekoGlobalCondition>();
    private readonly interactionHandlers = new Collection<keyof InteractionTypes, NekoInteractionEvent[]>();
    private readonly events = new Collection<keyof ClientEvents, NekoEvent[]>();
    private readonly customArgTypes = new Collection<unknown, NekoArgType>();
    private readonly commands = new Collection<
        string,
        NekoCommand |
        // subcommand
        Collection<
            string,
            NekoCommand |
            // subcommands from group
            Collection<
                string,
                NekoCommand
            >
        >
    >();

    [x: string]: unknown;

    // eslint-disable-next-line no-useless-constructor
    constructor(public readonly client: NekoClient) {}

    get<T>(key: string) {
        return this[key] as T;
    }

    public async register() {
        const { paths } = this.client.options;
        if (!paths) return;

        if (paths.argDefinitions) {
            await this.registerCustomArgTypes(paths.argDefinitions);
        }

        if (paths.interactionEvents) {
            await this.registerInteractionHandlers(paths.interactionEvents);
        }

        if (paths.commands) {
            await this.registerCommands(paths.commands);
        }

        if (paths.events) {
            await this.registerEvents(paths.events);
        }

        if (paths.globalConditions) {
            await this.registerGlobalConditions(paths.globalConditions);
        }
    }

    private async registerGlobalConditions(path: string) {
        this.globalConditions.push(...(await NekoResources.loadAllFiles(path, NekoGlobalCondition)));
    }

    private async registerInteractionHandlers(path: string) {
        const loaded = await NekoResources.loadAllFiles(path, NekoInteractionEvent);
        for (const handler of loaded) {
            this.interactionHandlers.ensure(handler.data.listener, () => []).push(handler as NekoInteractionEvent);
        }
    }

    private async registerEvents(path: string) {
        const loaded = await NekoResources.loadAllFiles(path, NekoEvent);

        for (const event of loaded) {
            this.client[event.once ? "once" : "on"](event.listener, event.handle.bind(this.client));
            this.events.ensure(event.listener, () => new Array()).push(event);
        }
    }

    private async registerCommands(path: string) {
        for (const mainFile of readdirSync(path)) {
            const mainFileStats = lstatSync(`${path}/${mainFile}`);
            if (mainFileStats.isDirectory()) {
                for (const subFile of readdirSync(`${path}/${mainFile}`)) {
                    const subFileStats = lstatSync(`${path}/${mainFile}/${subFile}`);
                    if (subFileStats.isDirectory()) {
                        for (const groupFile of readdirSync(`${path}/${mainFile}/${subFile}`)) {
                            const commands = await NekoResources.loadFile(`${path}/${mainFile}/${subFile}`, groupFile, NekoCommand) as NekoCommand[];
                            commands.forEach(
                                x => ((this.commands.ensure(mainFile, () => new Collection()) as Collection<string, Collection<string, NekoCommand>>).ensure(subFile, () => new Collection()) as Collection<string, NekoCommand>).set(x.data.name, x)
                            );
                        }
                    } else {
                        const commands = await NekoResources.loadFile(`${path}/${mainFile}`, subFile, NekoCommand) as NekoCommand[];
                        commands.forEach(
                            x => (this.commands.ensure(mainFile, () => new Collection()) as Collection<string, NekoCommand>).set(x.data.name, x)
                        );
                    }
                }
            } else {
                const commands = await NekoResources.loadFile(path, mainFile, NekoCommand) as NekoCommand[];
                commands.forEach(
                    x => this.commands.set(x.data.name, x)
                );
            }
        }
    }

    public getInteractionHandlers(type: keyof InteractionTypes) {
        return this.interactionHandlers.get(type) ?? null;
    }

    public getJSONCommands(): ChatInputApplicationCommandData[] {
        const got = new Array<ChatInputApplicationCommandData>();

        for (const [ key, value ] of this.commands) {
            if (value instanceof NekoCommand) got.push(value.toJSON(this.client));
            else if (value instanceof Collection) {
                const data: ApplicationCommandData = {
                    name: key,
                    description: "Unknown",
                    type: ApplicationCommandType.ChatInput,
                    options: []
                };

                for (const [ subKey, subValue ] of value) {
                    if (subValue instanceof NekoCommand) {
                        // @ts-ignore
                        data.options!.push(
                            subValue.toJSON(this.client, ApplicationCommandOptionType.Subcommand) as any
                        );
                    } else {
                        // @ts-ignore
                        data.options!.push({
                            name: subKey,
                            description: "Unknown",
                            type: ApplicationCommandOptionType.SubcommandGroup,
                            options: subValue.map(
                                x => x.toJSON(this.client, ApplicationCommandOptionType.Subcommand)
                            ) as any[]
                        });
                    }
                }

                got.push(data);
            }
        }

        return got;
    }

    private async registerCustomArgTypes(path: string) {
        const loaded = await NekoResources.loadAllFiles(path, NekoArgType);
        for (const load of loaded) this.customArgTypes.set(load.type, load);
    }

    getCommand(input: AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached">): NekoCommand | null
    getCommand(name: string, sub?: string | null, group?: string | null): NekoCommand | null
    getCommand(name: string | AutocompleteInteraction<"cached"> | ChatInputCommandInteraction<"cached">, sub?: string | null, group?: string | null): NekoCommand | null {
        if (name instanceof ChatInputCommandInteraction || name instanceof AutocompleteInteraction) {
            return this.getCommand(name.commandName, name.options.getSubcommand(false), name.options.getSubcommandGroup(false));
        }

        const command = this.commands.get(name);
        if (command) {
            if (command instanceof NekoCommand) return command;
            else {
                const col = command.get(group ?? sub!)!;
                if (col instanceof NekoCommand) return col ?? null;
                else return col.get(sub!) ?? null;
            }
        }

        return null;
    }

    getCustomArgType(customType: unknown) {
        const found = this.customArgTypes.get(customType);
        if (!found) throw new Error(`Custom arg handler not found for type ${customType}.`);
        return found;
    }
}
