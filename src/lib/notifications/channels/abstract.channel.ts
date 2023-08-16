import { resolve, join } from 'node:path';

import { Logger } from '@nestjs/common';
import { readFile } from 'fs-extra';
import * as ejs from 'ejs';

interface AbstractChannelConfig {
  logger: Logger;
  templateDir: string;
}

export class AbstractChannel {
  private logger: Logger;
  private templateDir: string;
  private templateCache: Map<string, string> = new Map();

  constructor(config: AbstractChannelConfig) {
    this.logger = config.logger;
    this.templateDir = config.templateDir;
  }

  public async renderTemplateFile(
    filename: string,
    metadata: Record<string, unknown>,
  ): Promise<string> {
    const template = await this.templateFromCacheOrFile(filename);

    try {
      return ejs.render(template, metadata);
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
    const filenameWithPath = join(this.templateDir, `${filename}.ejs`);

    let template = this.templateCache.get(filenameWithPath);

    if (!template) {
      const templateFile = resolve(`${__dirname}/../../..`, filenameWithPath);
      try {
        template = (await readFile(templateFile)).toString();
        this.templateCache.set(filenameWithPath, template);
      } catch (error) {
        this.LogAndThrowError({ filename, templateFile }, error);
      }
    }

    return template;
  }
}
