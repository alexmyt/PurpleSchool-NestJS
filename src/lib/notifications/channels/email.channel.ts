import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MailerService } from '../../mailer/mailer.service';
import { IConfig } from '../../config/config.interface';
import { EmailMessage } from '../notifications.interface';

import { AbstractChannel } from './abstract.channel';

@Injectable()
export class EmailChannel extends AbstractChannel {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<IConfig>,
  ) {
    const templateDir = configService.get('mail.templateDir', '', { infer: true });
    super({
      logger: new Logger(EmailChannel.name),
      templateDir,
    });
  }

  public async processMessage(message: EmailMessage): Promise<void> {
    let renderedMessage: string;

    if (message.templateFile) {
      renderedMessage = await this.renderTemplateFile(message.templateFile, message.metadata);
    } else {
      renderedMessage = message.body;
    }

    const { to, subject } = message;
    await this.mailerService.sendHtmlMessage(to, subject, renderedMessage);
  }
}
