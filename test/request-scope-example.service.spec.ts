import { Test, TestingModule } from "@nestjs/testing";
import { ExampleModule } from "./example.module";
import { RequestScopeExampleService } from "./request-scope-example.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { randomUUID } from "crypto";
import { ContextConsumerService } from "./request-context.service";

describe("RequestScopeExampleService", () => {
  let service: RequestScopeExampleService;
  let testingModule: TestingModule;
  let context: {
    requestId: string;
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExampleModule],
    }).compile();

    const requestId = randomUUID();
    context = {
      requestId,
    };

    const contextId = ContextIdFactory.getByRequest(context);
    const moduleRef = module.get(ModuleRef);
    moduleRef.registerRequestByContextId(context, contextId);

    testingModule = await module.init();

    service = await module.resolve(RequestScopeExampleService, contextId);
  });

  afterAll(async () => {
    await testingModule.close();
  });

  it("should run pi in Piscina thread pool", async () => {
    const result = await service.pi(context, 10000);

    expect(result).toBe(3.1414926535900345);
  });

  it.each([RequestScopeExampleService, ContextConsumerService])(
    "should isolate concurrent request dependencies for %p in workers",
    async (provider) => {
      const contexts = [
        { requestId: randomUUID() },
        { requestId: randomUUID() },
      ];
      const results = await Promise.all(
        contexts.map(async (request) => {
          const contextId = ContextIdFactory.getByRequest(request);
          testingModule.registerRequestByContextId(request, contextId);
          const instance = await testingModule.resolve<
            RequestScopeExampleService | ContextConsumerService
          >(provider, contextId);
          return instance.inspectContext(request);
        }),
      );

      results.forEach((result, index) => {
        expect(result).toEqual({
          argumentRequestId: contexts[index].requestId,
          injectedRequestId: contexts[index].requestId,
          instanceId: expect.any(String),
          isMainThread: false,
        });
      });
      expect(results[0].instanceId).not.toBe(results[1].instanceId);
    },
  );
});
