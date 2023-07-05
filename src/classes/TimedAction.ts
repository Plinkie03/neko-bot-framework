export class TimedAction {
    private timer: NodeJS.Timeout;

    // eslint-disable-next-line no-useless-constructor
    public constructor(
        public readonly fn: () => void | Promise<void>,
        public readonly timeout: number,
        public readonly repeat = false
    ) {
        this.timer = setTimeout(this.onTimeout.bind(this), timeout);
    }

    private onTimeout() {
        this.fn();
        if (this.repeat) this.refresh();
    }

    refresh() {
        this.timer.refresh();
    }
}
