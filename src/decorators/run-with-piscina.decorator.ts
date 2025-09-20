import "reflect-metadata";
import { SetMetadata } from "@nestjs/common";
import { callerFile } from "../common";
import { PISCINA_META } from "../constants";

export type RunWithPiscinaMetadata = {
  filename: string;
};

export const RunWithPiscina = (): MethodDecorator => {
  const filename = callerFile(__filename);

  return SetMetadata(PISCINA_META, {
    filename,
  });
};
