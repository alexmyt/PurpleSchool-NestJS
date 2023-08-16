export enum NotificationType {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
}

type MessageMetadata = Record<string, unknown>;

interface BaseMessageWithBody {
  body: string;
  templateFile?: never;
  metadata?: MessageMetadata;
}

interface BaseMessageWithTemplate {
  body?: never;
  templateFile: string;
  metadata?: MessageMetadata;
}

type BaseMessage = BaseMessageWithBody | BaseMessageWithTemplate;

export type TelegramMessage = BaseMessage & {
  type: NotificationType.TELEGRAM;
};

export type EmailMessage = BaseMessage & {
  type: NotificationType.EMAIL;
  to: string;
  subject: string;
};

export type NotificationServiceMessage = TelegramMessage | EmailMessage;
