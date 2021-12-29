import { writeFile } from "fs";
import path from "path";
import { promisify } from "util";

(async () => {
  const srcPath = path.join(__dirname, "..", "src");
  const constantFile = path.join(srcPath, "constant.ts");
  const assemblyConstantFile = path.join(srcPath, "assembly", "constants", "op.ts");
  const m = await import(constantFile);
  const c = m.default;

  const functions = c.functions as Map<string, number>;
  const content = Array.from(functions).map(([name, symbol]) => `export const ${name}Op = ${symbol};`).join("\n");

  await promisify(writeFile)(assemblyConstantFile, content);
})();
