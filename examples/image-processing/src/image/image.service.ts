import { Injectable, Logger } from "@nestjs/common";
import { RunWithPiscina } from "nestjs-piscina";
import { isMainThread } from "worker_threads";
import sharp from "sharp";

export interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  size: number;
  space: string;
  channels: number;
  hasAlpha: boolean;
}

export interface ProcessedImage {
  buffer: Buffer;
  metadata: ImageMetadata;
  processingTimeMs: number;
}

/**
 * Image processing service using Sharp library.
 * All CPU-intensive operations are offloaded to worker threads via @RunWithPiscina.
 */
@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  /**
   * Get image metadata and basic information
   */
  @RunWithPiscina()
  async getMetadata(imageBuffer: Buffer): Promise<ImageMetadata> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Getting metadata for image`);

    const metadata = await sharp(imageBuffer).metadata();

    const processingTime = performance.now() - startTime;
    this.logger.log(
      `[Worker] Metadata extraction took ${processingTime.toFixed(2)}ms`,
    );

    return {
      format: metadata.format || "unknown",
      width: metadata.width || 0,
      height: metadata.height || 0,
      size: imageBuffer.length,
      space: metadata.space || "unknown",
      channels: metadata.channels || 0,
      hasAlpha: metadata.hasAlpha || false,
    };
  }

  /**
   * Resize image to specified dimensions
   */
  @RunWithPiscina()
  async resize(
    imageBuffer: Buffer,
    width: number,
    height: number,
    fit: "cover" | "contain" | "fill" | "inside" | "outside" = "cover",
  ): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(
      `[Worker] Resizing image to ${width}x${height} with fit=${fit}`,
    );

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .resize(width, height, { fit })
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Resize took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Convert image to grayscale
   */
  @RunWithPiscina()
  async grayscale(imageBuffer: Buffer): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Converting image to grayscale`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .grayscale()
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(
      `[Worker] Grayscale conversion took ${processingTime.toFixed(2)}ms`,
    );

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Apply blur effect
   */
  @RunWithPiscina()
  async blur(imageBuffer: Buffer, sigma: number = 5): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Applying blur with sigma=${sigma}`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .blur(sigma)
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Blur took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Sharpen image
   */
  @RunWithPiscina()
  async sharpen(
    imageBuffer: Buffer,
    sigma: number = 1.5,
  ): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Sharpening image with sigma=${sigma}`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .sharpen({ sigma })
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Sharpen took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Rotate image
   */
  @RunWithPiscina()
  async rotate(imageBuffer: Buffer, angle: number): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Rotating image by ${angle} degrees`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation first
      .rotate(angle) // Then apply the requested rotation
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Rotation took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Flip image horizontally
   */
  @RunWithPiscina()
  async flip(imageBuffer: Buffer): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Flipping image horizontally`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .flip()
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Flip took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Flop image vertically
   */
  @RunWithPiscina()
  async flop(imageBuffer: Buffer): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(`[Worker] Flopping image vertically`);

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .flop()
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Flop took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Adjust image brightness and saturation
   */
  @RunWithPiscina()
  async modulate(
    imageBuffer: Buffer,
    brightness: number = 1,
    saturation: number = 1,
    hue: number = 0,
  ): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(
      `[Worker] Modulating image (brightness=${brightness}, saturation=${saturation}, hue=${hue})`,
    );

    const outputBuffer = await sharp(imageBuffer)
      .rotate() // Auto-rotate based on EXIF orientation
      .modulate({
        brightness,
        saturation,
        hue,
      })
      .toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(`[Worker] Modulation took ${processingTime.toFixed(2)}ms`);

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Convert image format
   */
  @RunWithPiscina()
  async convert(
    imageBuffer: Buffer,
    format: "jpeg" | "png" | "webp" | "avif" | "tiff",
    quality: number = 80,
  ): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(
      `[Worker] Converting image to ${format} (quality=${quality})`,
    );

    let pipeline = sharp(imageBuffer)
      .rotate(); // Auto-rotate based on EXIF orientation

    switch (format) {
      case "jpeg":
        pipeline = pipeline.jpeg({ quality });
        break;
      case "png":
        pipeline = pipeline.png({ quality });
        break;
      case "webp":
        pipeline = pipeline.webp({ quality });
        break;
      case "avif":
        pipeline = pipeline.avif({ quality });
        break;
      case "tiff":
        pipeline = pipeline.tiff({ quality });
        break;
    }

    const outputBuffer = await pipeline.toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(
      `[Worker] Format conversion took ${processingTime.toFixed(2)}ms`,
    );

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }

  /**
   * Apply multiple operations in sequence (composite operation)
   */
  @RunWithPiscina()
  async composite(
    imageBuffer: Buffer,
    operations: Array<{
      type: string;
      params: any;
    }>,
  ): Promise<ProcessedImage> {
    if (isMainThread) {
      throw new Error("This method should be run in a worker thread");
    }

    const startTime = performance.now();
    this.logger.log(
      `[Worker] Applying ${operations.length} operations in sequence`,
    );

    let pipeline = sharp(imageBuffer)
      .rotate(); // Auto-rotate based on EXIF orientation

    for (const op of operations) {
      switch (op.type) {
        case "resize":
          pipeline = pipeline.resize(op.params.width, op.params.height, {
            fit: op.params.fit || "cover",
          });
          break;
        case "grayscale":
          pipeline = pipeline.grayscale();
          break;
        case "blur":
          pipeline = pipeline.blur(op.params.sigma || 5);
          break;
        case "sharpen":
          pipeline = pipeline.sharpen(op.params);
          break;
        case "rotate":
          pipeline = pipeline.rotate(op.params.angle);
          break;
        case "flip":
          pipeline = pipeline.flip();
          break;
        case "flop":
          pipeline = pipeline.flop();
          break;
        case "modulate":
          pipeline = pipeline.modulate(op.params);
          break;
      }
    }

    const outputBuffer = await pipeline.toBuffer();

    const metadata = await this.getMetadata(outputBuffer);
    const processingTime = performance.now() - startTime;

    this.logger.log(
      `[Worker] Composite operation took ${processingTime.toFixed(2)}ms`,
    );

    return {
      buffer: outputBuffer,
      metadata,
      processingTimeMs: processingTime,
    };
  }
}
