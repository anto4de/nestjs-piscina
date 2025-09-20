import { PiscinaEnabled, PiscinaModule } from "..";
import { Module } from "@nestjs/common";
import { ExampleService } from "./example.service";
import { RequestScopeExampleService } from "./request-scope-example.service";

/**
 * Example module that demonstrates how to use the PiscinaModule
 */
@Module({
  imports: [
    PiscinaModule.forRoot({
      minThreads: 1,
      maxThreads: 4,
      execArgv: ["-r", "ts-node/register"],
    }),
  ],
  providers: [ExampleService, RequestScopeExampleService],
})
@PiscinaEnabled()
export class ExampleModule {}
