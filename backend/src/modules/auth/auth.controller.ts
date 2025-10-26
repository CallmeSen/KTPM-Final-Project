import { Controller, Request, Post, UseGuards, Get, Body,Req, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';
import { AdminLogin, LoginDto } from 'src/modules/auth/dto/login.dto';
import { RefreshTokenGuard } from 'src/modules/auth/guards/refreshToken.guard';
import { GoogleGuard } from 'src/modules/auth/guards/google.guard';
import { Public } from 'src/decorator/custome';
import { UserService } from 'src/modules/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly userService: UserService) { }


  @Post('SignUp')
  async Register(@Body() registerDto: CreateAuthDto) {
    return await this.authService.Register(registerDto)
  }

  @Post('Login')
  async signIn(@Body() credentials: LoginDto) {
    console.log(credentials)
    return await this.authService.login(credentials);
  }
  
  @Post('admin-login')
  async AdminLogin(@Body() credentials: AdminLogin) {
    return await this.authService.AdminLogin(credentials);
  }

  @Post('logout')
  async LogOut(@Body('accessToken') accessToken: string) {
    return this.authService.LogOut(accessToken);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refreshToken')
  async RefreshToken(@Request() req) {
    return await this.authService.refreshToken(req.id, req.username, req.role);
  }


  @Post('changePassword')
  async changePassword(
    @Body() body: { email: string; newpassword: string; confirmpassword: string },
  ) {
    const { email, newpassword, confirmpassword } = body;


    if (newpassword !== confirmpassword) {
      throw new BadRequestException('New password and confirm password do not match.');
    }


    let user = this.userService.checkEmailExist(email);

    if (!user) {
      throw new BadRequestException('User not authenticated.');
    }

    return await this.authService.resetPassword(email, newpassword);
  }
  @UseGuards(GoogleGuard)
  @Get('google/login')
  async googleLogin() { }

  @UseGuards(GoogleGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res: Response) {

    const user = req.user;

    const accessToken = await this.authService.generateAccesstoken(user.id)

    const frontendCallbackUrl = "http://localhost:3000/api/auth/google/callback";

    if (!frontendCallbackUrl) {
      throw new Error('FRONTEND_GOOGLE_CALLBACK_URL is not defined in environment variables');
    }

    const redirectUrl = new URL(frontendCallbackUrl);

    redirectUrl.searchParams.set('accessToken', accessToken);
    redirectUrl.searchParams.set('refreshToken', user.refreshTokens || '');
    redirectUrl.searchParams.set('userId', user.id);
    redirectUrl.searchParams.set('name', user.username || 'Unknown User');
    redirectUrl.searchParams.set('role', user.role || 'user');

    return res.redirect(redirectUrl.toString());

  }

  @Get("generateToken")
  @Public()
  async Generate(@Body() body: { userId: string }) {
    return await this.authService.generateToken(body.userId);
  }

  @Post("ResetPassword")
  @Public()
  async ResetPassword(@Body() body: { email: string }) {
    return await this.authService.ResetPassword(body.email);
  }

  @Post("checkPostcode")
  @Public()
  async checkPostcode(@Body() body: { email: string; postcode: string }) {
    console.log(body)
    return await this.authService.checkPostcode(body.email, body.postcode);
  }

}
