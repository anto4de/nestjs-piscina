import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module.js";
import { AppService } from "./app.service.js";

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  logger.log("🚀 Starting NestJS Piscina ESM TypeScript Example");

  try {
    const app = await NestFactory.create(AppModule, {
      logger: ["error", "warn", "log"],
    });
    await app.init();
 
    const appService = app.get(AppService);

    logger.log(
      "\n📊 Running CPU-intensive tasks with TypeScript → ES Modules...",
    );

    // Example 1: Fibonacci calculation (recursive approach)
    logger.log("\n1. Calculating Fibonacci sequence (40th number)...");
    const start1 = performance.now();
    const fibResult: number = await appService.calculateFibonacci(40);
    const time1 = performance.now() - start1;
    logger.log(`   Result: ${fibResult}`);
    logger.log(`   Time taken: ${time1.toFixed(2)}ms`);

    // Example 2: Hash computation (MD5-like simulation)
    logger.log("\n2. Computing hash for large data...");
    const start2 = performance.now();
    const hashResult: string = await appService.computeHash(
      "ESM TypeScript Example Data",
      1000000,
    );
    const time2 = performance.now() - start2;
    logger.log(`   Hash result: ${hashResult}`);
    logger.log(`   Time taken: ${time2.toFixed(2)}ms`);

    // Example 3: Monte Carlo Pi estimation
    logger.log("\n3. Monte Carlo Pi estimation with 5,000,000 points...");
    const start3 = performance.now();
    const piEstimate: number = await appService.monteCarloPI(5000000);
    const time3 = performance.now() - start3;
    logger.log(`   Pi estimate: ${piEstimate}`);
    logger.log(`   Time taken: ${time3.toFixed(2)}ms`);

    // Example 4: Data processing simulation
    logger.log("\n4. Processing large dataset...");
    const start4 = performance.now();
    const processedData: {
      totalRecords: number;
      averageValue: number;
      highValueCount: number;
      lowValueCount: number;
      firstRecord: any;
      lastRecord: any;
    } = await appService.processLargeDataset(50000);
    const time4 = performance.now() - start4;
    logger.log(`   Processed ${processedData.totalRecords} records`);
    logger.log(`   Average value: ${processedData.averageValue}`);
    logger.log(`   Time taken: ${time4.toFixed(2)}ms`);

    // Example 5: Advanced computation
    logger.log("\n5. Running advanced mathematical computation...");
    const start5 = performance.now();
    const advancedResult: {
      dimensions: number;
      iterations: number;
      result: number;
      matrixASum: number;
      matrixBSum: number;
    } = await appService.advancedComputation(50, 10000);
    const time5 = performance.now() - start5;
    logger.log(
      `   Matrix dimensions: ${advancedResult.dimensions}x${advancedResult.dimensions}`,
    );
    logger.log(`   Iterations: ${advancedResult.iterations}`);
    logger.log(`   Result: ${advancedResult.result}`);
    logger.log(`   Time taken: ${time5.toFixed(2)}ms`);

    // Example 6: Concurrent type-safe operations
    logger.log("\n6. Running concurrent type-safe operations...");
    const start6 = performance.now();
    const concurrentResults: [number, string, number] = await Promise.all([
      appService.calculateFibonacci(35),
      appService.computeHash("Concurrent Task", 500000),
      appService.monteCarloPI(1000000),
    ]);
    const time6 = performance.now() - start6;
    logger.log(`   Concurrent results: ${concurrentResults.join(", ")}`);
    logger.log(`   Time taken: ${time6.toFixed(2)}ms`);

    logger.log("\n✅ All TypeScript→ESM tasks completed successfully!");
    logger.log(
      `📈 Total sequential time: ${(time1 + time2 + time3 + time4 + time5).toFixed(2)}ms`,
    );
    logger.log(`📈 Concurrent execution time: ${time6.toFixed(2)}ms`);
  } catch (error) {
    logger.error("❌ Error during execution:", error);
    process.exit(1);
  }

  process.exit(0);
}

bootstrap().catch((error) => {
  const logger = new Logger('Bootstrap');
  logger.error("Fatal error:", error);
  process.exit(1);
});
