import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { TelegramModule } from '../telegram/telegram.module';
import { IConfig } from '../config/config.interface';
import { MailerModule } from '../mailer/mailer.module';

import { NotificationsService } from './notifications.service';
import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationsProcessor } from './notifications.processor';
import { TelegramChannel } from './channels/telegram.channel';
import { EmailChannel } from './channels/email.channel';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE_NAME }),
    MailerModule,
    TelegramModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => {
        const token = configService.getOrThrow('telegram.token', { infer: true });
        const chatId = configService.get('telegram.chatId', { infer: true });

        return { token, chatId };
      },
    }),
  ],
  providers: [NotificationsService, NotificationsProcessor, TelegramChannel, EmailChannel],
  exports: [NotificationsService],
})
export class NotificationsModule {}
