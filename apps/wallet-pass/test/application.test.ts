import test from 'ava';
import {asValue} from 'awilix';
import {Application} from '../src/_core/application';
import {delay} from '../src/_core/utils/common';
import {testRequest} from './_utils';

test('should register with predefined names', async t => {
  const registrations = new Application().registrations();

  const keys = Object.keys(registrations);
  t.is(keys.length, 0);
  [].forEach(key => t.true(keys.includes(key)));
});

test('should register a new service', async t => {
  const app = new Application().register({test: asValue('test')});
  t.is(app.resolve('test'), 'test');

  const registrations = app.registrations();
  t.true(Object.keys(registrations).includes('test'));
});

test('should schedule a job', async t => {
  let jobScheduled = false;
  new Application().scheduleJob('*/1 * * * * *', () => {
    jobScheduled = true;
  });
  await delay(2000);

  t.true(jobScheduled);
});

test('/health should be included as a predefined controller', async t => {
  const server = new Application().build();
  await testRequest(
    server,
    {
      method: 'GET',
      url: '/health',
    },
    {
      statusCode: 200,
      bodyAssertion: (body: string) => {
        const bodyJson = JSON.parse(body);
        return bodyJson.health && !!bodyJson.startTime;
      },
    },
    t
  );
});
