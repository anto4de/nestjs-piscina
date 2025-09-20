import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ContextIdFactory, DiscoveryService, MetadataScanner, ModuleRef, Reflector } from "@nestjs/core";
import { ContextId, InstanceWrapper } from "@nestjs/core/injector/instance-wrapper";
import { PISCINA_META } from "./constants";
import { PiscinaService } from "./piscina.service";
import { TokenIdentifier } from "./worker-core";
import { isMainThread } from "worker_threads";
import { RunWithPiscinaMetadata } from "./decorators/run-with-piscina.decorator";
import { PiscinaEnabledMetadata } from "./decorators/piscina-enabled.decorator";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants";
import { Injector } from "@nestjs/core/injector/injector";

/**
 * Explorer that scans for methods decorated with @RunWithPiscina and
 * replaces them with calls to PiscinaService.runFunction
 */
@Injectable()
export class RunWithPiscinaExplorer implements OnModuleInit {
  private readonly logger = new Logger(RunWithPiscinaExplorer.name);
  private readonly injector = new Injector();

  constructor(
    private readonly piscinaService: PiscinaService,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Scan for methods decorated with @RunWithPiscina and replace them
   * with calls to PiscinaService.runFunction
   */
  onModuleInit(): void {
    if (!isMainThread) return; // Only run in the main thread

    // Get all providers
    const providers = this.discoveryService.getProviders();

    // Process each provider
    for (const wrapper of providers) {
      // Skip providers that don't have an instance
      if (!wrapper.instance || typeof wrapper.instance !== "object") {
        continue;
      }

      this.scanProvider(wrapper);
    }
  }

  /**
   * Scan a provider for methods decorated with @RunWithPiscina
   * @param wrapper Provider instance wrapper
   */
  private scanProvider(wrapper: InstanceWrapper): void {
    const { instance } = wrapper;

    this.metadataScanner.getAllMethodNames(instance).forEach((methodName) => {
      // Skip non-function properties
      if (typeof instance[methodName] !== "function") return;

      // Get the method
      const method = instance[methodName];

      // Check if the method is decorated with @RunWithPiscina
      const meta = this.reflector.get<RunWithPiscinaMetadata>(
        PISCINA_META,
        method,
      );

      if (!meta) return;

      this.patchMethod(wrapper, meta.filename, methodName);
    });
  }

  private patchMethod(
    wrapper: InstanceWrapper,
    providerFilename: string,
    methodName: string,
  ): void {
    const { instance, token: providerToken, host: module } = wrapper;
    if (!module) {
      throw new Error(
        `Module for provider ${providerToken.toString()} not found`,
      );
    }

    const meta = this.reflector.get<PiscinaEnabledMetadata>(
      PISCINA_META,
      module.instance.constructor,
    );
    if (!meta) {
      throw new Error(
        `Module ${module.name} does not have @PiscinaEnabled decorator`,
      );
    }

    const providerIdentifier: TokenIdentifier = {
      filename: providerFilename,
      tokenName: instance.constructor.name,
    };
    const moduleIdentifier: TokenIdentifier = {
      filename: meta.filename,
      tokenName: module.name,
    };

    const isRequestScoped = !wrapper.isDependencyTreeStatic();

    const workerFunction = async (...args: unknown[]) => {
      try {
        return await this.piscinaService.runFunction({
          moduleIdentifier,
          providerIdentifier,
          methodName,
          args,
        });
      } catch (error) {
        this.logger.error(
          `Error in Piscina task for ${providerToken.toString()}.${methodName}`,
          error instanceof Error ? error.stack : String(error),
        );
        throw error;
      }
    };

    if (isRequestScoped) {
      // Patch the prototype method so all instances will have the patched method
      Object.getPrototypeOf(instance)[methodName] = async (
        contextArg: any,
        ...args: any[]
      ) => {
        let contextId: ContextId;
        if (typeof contextArg === "object") {
          contextId = ContextIdFactory.getByRequest(contextArg);
          Object.defineProperty(contextArg, REQUEST_CONTEXT_ID, {
            value: contextId,
            enumerable: false,
            configurable: false,
            writable: false,
          });
        } else {
          contextId = ContextIdFactory.create();
        }
        this.moduleRef.registerRequestByContextId(contextArg, contextId);

        const contextInstance = await this.injector.loadPerContext(
          instance,
          module,
          module.providers,
          contextId,
        );
        return workerFunction.call(contextInstance, contextArg, ...args);
      };
    } else {
      instance[methodName] = workerFunction.bind(instance);
    }
  }
}
