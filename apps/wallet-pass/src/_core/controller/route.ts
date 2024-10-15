import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import {applyRules} from '../services/jwtService';
import {Action, Controller, JwtFilterRule} from '../type';

export function buildRoutes(
  controllers: Controller[],
  urlSecurityRules: JwtFilterRule[] = []
) {
  return async (fastify: FastifyInstance) => {
    controllers.forEach(controller => {
      fastify.register(buildController(controller.actions), {
        prefix: controller.prefix,
      });
    });

    if (urlSecurityRules.length) {
      fastify.addHook('onRequest', buildJwtVerifier(urlSecurityRules));
    }
  };
}

function buildController(actions: Action[]) {
  return async (fastify: FastifyInstance) => {
    actions.forEach(action => {
      fastify[action.method](action.path, action.options ?? {}, action.handler);
    });
  };
}

function buildJwtVerifier(urlSecurityRules: JwtFilterRule[] = []) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const matched = applyRules(request.url, request.method, urlSecurityRules);
    if (matched) {
      try {
        const decoded: any = await request.jwtVerify();
        if (!decoded.user) {
          throw new Error('Invalid JWT Payload');
        }
      } catch (e) {
        reply.code(400).send(e);
      }
    }
  };
}
