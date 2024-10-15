import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import z from 'zod';

import {DbService} from '../_core/services/dbService';
import {Action} from '../_core/type';
import {
  PASS_GOOGLE_PLATFORM,
  WEBHOOK_PASS_REGISTER_EVENT,
  WEBHOOK_PASS_UNREGISTER_EVENT,
} from '../constant';
import {
  registerGoogle,
  unregisterGoogle,
} from '../services/googleCallbackService';
import PaymentTokenRecipient from '../services/paymentTokenRecipient';
import {
  getPassByVendorIdentifier,
  notifyClient,
} from '../services/walletPassService';

const paymentTokenRecipient = new PaymentTokenRecipient();

const ISSUER_ID = '3388000000022229808'; // STL google wallet api account at https://pay.google.com/business/console/passes/BCR2DN4TRDK3RFTG/issuer/3388000000022229808

export const callback: Action = {
  path: '/',
  method: 'post',
  options: {
    schema: {
      description:
        '[Google Wallet API] Google will call this API when a wallet pass is added or removed.',
      body: z.any(),
      response: {
        200: z.undefined(),
      },
      security: [{apiKey: []}],
    },
  },
  handler: callbackHandler,
};

async function callbackHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {classId, objectId, eventType} = await paymentTokenRecipient.unseal(
    ISSUER_ID,
    request.body
  );

  const pass = await getPassByVendorIdentifier(
    dbService,
    PASS_GOOGLE_PLATFORM,
    classId,
    objectId
  );

  if (!pass) return reply.status(200).send();

  if (eventType === 'save') {
    await registerGoogle(dbService, pass.id);
    await notifyClient(dbService, pass, WEBHOOK_PASS_REGISTER_EVENT);
  } else if (eventType === 'del') {
    await unregisterGoogle(dbService, pass.id);
    await notifyClient(dbService, pass, WEBHOOK_PASS_UNREGISTER_EVENT);
  }

  return reply.status(200).send();
}
