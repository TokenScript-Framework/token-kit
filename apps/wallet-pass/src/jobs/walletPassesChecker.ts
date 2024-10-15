import axios from 'axios';
import {ethers} from 'ethers';
import {LOGGER} from '../_core/constant';
import {DbService} from '../_core/services/dbService';
import {JobHandler} from '../_core/type';
import {env} from '../env';
import {findConfig} from '../services/projectService';
import {
  deleteWalletPassTaskById,
  findBatchOfDoneTasks,
  findBatchOfUndoneTasks,
  saveWalletPassResult,
  saveWalletResultAndCleanTask,
} from '../services/walletPassQueueService';
import {
  createWalletPass,
  updateWalletPass,
} from '../services/walletPassService';
import {getWalletPassById} from '../services/walletPassSummaryService';

const logger = LOGGER.child({from: 'walletPassesChecker'});

const BATCH_SIZE = 100;
const CHUNK_SIZE = 10;

const status = {
  creating: false,
  callback: false,
  updating: false,
};

export const walletPassCreationJobChecker: JobHandler = async diContainer => {
  if (status.creating) {
    return;
  }
  status.creating = true;
  const createTimer = setTimeout(() => {
    status.creating = false;
    logger.info('reset WalletPassCreate job running flag');
  }, 1200 * 1000); // reset in 20 mins
  try {
    logger.info('WalletPassCreate job started');
    const dbService: DbService = diContainer.resolve('dbService');
    const tasks = await findBatchOfUndoneTasks(dbService, 'create', BATCH_SIZE);

    for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
      const chunk = tasks.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async task => {
          const config = await findConfig(dbService, task.apiKey);
          if (!config?.walletPass) {
            logger.warn(
              'walletPass config not found for apiKey: %s',
              task.apiKey
            );
            return;
          }
          try {
            const result = await createWalletPass(
              dbService,
              task.apiKey,
              config,
              task.id,
              task.params
            );
            if (task.callbackUrl) {
              await saveWalletPassResult(
                dbService,
                task.id,
                task.apiKey,
                result
              );
            } else {
              await saveWalletResultAndCleanTask(
                dbService,
                task.id,
                task.apiKey,
                result
              );
            }
          } catch (e: any) {
            logger.error(
              e,
              'wallet pass creation task %s failed. %s.',
              task.id,
              e.message
            );
          }
        })
      );
    }
  } catch (err: any) {
    logger.error(err, 'wallet pass creation task failed. %s', err.message);
  } finally {
    status.creating = false;
    clearTimeout(createTimer);
    logger.info('WalletPassCreate job finished');
  }
};

export const walletPassCreationJobCallbackChecker: JobHandler =
  async diContainer => {
    if (status.callback) {
      return;
    }
    status.callback = true;
    try {
      logger.info('WalletPassCreate callback job started');
      const dbService: DbService = diContainer.resolve('dbService');
      const tasks = await findBatchOfDoneTasks(dbService, 'create');
      for (const task of tasks) {
        const result = await getWalletPassById(dbService, task.id);
        if (!result) {
          logger.warn('wallet pass not found for id: %s', task.id);
          return;
        }

        try {
          const wallet = new ethers.Wallet(env.SIGNATURE_PRIVATE_KEY);
          const messageToSign = `${task.id}-${JSON.stringify(result.result)}`;
          const signedMessage = await wallet.signMessage(messageToSign);
          await axios.post(task.callbackUrl!, {
            id: task.id,
            result: result.result,
            signedMessage,
          });
          logger.info('remove wallet pass creation job');
          await deleteWalletPassTaskById(dbService, task.id);
        } catch (err) {
          logger.error(err);
        }
      }
    } catch (err) {
      logger.error(err);
    } finally {
      status.callback = false;
      logger.info('WalletPassCreate callback job finished');
    }
  };

export const walletPassUpdateJobChecker: JobHandler = async diContainer => {
  if (status.updating) {
    return;
  }
  status.updating = true;
  const updateTimer = setTimeout(() => {
    status.updating = false;
    logger.info('reset WalletPassUpdate job running flag');
  }, 1200 * 1000); // reset in 20 mins

  try {
    logger.info('WalletPassUpdate job started');
    const dbService: DbService = diContainer.resolve('dbService');
    const tasks = await findBatchOfUndoneTasks(dbService, 'update', BATCH_SIZE);

    for (let i = 0; i < tasks.length; i += CHUNK_SIZE) {
      const chunk = tasks.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async task => {
          const config = await findConfig(dbService, task.apiKey);
          if (!config?.walletPass) {
            logger.warn(
              'walletPass config not found for apiKey: %s',
              task.apiKey
            );
            return;
          }

          try {
            await updateWalletPass(dbService, config, task.id, task.params);
            await deleteWalletPassTaskById(dbService, task.id);
          } catch (err: any) {
            logger.error(
              err,
              'wallet pass update task %s failed. %s.',
              task.id,
              err.message
            );
          }
        })
      );
    }
  } catch (err) {
    logger.error(err);
  } finally {
    status.updating = false;
    clearTimeout(updateTimer);
    logger.info('WalletPassUpdate job finished');
  }
};
