import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import { ImageService } from "./image.service.js";

/**
 * Image processing controller with file upload endpoints.
 * Accepts image uploads and returns processed images.
 */
@Controller("api/image")
export class ImageController {
  private readonly logger = new Logger(ImageController.name);

  constructor(private readonly imageService: ImageService) {}

  @Get("operations")
  getOperations() {
    return {
      operations: [
        {
          id: "metadata",
          name: "Get Metadata",
          description: "Extract image metadata",
          params: [],
        },
        {
          id: "resize",
          name: "Resize",
          description: "Resize image to specified dimensions",
          params: [
            { name: "width", type: "number", required: true },
            { name: "height", type: "number", required: true },
            {
              name: "fit",
              type: "select",
              options: ["cover", "contain", "fill", "inside", "outside"],
              default: "cover",
            },
          ],
        },
        {
          id: "grayscale",
          name: "Grayscale",
          description: "Convert image to grayscale",
          params: [],
        },
        {
          id: "blur",
          name: "Blur",
          description: "Apply Gaussian blur",
          params: [
            { name: "sigma", type: "number", default: 5, min: 0.3, max: 1000 },
          ],
        },
        {
          id: "sharpen",
          name: "Sharpen",
          description: "Sharpen the image",
          params: [
            { name: "sigma", type: "number", default: 1.5, min: 0.01, max: 10 },
          ],
        },
        {
          id: "rotate",
          name: "Rotate",
          description: "Rotate image by angle",
          params: [{ name: "angle", type: "number", required: true }],
        },
        {
          id: "flip",
          name: "Flip Horizontal",
          description: "Flip image horizontally",
          params: [],
        },
        {
          id: "flop",
          name: "Flip Vertical",
          description: "Flip image vertically",
          params: [],
        },
        {
          id: "modulate",
          name: "Adjust Colors",
          description: "Adjust brightness, saturation, and hue",
          params: [
            { name: "brightness", type: "number", default: 1, min: 0, max: 3 },
            { name: "saturation", type: "number", default: 1, min: 0, max: 3 },
            { name: "hue", type: "number", default: 0, min: -360, max: 360 },
          ],
        },
        {
          id: "convert",
          name: "Convert Format",
          description: "Convert image to different format",
          params: [
            {
              name: "format",
              type: "select",
              options: ["jpeg", "png", "webp", "avif", "tiff"],
              required: true,
            },
            { name: "quality", type: "number", default: 80, min: 1, max: 100 },
          ],
        },
      ],
    };
  }

  @Post("metadata")
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor("image"))
  async getMetadata(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const startTime = performance.now();
    const metadata = await this.imageService.getMetadata(file.buffer);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Metadata extraction took ${totalTime.toFixed(2)}ms`);

    return {
      success: true,
      data: metadata,
      meta: {
        totalRequestTimeMs: totalTime,
        originalFilename: file.originalname,
        originalSize: file.size,
      },
    };
  }

  @Post("resize")
  @UseInterceptors(FileInterceptor("image"))
  async resize(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const width = parseInt(body.width, 10);
    const height = parseInt(body.height, 10);
    const fit = body.fit || "cover";

    if (
      !width ||
      !height ||
      width < 1 ||
      height < 1 ||
      width > 10000 ||
      height > 10000
    ) {
      throw new BadRequestException("Invalid width or height");
    }

    const startTime = performance.now();
    const result = await this.imageService.resize(
      file.buffer,
      width,
      height,
      fit,
    );
    const totalTime = performance.now() - startTime;

    this.logger.log(`Resize operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
      "X-Original-Size": file.size.toString(),
      "X-New-Size": result.buffer.length.toString(),
    });

    res.send(result.buffer);
  }

  @Post("grayscale")
  @UseInterceptors(FileInterceptor("image"))
  async grayscale(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const startTime = performance.now();
    const result = await this.imageService.grayscale(file.buffer);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Grayscale operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("blur")
  @UseInterceptors(FileInterceptor("image"))
  async blur(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const sigma = parseFloat(body.sigma) || 5;

    const startTime = performance.now();
    const result = await this.imageService.blur(file.buffer, sigma);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Blur operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("sharpen")
  @UseInterceptors(FileInterceptor("image"))
  async sharpen(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const sigma = parseFloat(body.sigma) || 1.5;

    const startTime = performance.now();
    const result = await this.imageService.sharpen(
      file.buffer,
      sigma,
    );
    const totalTime = performance.now() - startTime;

    this.logger.log(`Sharpen operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("rotate")
  @UseInterceptors(FileInterceptor("image"))
  async rotate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const angle = parseFloat(body.angle);
    if (isNaN(angle)) {
      throw new BadRequestException("Invalid angle");
    }

    const startTime = performance.now();
    const result = await this.imageService.rotate(file.buffer, angle);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Rotate operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("flip")
  @UseInterceptors(FileInterceptor("image"))
  async flip(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const startTime = performance.now();
    const result = await this.imageService.flip(file.buffer);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Flip operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("flop")
  @UseInterceptors(FileInterceptor("image"))
  async flop(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const startTime = performance.now();
    const result = await this.imageService.flop(file.buffer);
    const totalTime = performance.now() - startTime;

    this.logger.log(`Flop operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("modulate")
  @UseInterceptors(FileInterceptor("image"))
  async modulate(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const brightness = parseFloat(body.brightness) || 1;
    const saturation = parseFloat(body.saturation) || 1;
    const hue = parseFloat(body.hue) || 0;

    const startTime = performance.now();
    const result = await this.imageService.modulate(
      file.buffer,
      brightness,
      saturation,
      hue,
    );
    const totalTime = performance.now() - startTime;

    this.logger.log(`Modulate operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
    });

    res.send(result.buffer);
  }

  @Post("convert")
  @UseInterceptors(FileInterceptor("image"))
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    const format = body.format;
    const quality = parseInt(body.quality, 10) || 80;

    if (!["jpeg", "png", "webp", "avif", "tiff"].includes(format)) {
      throw new BadRequestException("Invalid format");
    }

    const startTime = performance.now();
    const result = await this.imageService.convert(
      file.buffer,
      format,
      quality,
    );
    const totalTime = performance.now() - startTime;

    this.logger.log(`Convert operation took ${totalTime.toFixed(2)}ms`);

    res.set({
      "Content-Type": `image/${format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
      "X-Original-Size": file.size.toString(),
      "X-New-Size": result.buffer.length.toString(),
    });

    res.send(result.buffer);
  }

  @Post("composite")
  @UseInterceptors(FileInterceptor("image"))
  async composite(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException("No image file provided");
    }

    let operations;
    try {
      operations =
        typeof body.operations === "string"
          ? JSON.parse(body.operations)
          : body.operations;
    } catch (error) {
      throw new BadRequestException("Invalid operations format");
    }

    if (!Array.isArray(operations) || operations.length === 0) {
      throw new BadRequestException("Operations must be a non-empty array");
    }

    const startTime = performance.now();
    const result = await this.imageService.composite(file.buffer, operations);
    const totalTime = performance.now() - startTime;

    this.logger.log(
      `Composite operation (${operations.length} ops) took ${totalTime.toFixed(2)}ms`,
    );

    res.set({
      "Content-Type": `image/${result.metadata.format}`,
      "X-Processing-Time": totalTime.toFixed(2),
      "X-Worker-Time": result.processingTimeMs.toFixed(2),
      "X-Operations-Count": operations.length.toString(),
    });

    res.send(result.buffer);
  }
}
