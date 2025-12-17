import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || '15cbc6c6-f1d6-4c42-a717-6b8d68cc36a0',
  expiresIn: '15m',
}));
