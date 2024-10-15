import {eq, ilike} from 'drizzle-orm';
import {createSelectSchema} from 'drizzle-zod';
import {createSigner} from 'fast-jwt';
import {FastifyInstance, FastifyReply, FastifyRequest} from 'fastify';
import z from 'zod';
import {DbService} from '../_core/services/dbService';
import {Action} from '../_core/type';
import {encrypt} from '../_core/utils/crypto';
import {errorResponseSchema} from '../constant';
import {env} from '../env';
import {projects} from '../schemas/projects';
import {
  configSchema,
  createIvByProject,
  findProjectByApiKey,
  findProjectById,
  findProjectByProject,
  ProjectConfig,
} from '../services/projectService';
import {apiKeyHeaderSchema, apiKeyOnRequest, getApiKey} from './hook';

const selectSchema = createSelectSchema(projects);

export const listProjects: Action = {
  path: '/',
  method: 'get',
  options: {
    schema: {
      description: 'List existing projects.',
      querystring: z.object({
        project: z.string().optional(),
      }),
      response: {
        200: z.array(
          z.object({
            id: z.number(),
            project: z.string(),
          })
        ),
      },
      security: [{jwt: []}],
    },
  },
  handler: listProjectsHandler,
};

async function listProjectsHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {project} = request.query as {project?: string};

  if (project) {
    const results = await dbService
      .db()
      .select({
        id: projects.id,
        project: projects.project,
      })
      .from(projects)
      .where(ilike(projects.project, `%${project}%`))
      .limit(100);
    return reply.status(200).send(results);
  } else {
    const results = await dbService
      .db()
      .select({
        id: projects.id,
        project: projects.project,
      })
      .from(projects)
      .limit(100);
    return reply.status(200).send(results);
  }
}

export const getProject: Action = {
  path: '/:id',
  method: 'get',
  options: {
    schema: {
      description: 'Get project configuration.',
      params: z.object({
        id: z.coerce.number(),
      }),
      response: {
        200: selectSchema,
      },
      security: [{jwt: []}],
    },
  },
  handler: getProjectHandler,
};

async function getProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {id} = request.params as {id: number};
  const result = await findProjectById(dbService, id);

  if (!result) {
    return reply.status(404).send({});
  }

  return reply.status(200).send(result);
}

export const createProject: Action = {
  path: '/',
  method: 'post',
  options: {
    schema: {
      description:
        'Create a new project. Project is like a service account to access common-api features, every project is assigned with a api_key as authentication credential.',
      body: z.object({
        project: z.string(),
      }),
      response: {
        201: z.object({
          id: z.number(),
          project: z.string(),
          apiKey: z.string(),
        }),
        400: errorResponseSchema,
      },
      security: [{jwt: []}],
    },
  },
  handler: createProjectHandler,
};

async function createProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {project} = request.body as {project: string};

  if (await findProjectByProject(dbService, project)) {
    return reply.status(400).send({error: 'project already exists'});
  }

  const result = await dbService
    .db()
    .insert(projects)
    .values({
      project,
      apiKey: createSigner({
        key: env.JWT_SECRET,
      })({project}),
      createdAt: Date.now(),
    })
    .returning({
      id: projects.id,
      project: projects.project,
      apiKey: projects.apiKey,
    });
  return reply.status(201).send(result[0]);
}

export const updateProject: Action = {
  path: '/',
  method: 'put',
  options: {
    schema: {
      description: 'Update project configuration.',
      headers: apiKeyHeaderSchema,
      body: z.object({
        config: configSchema,
      }),
      response: {
        200: z.object({id: z.number().optional()}),
      },
      security: [{apiKey: []}],
    },
    onRequest: apiKeyOnRequest,
  },
  handler: updateProjectHandler,
};

async function updateProjectHandler(
  this: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const dbService: DbService = this.diContainer.resolve('dbService');
  const {config} = request.body as {config: ProjectConfig};

  if (!config) {
    return reply.status(200).send({});
  }

  try {
    configSchema.parse(config);
  } catch (err: any) {
    return reply.code(400).send({error: 'invalid config'});
  }

  const apiKey = getApiKey(request);
  const project = await findProjectByApiKey(dbService, apiKey);
  if (!project) {
    return reply.status(404).send({});
  }

  const iv = createIvByProject(project.project);
  if (config?.ticket?.sk) {
    config.ticket.sk = encrypt(env.KEY_FOR_DB_CRYPTO, iv, config.ticket.sk);
  }

  if (config?.walletPass?.apple?.key) {
    config.walletPass.apple.key = encrypt(
      env.KEY_FOR_DB_CRYPTO,
      iv,
      config?.walletPass?.apple?.key
    );
  }

  if (config?.walletPass?.google?.credentials?.private_key) {
    config.walletPass.google.credentials.private_key = encrypt(
      env.KEY_FOR_DB_CRYPTO,
      iv,
      config?.walletPass?.google?.credentials?.private_key
    );
  }

  await dbService
    .db()
    .update(projects)
    .set(request.body as any)
    .where(eq(projects.id, project.id));
  return reply.status(200).send({id: project.id});
}
