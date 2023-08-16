import { NotImplementedException } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationServiceMessage, NotificationType } from './notifications.interface';
import { TelegramChannel } from './channels/telegram.channel';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly telegramChannel: TelegramChannel) {
    super();
  }

  async process(job: Job<NotificationServiceMessage>): Promise<void> {
    const { data } = job;

    if (data.type === NotificationType.TELEGRAM) {
      this.telegramChannel.processMessage(data);
    } else if (data.type === NotificationType.EMAIL) {
      throw new NotImplementedException();
    } else {
      throw new NotImplementedException();
    }
  }
}
