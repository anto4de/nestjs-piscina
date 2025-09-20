import {
  ContextIdFactory,
  DiscoveryService,
  ModuleRef,
  NestFactory,
} from "@nestjs/core";
import { Type } from "@nestjs/common/interfaces/type.interface";
import { Injector } from "@nestjs/core/injector/injector";
import { REQUEST_CONTEXT_ID } from "@nestjs/core/router/request/request-constants";
import { ContextId } from "@nestjs/core/injector/instance-wrapper";

export type TokenIdentifier = {
  filename: string;
  tokenName: string;
};

export type WorkerArgs = {
  moduleIdentifier: TokenIdentifier;
  providerIdentifier: TokenIdentifier;
  methodName: string;
  args: unknown[];
};

/**
 * Core worker logic shared between ESM and CommonJS workers
 */
export async function executeWorkerTask(
  moduleToken: Type,
  providerToken: Type,
  methodName: string,
  args: unknown[]
): Promise<unknown> {
  const app = await NestFactory.createApplicationContext(moduleToken);

  const discoveryService = app.get(DiscoveryService);
  const moduleRef = app.get(ModuleRef);
  const injector = new Injector();

  const wrapper = discoveryService
    .getProviders()
    .find((w) => w.token === providerToken);
  if (!wrapper) {
    throw new Error(
      `Provider with token ${providerToken.toString()} not found in the application context`,
    );
  }

  const module = wrapper.host;
  if (!module) {
    throw new Error(
      `Module for provider ${providerToken.toString()} not found`,
    );
  }
  const isRequestScoped = !wrapper.isDependencyTreeStatic();
  let runWithPiscinaFunction: any;

  if (isRequestScoped) {
    runWithPiscinaFunction = async (contextArg: any, ...args: any[]) => {
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
      moduleRef.registerRequestByContextId(contextArg, contextId);

      const contextInstance = await injector.loadPerContext(
        wrapper.instance,
        module,
        module.providers,
        contextId,
      );
      return (contextInstance[methodName] as Function).call(
        contextInstance,
        contextArg,
        ...args,
      );
    };
  } else {
    runWithPiscinaFunction = (wrapper.instance[methodName] as Function).bind(
      wrapper.instance,
    );
  }

  if (typeof runWithPiscinaFunction !== "function") {
    throw new Error(
      `Method ${methodName} not found in class ${providerToken.toString()}`,
    );
  }

  // Run the method with the arguments
  const result = await runWithPiscinaFunction(...args);

  // Close the application context
  await app.close();

  return result;
}