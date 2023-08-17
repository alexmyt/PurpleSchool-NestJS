import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport, SendMailOptions } from 'nodemailer';
import * as deepmerge from 'deepmerge';

import { IConfig } from '../config/config.interface';

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;
  private readonly logger: Logger = new Logger(MailerService.name);
  private readonly defaultMailOptions: SendMailOptions;

  constructor(private configService: ConfigService<IConfig, true>) {
    this.transporter = createTransport({
      host: configService.getOrThrow('mail.host', { infer: true }),
      port: configService.getOrThrow('mail.port', { infer: true }),
      secure: false,
      auth: {
        user: configService.getOrThrow('mail.username', { infer: true }),
        pass: configService.getOrThrow('mail.password', { infer: true }),
      },
      tls: {
        rejectUnauthorized: false,
      },
      pool: true,
    });

    this.defaultMailOptions = {
      from: {
        name: this.configService.getOrThrow('app.name', { infer: true }),
        address: this.configService.getOrThrow('mail.senderEmail', { infer: true }),
      },
    };
  }

  /**
   * Send an email message
   */
  public async sendMail(mailOptions: SendMailOptions): Promise<void> {
    const mergedOptions = deepmerge<SendMailOptions>(this.defaultMailOptions, mailOptions);

    try {
      await this.transporter.sendMail(mergedOptions);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { text, html, ...restOptions } = mailOptions;
      this.logger.error(restOptions, error instanceof Error ? error.message : error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Send an HTML email message
   */
  public async sendHtmlMessage(
    to: SendMailOptions['to'],
    subject: SendMailOptions['subject'],
    html: SendMailOptions['html'],
    mailOptions?: SendMailOptions,
  ): Promise<void> {
    this.sendMail({ to, subject, html, ...mailOptions });
  }
}
