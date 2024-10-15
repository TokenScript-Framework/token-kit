import {FastifyReply, FastifyRequest} from 'fastify';

const startTime = new Date();

export function health(request: FastifyRequest, reply: FastifyReply) {
  return reply.code(200).send({health: true, startTime});
}
