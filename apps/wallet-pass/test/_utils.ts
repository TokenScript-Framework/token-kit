import {Assertions} from 'ava';
import {FastifyInstance, InjectOptions} from 'fastify';

export async function testRequest(
  server: FastifyInstance,
  request: InjectOptions,
  expected: {
    statusCode: number;
    body?: string;
    bodyAssertion?: (body: string) => boolean;
  },
  t: Assertions
) {
  const response = request.headers
    ? await server.inject({
        method: request.method,
        url: request.url,
        headers: request.headers,
      })
    : await server.inject({
        method: request.method,
        url: request.url,
      });

  t.is(response.statusCode, expected.statusCode);
  if (expected.body) {
    t.is(response.body, expected.body);
  } else if (expected.bodyAssertion) {
    t.true(expected.bodyAssertion(response.body));
  }
}

export function assertException(
  t: Assertions,
  fn: () => any,
  patialErrorMessage?: string
) {
  const error = t.throws(fn);
  t.true(!!error);
  if (patialErrorMessage) {
    t.true(error?.message.includes(patialErrorMessage));
  }
}
