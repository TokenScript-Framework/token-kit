import {Cradle} from '@fastify/awilix';
import {AwilixContainer} from 'awilix';
import {RouteHandlerMethod, RouteShorthandOptions} from 'fastify';

export type Action = {
  path: string;
  method:
    | 'get'
    | 'head'
    | 'post'
    | 'put'
    | 'delete'
    | 'options'
    | 'patch'
    | 'all';
  options?: RouteShorthandOptions;
  handler: RouteHandlerMethod;
};

export type Controller = {
  prefix: string;
  actions: Action[];
};

type HttpMethodLimited = 'get' | 'post' | 'put' | 'delete';

export type JwtFilterRule = {
  pattern: RegExp;
  httpMethod?: HttpMethodLimited | HttpMethodLimited[];
};

export type JobHandler = (
  diContainer: AwilixContainer<Cradle>,
  fireDate: Date
) => void | Promise<any>;
