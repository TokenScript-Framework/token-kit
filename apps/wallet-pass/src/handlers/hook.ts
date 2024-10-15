import {createVerifier} from 'fast-jwt';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {z} from 'zod';
import {env} from '../env';

const verifier = createVerifier({key: env.JWT_SECRET});

export const apiKeyHeaderSchema = z.object({'x-stl-key': z.string()});

export async function apiKeyOnRequest(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const apiKey = getApiKey(request);
  if (!apiKey || !verifier(apiKey)) {
    return reply.status(403).send({error: 'Invalid API Key'});
  }
}

export const getApiKey = (request: FastifyRequest) =>
  (request.headers as any)['x-stl-key'];

export const passkitHeaderSchema = z.object({authorization: z.string()});

export async function passkitAuthOnRequest(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authToken = getAuthToken(request);
  if (authToken !== `ApplePass ${env.PASSKIT_AUTH_TOKEN}`) {
    return reply.status(401).send({error: 'Invalid authenticationToken'});
  }
}

export const getAuthToken = (request: FastifyRequest) =>
  (request.headers as any)['authorization'];
