import { Action, UserRole } from '../../common/permission.enum';
import { UserModel } from '../../modules/users/user.model';

import { CaslAbilityFactory } from './casl-ability.factory';

const caslAbilityFactory = new CaslAbilityFactory();

describe('Ability factory', () => {
  let user;
  let ability;

  describe('when user is USER', () => {
    beforeEach(() => {
      user = { _id: '1', role: UserRole.USER };
      ability = caslAbilityFactory.createForUser(user);
    });

    it.each([Action.READ, Action.UPDATE])('can %p yourself', action => {
      const subject = new UserModel();
      Object.assign(subject, user);
      expect(ability.can(action, subject)).toBeTruthy;
    });

    it('can not delete yourself', () => {
      const subject = new UserModel();
      Object.assign(subject, user);
      expect(ability.can(Action.DELETE, subject)).toBeFalsy;
    });
  });
});
