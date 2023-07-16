import { Module, Global } from '@nestjs/common';

import { CaslAbilityFactory } from './casl-ability.factory';

@Global()
@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
  imports: [],
})
export class CaslModule {}
