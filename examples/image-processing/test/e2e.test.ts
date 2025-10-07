import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module.js";

/**
 * E2E Test Suite for NestJS Piscina REST API Example
 *
 * This test suite starts the NestJS application, makes HTTP requests
 * to all endpoints, and verifies the responses.
 */

const logger = new Logger("E2E-Test");
let app: INestApplication;
let baseUrl: string;

// Simple HTTP client using Node.js built-in fetch (Node 18+)
async function request(method: string, path: string, body?: any) {
  const url = `${baseUrl}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  logger.debug(`${method} ${url}`);
  const response = await fetch(url, options);
  const data = await response.json();

  return { status: response.status, data };
}

async function startServer() {
  logger.log("🚀 Starting test server...");
  app = await NestFactory.create(AppModule, {
    logger: ["error", "warn"],
  });

  const port = 3001; // Use different port for testing
  await app.listen(port);
  baseUrl = `http://localhost:${port}`;

  logger.log(`✅ Test server started on ${baseUrl}`);
}

async function stopServer() {
  if (app) {
    await app.close();
    logger.log("🛑 Test server stopped");
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      logger.log(`\n📋 Test: ${name}`);
      const start = performance.now();
      await fn();
      const time = performance.now() - start;
      logger.log(`✅ PASSED (${time.toFixed(2)}ms)`);
      passed++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(`❌ FAILED: ${errorMessage}`);
      failed++;
    }
  };

  // Test 1: Health Check
  await test("Health check endpoint", async () => {
    const { status, data } = await request("GET", "/api/health");
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (data.status !== "ok") throw new Error("Health check failed");
    logger.log(`   Response: ${JSON.stringify(data)}`);
  });

  // Test 2: Analytics Report (small dataset)
  await test("Generate analytics report (10,000 records)", async () => {
    const { status, data } = await request("POST", "/api/analytics/report", {
      recordCount: 10000,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");
    if (data.data.totalRecords !== 10000) throw new Error("Incorrect record count");

    logger.log(`   Total records: ${data.data.totalRecords}`);
    logger.log(`   Average value: ${data.data.averageValue.toFixed(2)}`);
    logger.log(`   Median: ${data.data.median.toFixed(2)}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
    logger.log(`   Total time: ${data.meta.totalRequestTimeMs.toFixed(2)}ms`);
  });

  // Test 3: Analytics Report (large dataset)
  await test("Generate analytics report (100,000 records)", async () => {
    const { status, data } = await request("POST", "/api/analytics/report", {
      recordCount: 100000,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");
    if (data.data.totalRecords !== 100000) throw new Error("Incorrect record count");

    logger.log(`   Total records: ${data.data.totalRecords}`);
    logger.log(`   Categories: ${JSON.stringify(data.data.categoryCounts)}`);
    logger.log(`   P95: ${data.data.percentiles.p95.toFixed(2)}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 4: Image Processing (small image)
  await test("Process image 800x600 with blur filter", async () => {
    const { status, data } = await request("POST", "/api/image/process", {
      width: 800,
      height: 600,
      filters: ["blur"],
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Processed pixels: ${data.data.processedPixels.toLocaleString()}`);
    logger.log(`   Checksum: ${data.data.checksum}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 5: Image Processing (multiple filters)
  await test("Process image 1920x1080 with multiple filters", async () => {
    const { status, data } = await request("POST", "/api/image/process", {
      width: 1920,
      height: 1080,
      filters: ["blur", "sharpen", "grayscale"],
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Filters applied: ${data.data.filters.join(", ")}`);
    logger.log(`   Processed pixels: ${data.data.processedPixels.toLocaleString()}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 6: Password Hashing (low iterations)
  await test("Hash password with 5,000 iterations", async () => {
    const { status, data } = await request("POST", "/api/security/hash", {
      password: "test-password-123",
      iterations: 5000,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Algorithm: ${data.data.algorithm}`);
    logger.log(`   Iterations: ${data.data.iterations}`);
    logger.log(`   Hash preview: ${data.data.hash}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 7: Password Hashing (high iterations)
  await test("Hash password with 50,000 iterations", async () => {
    const { status, data } = await request("POST", "/api/security/hash", {
      password: "secure-password-456",
      iterations: 50000,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Iterations: ${data.data.iterations}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 8: PDF Report Generation (small)
  await test("Generate PDF report with 5 sections", async () => {
    const { status, data } = await request("POST", "/api/reports/pdf", {
      sections: 5,
      chartsPerSection: 2,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Pages: ${data.data.pages}`);
    logger.log(`   Size: ${(data.data.size / 1024).toFixed(2)} KB`);
    logger.log(`   Sections: ${data.data.sectionCount}`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 9: PDF Report Generation (large)
  await test("Generate PDF report with 20 sections", async () => {
    const { status, data } = await request("POST", "/api/reports/pdf", {
      sections: 20,
      chartsPerSection: 3,
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");

    logger.log(`   Pages: ${data.data.pages}`);
    logger.log(`   Size: ${(data.data.size / 1024 / 1024).toFixed(2)} MB`);
    logger.log(`   Worker time: ${data.data.processingTimeMs.toFixed(2)}ms`);
  });

  // Test 10: Batch Processing
  await test("Execute batch of 4 operations concurrently", async () => {
    const { status, data } = await request("POST", "/api/batch", {
      operations: [
        { type: "report", params: { recordCount: 20000 } },
        { type: "image", params: { width: 800, height: 600, filters: ["blur"] } },
        { type: "hash", params: { password: "test123", iterations: 5000 } },
        { type: "pdf", params: { sections: 3, chartsPerSection: 2 } },
      ],
    });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.success) throw new Error("Request failed");
    if (data.data.length !== 4) throw new Error("Expected 4 results");

    logger.log(`   Operations completed: ${data.data.length}`);
    logger.log(`   Total time: ${data.meta.totalRequestTimeMs.toFixed(2)}ms`);
    logger.log(`   Average per operation: ${(data.meta.totalRequestTimeMs / 4).toFixed(2)}ms`);
  });

  // Test 11: Error Handling (invalid request)
  await test("Error handling - invalid record count", async () => {
    const { status, data } = await request("POST", "/api/analytics/report", {
      recordCount: 2000000, // Exceeds maximum
    });
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
    logger.log(`   Error message: ${data.message}`);
  });

  // Test 12: Concurrent Requests
  await test("Handle 5 concurrent requests", async () => {
    const start = performance.now();
    const promises = [
      request("POST", "/api/analytics/report", { recordCount: 10000 }),
      request("POST", "/api/image/process", { width: 800, height: 600 }),
      request("POST", "/api/security/hash", { password: "test", iterations: 5000 }),
      request("POST", "/api/reports/pdf", { sections: 3 }),
      request("GET", "/api/health"),
    ];

    const results = await Promise.all(promises);
    const time = performance.now() - start;

    const allSuccessful = results.every((r) => r.status === 200);
    if (!allSuccessful) throw new Error("Not all requests succeeded");

    logger.log(`   Total time for 5 concurrent requests: ${time.toFixed(2)}ms`);
    logger.log(`   Average per request: ${(time / 5).toFixed(2)}ms`);
  });

  return { passed, failed };
}

async function main() {
  logger.log("=".repeat(70));
  logger.log("NestJS Piscina REST API - E2E Test Suite");
  logger.log("=".repeat(70));

  try {
    await startServer();

    // Wait a moment for server to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const { passed, failed } = await runTests();

    logger.log("\n" + "=".repeat(70));
    logger.log("Test Results");
    logger.log("=".repeat(70));
    logger.log(`✅ Passed: ${passed}`);
    logger.log(`❌ Failed: ${failed}`);
    logger.log(`📊 Total: ${passed + failed}`);

    if (failed === 0) {
      logger.log("\n🎉 All tests passed!");
    } else {
      logger.error(`\n⚠️  ${failed} test(s) failed`);
    }

    await stopServer();
    process.exit(failed === 0 ? 0 : 1);
  } catch (error) {
    logger.error("Fatal error:", error);
    await stopServer();
    process.exit(1);
  }
}

main();
