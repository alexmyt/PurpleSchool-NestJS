import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json').toString());

export const APP_NAME = packageJson.name;
export const SWAGGER_API_CURRENT_VERSION = packageJson.version;
export const SWAGGER_DESCRIPTION = packageJson.description;
export const SWAGGER_TITLE = `${APP_NAME.toUpperCase()} API Documentation`;
export const SWAGGER_API_ENDPOINT = 'swagger';
