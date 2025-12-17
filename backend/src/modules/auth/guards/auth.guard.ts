import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { AuthenticatedRequest } from 'src/interfaces/authentication.interface';
import { RefreshToken } from 'src/modules/auth/entities/RefreshToken.entity';
import { BlacklistService } from 'src/modules/Blacklist/blacklist.service';
import { Repository } from 'typeorm';

export interface JwtPayload {
  userId: number;

}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
    @InjectRepository(RefreshToken) private RefreshTokenRespo: Repository<RefreshToken>,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const response = context.switchToHttp().getResponse<Response>();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Missing or invalid token');


    const isBlacklisted = await this.blacklistService.findAccessToken(token);

    if (isBlacklisted) throw new UnauthorizedException('Token is in blacklist');

    try {

      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = decoded;


      return true;

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return this.handleExpiredToken(request, response);
      } else {
        Logger.error(error.message);
        throw new UnauthorizedException('Invalid token');
      }
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    return authHeader?.startsWith('Bearer') ? authHeader.split(' ')[1] : undefined;
  }

  private async handleExpiredToken(
    request: AuthenticatedRequest,
    response: Response,
  ): Promise<boolean> {
    const refreshToken = request.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    try {
      const decodedRefreshToken = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET,
      });


      const tokenDoc = await this.RefreshTokenRespo.findOne({
        where: {
          token: refreshToken,
        },
      });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }


      const newAccessToken = this.jwtService.sign(
        { userId: decodedRefreshToken.userId },
        { secret: process.env.JWT_SECRET, expiresIn: '1h' },
      );

      response.setHeader('Authorization', `Bearer ${newAccessToken}`);

       request.user = decodedRefreshToken;

      return true;

    } catch (error) {
      Logger.error(error.message);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
