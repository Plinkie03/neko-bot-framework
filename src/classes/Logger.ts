import { LoggingType } from "../typings/enums/LoggingType.js";
import chalk from "chalk";

export class Logger {
    public static readonly Colors = {
        [LoggingType.Debug]: chalk.gray.gray,
        [LoggingType.Info]: chalk.cyan.bold,
        [LoggingType.Error]: chalk.red.bold,
        [LoggingType.Warning]: chalk.yellow.bold
    };

    private static log(
        type: LoggingType,
        ...args: unknown[]
    ) {
        const color = Logger.Colors[type];
        console.log(chalk.green.bold(new Date().toLocaleString()), color(`[${type}]`), ...args);
    }

    public static info(...args: unknown[]) {
        return this.log(LoggingType.Info, ...args);
    }

    public static debug(...args: unknown[]) {
        return this.log(LoggingType.Debug, ...args);
    }

    public static warn(...args: unknown[]) {
        return this.log(LoggingType.Warning, ...args);
    }

    public static error(...args: unknown[]) {
        return this.log(LoggingType.Error, ...args);
    }
}
