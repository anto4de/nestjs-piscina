import { Module } from "@nestjs/common";
import { PiscinaModule } from "nestjs-piscina";
import { ImageModule } from "./image/image.module.js";

/**
 * Image Processing Application Module
 *
 * This module demonstrates using NestJS + Piscina + Sharp for
 * high-performance image processing in worker threads.
 */
@Module({
  imports: [
    PiscinaModule.forRoot({
      minThreads: 1,
      maxThreads: 2,
      idleTimeout: 10000,
      execArgv: process.argv[1]?.endsWith(".ts")
        ? [...process.execArgv]
        : undefined,
    }),
    ImageModule,
  ],
})
export class AppModule {}
