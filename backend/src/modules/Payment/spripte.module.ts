import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'STRIPE_CLIENT',
      useFactory: (configService: ConfigService) => {
        const stripeKey = configService.get<string>('sk_test');
        if (!stripeKey) {
          throw new Error('Stripe secret key (sk_test) is not defined in environment variables');
        }
        return new Stripe(stripeKey, {});
      },
      inject: [ConfigService],
    },
  ],
  exports: ['STRIPE_CLIENT'],
})
export class StripeModule { }