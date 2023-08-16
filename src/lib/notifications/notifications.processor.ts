import { resolve } from 'node:path';

import { ConfigService } from '@nestjs/config';
import { Logger, NotImplementedException } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as ejs from 'ejs';

import { TelegramService } from '../telegram/telegram.service';
import { IConfig } from '../config/config.interface';

import { NOTIFICATIONS_QUEUE_NAME } from './notifications.constants';
import { NotificationServiceMessage, NotificationType } from './notifications.interface';

@Processor(NOTIFICATIONS_QUEUE_NAME)
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);
  private templateDir: string;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService<IConfig>,
  ) {
    super();
    this.templateDir = this.configService.get('telegram.templateDir', '', { infer: true });
  }

  async process(job: Job<NotificationServiceMessage>): Promise<void> {
    this.logger.log(job.data);
    const { data } = job;

    let messageBody: string;
    const { body, templateFile, metadata } = data;
    if (templateFile) {
      messageBody = await this.renderTemplate(templateFile, metadata);
    } else {
      messageBody = body;
    }

    if (data.type === NotificationType.TELEGRAM) {
      this.sendTelegramMessage(messageBody);
    } else if (data.type === NotificationType.EMAIL) {
      const { to, subject } = data;
      this.sendEmailMessage(messageBody, to, subject);
    } else {
      throw new NotImplementedException();
    }
  }

  private async renderTemplate(
    templateName: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const filename = resolve(`${__dirname}/../..`, this.templateDir, `${templateName}.ejs`);
    try {
      const rendered = await ejs.renderFile(filename, metadata);
      return rendered;
    } catch (error) {
      this.logger.error({ filename, metadata }, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  private async sendTelegramMessage(message: string): Promise<void> {
    await this.telegramService.sendMessage(message);
  }

  private async sendEmailMessage(message: string, to: string, subject: string): Promise<void> {
    throw new NotImplementedException();
  }
}
