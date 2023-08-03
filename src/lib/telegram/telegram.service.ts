import { Inject, Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

import { TELEGRAM_MODULE_OPTIONS } from './telegram.constants';
import { TelegramOptions } from './telegram.interface';

@Injectable()
export class TelegramService {
  bot: Telegraf;

  constructor(@Inject(TELEGRAM_MODULE_OPTIONS) private options: TelegramOptions) {
    this.bot = new Telegraf(options.token);
  }

  async sendMessage(message: string, chatId = this.options.chatId) {
    if (!chatId) {
      return;
    }

    await this.bot.telegram.sendMessage(chatId, message, { parse_mode: 'HTML' });
  }
}
