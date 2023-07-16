import { ConfigType } from '@nestjs/config';

import { app, jwt, mongodb } from './configs';

export interface IConfig {
  app: ConfigType<typeof app>;
  jwt: ConfigType<typeof jwt>;
  mongodb: ConfigType<typeof mongodb>;
}
