import { Type } from "@nestjs/common/interfaces/type.interface";
import { executeWorkerTask, WorkerArgs } from "./worker-core";

export default async function ({
  moduleIdentifier,
  providerIdentifier,
  methodName,
  args,
}: WorkerArgs): Promise<unknown> {
  try {
    // Use require for CommonJS compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const moduleToken = require(moduleIdentifier.filename)[
      moduleIdentifier.tokenName
    ] as Type;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const providerToken = require(providerIdentifier.filename)[
      providerIdentifier.tokenName
    ] as Type;

    return await executeWorkerTask(moduleToken, providerToken, methodName, args);
  } catch (error) {
    console.error("Error in worker thread:", error);
    throw error;
  }
}