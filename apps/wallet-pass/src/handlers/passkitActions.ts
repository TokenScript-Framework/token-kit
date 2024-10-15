import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import z from 'zod';

import {LOGGER} from '../_core/constant';
import {DbService} from '../_core/services/dbService';
import {Action} from '../_core/type';
import {
  DEVICE_IOS_PLATFORM,
  errorResponseSchema,
  PASS_APPLE_PLATFORM,
  WEBHOOK_PASS_REGISTER_EVENT,
  WEBHOOK_PASS_UNREGISTER_EVENT,
} from '../constant';
import {generateAppleWalletPassFile} from '../services/appleWalletPassService';
import {
  findUpdatedPasses,
  getActiveRegistrationByVendorIdentifier,
  registerApple,
  unregisterApple,
} from '../services/passkitService';
import {findConfig} from '../services/projectService';
import {
  getPassByVendorIdentifier,
  notifyClient,
} from '../services/walletPassService';
import {passkitAuthOnRequest, passkitHeaderSchema} from './hook';

const logger = LOGGER.child({from: 'passkitActions'});

export const registerDevice: Action = {
  path: '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
  method: 'post',
  options: {
    schema: {
      description:
        '[Apple updatable pass web service interface] Register a device associated to a wallet pass.',
      headers: passkitHeaderSchema,
      params: z.object({
        deviceLibraryIdentifier: z.string(),
        passTypeIdentifier: z.string(),
        serialNumber: z.string(),
      }),
      body: z.object({
        pushToken: z.string(),
      }),
      response: {
        200: z.undefined(),
        201: z.undefined(),
      },
      security: [{apiKey: []}],
    },
    onRequest: passkitAuthOnRequest,
  },
  handler: registerDeviceHandler,
};

async function registerDeviceHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {deviceLibraryIdentifier, passTypeIdentifier, serialNumber} =
    request.params as {
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
      serialNumber: string;
    };
  const {pushToken} = request.body as {pushToken: string};

  const pass = await getPassByVendorIdentifier(
    dbService,
    PASS_APPLE_PLATFORM,
    passTypeIdentifier,
    serialNumber
  );

  if (!pass) return reply.status(200).send();

  await registerApple(
    dbService,
    pass.id,
    DEVICE_IOS_PLATFORM, // Following Ethpass exported data to set platform for apple device
    deviceLibraryIdentifier,
    pushToken
  );
  await notifyClient(dbService, pass, WEBHOOK_PASS_REGISTER_EVENT);

  return reply.status(201).send();
}

export const unregisterDevice: Action = {
  path: '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
  method: 'delete',
  options: {
    schema: {
      description:
        '[Apple updatable pass web service interface] Unregister a device associated to a wallet pass.',
      headers: passkitHeaderSchema,
      params: z.object({
        deviceLibraryIdentifier: z.string(),
        passTypeIdentifier: z.string(),
        serialNumber: z.string(),
      }),
      response: {
        200: z.undefined(),
        404: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
    onRequest: passkitAuthOnRequest,
  },
  handler: unregisterDeviceHandler,
};

async function unregisterDeviceHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {deviceLibraryIdentifier, passTypeIdentifier, serialNumber} =
    request.params as {
      deviceLibraryIdentifier: string;
      passTypeIdentifier: string;
      serialNumber: string;
    };

  const passRegInfo = await getActiveRegistrationByVendorIdentifier(
    dbService,
    DEVICE_IOS_PLATFORM,
    deviceLibraryIdentifier,
    PASS_APPLE_PLATFORM,
    passTypeIdentifier,
    serialNumber
  );

  if (passRegInfo) {
    await unregisterApple(dbService, [passRegInfo.regId]);
    await notifyClient(dbService, passRegInfo, WEBHOOK_PASS_UNREGISTER_EVENT);
  }

  return reply.status(200).send();
}

export const listUpdatablePasses: Action = {
  path: '/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier',
  method: 'get',
  options: {
    schema: {
      description:
        '[Apple updatable pass web service interface] Query updated passes of a specific passTypeIdentifier for a device.',
      params: z.object({
        deviceLibraryIdentifier: z.string(),
        passTypeIdentifier: z.string(),
      }),
      querystring: z.object({
        passesUpdatedSince: z.string().optional(),
      }),
      response: {
        201: z.object({
          serialNumbers: z.array(z.string()),
          lastUpdated: z.string(),
        }),
        204: z.undefined(),
      },
      security: [{apiKey: []}],
    },
  },
  handler: listUpdatablePassesHandler,
};

async function listUpdatablePassesHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {deviceLibraryIdentifier, passTypeIdentifier} = request.params as {
    deviceLibraryIdentifier: string;
    passTypeIdentifier: string;
  };
  const {passesUpdatedSince} = request.query as {passesUpdatedSince: string};
  const previousUpdated = new Date(Number(passesUpdatedSince || 0) * 1000);

  const result = await findUpdatedPasses(
    dbService,
    DEVICE_IOS_PLATFORM,
    deviceLibraryIdentifier,
    passTypeIdentifier,
    previousUpdated
  );
  if (result) return reply.status(200).send(result);

  return reply.status(204).send();
}

export const getPass: Action = {
  path: '/v1/passes/:passTypeIdentifier/:serialNumber',
  method: 'get',
  options: {
    schema: {
      description:
        '[Apple updatable pass web service interface] Download wallet pass pkpass file.',
      headers: passkitHeaderSchema.merge(
        z.object({
          'if-modified-since': z.string().optional(),
        })
      ),
      params: z.object({
        passTypeIdentifier: z.string(),
        serialNumber: z.string(),
      }),
      response: {
        200: z.instanceof(Buffer),
        304: z.undefined(),
        404: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
    onRequest: passkitAuthOnRequest,
  },
  handler: getPassHandler,
};

async function getPassHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const ifModifiedSince = request.headers['if-modified-since'] || 0;
  const {passTypeIdentifier, serialNumber} = request.params as {
    passTypeIdentifier: string;
    serialNumber: string;
  };

  const pass = await getPassByVendorIdentifier(
    dbService,
    PASS_APPLE_PLATFORM,
    passTypeIdentifier,
    serialNumber
  );
  if (!pass) {
    return reply.status(404).send({error: 'wallet pass not found'});
  }
  if (Math.round(pass.updatedAt!.getTime() / 1000) <= Number(ifModifiedSince)) {
    return reply.status(304).send();
  }

  const config = await findConfig(dbService, pass.apiKey);
  return await generateAppleWalletPassFile(pass, config, reply);
}

export const logMessage: Action = {
  path: '/v1/log',
  method: 'post',
  options: {
    schema: {
      description:
        '[Apple updatable pass web service interface] Echo log messages.',
      body: z.object({
        logs: z.array(z.string()),
      }),
      response: {
        200: z.undefined(),
      },
      security: [{apiKey: []}],
    },
  },
  handler: logMessageHandler,
};

async function logMessageHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {logs} = request.body as {logs: string[]};
  logger.info(logs.join(';'));

  return reply.status(200).send();
}
