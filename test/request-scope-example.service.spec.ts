import { Test, TestingModule } from "@nestjs/testing";
import { ExampleModule } from "./example.module";
import { RequestScopeExampleService } from "./request-scope-example.service";
import { ContextIdFactory, ModuleRef } from "@nestjs/core";
import { randomUUID } from "crypto";

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
});
