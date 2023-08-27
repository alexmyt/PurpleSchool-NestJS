import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';

import { IConfig } from '../config/config.interface';

import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { TelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
  private readonly isServiceDisabled: boolean;
  private readonly bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @Inject(TELEGRAM_MODULE_OPTIONS) private options: TelegramOptions,
    private configService: ConfigService<IConfig, true>,
  ) {
    this.isServiceDisabled = configService.get('mail.serviceDisabled', { infer: true });

    if (this.isServiceDisabled) {
      return;
    }

    this.bot = new Telegraf(options.token);
  }

  async sendMessage(message: string, chatId = this.options.chatId) {
    if (this.isServiceDisabled) {
      this.logger.warn(
        'Trying to send an message while telegram service is disabled by config. Check TELEGRAM_SERVICE_DISABLED env var.',
      );
      return;
    }

    if (!chatId) {
      return;
    }

    try {
      await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      this.logger.error(error instanceof Error ? error.message : error);
    }
  }
}
