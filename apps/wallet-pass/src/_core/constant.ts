import pino from 'pino';
import {env} from '../env';

export const LOGGER = pino({level: env.LOG_LEVEL});

export const API_INFO = {
  title: 'Token Kit Wallet Pass API',
  description: 'An API service to manage wallet pass.',
};
