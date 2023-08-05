import { SetMetadata, Type } from '@nestjs/common';

import { CHECK_ABILITY_KEY } from '../../common/constants';
import { Action } from '../../common/permission.enum';

import { AbilitySubjects, AbilitySubjectHook } from './casl.interface';

export const CheckAbility = <Subject extends AbilitySubjects>(
  subjectClass: Type<Subject>,
  subjectHookClass: Type<AbilitySubjectHook<Subject>>,
  ...actions: Action[]
) =>
  SetMetadata(
    CHECK_ABILITY_KEY,
    actions.map(action => ({ subjectClass, subjectHookClass, action })),
  );
