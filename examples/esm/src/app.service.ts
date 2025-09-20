import { Injectable } from "@nestjs/common";
import { RunWithPiscina } from "nestjs-piscina";
import { isMainThread } from "worker_threads";

/**
 * Service demonstrating CPU-intensive tasks running in Piscina worker threads
 * TypeScript → ES Modules compilation example
 */
@Injectable()
export class AppService {
  /**
   * Calculates Fibonacci number using recursive approach
   */
  @RunWithPiscina()
  async calculateFibonacci(n: number): Promise<number> {
    // Verify we're running in a worker thread
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    // Recursive Fibonacci calculation (intentionally inefficient for demo)
    const fibonacci = (num: number): number => {
      if (num <= 1) return num;
      return fibonacci(num - 1) + fibonacci(num - 2);
    };

    return fibonacci(n);
  }

  /**
   * Computes a hash-like value for demonstration
   * Simulates cryptographic hash computation
   */
  @RunWithPiscina()
  async computeHash(data: string, iterations: number): Promise<string> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    let hash = 0;
    const dataStr = String(data);

    // Simulate hash computation with multiple iterations
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < dataStr.length; j++) {
        const char = dataStr.charCodeAt(j);
        hash = ((hash << 5) - hash + char) & 0xffffffff;
        hash = Math.abs(hash);
      }
      // Add some computational complexity
      hash = Math.floor(Math.sin(hash) * 1000000);
      hash = Math.abs(hash);
    }

    return hash.toString(16);
  }

  /**
   * Estimates Pi using Monte Carlo method
   */
  @RunWithPiscina()
  async monteCarloPI(numPoints: number): Promise<number> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    let pointsInCircle = 0;

    for (let i = 0; i < numPoints; i++) {
      const x = Math.random();
      const y = Math.random();

      // Check if point is inside unit circle
      if (x * x + y * y <= 1) {
        pointsInCircle++;
      }
    }

    // Pi estimation = 4 * (points in circle / total points)
    const piEstimate = 4 * (pointsInCircle / numPoints);
    return parseFloat(piEstimate.toFixed(6));
  }

  /**
   * Processes a large dataset simulation
   */
  @RunWithPiscina()
  async processLargeDataset(numRecords: number): Promise<{
    totalRecords: number;
    averageValue: number;
    highValueCount: number;
    lowValueCount: number;
    firstRecord: any;
    lastRecord: any;
  }> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const records: any[] = [];
    let sum = 0;

    // Generate and process dataset
    for (let i = 0; i < numRecords; i++) {
      const record = {
        id: i,
        value: Math.random() * 1000,
        timestamp: Date.now() + i,
        processed: false,
        normalizedValue: 0,
        category: "",
        complexValue: 0,
      };

      // Simulate data processing
      record.normalizedValue = record.value / 1000;
      record.category = record.value > 500 ? "high" : "low";
      record.processed = true;

      // Complex computation for demonstration
      const complexValue =
        Math.sin(record.value) * Math.cos(record.value) +
        Math.sqrt(record.value) * Math.log(record.value + 1);
      record.complexValue = complexValue;

      records.push(record);
      sum += record.value;
    }

    const averageValue = sum / numRecords;
    const highValueCount = records.filter((r) => r.category === "high").length;
    const lowValueCount = records.filter((r) => r.category === "low").length;

    return {
      totalRecords: numRecords,
      averageValue: parseFloat(averageValue.toFixed(2)),
      highValueCount,
      lowValueCount,
      firstRecord: records[0],
      lastRecord: records[numRecords - 1],
    };
  }

  /**
   * Performs complex mathematical operations
   * Demonstrates advanced computational patterns
   */
  @RunWithPiscina()
  async advancedComputation(
    dimensions: number = 50,
    iterations: number = 10000,
  ): Promise<{
    dimensions: number;
    iterations: number;
    result: number;
    matrixASum: number;
    matrixBSum: number;
  }> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    // Create matrices
    const matrixA = Array.from({ length: dimensions }, () =>
      Array.from({ length: dimensions }, () => Math.random() * 10),
    );

    const matrixB = Array.from({ length: dimensions }, () =>
      Array.from({ length: dimensions }, () => Math.random() * 10),
    );

    // Perform iterative computations
    let result = 0;
    for (let iter = 0; iter < iterations; iter++) {
      // Matrix-like operations
      for (let i = 0; i < dimensions; i++) {
        for (let j = 0; j < dimensions; j++) {
          const value = matrixA[i]![j]! * matrixB[j]![i]!;
          result += Math.sin(value) + Math.cos(value);
          result += Math.sqrt(Math.abs(value));
          result += Math.log(value + 1);
        }
      }
    }

    return {
      dimensions,
      iterations,
      result: parseFloat(result.toFixed(6)),
      matrixASum: matrixA.flat().reduce((a, b) => a + b, 0),
      matrixBSum: matrixB.flat().reduce((a, b) => a + b, 0),
    };
  }

  /**
   * Simulates image processing operations
   */
  @RunWithPiscina()
  async simulateImageProcessing(
    width: number = 500,
    height: number = 500,
  ): Promise<{
    dimensions: string;
    totalPixels: number;
    originalSum: number;
    processedSum: number;
    difference: number;
  }> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    // Create simulated image data (RGBA)
    const imageData = new Array(width * height * 4);

    // Fill with random pixel data
    for (let i = 0; i < imageData.length; i += 4) {
      imageData[i] = Math.floor(Math.random() * 256); // R
      imageData[i + 1] = Math.floor(Math.random() * 256); // G
      imageData[i + 2] = Math.floor(Math.random() * 256); // B
      imageData[i + 3] = 255; // A
    }

    // Apply filters (blur simulation)
    const processed = [...imageData];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;

        // Simple blur filter
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const neighborIndex = ((y + dy) * width + (x + dx)) * 4 + c;
              sum += imageData[neighborIndex]!;
            }
          }
          processed[index + c] = Math.floor(sum / 9);
        }
      }
    }

    // Calculate statistics
    const originalSum = imageData.reduce((a, b) => a + b, 0);
    const processedSum = processed.reduce((a, b) => a + b, 0);

    return {
      dimensions: `${width}x${height}`,
      totalPixels: width * height,
      originalSum,
      processedSum,
      difference: Math.abs(originalSum - processedSum),
    };
  }
}
