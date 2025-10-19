import { registerAs } from "@nestjs/config";
import { JwtSignOptions } from "@nestjs/jwt";


export default registerAs('refresh-jwt', () => ({
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRED || '7d', // Thời gian hết hạn của refresh token
  }));