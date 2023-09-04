import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationsService } from '../../../lib/notifications/notifications.service';
import {
  NotificationType,
  NotificationServiceMessage,
} from '../../../lib/notifications/notifications.interface';
import { ReservationCreatedEvent } from '../events/reservation-created.event';
import { EVENTS, RESERVATION_CREATED_SUBJECT, TEMPLATES } from '../reservations.constants';

@Injectable()
export class ReservationCreatedListener {
  constructor(private readonly notificationService: NotificationsService) {}

  @OnEvent(EVENTS.reservationCreated)
  async handleReservationCreatedEvent(event: ReservationCreatedEvent): Promise<void> {
    const messages = this.createNotificationMessages(event);

    const notificationPromises = messages.map(message =>
      this.notificationService.sendMessage(message),
    );

    await Promise.all(notificationPromises);
  }

  private createNotificationMessages(event: ReservationCreatedEvent): NotificationServiceMessage[] {
    return [
      {
        type: NotificationType.TELEGRAM,
        templateFile: TEMPLATES.reservationCreated,
        metadata: { ...event },
      },
      {
        type: NotificationType.EMAIL,
        to: `${event.renterName} <${event.renterEmail}>`,
        subject: RESERVATION_CREATED_SUBJECT,
        templateFile: TEMPLATES.reservationCreated,
        metadata: { ...event },
      },
      {
        type: NotificationType.EMAIL,
        to: `${event.ownerName} <${event.ownerEmail}>`,
        subject: RESERVATION_CREATED_SUBJECT,
        templateFile: TEMPLATES.reservationCreated,
        metadata: { ...event },
      },
    ];
  }
}
