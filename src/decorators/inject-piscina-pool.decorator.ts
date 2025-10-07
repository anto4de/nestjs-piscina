import { Inject } from "@nestjs/common";

/**
 * Token for injecting the Piscina pool instance
 */
export const PISCINA_POOL = Symbol("PISCINA_POOL");

/**
 * Decorator to inject the Piscina pool instance directly
 *
 * @example
 * ```typescript
 * import { Injectable } from '@nestjs/common';
 * import { InjectPiscinaPool } from 'nestjs-piscina';
 * import type Piscina from 'piscina';
 *
 * @Injectable()
 * export class MyService {
 *   constructor(@InjectPiscinaPool() private readonly piscina: Piscina) {}
 *
 *   getPoolStats() {
 *     return {
 *       threads: this.piscina.threads.length,
 *       queueSize: this.piscina.queueSize,
 *       utilization: this.piscina.utilization,
 *     };
 *   }
 * }
 * ```
 */
export const InjectPiscinaPool = () => Inject(PISCINA_POOL);
