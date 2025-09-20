import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { AppService } from "./app.service";

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  logger.log("🚀 Starting NestJS Piscina CommonJS TypeScript Example");

  try {
    const app = await NestFactory.create(AppModule);
    await app.init();
    const appService = app.get(AppService);

    logger.log("\n📊 Running CPU-intensive tasks (TypeScript → CommonJS)...");

    // Example 1: Pi calculation
    logger.log("\n1. Calculating Pi with 1,000,000 iterations...");
    const start1 = Date.now();
    const piResult: number = await appService.calculatePi(1000000);
    const time1 = Date.now() - start1;
    logger.log(`   Result: ${piResult}`);
    logger.log(`   Time taken: ${time1}ms`);

    // Example 2: Prime number calculation
    logger.log("\n2. Finding prime numbers up to 10,000...");
    const start2 = Date.now();
    const primes: number[] = await appService.findPrimes(10000);
    const time2 = Date.now() - start2;
    logger.log(`   Found ${primes.length} prime numbers`);
    logger.log(`   First 10 primes: ${primes.slice(0, 10).join(", ")}`);
    logger.log(`   Time taken: ${time2}ms`);

    // Example 3: Factorial calculation
    logger.log("\n3. Calculating factorial of 100...");
    const start3 = Date.now();
    const factorial: string = await appService.calculateFactorial(100);
    const time3 = Date.now() - start3;
    logger.log(`   Result: ${factorial}`);
    logger.log(`   Time taken: ${time3}ms`);

    // Example 4: Matrix multiplication
    logger.log("\n4. Multiplying two 100x100 matrices...");
    const start4 = Date.now();
    const matrixResult: {
      dimensions: string;
      sum: number;
      sampleElement: number;
    } = await appService.multiplyMatrices(100);
    const time4 = Date.now() - start4;
    logger.log(`   Result matrix sum: ${matrixResult.sum}`);
    logger.log(`   Time taken: ${time4}ms`);

    // Example 5: Complex computation
    logger.log("\n5. Running complex computation...");
    const start5 = Date.now();
    const complexResult: {
      complexity: number;
      iterations: number;
      result: string;
      timestamp: string;
    } = await appService.complexComputation(4);
    const time5 = Date.now() - start5;
    logger.log(`   Complexity: ${complexResult.complexity}`);
    logger.log(`   Result: ${complexResult.result}`);
    logger.log(`   Time taken: ${time5}ms`);

    logger.log("\n✅ All TypeScript→CommonJS tasks completed successfully!");
    logger.log(
      `📈 Total execution time: ${time1 + time2 + time3 + time4 + time5}ms`,
    );
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
