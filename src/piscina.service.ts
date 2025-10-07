import { Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { PISCINA_POOL } from "./decorators/inject-piscina-pool.decorator";
import Piscina from "piscina";
import type { WorkerArgs } from "./worker-core";
import { WORKER_PATH_PROVIDER } from "./worker-path.provider";

@Injectable()
export class PiscinaService implements OnModuleDestroy {
  private readonly logger = new Logger(PiscinaService.name);

  constructor(
    @Inject(PISCINA_POOL)
    private readonly pool: Piscina,
    @Inject(WORKER_PATH_PROVIDER)
    private readonly workerPath: string,
  ) {
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
