import { Module } from "@nestjs/common";
import { PiscinaEnabled, PiscinaModule } from "nestjs-piscina";
import { AppService } from "./app.service";

/**
 * Main application module configured with Piscina
 * TypeScript → CommonJS compilation example
 */
@Module({
  imports: [
    // Configure Piscina with custom options
    PiscinaModule.forRoot({
      // Minimum number of worker threads
      minThreads: 2,
      // Maximum number of worker threads
      maxThreads: 4,
      // Worker idle timeout (5 seconds)
      idleTimeout: 5000,
      // Maximum number of tasks per worker before recycling
      maxQueue: 100,
      // For TypeScript development, use ts-node register
      execArgv: process.argv[1]?.endsWith('.ts') ? ['-r', 'ts-node/register/transpile-only'] : undefined,
    }),
  ],
  providers: [AppService],
})
@PiscinaEnabled() // Enable Piscina for this module
export class AppModule {}
