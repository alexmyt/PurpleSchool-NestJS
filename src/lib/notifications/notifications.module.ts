import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { NotificationsService } from './notifications.service';
import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationsProcessor } from './notifications.processor';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: NOTIFICATIONS_QUEUE_NAME })],
  providers: [NotificationsService, NotificationsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
