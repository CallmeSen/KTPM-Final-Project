import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import {  forwardRef, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { join } from 'path';
import {   ConfigService } from '@nestjs/config';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/users/users.module';


@Module({
    imports: [
        MailerModule.forRootAsync({
            useFactory: async (config: ConfigService) => ({
                transport: {
                    host: config.get<string>('MAIL_HOST'),
                    secure: false,
                    auth: {
                        user: config.get<string>('Mail_User'),
                        pass: config.get<string>('Mail_password'),
                    },
                    connectionTimeout: 10000,
                },
                defaults: {
                    from: `"No Reply" <${config.get<string>('dsa')}>`,
                },
                template: {
                    dir: join(__dirname, 'mails'),
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        
        forwardRef(() => AuthModule),
        forwardRef(() => UserModule),
       
    ],
    providers: [MailService],

    exports: [MailService],
})
export class MailModule { }
