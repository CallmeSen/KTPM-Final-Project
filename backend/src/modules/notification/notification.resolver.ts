import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from 'src/modules/notification/dto/create-notification.input';

@Resolver(() => Notification)
export class NotificationResolver {
  
  constructor(private readonly notificationService: NotificationService) {}

 @Mutation(() => Notification)
 
  sendNotification(
    @Args('createNotificationInput') createNotificationInput: CreateNotificationInput,
  ) {
    return this.notificationService.sendNotification(createNotificationInput);
  }

  @Query(() => [Notification])
  async getNotifications(@Args('userId') userId: string) {
    return await this.notificationService.getNotificationsByUser(userId);
  }

  @Query(() => Int)
  async countNotifications(@Args('userId') userId: string) {
    return await this.notificationService.countNotificationsByUser(userId);
  }

}
