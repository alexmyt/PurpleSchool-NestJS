import { ConfigService } from '@nestjs/config';

import { TokensService } from '../../lib/tokens/tokens.service';
import { HelperService } from '../../common/helper.service';
import { UsersService } from '../users/users.service';
import { IConfig } from '../../lib/config/config.interface';
import { UserModelDocument } from '../users/user.model';

import { AuthService } from './auth.service';

describe('TokensService', () => {
  const configService = {
    get: (key: string) => {
      const config = {};
      return config[key];
    },
  } as unknown as ConfigService<IConfig>;

  const usersService = {
    findOneByEmail: jest.fn(),
  } as unknown as UsersService;

  const tokensService = {
    generateTokenPair: jest.fn(),
  } as unknown as TokensService;

  const authService = new AuthService(usersService, tokensService, configService);

  // Generates a pair of tokens with valid user object
  it('should generate a pair of tokens with valid user object', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password';
    const user = {
      _id: { toHexString: () => '123456789' },
      role: 'user',
      hashedPassword: 'hashedPassword',
    };
    const authUserInfo = {
      role: user.role,
    };
    const accessToken = 'accessToken';
    const refreshToken = 'refreshToken';

    jest
      .spyOn(usersService, 'findOneByEmail')
      .mockResolvedValue(user as unknown as UserModelDocument);
    jest.spyOn(HelperService, 'verifyPassword').mockResolvedValue(true);
    jest.spyOn(tokensService, 'generateTokenPair').mockResolvedValue({ accessToken, refreshToken });

    // Act
    const result = await authService.login(email, password);

    // Assert
    expect(usersService.findOneByEmail).toHaveBeenCalledWith(email);
    expect(HelperService.verifyPassword).toHaveBeenCalledWith(password, user.hashedPassword);
    expect(tokensService.generateTokenPair).toHaveBeenCalledWith(
      user._id.toHexString(),
      authUserInfo,
    );
    expect(result).toEqual({
      accessToken,
      refreshToken,
      user: { id: user._id.toHexString(), ...authUserInfo },
    });
  });
});
