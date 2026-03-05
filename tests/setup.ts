import nock from 'nock';

import dotenv from 'dotenv';

const dotenvLogSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
dotenv.config();
dotenvLogSpy.mockRestore();

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
