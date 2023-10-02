import { NotImplementedException, OnModuleDestroy } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationServiceMessage, NotificationType } from './notifications.interface';
import { TelegramChannel } from './channels/telegram.channel';
import { EmailChannel } from './channels/email.channel';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationsProcessor extends WorkerHost implements OnModuleDestroy {
  constructor(
    private readonly telegramChannel: TelegramChannel,
    private readonly emailChannel: EmailChannel,
  ) {
    super();
  }

  async process(job: Job<NotificationServiceMessage>): Promise<void> {
    const { data } = job;

    if (data.type === NotificationType.TELEGRAM) {
      this.telegramChannel.processMessage(data);
    } else if (data.type === NotificationType.EMAIL) {
      this.emailChannel.processMessage(data);
    } else {
      throw new NotImplementedException();
    }
  }

  async onModuleDestroy() {
    await this.worker.close();
  }
}
