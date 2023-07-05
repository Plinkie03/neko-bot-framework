import { ChatInputCommandInteraction, Client, ClientOptions, IntentsBitField, Interaction } from "discord.js";
import { NekoManager } from "./NekoManager.js";
import { NekoPrebuiltHandlers } from "../classes/NekoPrebuiltHandlers.js";
import { NekoCommand } from "../classes/NekoCommand.js";
import { NekoCommandError } from "../classes/NekoCommandError.js";
import { NekoArg } from "../index.js";
import { TimedAction } from "../classes/TimedAction.js";

export type SendableArgs = Exclude<Parameters<ChatInputCommandInteraction<"cached">["reply"]>[0], string>

export interface IPathsData {
    commands: string
    events: string
    interactionEvents: string
    argDefinitions: string
}

export interface IFactoriesData {
    argErrorMessage: (this: NekoClient, input: Interaction<"cached">, arg: NekoArg, name: string) => Promise<SendableArgs> | SendableArgs
    cooldownMessage: (this: NekoClient, input: Interaction<"cached">, name: string, timeLeft: number) => Promise<SendableArgs> | SendableArgs
    unknownErrorMessage: (this: NekoClient, input: Interaction<"cached">, name: string, error: Error) => Promise<SendableArgs> | SendableArgs
    knownErrorMessage: (this: NekoClient, input: Interaction<"cached">, name: string, error: NekoCommandError) => Promise<SendableArgs> | SendableArgs
}

export interface INekoClientOptions extends ClientOptions {
    paths?: Partial<IPathsData>
    factories?: Partial<IFactoriesData>
    registerCommandsOnReady?: boolean
    useCommandHandler?: boolean
    gcEvery?: number
    useInteractionHandler?: boolean
}

export class NekoClient extends Client<true> {
    public static readonly DefaultOptions: Partial<INekoClientOptions> = {
        factories: {
            argErrorMessage: NekoPrebuiltHandlers.argErrorMessage,
            knownErrorMessage: NekoPrebuiltHandlers.knownErrorMessage,
            unknownErrorMessage: NekoPrebuiltHandlers.unknownErrorMessage,
            cooldownMessage: NekoPrebuiltHandlers.cooldownMessage
        }
    };

    manager = new NekoManager(this);
    declare public options: (Omit<ClientOptions, "intents"> & { intents: IntentsBitField; }) & INekoClientOptions;

    constructor(options: INekoClientOptions) {
        super(options);
        this.options = {
            ...NekoClient.DefaultOptions,
            ...this.options
        };

        this.#setup();
    }

    #setup() {
        if (this.options.useCommandHandler) {
            this.on("interactionCreate", NekoPrebuiltHandlers.commandHandler.bind(this));
        }

        if (this.options.registerCommandsOnReady) {
            this.once("ready", NekoPrebuiltHandlers.registerCommands);
        }

        if (this.options.useInteractionHandler) {
            this.on("interactionCreate", NekoPrebuiltHandlers.interactionHandler);
        }

        if (this.options.gcEvery) {
            if (window.gc) {
                new TimedAction(
                    window.gc,
                    this.options.gcEvery,
                    true
                );
            } else {
                console.warn("`gcEvery` has been defined but the GC was not exposed to node.");
            }
        }
    }

    public async login(token?: string | undefined): Promise<string> {
        await this.manager.register();
        return await super.login(token);
    }
}
