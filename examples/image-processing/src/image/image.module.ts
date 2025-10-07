import { Module } from "@nestjs/common";
import { PiscinaEnabled } from "nestjs-piscina";
import { ImageService } from "./image.service.js";
import { ImageController } from "./image.controller.js";

@Module({
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
@PiscinaEnabled()
export class ImageModule {}
