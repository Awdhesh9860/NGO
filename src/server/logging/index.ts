/**
 * Server Structured Logger with Automatic PII Redaction
 */
import { logger } from '../../lib/logger';

export * from '../../lib/logger';
export const serverLogger = {
  debug: (metaOrMsg: unknown, msg?: string) => {
    if (typeof metaOrMsg === 'string') {
      logger.debug(metaOrMsg);
    } else {
      logger.debug(msg || '', undefined, metaOrMsg);
    }
  },
  info: (metaOrMsg: unknown, msg?: string) => {
    if (typeof metaOrMsg === 'string') {
      logger.info(metaOrMsg);
    } else {
      logger.info(msg || '', undefined, metaOrMsg);
    }
  },
  warn: (metaOrMsg: unknown, msg?: string) => {
    if (typeof metaOrMsg === 'string') {
      logger.warn(metaOrMsg);
    } else {
      logger.warn(msg || '', undefined, metaOrMsg);
    }
  },
  error: (metaOrMsg: unknown, msg?: string) => {
    if (typeof metaOrMsg === 'string') {
      logger.error(metaOrMsg);
    } else {
      logger.error(msg || '', undefined, metaOrMsg as Record<string, unknown>);
    }
  },
};
export default serverLogger;
