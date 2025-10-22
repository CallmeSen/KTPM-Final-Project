import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'src/modules/auth/auth.service';
import { User } from 'src/modules/users/entities/user.entity';

function generateOtp(): string {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

@Injectable()
export class MailService {

  constructor(
    private readonly mailerService: MailerService,

    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,

  ) { }

  async sendUserConfirmation(user: User): Promise<void> {

    try {
      await this.mailerService.sendMail({
        to: user.email,
        from: 'Support Team <support@example.com>',
        subject: 'Welcome to Nice App! Confirm your Email',
        template: 'sub',
        context: {
          name: user.username,
        },
      });


      console.log('Confirmation email sent to:', user.email);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  }

  async sendPasswordResetOtp(email: string): Promise<void> {

    const otp = generateOtp();

    try {

      await this.mailerService.sendMail({
        to: email,
        from: 'Bookstore',
        subject: 'Password Reset Code',
        html: `
        <p>You requested a password reset.</p>
        <p>Your verification code is:</p>
        <h2>${otp}</h2>
        <p>This code will expire in 1 minute.</p>
      `,
      });

      await this.authService.savePostcode(email, otp);


    } catch (error) {
      console.error('Failed to send reset OTP:', error);
    }

  }
}
