import { resolve } from 'node:path';

import { Logger } from '@nestjs/common';
import { readFile } from 'fs-extra';
import * as ejs from 'ejs';

interface AbstractChannelConfig {
  logger: Logger;
  templateDir: string;
}

export abstract class AbstractChannel {
  private logger: Logger;
  private templateDir: string;
  private templateCache: Map<string, string> = new Map();

  constructor(config: AbstractChannelConfig) {
    this.logger = config.logger;
    this.templateDir = config.templateDir;
  }

  abstract processMessage(message: unknown): Promise<void>;

  public async renderTemplateFile(
    filename: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const absolutePathFileName = resolve(
      `${__dirname}/../../..`,
      this.templateDir,
      `${filename}.ejs`,
    );
    const template = await this.templateFromCacheOrFile(absolutePathFileName);

    try {
      return ejs.render(template, metadata, { filename: absolutePathFileName });
    } catch (error) {
      this.LogAndThrowError({ template, metadata }, error);
    }
  }

  public LogAndThrowError(data, error) {
    if (error instanceof Error) {
      this.logger.error(data, error.message);
      throw error;
    } else {
      this.logger.error(data, error);
      throw new Error(error);
    }
  }

  private async templateFromCacheOrFile(filename: string): Promise<string> {
    let template = this.templateCache.get(filename);

    if (!template) {
      try {
        template = (await readFile(filename)).toString();
        this.templateCache.set(filename, template);
      } catch (error) {
        this.LogAndThrowError({ filename }, error);
      }
    }

    return template;
  }
}
