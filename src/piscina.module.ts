import { DynamicModule, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { PiscinaService } from "./piscina.service";
import { RunWithPiscinaExplorer } from "./run-with-piscina.explorer";
import { PISCINA_OPTIONS } from "./constants";
import { PiscinaOptions } from "./piscina.types";
import { WorkerPathProvider } from "./worker-path.provider";

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
        WorkerPathProvider,
        PiscinaService,
        RunWithPiscinaExplorer,
      ],
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
        WorkerPathProvider,
        PiscinaService,
        RunWithPiscinaExplorer,
      ],
    };
  }
}
