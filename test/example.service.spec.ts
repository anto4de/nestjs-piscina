import { Test, TestingModule } from "@nestjs/testing";
import { ExampleService } from "./example.service";
import { ExampleModule } from "./example.module";

describe("ExampleService", () => {
  let service: ExampleService;
  let testingModule: TestingModule;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ExampleModule],
    }).compile();

    service = module.get(ExampleService);

    testingModule = await module.init();
  });

  afterAll(async () => {
    await testingModule.close();
  });

  it("should run pi in Piscina thread pool", async () => {
    const result = await service.pi(10000);

    expect(result).toBe(3.1414926535900345);
  });
});
