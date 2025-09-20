import "reflect-metadata";
import { SetMetadata } from "@nestjs/common";
import { callerFile } from "../common";
import { PISCINA_META } from "../constants";

export type PiscinaEnabledMetadata = {
  filename: string;
};

export const PiscinaEnabled = (): ClassDecorator => {
  const filename = callerFile(__filename);

  return SetMetadata(PISCINA_META, {
    filename,
  });
};
