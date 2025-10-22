import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    credentials: true, 
  });


  app.use(cookieParser());

  app.use(
  '/payment/webhook',
  bodyParser.raw({ type: 'application/json' })
);

  await app.listen(8000);
  
}
bootstrap();
