import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import * as os from "os";
import { PISCINA_OPTIONS } from "./constants";
import Piscina from "piscina";
import type { PiscinaOptions } from "./piscina.types";
import type { WorkerArgs } from "./worker-core";
import { WORKER_PATH_PROVIDER } from "./worker-path.provider";

@Injectable()
export class PiscinaService implements OnModuleDestroy {
  private readonly logger = new Logger(PiscinaService.name);
  private readonly pool: Piscina;

  constructor(
    @Inject(PISCINA_OPTIONS)
    readonly options: PiscinaOptions = {},
    @Inject(WORKER_PATH_PROVIDER)
    private readonly workerPath: string,
  ) {
    this.pool = new Piscina({
      minThreads: 1,
      maxThreads: os.availableParallelism?.() ?? os.cpus().length,
      ...options,
    });

    this.logger.log(
      `Piscina thread pool initialized with ${this.pool.options.maxThreads} threads`,
    );

    this.pool.on("error", (error) => {
      this.logger.error("Piscina thread pool error:", error);
    });
  }

  async runFunction<T = any>(args: WorkerArgs): Promise<T> {
    return this.pool.run(args, {
      filename: this.workerPath,
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.destroy();
  }
}
