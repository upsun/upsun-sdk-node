import nock from 'nock';

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

// nock patches shared Node core modules on import; hooks don't run in fully skipped files, so only patch inside beforeAll.
nock.restore();
beforeAll(() => {
  nock.activate();
});

// Configuration globale pour les tests
beforeEach(() => {
  // Nettoyer tous les mocks HTTP avant chaque test
  nock.cleanAll();
});

afterEach(() => {
  // Ensure all mocks have been used
  if (!nock.isDone()) {
    console.error('Pending mocks:', nock.pendingMocks());
    nock.cleanAll();
  }
});

// Configuration des variables d'environnement pour les tests
//process.env.UPSUN_CLI_TOKEN = 'test-token';
process.env.NODE_ENV = 'test';

// Configuration globale Jest
global.beforeEach(() => {
  jest.clearAllMocks();
});

// Unpatch so the next test file in this worker starts clean
afterAll(() => {
  nock.restore();
});
