import { ConfigType } from '@nestjs/config';

import { app, storage, jwt, mongodb } from './configs';

export interface IConfig {
  app: ConfigType<typeof app>;
  storage: ConfigType<typeof storage>;
  jwt: ConfigType<typeof jwt>;
  mongodb: ConfigType<typeof mongodb>;
}
