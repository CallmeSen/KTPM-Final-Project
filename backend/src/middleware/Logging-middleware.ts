import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
  
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress;

    const method = req.method;
    const url = req.originalUrl;

    console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip}`);

    next(); 
  }
}
