import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('auth/register')
  register(@Body() body: { email: string; password: string; name?: string }) {
    return this.auth.register(body);
  }

  @Post('auth/login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body);
  }

  @Post('auth/dev-login')
  devLogin(@Body() body: { email: string; name?: string }) {
    return this.auth.devLogin(body);
  }

  @Post('auth/forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body);
  }

  @Post('auth/reset-password')
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async me(@Req() req: { user: { id: string } }) {
    const user = await this.auth.getMe(req.user.id);
    return { user };
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateAccount(
    @Req() req: { user: { id: string } },
    @Body() body: { name?: string; email?: string },
  ) {
    const user = await this.auth.updateAccount(req.user.id, body);
    return { user };
  }
}
