import { DynamicModule, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import * as os from "os";
import Piscina from "piscina";
import { PiscinaService } from "./piscina.service";
import { RunWithPiscinaExplorer } from "./run-with-piscina.explorer";
import { PISCINA_OPTIONS } from "./constants";
import { PiscinaOptions } from "./piscina.types";
import { WorkerPathProvider } from "./worker-path.provider";
import { PISCINA_POOL } from "./decorators/inject-piscina-pool.decorator";

/**
 * Module that provides the PiscinaService and RunWithPiscinaExplorer
 */
@Module({})
export class PiscinaModule {
  /**
   * Configure the PiscinaModule with options
   * @param options Piscina options
   * @returns Dynamic module
   */
  static forRoot(options: PiscinaOptions = {}): DynamicModule {
    return {
      module: PiscinaModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: PISCINA_OPTIONS,
          useValue: options,
        },
        ...this.createCommonProviders(),
      ],
      exports: [PISCINA_POOL],
    };
  }

  /**
   * Configure the PiscinaModule with async options
   * @param options Async options factory
   * @returns Dynamic module
   */
  static forRootAsync(options: {
    useFactory: (...args: any[]) => PiscinaOptions | Promise<PiscinaOptions>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: PiscinaModule,
      global: true,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: PISCINA_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        ...this.createCommonProviders(),
      ],
      exports: [PISCINA_POOL],
    };
  }

  private static createCommonProviders() {
    return [
      WorkerPathProvider,
      {
        provide: PISCINA_POOL,
        useFactory: (piscinaOptions: PiscinaOptions) =>
          new Piscina({
            minThreads: 1,
            maxThreads: os.availableParallelism?.() ?? os.cpus().length,
            ...piscinaOptions,
          }),
        inject: [PISCINA_OPTIONS],
      },
      PiscinaService,
      RunWithPiscinaExplorer,
    ];
  }
}
