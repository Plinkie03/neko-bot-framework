import { readdirSync } from "fs";

export class NekoResources {
    static async loadAllFiles<T>(path: string) {
        const tree = readdirSync(path, { recursive: true, withFileTypes: true });
        const results = new Array<T>();

        for (const file of tree) {
            if (file.isDirectory()) {
                results.push(...await this.loadAllFiles<T>(file.path));
            } else {
                results.push(...await this.loadFile<T>(file.path, file.name));
            }
        }

        return results;
    }

    static async loadFile<T>(path: string, filename: string): Promise<T[]> {
        const imports = await import(`file://${process.cwd()}//${path}/${filename}`);
        if (typeof imports !== "object") return [];
        else if (imports.default) return [ imports.default ];
        else if (!Array.isArray(imports)) {
            return Object.values(imports.default);
        }
        else return imports;
    }
}
