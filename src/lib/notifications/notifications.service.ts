import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { NotificationServiceMessage } from './notifications.interface';
import { NOTIFICATIONS_JOB_NAME, NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';

@Injectable()
export class NotificationsService implements OnModuleDestroy {
  constructor(@InjectQueue(NOTIFICATIONS_QUEUE_NAME) private readonly notificationQueue: Queue) {}

  async sendMessage(message: NotificationServiceMessage): Promise<void> {
    this.notificationQueue.add(NOTIFICATIONS_JOB_NAME, message);
  }

  async onModuleDestroy() {
    await this.notificationQueue.close();
  }
}
