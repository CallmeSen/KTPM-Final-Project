import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { Strategy } from "passport-google-oauth20";
import { PassportStrategy } from "@nestjs/passport";
import { VerifiedCallback } from "passport-jwt";
import googleOuth from "src/modules/auth/config/google.outh";
import { AuthService } from "src/modules/auth/auth.service";


@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {

  constructor(
    @Inject(googleOuth.KEY) private googleConfig: ConfigType<typeof googleOuth>,
    private readonly autservice: AuthService,
  ) {
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: googleConfig.callbackUrl,
      passReqToCallback: true,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifiedCallback
  ) {

    const user = await this.autservice.valiateGoogleLogin(profile);


    if (!user) {
      return done(new Error("User not found"), false);
    }

    done(null, user);
  }


}