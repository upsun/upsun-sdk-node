# Tests Documentation

## Overview

This comprehensive test suite for the Upsun Node.js SDK includes unit, integration, and performance tests to ensure SDK quality and reliability.

## Test Structure

```
tests/
├── setup.ts                     # Configuration globale des tests
├── unit/                        # Tests unitaires
│   ├── upsun-client.test.ts    # Tests du client principal
│   ├── core/
│   │   └── oauth2-client.test.ts
│   └── tasks/                   # Task tests
│       ├── organization.test.ts
│       ├── project.test.ts
│       ├── environment.test.ts
│       ├── activity.test.ts
│       ├── application.test.ts
│       ├── backup.test.ts
│       ├── variable.test.ts
│       ├── user.test.ts
│       ├── route.test.ts
│       ├── service.test.ts
│       └── domain.test.ts
├── integration/                 # Integration tests
│   └── workflows.test.ts       # Complete workflow tests
└── performance/                 # Performance tests
    └── sdk-performance.test.ts  # Performance and memory tests
```

## Test Types

### Unit Tests (`tests/unit/`)

Unit tests verify the behavior of each component individually:

- **UpsunClient**: Configuration, authentication, task initialization
- **OAuth2Client**: Token management, refresh, error handling
- **Tasks**: All CRUD operations and specialized methods

Each test uses `nock` to mock HTTP calls and isolate tests.

### Integration Tests (`tests/integration/`)

Integration tests verify complete workflows:

- Organization creation → Project creation → Environment management
- Complete deployment with activity monitoring
- Environment lifecycle (pause, resume, deletion)
- Error handling and recovery

### Performance Tests (`tests/performance/`)

Performance tests verify:

- **Memory usage**: No memory leaks during multiple calls
- **Response time**: API call responsiveness
- **Concurrency**: Efficient handling of simultaneous calls
- **Large datasets**: Performance with big datasets
- **Error recovery**: Performance maintained after errors

## Configuration et mocking

### Setup global (`tests/setup.ts`)

- Configuration de nock pour les mocks HTTP
- Test environment variables
- Automatic mock cleanup

### Mocking with nock

Each test uses nock to intercept HTTP requests:

```typescript
nock('https://api.upsun.com').get('/users/me').reply(200, { id: 'user-123', name: 'Test User' });
```

## Test Scripts

```bash
# Run all tests
npm test

# Tests in watch mode
npm run test:watch

# Tests with coverage
npm run test:coverage

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

## Code Coverage

Jest configuration collects coverage for:

- All files in `src/` (TypeScript)
- Exclusion of generated files (`src/api/`)
- Exclusion of type definition files

Coverage targets:

- **Lines**: > 80%
- **Branches** : > 75%
- **Fonctions** : > 85%

## Bonnes pratiques

### Structure des tests

```typescript
describe('TaskName', () => {
  let client: UpsunClient;
  let task: TaskName;

  beforeEach(() => {
    client = new UpsunClient({ apiKey: 'test-key' } as any);
    task = new TaskName(client);
  });

  describe('methodName', () => {
    it('should handle success case', async () => {
      // Arrange
      nock('https://api.upsun.com').get('/endpoint').reply(200, mockData);

      // Act
      const result = await task.method();

      // Assert
      expect(result).toEqual(mockData);
    });

    it('should handle error case', async () => {
      // Arrange
      nock('https://api.upsun.com').get('/endpoint').reply(404, { error: 'Not found' });

      // Act & Assert
      await expect(task.method()).rejects.toThrow();
    });
  });
});
```

### Test Data

- Use consistent and realistic data
- Create mocks that reflect the real API
- Test edge cases and error scenarios

### Cleanup

- `nock.cleanAll()` is called automatically after each test
- Verification that all mocks have been used
- Reset client instances between tests

## Debugging

### Debug Logs

```bash
# Enable detailed logs
DEBUG=nock* npm test

# View pending mocks
console.log(nock.pendingMocks());
```

### Common Issues

1. **Unused mocks**: Check that URL and method match exactly
2. **Memory leaks**: Use `nock.cleanAll()` and avoid circular references
3. **Flaky tests**: Ensure mocks are properly configured

## Maintenance

### Adding New Tests

1. Create test file in the correct folder (`unit/`, `integration/`, `performance/`)
2. Follow existing structure and conventions
3. Add both success AND error cases
4. Check code coverage

### Updating Tests

When API changes occur:

1. Update mocks to reflect new formats
2. Add tests for new features
3. Maintain backward compatibility when possible

## CI/CD

Tests are run automatically:

- On every push/PR
- With different Node.js versions
- With code coverage verification
- With TypeScript type validation
