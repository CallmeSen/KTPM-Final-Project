import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';

import { Request } from 'express';
import jwtConfig from 'src/modules/auth/config/jwt.config';
import refreshjwtConfig from 'src/modules/auth/config/refreshjwt.config';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthPayload } from 'src/modules/auth/types/auth-jwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly refreshTokenCofig: ConfigType<typeof refreshjwtConfig>,
    private readonly authService: AuthService, 
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh'),
      secretOrKey: refreshTokenCofig.secret,
      ignoreExpiration: false, 
      passReqToCallback: true
    });
  }
  async validate(req: Request, payload: AuthPayload) {

    const userId = payload.sub;

    const refreshToken = req.body.refresh;

    return await this.authService.validateRefreshToken(userId, refreshToken);
    
  }
}
