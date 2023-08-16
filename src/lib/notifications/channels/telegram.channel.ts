import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TelegramService } from '../../telegram/telegram.service';
import { TelegramMessage } from '../notifications.interface';
import { IConfig } from '../../../lib/config/config.interface';

import { AbstractChannel } from './abstract.channel';

@Injectable()
export class TelegramChannel extends AbstractChannel {
  constructor(
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService<IConfig>,
  ) {
    super({
      logger: new Logger(TelegramChannel.name),
      templateDir: configService.get('telegram.templateDir', '', { infer: true }),
    });
  }
  async processMessage(message: TelegramMessage): Promise<void> {
    let renderedMessage: string;

    if (message.templateFile) {
      renderedMessage = await this.renderTemplateFile(message.templateFile, message.metadata);
    } else {
      renderedMessage = message.body;
    }

    await this.telegramService.sendMessage(renderedMessage);
  }
}
