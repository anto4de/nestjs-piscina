import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { randomUUID } from "crypto";
import { isMainThread } from "worker_threads";
import { RunWithPiscina } from "..";

export type RequestContext = { requestId: string };

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private readonly instanceId = randomUUID();

  constructor(@Inject(REQUEST) private readonly request: RequestContext) {}

  inspect() {
    return {
      injectedRequestId: this.request.requestId,
      instanceId: this.instanceId,
      isMainThread,
    };
  }
}

// Request scope must propagate through dependencies even without Scope.REQUEST.
@Injectable()
export class ContextConsumerService {
  constructor(private readonly requestContext: RequestContextService) {}

  @RunWithPiscina()
  async inspectContext(context: RequestContext) {
    return {
      argumentRequestId: context.requestId,
      ...this.requestContext.inspect(),
    };
  }
}
