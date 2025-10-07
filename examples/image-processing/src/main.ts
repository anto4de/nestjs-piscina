import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { AppModule } from "./app.module.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  logger.log("🚀 Starting NestJS Piscina Image Processing Example");
  logger.log("📸 Using Sharp library for real image processing in worker threads");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log"],
  });

  // Serve static files from public directory
  const publicPath = process.env.NODE_ENV === "production"
    ? join(__dirname, "..", "public")
    : join(__dirname, "..", "public");

  logger.log(`📁 Serving static files from: ${publicPath}`);
  app.useStaticAssets(publicPath, { prefix: "/" });

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`✅ Application is running!`);
  logger.log(`🌐 Open your browser: http://localhost:${port}`);
  logger.log(``);
  logger.log("🖼️  Available Operations:");
  logger.log("  - Resize, Grayscale, Blur, Sharpen");
  logger.log("  - Rotate, Flip, Flop");
  logger.log("  - Color adjustments (brightness, saturation, hue)");
  logger.log("  - Format conversion (JPEG, PNG, WebP, AVIF, TIFF)");
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("Fatal error during bootstrap:", error);
  process.exit(1);
});
