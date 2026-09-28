import { PiscinaEnabled, PiscinaModule } from "..";
import { Module } from "@nestjs/common";
import { ExampleService } from "./example.service";
import { RequestScopeExampleService } from "./request-scope-example.service";
import {
  ContextConsumerService,
  RequestContextService,
} from "./request-context.service";

/**
 * Example module that demonstrates how to use the PiscinaModule
 */
@Module({
  imports: [
    PiscinaModule.forRoot({
      // Reuse workers across cases without idle-thread teardown.
      minThreads: 2,
      maxThreads: 2,
      execArgv: ["-r", "ts-node/register"],
    }),
  ],
  providers: [
    ExampleService,
    RequestScopeExampleService,
    RequestContextService,
    ContextConsumerService,
  ],
})
@PiscinaEnabled()
export class ExampleModule {}
