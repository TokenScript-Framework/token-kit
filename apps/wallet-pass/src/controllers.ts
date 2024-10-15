import {Controller, JwtFilterRule} from './_core/type';
import {callback} from './handlers/googleCallbackActions';
import {getBarcodeLink, getPassLink} from './handlers/linksActions';
import {
  getPass,
  listUpdatablePasses,
  logMessage,
  registerDevice,
  unregisterDevice,
} from './handlers/passkitActions';
import {
  createProject,
  getProject,
  listProjects,
  updateProject,
} from './handlers/projectsActions';
import {
  createWalletPass,
  getWalletPassStatus,
  updateWalletPass,
} from './handlers/walletPassActions';

export const controllers: Controller[] = [
  {
    prefix: '/projects',
    actions: [listProjects, getProject, updateProject, createProject],
  },
  {
    prefix: '/wallet-passes',
    actions: [createWalletPass, updateWalletPass, getWalletPassStatus],
  },
  {
    prefix: '/link',
    actions: [getPassLink, getBarcodeLink],
  },
  {
    prefix: '/passkit',
    actions: [
      registerDevice,
      unregisterDevice,
      listUpdatablePasses,
      getPass,
      logMessage,
    ],
  },
  {
    prefix: '/google-callback',
    actions: [callback],
  },
];

export const securityRules: JwtFilterRule[] = [
  {pattern: /^\/projects/, httpMethod: ['post', 'get']},
];
