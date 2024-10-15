import test from 'ava';
import {FastifyReply, FastifyRequest} from 'fastify';
import {Application} from '../../../src/_core/application';
import {Controller, JwtFilterRule} from '../../../src/_core/type';
import {testRequest} from '../../_utils';

function handler1(request: FastifyRequest, reply: FastifyReply) {
  reply.code(200).send('handler1');
}

async function handler2(request: FastifyRequest, reply: FastifyReply) {
  reply.code(201).send('handler2');
}

const protectedUrl = '/protected/test';

const controllers: Controller[] = [
  {
    prefix: '/',
    actions: [{path: '/test', method: 'get', handler: handler1}],
  },
  {
    prefix: '/sub',
    actions: [{path: '/test', method: 'post', handler: handler2}],
  },
  {
    prefix: '/protected',
    actions: [{path: '/test', method: 'get', handler: handler1}],
  },
  {
    prefix: '/protected',
    actions: [{path: '/test', method: 'post', handler: handler2}],
  },
  {
    prefix: '/banned-all',
    actions: [{path: '/test', method: 'all', handler: handler1}],
  },
];

const securityRules: JwtFilterRule[] = [
  {pattern: /^\/protected/, httpMethod: 'post'},
  {pattern: /^\/banned-all/},
];
const jwt =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZHVtbXkiLCJpYXQiOjE2Njg1ODk4MDN9.drk0s1kubyrs_v4CfhiJ5K7vKRQzrFdef8RJUlJz-_4';

const server = new Application()
  .controllers(controllers)
  .securityRules(securityRules)
  .build();

test('route should work', async t => {
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/test',
    },
    {statusCode: 200, body: 'handler1'},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: '/sub/test',
    },
    {statusCode: 201, body: 'handler2'},
    t
  );
});

test('jwtVerifier should work', async t => {
  await testRequest(
    server,
    {
      method: 'GET',
      url: protectedUrl,
    },
    {statusCode: 200, body: 'handler1'},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: protectedUrl,
    },
    {statusCode: 401},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: protectedUrl,
      headers: {Authorization: `Bearer ${jwt}bad`},
    },
    {statusCode: 401},
    t
  );

  await testRequest(
    server,
    {
      method: 'post',
      url: protectedUrl,
      headers: {Authorization: `Bearer ${jwt}`},
    },
    {statusCode: 201, body: 'handler2'},
    t
  );

  ['GET', 'POST', 'DELETE'].forEach(
    async (method: any) =>
      await testRequest(
        server,
        {
          method,
          url: '/banned-all/test',
        },
        {statusCode: 401},
        t
      )
  );

  ['GET', 'POST', 'DELETE'].forEach(
    async (method: any) =>
      await testRequest(
        server,
        {
          method,
          url: '/banned-all/test',
          headers: {Authorization: `Bearer ${jwt}`},
        },
        {statusCode: 200},
        t
      )
  );
});
