import { AutocompleteInteraction, ButtonInteraction, ChannelSelectMenuInteraction, ContextMenuCommandInteraction, Interaction, MentionableSelectMenuInteraction, ModalSubmitInteraction, RoleSelectMenuInteraction, StringSelectMenuInteraction, UserSelectMenuInteraction } from "discord.js";
import { NekoClient } from "../core/NekoClient.js";

export interface InteractionTypes {
    button: ButtonInteraction<"cached">
    stringMenu: StringSelectMenuInteraction<"cached">
    roleMenu: RoleSelectMenuInteraction<"cached">
    contextMenu: ContextMenuCommandInteraction<"cached">
    modal: ModalSubmitInteraction<"cached">
    channelMenu: ChannelSelectMenuInteraction<"cached">
    userMenu: UserSelectMenuInteraction<"cached">
    autocomplete: AutocompleteInteraction<"cached">
    mentionableMenu: MentionableSelectMenuInteraction<"cached">
}

interface INekoInteractionEventData<T extends keyof InteractionTypes, Extras> {
    listener: T
    extras?: (this: NekoClient, i: InteractionTypes[T]) => Awaited<Extras>
    handle: (this: NekoClient, i: InteractionTypes[T], extras: Extras) => void | Promise<void>
    check?: (this: NekoClient, i: InteractionTypes[T]) => boolean | Promise<boolean>
    startsWith?: string
    endsWith?: string

    /**
     * If set to true this will defer as ephemeral
     *
     * False for not ephemeral
     */
    defer?: boolean
    deferUpdate?: boolean
    includes?: string
    ownerOnly?: string
    equals?: string

    /**
     * Must match one of the regexes
     */
    matches?: RegExp[]
}

export class NekoInteractionEvent<T extends keyof InteractionTypes = keyof InteractionTypes, Extras = undefined> {
    public data = {} as INekoInteractionEventData<T, Extras>;

    constructor(listener?: T) {
        if (listener) this.data.listener = listener;
    }

    equals(str: string) {
        this.data.equals = str;
        return this;
    }

    setMatches(...regexes: RegExp[]) {
        this.data.matches = regexes;
        return this;
    }

    startsWith(str: string) {
        this.data.startsWith = str;
        return this;
    }

    endsWith(str: string) {
        this.data.endsWith = str;
        return this;
    }

    includes(str: string) {
        this.data.includes = str;
        return this;
    }

    setHandle(fn: INekoInteractionEventData<T, Extras>["handle"]) {
        this.data.handle = fn;
        return this;
    }

    setCheck(fn: INekoInteractionEventData<T, Extras>["check"]) {
        this.data.check = fn;
        return this;
    }

    deferUpdate() {
        this.data.deferUpdate = true;
        return this;
    }

    defer(ephemeral: boolean = false) {
        this.data.defer = ephemeral;
        return this;
    }

    setExtras<Extras>(fn: INekoInteractionEventData<T, Extras>["extras"]): NekoInteractionEvent<T, Extras> {
        this.data.extras = fn as unknown as INekoInteractionEventData<T, any>["extras"];
        return this.cast();
    }

    setListener<V extends keyof InteractionTypes>(listener: V): NekoInteractionEvent<V, Extras> {
        this.data.listener = listener as unknown as T;
        return this.cast();
    }

    private cast<T extends keyof InteractionTypes, Extras>() {
        return this as unknown as NekoInteractionEvent<T, Extras>;
    }

    static getInteractionType(input: Interaction<"cached">): keyof InteractionTypes | null {
        return input.isContextMenuCommand() ? "contextMenu" :
            input.isButton() ? "button" :
                input.isAutocomplete() ? "autocomplete" :
                    input.isChannelSelectMenu() ? "channelMenu" :
                        input.isMentionableSelectMenu() ? "mentionableMenu" :
                            input.isRoleSelectMenu() ? "roleMenu" :
                                input.isUserSelectMenu() ? "userMenu" :
                                    input.isStringSelectMenu() ? "stringMenu" :
                                        input.isModalSubmit() ? "modal" :
                                            null;
    }
}
