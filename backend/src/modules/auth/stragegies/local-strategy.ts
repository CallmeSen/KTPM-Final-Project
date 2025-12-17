import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/modules/auth/auth.service';


@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email', 
    });
  }

  async validate(email: string, password: string): Promise<any> {

    if (password === "") throw new UnauthorizedException('Please provide your password');

    const user = await this.authService.verifyUser(email, password);
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  }
}
