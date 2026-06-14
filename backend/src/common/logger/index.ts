import winston from 'winston';
import { envConfig } from '@config/env.config';

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const transports = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format: winston.format.uncolorize(),
  }),
  new winston.transports.File({
    filename: 'logs/combined.log',
    format: winston.format.uncolorize(),
  }),
];

const logger = winston.createLogger({
  level: envConfig.LOG_LEVEL,
  format,
  transports,
});

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: any): void {
    logger.info(`[${this.context}] ${message}`, data);
  }

  error(message: string, error?: any): void {
    logger.error(`[${this.context}] ${message}`, error);
  }

  warn(message: string, data?: any): void {
    logger.warn(`[${this.context}] ${message}`, data);
  }

  debug(message: string, data?: any): void {
    logger.debug(`[${this.context}] ${message}`, data);
  }
}

export default logger;
