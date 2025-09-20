import { FactoryProvider } from "@nestjs/common/interfaces/modules/provider.interface";
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

export const WORKER_PATH_PROVIDER = Symbol("WORKER_PATH_PROVIDER");

export const WorkerPathProvider: FactoryProvider<string> = {
  provide: WORKER_PATH_PROVIDER,
  useFactory: async () => {
    // Determine module format by checking package.json
    let isESM = false;
    try {
      const packageJsonPath = resolve(process.cwd(), "package.json");
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
        isESM = packageJson.type === "module";
      }
    } catch {
      // Fallback: check if module is undefined (ESM context)
      isESM = typeof module === "undefined";
    }

    // Determine file extension (TypeScript vs JavaScript)
    const isTypeScript = __filename.endsWith(".ts");
    const extension = isTypeScript ? "ts" : "js";

    // Select worker file based on module format
    const workerName = isESM
      ? "run-with-piscina.worker"
      : "run-with-piscina.worker.cjs";
    const workerPath = resolve(__dirname, `./${workerName}.${extension}`);

    if (existsSync(workerPath)) {
      return workerPath;
    }

    throw new Error(`Worker file not found: ${workerPath}`);
  },
};
