import {Cradle, diContainer, fastifyAwilixPlugin} from '@fastify/awilix';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyJWT from '@fastify/jwt';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import {
  asClass,
  asValue,
  AwilixContainer,
  Lifetime,
  NameAndRegistrationPair,
} from 'awilix';
import fastify, {FastifyInstance} from 'fastify';
import fastifyRawBody from 'fastify-raw-body';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod';
import * as schedule from 'node-schedule';
import {
  RecurrenceRule,
  RecurrenceSpecDateRange,
  RecurrenceSpecObjLit,
} from 'node-schedule';
import {env} from '../env';
import {API_INFO, LOGGER} from './constant';
import {health} from './controller/actions/health';
import {buildRoutes} from './controller/route';
import {DbService, PgOptions} from './services/dbService';
import {Controller, JobHandler, JwtFilterRule} from './type';

const predefinedCtls: Controller[] = [
  {
    prefix: '/health',
    actions: [{path: '/', method: 'get', handler: health}],
  },
];

export class Application {
  private server?: FastifyInstance;
  private diContainer: AwilixContainer<Cradle>;

  private ctls: Controller[] = [];
  private jwtRules: JwtFilterRule[] = [];

  constructor() {
    this.diContainer = diContainer;
  }

  controllers(value: Controller[]) {
    this.ctls = value;
    return this;
  }

  securityRules(value: JwtFilterRule[]) {
    this.jwtRules = value;
    return this;
  }

  pgOpts(value: PgOptions) {
    this.diContainer.register({
      pgOpts: asValue(value),
      dbService: asClass(DbService, {
        lifetime: Lifetime.SINGLETON,
        dispose: module => module.dispose(),
      }),
    });
    return this;
  }

  resolve<T>(name: string) {
    return this.diContainer.resolve<T>(name);
  }

  register(nameAndRegistrationPair: NameAndRegistrationPair<Cradle>) {
    this.diContainer.register(nameAndRegistrationPair);
    return this;
  }

  registrations() {
    return this.diContainer.registrations;
  }

  build() {
    this.server = fastify({
      logger: LOGGER,
      disableRequestLogging: env.NODE_ENV === 'prod',
      trustProxy: true,
      bodyLimit: 10485760, // 10 MiB,
      keepAliveTimeout: 120000,
    });

    this.server.setValidatorCompiler(validatorCompiler);
    this.server.setSerializerCompiler(serializerCompiler);

    this.server
      .withTypeProvider<ZodTypeProvider>()
      .register(helmet, {global: true})
      .register(fastifySwagger, {
        openapi: {
          info: API_INFO,
          servers: [],
          components: {
            securitySchemes: {
              jwt: {
                type: 'http',
                scheme: 'bearer',
              },
              apiKey: {
                type: 'apiKey',
                name: 'x-stl-key',
                in: 'header',
              },
            },
          },
        },
        transform: jsonSchemaTransform,
      })
      .register(cors)
      .register(fastifyJWT, {secret: env.JWT_SECRET})
      .register(fastifyRawBody, {
        global: false,
        runFirst: true,
      })
      .register(fastifyAwilixPlugin, {
        disposeOnClose: true,
        disposeOnResponse: false,
      })
      .register(fastifySwaggerUI, {
        routePrefix: '/documentation',
        uiConfig: {
          persistAuthorization: true,
        },
      })
      .register(buildRoutes([...this.ctls, ...predefinedCtls], this.jwtRules))
      .after(err => {
        if (err) {
          console.log(`register plugins failed: ${err.message}`);
          throw err;
        }
      })
      .ready()
      .then(
        () => {
          LOGGER.info('Server successfully booted!');
        },
        err => {
          LOGGER.trace('Server start error', err);
        }
      );
    return this.server;
  }

  async start(port = 3006, host = '127.0.0.1') {
    if (!this.server) {
      this.server = this.build();
    }

    await this.server.listen({port, host});

    this.server.log.info(`🚀 Server running on port ${port}`);
    this.server.log.info(
      `🚀 Api document on http://${host}:${port}/documentation`
    );
  }

  scheduleJob(
    rule:
      | RecurrenceRule
      | RecurrenceSpecDateRange
      | RecurrenceSpecObjLit
      | Date
      | string
      | number,
    handler: JobHandler
  ) {
    schedule.scheduleJob(rule, fireDate => {
      handler(this.diContainer, fireDate);
    });
    return this;
  }
}
