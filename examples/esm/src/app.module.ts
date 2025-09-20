import { Module } from "@nestjs/common";
import { PiscinaEnabled, PiscinaModule } from "nestjs-piscina";
import { AppService } from "./app.service.js";

/**
 * Main application module configured with Piscina
 * TypeScript → ES Modules compilation example
 */
@Module({
  imports: [
    // Configure Piscina with different options for ESM TypeScript example
    PiscinaModule.forRoot({
      // Minimum number of worker threads
      minThreads: 1,
      // Maximum number of worker threads (higher for concurrent demo)
      maxThreads: 6,
      // Worker idle timeout (3 seconds)
      idleTimeout: 3000,
      // Maximum number of tasks per worker before recycling
      maxQueue: 200,
      // For TypeScript development, pass through existing execArgv (includes ts-node loader)
      execArgv: process.argv[1]?.endsWith('.ts') ? [...process.execArgv] : undefined,
    }),
  ],
  providers: [AppService],
})
@PiscinaEnabled() // Enable Piscina for this module
export class AppModule {}
