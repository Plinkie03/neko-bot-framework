import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const exports = new Array<string>();

for (const file of readdirSync("./src/", { recursive: true, withFileTypes: true })) {
    if (["__tests__", "examples"].some(x => file.path.includes(x)) || file.name === "index.ts") continue;
    if (file.isFile()) {
        exports.push(`export * from "./${join(file.path, file.name.replace(".ts", ".js")).replaceAll("\\", "/").replace("src/", "")}";`);
    }
}

writeFileSync("./src/index.ts", exports.join("\n") + "\n");
