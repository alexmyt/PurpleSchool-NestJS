import { Body, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { GenericController } from '../../common/decorators/controller.decorator';
import { AuthUser } from '../../common/decorators/auth-user.decorator';

import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserLoginResponseDTO } from './dto/user-login.response';
import { RefreshTokenDTO } from './dto/refresh-token.dto';
import { AuthenticatedUserInfo } from './auth.interface';

@GenericController('auth', false)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @ApiOkResponse({ type: UserLoginResponseDTO, description: 'User has been logged in' })
  @ApiUnauthorizedResponse({ description: 'User not authorized' })
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDTO): Promise<UserLoginResponseDTO> {
    const { email, password } = userLoginDto;
    const result = await this.authService.login(email, password);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }

  @Post('refresh')
  @ApiOkResponse({ type: UserLoginResponseDTO, description: 'Tokens hav been refreshed' })
  @ApiUnauthorizedResponse({ description: 'User not authorized' })
  async refresh(
    @AuthUser() user: AuthenticatedUserInfo,
    @Body() { refreshToken }: RefreshTokenDTO,
  ): Promise<UserLoginResponseDTO> {
    const result = await this.authService.refreshTokens(user, refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
