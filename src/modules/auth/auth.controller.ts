import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { Public } from '../../common/decorators/public.decorator';

import { AuthService } from './auth.service';
import { UserLoginDTO } from './dto/user-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() userLoginDto: UserLoginDTO) {
    const { email, password } = userLoginDto;
    const result = await this.authService.login(email, password);
    return {
      accessToken: result.accessToken,
      user: { id: result.user._id, role: result.user.role },
    };
  }
}
