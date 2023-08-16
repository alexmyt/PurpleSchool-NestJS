import { Inject, Injectable, Logger } from '@nestjs/common';
import { Telegraf } from 'telegraf';

import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { TelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
  bot: Telegraf;

  private readonly logger = new Logger(TelegramService.name);

  constructor(@Inject(TELEGRAM_MODULE_OPTIONS) private options: TelegramOptions) {
    this.bot = new Telegraf(options.token);
  }

  async sendMessage(message: string, chatId = this.options.chatId) {
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
