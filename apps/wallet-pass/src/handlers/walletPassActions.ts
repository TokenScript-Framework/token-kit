import {createInsertSchema} from 'drizzle-zod';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import z from 'zod';
import {LOGGER} from '../_core/constant';
import {DbService} from '../_core/services/dbService';
import {Action} from '../_core/type';
import {errorResponseSchema} from '../constant';
import {walletPassQueue} from '../schemas/walletPassQueue';
import {
  findWalletPassTaskById,
  updateWalletPassTaskParamsById,
} from '../services/walletPassQueueService';
import {getPassById} from '../services/walletPassService';
import {getWalletPassStatusById} from '../services/walletPassSummaryService';
import {apiKeyHeaderSchema, apiKeyOnRequest, getApiKey} from './hook';

const logger = LOGGER.child({from: 'walletPassActions'});

const insertSchema = createInsertSchema(walletPassQueue).omit({
  done: true,
  jobType: true,
  apiKey: true,
});

export const createWalletPass: Action = {
  path: '/',
  method: 'post',
  options: {
    schema: {
      description:
        'Create wallet pass. The job will be enqueued and processed in an async task.',
      headers: apiKeyHeaderSchema,
      body: insertSchema,
      response: {
        201: z.object({
          id: z.string(),
        }),
        400: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
    onRequest: apiKeyOnRequest,
  },
  handler: createWalletPassHandler,
};

async function createWalletPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  return createOrUpdateWalletPassQueueTask(
    this.diContainer.resolve('dbService'),
    request,
    reply,
    'create'
  );
}

export const updateWalletPass: Action = {
  path: '/',
  method: 'put',
  options: {
    schema: {
      description:
        'Update wallet pass. The job will be enqueued and processed in an async task.',
      headers: apiKeyHeaderSchema,
      body: insertSchema,
      response: {
        201: z.object({
          id: z.string(),
        }),
        400: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
    onRequest: apiKeyOnRequest,
  },
  handler: updateWalletPassHandler,
};

async function updateWalletPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  return createOrUpdateWalletPassQueueTask(
    this.diContainer.resolve('dbService'),
    request,
    reply,
    'update'
  );
}

async function createOrUpdateWalletPassQueueTask(
  dbService: DbService,
  request: FastifyRequest,
  reply: FastifyReply,
  jobType: string
) {
  const apiKey = getApiKey(request);
  const {id, params, callbackUrl} = request.body as z.infer<
    typeof insertSchema
  >;

  if (jobType === 'update') {
    const pass = await getPassById(dbService, id);
    if (!pass || apiKey !== pass.apiKey) {
      return reply.status(404).send({
        error: `Pass with id ${id} not found`,
      });
    }
  }

  const existingTask = await findWalletPassTaskById(dbService, id);

  if (existingTask) {
    logger.info('update wallet pass job');
    const oldParams = existingTask.params as any;
    const newParams: any = {
      ...oldParams,
      pass: {
        ...oldParams.pass,
        ...(params as any).pass,
      },
    };

    await updateWalletPassTaskParamsById(dbService, id, newParams);
  } else {
    logger.info('insert wallet pass job');
    await dbService
      .db()
      .insert(walletPassQueue)
      .values({
        id,
        apiKey,
        jobType,
        params,
        callbackUrl,
        done: -1,
      })
      .returning({
        id: walletPassQueue.id,
      });
  }

  return reply.status(201).send({id});
}

export const getWalletPassStatus: Action = {
  path: '/status',
  method: 'get',
  options: {
    schema: {
      description: 'Query wallet pass job status.',
      headers: apiKeyHeaderSchema,
      querystring: z.object({
        googlePassId: z.string(),
        applePassId: z.string(),
      }),
      response: {
        200: z.object({
          isGeneratingWalletPass: z.boolean(),
        }),
      },
    },
    onRequest: apiKeyOnRequest,
  },
  handler: getWalletPassStatusHandler,
};

async function getWalletPassStatusHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {googlePassId, applePassId} = request.query as {
    googlePassId: string;
    applePassId: string;
  };

  const result = await getWalletPassStatusById(
    dbService,
    googlePassId,
    applePassId
  );

  if (!result) {
    return reply.status(200).send({isGeneratingWalletPass: false});
  }

  return reply.status(200).send({isGeneratingWalletPass: true});
}
