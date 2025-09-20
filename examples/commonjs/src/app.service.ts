import { Injectable } from "@nestjs/common";
import { RunWithPiscina } from "nestjs-piscina";
import { isMainThread } from "worker_threads";

/**
 * Service demonstrating CPU-intensive tasks running in Piscina worker threads
 * TypeScript → CommonJS compilation example
 */
@Injectable()
export class AppService {
  /**
   * Calculates Pi using the Leibniz formula
   * This is a CPU-intensive task that benefits from running in a worker thread
   */
  @RunWithPiscina()
  async calculatePi(iterations: number): Promise<number> {
    // Verify we're running in a worker thread
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += (4 * (i % 2 === 0 ? 1 : -1)) / (2 * i + 1);
    }
    return sum;
  }

  /**
   * Finds all prime numbers up to a given limit using the Sieve of Eratosthenes
   */
  @RunWithPiscina()
  async findPrimes(limit: number): Promise<number[]> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    if (limit < 2) return [];

    const sieve = new Array(limit + 1).fill(true);
    sieve[0] = sieve[1] = false;

    for (let i = 2; i * i <= limit; i++) {
      if (sieve[i]) {
        for (let j = i * i; j <= limit; j += i) {
          sieve[j] = false;
        }
      }
    }

    const primes: number[] = [];
    for (let i = 2; i <= limit; i++) {
      if (sieve[i]) {
        primes.push(i);
      }
    }

    return primes;
  }

  /**
   * Calculates factorial using BigInt for large numbers
   */
  @RunWithPiscina()
  async calculateFactorial(n: number): Promise<string> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    if (n < 0) throw new Error("Factorial is not defined for negative numbers");
    if (n === 0 || n === 1) return "1";

    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
      result *= BigInt(i);
    }

    return result.toString();
  }

  /**
   * Multiplies two randomly generated matrices
   */
  @RunWithPiscina()
  async multiplyMatrices(
    size: number,
  ): Promise<{ dimensions: string; sum: number; sampleElement: number }> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    // Generate two random matrices
    const matrixA = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 10)),
    );

    const matrixB = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => Math.floor(Math.random() * 10)),
    );

    // Multiply matrices
    const result = Array.from({ length: size }, () => new Array(size).fill(0));

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        for (let k = 0; k < size; k++) {
          result[i]![j] += matrixA[i]![k]! * matrixB[k]![j]!;
        }
      }
    }

    // Calculate sum of all elements for verification
    const sum = result.flat().reduce((acc, val) => acc + val, 0);

    return {
      dimensions: `${size}x${size}`,
      sum: sum,
      sampleElement: result[0]![0]!, // First element as sample
    };
  }

  /**
   * Simulates a complex mathematical computation
   * Combines multiple operations for demonstration
   */
  @RunWithPiscina()
  async complexComputation(complexity: number = 3): Promise<{
    complexity: number;
    iterations: number;
    result: string;
    timestamp: string;
  }> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const iterations = complexity * 100000;
    let result = 0;

    // Simulate complex mathematical operations
    for (let i = 0; i < iterations; i++) {
      result += Math.sin(i) * Math.cos(i) * Math.tan(i / 1000);
      result += Math.sqrt(i) * Math.log(i + 1);
      result += Math.pow(i % 100, 2);
    }

    return {
      complexity,
      iterations,
      result: result.toFixed(6),
      timestamp: new Date().toISOString(),
    };
  }
}
