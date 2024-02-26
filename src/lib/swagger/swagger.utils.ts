import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DocumentBuilder,
  SwaggerModule,
  SwaggerCustomOptions,
  OpenAPIObject,
} from '@nestjs/swagger';

import { IS_PUBLIC_KEY } from '../../common/constants';
import { IConfig } from '../config/config.interface';

import {
  SWAGGER_API_CURRENT_VERSION,
  SWAGGER_API_ENDPOINT,
  SWAGGER_DESCRIPTION,
  SWAGGER_TITLE,
} from './swagger.constants';

/**
 * Removes the default security configuration from all public paths in the OpenAPI document.
 */
const removeDefaultSecurityFromPublicMethods = (document: OpenAPIObject): void => {
  const paths = Object.values(document.paths);
  for (const path of paths) {
    const methods = Object.values(path);

    for (const method of methods) {
      if (Array.isArray(method.security) && method.security.includes(IS_PUBLIC_KEY))
        method.security = [];
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addResponsesAdditionalProperties = (document: OpenAPIObject): void => {
  // TODO
};

/**
 * Sorts the operations (API endpoints) in the Swagger documentation based on their HTTP methods and paths.
 */
const operationsSorter = (
  a: { get: (argument: string) => string },
  b: { get: (argument: string) => string },
) => {
  const methodsOrder = ['get', 'post', 'put', 'patch', 'delete', 'options', 'trace'];
  let result = methodsOrder.indexOf(a.get('method')) - methodsOrder.indexOf(b.get('method'));

  if (result === 0) result = a.get('path').localeCompare(b.get('path'));

  return result;
};

/**
 * Creates a Swagger configuration object using the provided `appUrl` and `appPort` parameters.
 */
const createSwaggerConfig = (server: string): Omit<OpenAPIObject, 'paths'> => {
  return new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion(SWAGGER_API_CURRENT_VERSION)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
    })
    .addServer(server)
    .build();
};

const swaggerCustomOptions: SwaggerCustomOptions = {
  explorer: true,
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestDuration: true,
    persistAuthorization: true,
    operationsSorter,
  },
};

/**
 * Setup Swagger module
 */
export const setupSwagger = async (
  app: INestApplication,
  configService: ConfigService<IConfig>,
): Promise<void> => {
  const appUrl = configService.get('app.url', { infer: true });
  const appPort = configService.get('app.port', { infer: true });
  const server = new URL(`${appUrl}:${appPort}`);

  const config = createSwaggerConfig(server.origin);

  const document = SwaggerModule.createDocument(app, config, {});

  removeDefaultSecurityFromPublicMethods(document);
  addResponsesAdditionalProperties(document);

  SwaggerModule.setup(SWAGGER_API_ENDPOINT, app, document, swaggerCustomOptions);
};
