import { ConfigType } from '@nestjs/config';

import { app, mongodb } from './configs';

export interface IConfig {
  app: ConfigType<typeof app>;
  mongodb: ConfigType<typeof mongodb>;
}
