export class Util {
    static generateBar(
        fill: string,
        empty: string,
        current: number,
        max: number,
        length: number
    ) {
        const filledCount = Math.max(Math.min(Math.round(current * length / max), 10), 0);
        return fill.repeat(filledCount) + empty.repeat(length - filledCount);
    }
}
