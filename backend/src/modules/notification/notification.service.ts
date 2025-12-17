import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationInput } from './dto/create-notification.input';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
  ) { }

  async sendNotification(input: CreateNotificationInput) {
    const notification = await this.notificationRepo.create(input);
    return await this.notificationRepo.save(notification);
  }


  async getNotificationsByUser(userId: string) {
    return await this.notificationRepo.find({
    where: [
      { userId },        
      { userId: IsNull() },  
    ],
    order: { createdAt: 'DESC' },
  });
  }

  async markAsRead(notificationId: string) {
    await this.notificationRepo.update(notificationId, { isRead: true });
    return this.notificationRepo.findOne({ where: { id: notificationId } });
  }

  async countNotificationsByUser(userId: string): Promise<number> {
  return await this.notificationRepo.count({
    where:[ { userId }, { userId: IsNull() }, ]
  });
  }
  
}
