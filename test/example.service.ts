import { RunWithPiscina } from "..";
import { Injectable } from "@nestjs/common";
import { isMainThread } from "worker_threads";

/**
 * Example service that demonstrates how to use the @RunWithPiscina decorator
 */
@Injectable()
export class ExampleService {
  /**
   * Calculates an approximation of Pi using the Leibniz formula.
   */
  @RunWithPiscina()
  async pi(iterations: number): Promise<number> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += (4 * (i % 2 === 0 ? 1 : -1)) / (2 * i + 1);
    }
    return sum;
  }
}
