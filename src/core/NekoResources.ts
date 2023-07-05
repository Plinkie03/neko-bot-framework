import { readdirSync } from "fs";

export type ClassInstance<T> = T extends new (...args: any[]) => infer P ? P : never;
export type ClassType = new (...args: any[]) => any;

export class NekoResources {
    static async loadAllFiles<T extends [...ClassType[]]>(path: string, ...classes: [...T]) {
        const tree = readdirSync(path, { recursive: true, withFileTypes: true });
        const results = new Array<ClassInstance<T[number]>>();

        for (const file of tree) {
            if (file.isDirectory()) {
                results.push(...await this.loadAllFiles<T>(file.path, ...classes));
            } else {
                results.push(...await this.loadFile<T>(file.path, file.name, ...classes));
            }
        }

        return results;
    }

    static async loadFile<T extends [...ClassType[]]>(path: string, filename: string, ...classes: [...T]): Promise<ClassInstance<T[number]>[]> {
        if (!filename.endsWith(".js")) return [];
        const imports = await import(`file://${process.cwd()}//${path}/${filename}`);
        if (typeof imports !== "object") return [];
        else if (imports.default && classes.some(x => imports.default instanceof x)) return [ imports.default ];
        else if (!Array.isArray(imports)) {
            return Object.values(imports.default).filter(x => classes.some(y => x instanceof y)) as ClassInstance<T[number]>[];
        }
        else if (classes.some(x => imports instanceof x)) return imports;
        return [];
    }
}
