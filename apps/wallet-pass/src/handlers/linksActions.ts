import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import z from 'zod';
import {DbService} from '../_core/services/dbService';
import {Action} from '../_core/type';
import {errorResponseSchema, PASS_APPLE_PLATFORM} from '../constant';
import {generateAppleWalletPassFile} from '../services/appleWalletPassService';
import {generateGoogleWalletPassLink} from '../services/googleWalletPassService';
import {findConfig} from '../services/projectService';
import {getPassById} from '../services/walletPassService';

export const getPassLink: Action = {
  path: '/wallet-pass/:id',
  method: 'get',
  options: {
    schema: {
      description: 'Get wallet pass details.',
      params: z.object({
        id: z.string(),
      }),
      response: {
        200: z.instanceof(Buffer),
        307: z.undefined(),
        404: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
  },
  handler: getPassLinkHandler,
};

async function getPassLinkHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {id} = request.params as {id: string};

  const pass = await getPassById(dbService, id);
  if (!pass) {
    return reply.status(404).send({error: 'wallet pass not found'});
  }

  const config = await findConfig(dbService, pass.apiKey);
  if (pass.platform === PASS_APPLE_PLATFORM) {
    return await generateAppleWalletPassFile(pass, config, reply);
  } else {
    return await generateGoogleWalletPassLink(pass, config, reply);
  }
}

export const getBarcodeLink: Action = {
  path: '/barcode/:id',
  method: 'get',
  options: {
    schema: {
      description: 'Get barcode link.',
      params: z.object({
        id: z.string(),
      }),
      response: {
        307: z.undefined(),
        404: errorResponseSchema,
      },
      security: [{apiKey: []}],
    },
  },
  handler: getBarcodeLinkHandler,
};

async function getBarcodeLinkHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {id} = request.params as {id: string};

  const pass = await getPassById(dbService, id);
  if (!pass || !pass.barcodeUrl) {
    return reply.status(404).send({error: 'barcode url not found'});
  }

  return reply.redirect(307, pass.barcodeUrl);
}
