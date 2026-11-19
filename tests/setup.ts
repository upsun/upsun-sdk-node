import nock from 'nock';

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

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

// nock patches shared Node core modules; unpatch so the next test file in this worker starts clean
afterAll(() => {
  nock.restore();
});
