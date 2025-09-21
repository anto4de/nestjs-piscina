# NestJS Piscina

A NestJS library for easy integration with [Piscina](https://github.com/piscinajs/piscina), the fast worker thread pool for Node.js. This library allows you to offload CPU-intensive tasks to worker threads while maintaining the familiar NestJS decorator pattern and dependency injection.

## Installation

```bash
npm install nestjs-piscina piscina
```

## Features

- 🚀 **Easy Integration**: Seamlessly integrate Piscina worker threads into your NestJS application
- 🎯 **Decorator-Based**: Use simple decorators to mark methods for worker thread execution
- 🔄 **Dependency Injection**: Full support for NestJS dependency injection in worker threads
- 🛡️ **Type Safety**: Complete TypeScript support with proper type inference
- ⚡ **Performance**: Leverage worker threads for CPU-intensive tasks without blocking the main thread
- 🔧 **Configurable**: Flexible configuration options for thread pool management
- 📦 **Dual Module Support**: Works with both ESM and CommonJS projects
- 🛠️ **TypeScript Development**: Built-in support for TypeScript development workflows

## Usage

### 1. Import the PiscinaModule and add the @PiscinaEnabled decorator

```typescript
import {Module} from '@nestjs/common';
import {PiscinaModule} from 'nestjs-piscina';
import {PiscinaEnabled} from 'nestjs-piscina';
import {AppService} from './app.service';

@Module({
    imports: [
        PiscinaModule.forRoot({
            // Piscina options
            minThreads: 1,
            maxThreads: 4,
        }),
    ],
    providers: [AppService],
})
@PiscinaEnabled()
export class AppModule {
}
```

### 2. Use the @RunWithPiscina decorator

```typescript
import {Injectable} from '@nestjs/common';
import {RunWithPiscina} from 'nestjs-piscina';
import {isMainThread} from 'worker_threads';

@Injectable()
export class AppService {
    /**
     * Method that will be executed in the Piscina thread pool
     * The method's body will be automatically serialized and run directly in a worker thread
     */
    @RunWithPiscina()
    async slowWork(iterations: number = 1000000): Promise<number> {
        // This code will be executed in the worker thread
        if (isMainThread) {
            throw new Error("This method should be run in a worker thread");
        }

        // It's a CPU-intensive task that calculates the sum of squares
        let sum = 0;
        for (let i = 0; i < iterations; i++) {
            sum += i * i;
        }
        return sum;
    }

    async run(): Promise<number> {
        try {
            console.log('Starting slow work...');
            const result = await this.slowWork(5000000);
            console.log('Slow work completed with result:', result);
            return result;
        } catch (error) {
            console.error('Error during slow work:', error);
            throw error;
        }
    }
}
```

## Advanced Usage

### Request-Scoped Providers

The library fully supports request-scoped providers. When a method decorated with `@RunWithPiscina()` is called on a
request-scoped provider, the request context is properly maintained in the worker thread.

Here's how to use it:

```typescript
import {Injectable, Scope, Logger} from '@nestjs/common';
import {RunWithPiscina} from 'nestjs-piscina';
import {isMainThread} from 'worker_threads';

@Injectable({scope: Scope.REQUEST})
export class RequestScopeExampleService {
    private readonly logger = new Logger(RequestScopeExampleService.name);

    @RunWithPiscina()
    async processData(
        context: { requestId: string }, // First parameter must be the request context
        data: any
    ): Promise<any> {
        if (isMainThread) {
            throw new Error("This method should be run in a worker thread");
        }

        // The request context is available in the worker thread
        this.logger.debug(`Processing data for request ID: ${context.requestId}`);

        // Your CPU-intensive processing here
        return processedData;
    }
}
```

When using request-scoped providers:

1. The first parameter of the method must be the request context object
2. This context is passed to the worker thread and used to maintain request scope
3. Any request-scoped dependencies will be properly injected in the worker thread

Example usage in a controller:

```typescript

@Controller()
export class AppController {
    constructor(private readonly requestScopeService: RequestScopeExampleService) {
    }

    @Get()
    async process(@Req() request) {
        // Create a context object with request information
        const context = {requestId: request.id};

        // Pass the context as the first argument
        return this.requestScopeService.processData(context, request.body);
    }
}
```

### Async Configuration

You can use `forRootAsync` to configure the module asynchronously:

```typescript
import {Module} from '@nestjs/common';
import {PiscinaModule} from 'nestjs-piscina';
import {PiscinaEnabled} from 'nestjs-piscina';
import {ConfigService} from '@nestjs/config';

@Module({
    imports: [
        PiscinaModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                minThreads: configService.get('PISCINA_MIN_THREADS', 1),
                maxThreads: configService.get('PISCINA_MAX_THREADS', 4),
            }),
            inject: [ConfigService],
        }),
    ],
})
@PiscinaEnabled()
export class AppModule {
}
```

## TypeScript Development Setup

To use the nestjs-piscina library in a local environment with TypeScript files, you need to configure `execArgv` explicitly based on your project type.

### ESM Projects (with `"type": "module"` in package.json)

1. **Install dependencies:**
```bash
npm install nestjs-piscina piscina
npm install -D ts-node typescript
```

2. **Configure your module with explicit execArgv:**
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { PiscinaModule, PiscinaEnabled } from 'nestjs-piscina';
import { AppService } from './app.service';

@Module({
  imports: [
    PiscinaModule.forRoot({
      minThreads: 1,
      maxThreads: 4,
      // For TypeScript development, pass through existing execArgv (includes ts-node loader)
      execArgv: process.argv[1]?.endsWith('.ts') ? [...process.execArgv] : undefined,
    }),
  ],
  providers: [AppService],
})
@PiscinaEnabled()
export class AppModule {}
```

3. **Run with ts-node ESM loader:**
```bash
node --loader ts-node/esm src/main.ts
```

### CommonJS Projects (traditional Node.js)

1. **Install dependencies:**
```bash
npm install nestjs-piscina piscina
npm install -D ts-node typescript
```

2. **Configure your module:**
```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { PiscinaModule, PiscinaEnabled } from 'nestjs-piscina';
import { AppService } from './app.service';

@Module({
  imports: [
    PiscinaModule.forRoot({
      minThreads: 1,
      maxThreads: 4,
      // For TypeScript development, use ts-node register
      execArgv: process.argv[1]?.endsWith('.ts') ? ['-r', 'ts-node/register/transpile-only'] : undefined,
    }),
  ],
  providers: [AppService],
})
@PiscinaEnabled()
export class AppModule {}
```

3. **Run with ts-node:**
```bash
npx ts-node src/main.ts
```

### Service Implementation

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';
import { RunWithPiscina } from 'nestjs-piscina';
import { isMainThread } from 'worker_threads';

@Injectable()
export class AppService {
  @RunWithPiscina()
  async heavyComputation(iterations: number): Promise<number> {
    // This code runs in a worker thread
    if (isMainThread) {
      throw new Error("This should run in worker thread");
    }
    
    let sum = 0;
    for (let i = 0; i < iterations; i++) {
      sum += i * i;
    }
    return sum;
  }

  async processData() {
    // This runs in the main thread and calls the worker
    const result = await this.heavyComputation(1000000);
    console.log('Result:', result);
    return result;
  }
}
```

### Key Points for TypeScript Development:

1. **Explicit Configuration**: The library no longer auto-detects execArgv. You must configure it explicitly based on your project type.

2. **Worker Thread Context**: The `@RunWithPiscina()` decorated methods run in separate worker threads with full NestJS context.

3. **Module Detection**: The library automatically selects the correct worker file (ESM vs CommonJS) based on your project's package.json `type` field.

4. **TypeScript Support**: Both ESM and CommonJS projects support TypeScript development through proper execArgv configuration.

## Module Compatibility

This library supports both ESM (ECMAScript Modules) and CJS (CommonJS) module formats:

- **ESM**: For projects using `"type": "module"` in package.json or `.mjs` files
  ```typescript
  import { PiscinaModule, RunWithPiscina } from 'nestjs-piscina';
  ```

- **CommonJS**: For traditional Node.js projects
  ```typescript
  const { PiscinaModule, RunWithPiscina } = require('nestjs-piscina');
  ```

The correct format is automatically selected based on your import style, thanks to the package's `exports` field.

## TypeScript baseUrl

For projects using TypeScript `baseUrl`, configure `NODE_PATH` to resolve paths in worker threads:

```typescript
// In your module - align NODE_PATH with your tsconfig baseUrl
PiscinaModule.forRoot({
  env: {
    ...process.env,
    NODE_PATH: process.cwd(), // Adjust path to match your baseUrl setting
  },
})
```

```json
{
  "scripts": {
    "dev": "NODE_PATH=./src node -r ts-node/register/transpile-only -r tsconfig-paths/register src/app.ts",
    "start": "NODE_PATH=./dist node dist/app.js"
  }
}
```

## Global Modules

If there is a global module, it needs to be explicitly imported as a dependency in the `@PiscinaEnabled()` decorated module, or it won't work in the worker thread.

Worker threads create isolated NestJS application contexts using only the decorated module, without access to the main application's global modules. This means services that depend on global modules (like `ConfigService`, database connections, or other global providers) will fail to resolve in worker threads unless explicitly imported.

```typescript
@Module({
  imports: [
    ConfigModule,     // Must import even if global in main app
    DatabaseModule,   // Required for database access in worker
  ],
  providers: [ComputeService],
})
@PiscinaEnabled()
export class FeatureModule {}
```

## API Reference

### PiscinaModule

- `forRoot(options?: PiscinaOptions)`: Configure the module with Piscina options
- `forRootAsync(options: { useFactory, inject? })`: Configure the module asynchronously

### Decorators

- `@PiscinaEnabled()`: Decorator for modules that contain services with @RunWithPiscina methods
- `@RunWithPiscina()`: Decorator to mark a method for direct execution in a worker thread

### PiscinaService

- `runFunction(options: { moduleIdentifier, providerIdentifier, methodName, args }): Promise<any>`: Run a function in
  the thread pool
- `piscinaPool: Piscina`: Get the underlying Piscina instance

## How It Works

### General Implementation

1. During module initialization, the `RunWithPiscinaExplorer` scans all providers for methods decorated with
   `@RunWithPiscina()`
2. It patches these methods to run in the Piscina thread pool instead of the main thread
3. When a patched method is called, the arguments are passed to a worker thread
4. The worker thread creates a new NestJS application context, resolves the provider, and calls the original method
5. The result is returned to the main thread

### Request Scope Handling

For request-scoped providers, the library:

1. Detects if a provider is request-scoped using `!wrapper.isDependencyTreeStatic()`
2. For request-scoped providers, it expects the first parameter to be a request context object
3. It creates a context ID from this object using `ContextIdFactory.getByRequest(contextArg)`
4. The context ID is attached to the context object and registered with the module reference
5. In the worker thread, the same process happens to maintain the request scope
6. This ensures that request-scoped dependencies are properly injected in both the main thread and worker threads

This implementation allows you to use request-scoped providers with Piscina without losing the request context, making
it possible to access request-specific data and dependencies in your worker threads.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
