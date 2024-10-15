import axios from 'axios';

import {Application} from './_core/application';

import {LOGGER} from './_core/constant';
import {controllers, securityRules} from './controllers';
import {env} from './env';
import {
  walletPassCreationJobCallbackChecker,
  walletPassCreationJobChecker,
  walletPassUpdateJobChecker,
} from './jobs/walletPassesChecker';

// set axios default timeout to 10min
axios.defaults.timeout = 600_000;

const logger = LOGGER.child({from: 'index'});

const app = new Application()
  .pgOpts({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  })
  .controllers(controllers)
  .securityRules(securityRules);

if (!env.MODE || env.MODE === 'API') {
  app.start(env.FASTIFY_PORT, env.FASTIFY_ADDRESS);
}

if (!env.MODE || env.MODE === 'WATCHER') {
  app.scheduleJob('*/10 * * * * *', walletPassCreationJobChecker);
  app.scheduleJob('*/5 * * * * *', walletPassCreationJobCallbackChecker);
  app.scheduleJob('*/10 * * * * *', walletPassUpdateJobChecker);

  logger.info('Checker jobs started');
}
