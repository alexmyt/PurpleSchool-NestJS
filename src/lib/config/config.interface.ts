import { ConfigType } from '@nestjs/config';

import { app, storage, jwt, mongodb, telegram, redis, mail } from './configs';

export interface IConfig {
  app: ConfigType<typeof app>;
  storage: ConfigType<typeof storage>;
  jwt: ConfigType<typeof jwt>;
  mongodb: ConfigType<typeof mongodb>;
  telegram: ConfigType<typeof telegram>;
  mail: ConfigType<typeof mail>;
  redis: ConfigType<typeof redis>;
}
