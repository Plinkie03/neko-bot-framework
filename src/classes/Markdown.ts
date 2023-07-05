enum HeaderType {
    H1 = "#",
    H2 = "##",
    H3 = "###"
}

type InfiniteArray<T> = Array<T | InfiniteArray<T>>;

export class Markdown {
    public static header<T extends HeaderType, K extends string>(type: T, value: K) {
        return `${type} ${value}` as const;
    }

    public static bold<T extends string>(s: T) {
        return `**${s}**` as const;
    }

    public static underline<T extends string>(s: T) {
        return `__${s}__` as const;
    }

    public static strike<T extends string>(s: T) {
        return `~~${s}~~` as const;
    }

    public static codeBlock<L extends string, K extends string>(code: K): `\`\`\`\n${K}\n\`\`\``;
    public static codeBlock<L extends string, K extends string>(lang: L, code: K): `\`\`\`${L}\n${K}\n\`\`\``;
    public static codeBlock<L extends string, K extends string>(lang: L, code?: K) {
        if (!code) return `\`\`\`\n${lang}\n\`\`\`` as const;
        return `\`\`\`${lang}\n${code}\n\`\`\`` as const;
    }

    public static list(values: InfiniteArray<string>) {
        const result = new Array<string>();
        for (const value of values) {
            if (Array.isArray(value)) {
                result.push(...this.list(value).map(x => `  ${x}`));
            } else {
                result.push(`- ${value}`);
            }
        }

        return result;
    }

    public static enumeration(...values: string[]) {
        return values.map((x, y) => `${y + 1}. ${x}`);
    }
}
