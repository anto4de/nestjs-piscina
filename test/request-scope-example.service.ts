import { RunWithPiscina } from "..";
import { Injectable, Logger, Scope } from "@nestjs/common";
import { isMainThread } from "worker_threads";
import {
  RequestContext,
  RequestContextService,
} from "./request-context.service";

/**
 * Example service that demonstrates how to use the @RunWithPiscina decorator
 */
@Injectable({ scope: Scope.REQUEST })
export class RequestScopeExampleService {
  private readonly logger = new Logger(RequestScopeExampleService.name);

  constructor(private readonly requestContext: RequestContextService) {}

  @RunWithPiscina()
  async inspectContext(context: RequestContext) {
    return {
      argumentRequestId: context.requestId,
      ...this.requestContext.inspect(),
    };
  }

  /**
   * Calculates an approximation of Pi using the Leibniz formula.
   */
  @RunWithPiscina()
  async pi(
    context: {
      requestId: string;
    },
    iterations: number,
  ): Promise<number> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    // Log the request ID for debugging purposes
    this.logger.debug(`Calculating Pi for request ID: ${context.requestId}`);

    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += (4 * (i % 2 === 0 ? 1 : -1)) / (2 * i + 1);
    }
    return sum;
  }
}
