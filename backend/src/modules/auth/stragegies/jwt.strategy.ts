import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/modules/auth/config/jwt.config';
import { AuthService } from 'src/modules/auth/auth.service';
import { AuthPayload } from 'src/modules/auth/types/auth-jwtPayload';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConf: ConfigType<typeof jwtConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtConf.secret,
      ignoreExpiration: false, 
    });
  }

  async validate(payload: AuthPayload) {
    
    const user = await this.authService.validateJwtUser(payload.sub);
    
    if (!user) throw new UnauthorizedException();
  
    return user; 

  }

}
