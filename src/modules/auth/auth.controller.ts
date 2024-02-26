import { Body, HttpCode, Post } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { GenericController } from '../../common/decorators/controller.decorator';

import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserLoginResponseDTO } from './dto/user-login.response';
import { RefreshTokenDTO } from './dto/refresh-token.dto';

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

  @Public()
  @HttpCode(200)
  @Post('refresh')
  @ApiOkResponse({ type: UserLoginResponseDTO, description: 'Tokens hav been refreshed' })
  @ApiUnauthorizedResponse({ description: 'User not found or invalid password' })
  @ApiForbiddenResponse({ description: 'Token is invalid or banned' })
  async refresh(@Body() { refreshToken }: RefreshTokenDTO): Promise<UserLoginResponseDTO> {
    const result = await this.authService.refreshTokens(refreshToken);

    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  }
}
