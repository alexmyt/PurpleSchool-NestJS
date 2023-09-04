import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { NotificationsService } from '../../../lib/notifications/notifications.service';
import {
  NotificationServiceMessage,
  NotificationType,
} from '../../../lib/notifications/notifications.interface';
import { ReservationCreatedEvent } from '../events/reservation-created.event';
import { EVENTS, RESERVATION_CANCELED_SUBJECT, TEMPLATES } from '../reservations.constants';

@Injectable()
export class ReservationCanceledListener {
  constructor(private readonly notificationService: NotificationsService) {}

  @OnEvent(EVENTS.reservationCanceled)
  async handleReservationCreatedEvent(event: ReservationCreatedEvent): Promise<void> {
    const messages = this.createNotificationMessages(event);

    const notificationPromises = messages.map(message =>
      this.notificationService.sendMessage(message),
    );

    await Promise.all(notificationPromises);
  }

  private createNotificationMessages(event: ReservationCreatedEvent): NotificationServiceMessage[] {
    return [
      // Send message to Telegram bot
      {
        type: NotificationType.TELEGRAM,
        templateFile: TEMPLATES.reservationCanceled,
        metadata: { ...event },
      },

      // Send email to renter
      {
        type: NotificationType.EMAIL,
        to: `${event.renterName} <${event.renterEmail}>`,
        subject: RESERVATION_CANCELED_SUBJECT,
        templateFile: TEMPLATES.reservationCanceled,
        metadata: { ...event },
      },

      // send message to room owner
      {
        type: NotificationType.EMAIL,
        to: `${event.ownerName} <${event.ownerEmail}>`,
        subject: RESERVATION_CANCELED_SUBJECT,
        templateFile: TEMPLATES.reservationCanceled,
        metadata: { ...event },
      },
    ];
  }
}
