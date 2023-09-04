import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { subject as setSubjectType } from '@casl/ability';

import { CHECK_ABILITY_KEY, IS_PUBLIC_KEY } from '../../common/constants';
import { Action } from '../../common/permission.enum';

import { AppAbility, CaslAbilityFactory } from './casl-ability.factory';
import { AbilityConfig } from './casl.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const ability = this.caslAbilityFactory.createForUser(user);

    const abilityConfigs =
      this.reflector.get<AbilityConfig[]>(CHECK_ABILITY_KEY, context.getHandler()) || [];

    let abilitiesIsPass = true;
    for (const abilityConfig of abilityConfigs) {
      abilitiesIsPass &&= await this.checkAbility(abilityConfig, ability, request);
    }

    return abilitiesIsPass;
  }

  private async checkAbility(abilityConfig: AbilityConfig, ability: AppAbility, request: Request) {
    const { subjectClass, subjectHookClass, action } = abilityConfig;

    if (action === Action.CREATE) {
      // check user have abilities to create new subject with those fields
      const subject = new subjectClass();
      Object.assign(subject, request.body);
      return ability.can(action, subject);
    }

    const abilitySubjectHook = this.moduleRef.get(subjectHookClass, { strict: false });
    const subject = await abilitySubjectHook.run(request);
    if (!subject) {
      throw new NotFoundException();
    }

    return ability.can(action, setSubjectType(subjectClass.name, subject));
  }
}
