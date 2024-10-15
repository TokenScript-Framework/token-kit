import {diContainer} from '@fastify/awilix';

export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function validateDependencies(...names: string[]) {
  if (names.some(name => !diContainer.hasRegistration(name))) {
    throw new Error(
      `Not all dependencies are registered for running, required: [${names.join(
        ', '
      )}]`
    );
  }
}
