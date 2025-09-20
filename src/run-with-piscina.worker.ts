import { Type } from "@nestjs/common/interfaces/type.interface";
import { executeWorkerTask, WorkerArgs } from "./worker-core";

export default async function ({
  moduleIdentifier,
  providerIdentifier,
  methodName,
  args,
}: WorkerArgs): Promise<unknown> {
  try {
    // Use dynamic import for ESM compatibility
    const moduleToken = (await import(moduleIdentifier.filename))[
      moduleIdentifier.tokenName
    ] as Type;
    const providerToken = (await import(providerIdentifier.filename))[
      providerIdentifier.tokenName
    ] as Type;

    return await executeWorkerTask(moduleToken, providerToken, methodName, args);
  } catch (error) {
    console.error("Error in worker thread:", error);
    throw error;
  }
}
