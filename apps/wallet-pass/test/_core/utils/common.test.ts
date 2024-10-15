import test from 'ava';
import {asValue} from 'awilix';
import {Application} from '../../../src/_core/application';
import {validateDependencies} from '../../../src/_core/utils/common';
import {assertException} from '../../_utils';

test('validateDependencies should work', t => {
  const app = new Application();

  assertException(
    t,
    () => {
      validateDependencies('value1');
    },
    'Not all dependencies are registered for running'
  );

  app.register({value1: asValue('value1')});
  t.notThrows(() => {
    validateDependencies('value1');
  });

  assertException(
    t,
    () => {
      validateDependencies('value1', 'value2');
    },
    'Not all dependencies are registered for running'
  );

  app.register({value2: asValue('value2')});
  t.notThrows(() => {
    validateDependencies('value1', 'value2');
  });
});
