import { Body, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { Public } from '../../common/decorators/public.decorator';
import { GenericController } from '../../common/decorators/controller.decorator';

import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserLoginResponseDTO } from './dto/user-login.response';

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
      user: { id: result.user._id.toHexString(), role: result.user.role },
    };
  }
}
