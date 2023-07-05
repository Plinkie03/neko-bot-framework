import { Locale } from "discord.js";

export class Formatters {
    public static Intl = new Intl.NumberFormat(Locale.EnglishUS);

    public static number(int: number | bigint) {
        return this.Intl.format(int);
    }

    public static multiplier(int: number | bigint) {
        return `${this.number(int)}x`;
    }

    public static percentage(p: number) {
        return `${p.toFixed(2).replace(/\.00$/g, "")}%`;
    }

    public static setOptions(options: Intl.NumberFormatOptions) {
        this.Intl = Intl.NumberFormat(Locale.EnglishUS, options);
    }
}
