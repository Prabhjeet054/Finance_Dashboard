# Testing Guide

This project uses Jest with supertest for comprehensive integration and end-to-end testing.

## Test Files

### tests/auth.test.ts
Comprehensive authentication endpoint tests:
- **POST /api/v1/auth/register** - Registration with valid/invalid data, duplicate email detection (409)
- **POST /api/v1/auth/login** - Login success, wrong password (401), inactive user (401), validation errors (422)

### tests/access-control.test.ts
Role-based access control tests with three pre-seeded users (VIEWER, ANALYST, ADMIN):

**Records Endpoints:**
- Authorization checks (401 without auth)
- GET /api/v1/records - All roles can read
- POST /api/v1/records - Only ANALYST and ADMIN can create (201)
- DELETE /api/v1/records/:slug - Only ADMIN can delete (200)

**Dashboard Endpoints:**
- GET /api/v1/dashboard/summary - ANALYST and ADMIN only (403 for VIEWER)
- GET /api/v1/dashboard/categories - ANALYST and ADMIN only (403 for VIEWER)
- GET /api/v1/dashboard/trends - ANALYST and ADMIN only (403 for VIEWER)
- GET /api/v1/dashboard/recent - All roles allowed (200 for all)

## Running Tests

### Prerequisites
Ensure you have a running PostgreSQL database.

### PostgreSQL Configuration
```bash
# Add to .env or set environment variables
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_db"
TEST_DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_test_db"
JWT_SECRET="your_test_secret"

# Run tests
npm test

# Run with watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Test Database Reset
Each test automatically resets the database before running:
- All users are deleted
- All financial records are deleted
- Fresh seed data is created for each test suite

## Test Structure

### Helpers (tests/helpers.ts)
Utility functions for tests:
- `resetDatabase()` - Clears all data
- `seedUser()` - Creates test users
- `seedRecord()` - Creates test records
- `generateAuthToken()` - Generates JWT tokens for authenticated requests
- `disconnectDatabase()` - Closes Prisma connection after tests

### Setup (tests/setup.ts)
Jest setup file that:
- Sets NODE_ENV=test
- Configures test database
- Runs Prisma migrations on test database

## Troubleshooting

### "Can't reach database server" Error
**Solution:** Ensure PostgreSQL is running and both DATABASE_URL and TEST_DATABASE_URL are correct.

### Tests Timeout
**Solution:** Increase Jest timeout in jest.config.ts:
```ts
testTimeout: 60000, // 60 seconds
```

### JWT Token Issues
**Solution:** Ensure JWT_SECRET is set in .env:
```bash
JWT_SECRET="your_super_secret_jwt_key"
```

## Coverage Report
```bash
npm run test:coverage
```

Generates coverage report in `coverage/` directory.

## Writing New Tests

1. Create test file in `tests/` directory with `.test.ts` extension
2. Import testing utilities:
   ```ts
   import request from 'supertest';
   import app from '../src/app';
   import { resetDatabase, seedUser, disconnectDatabase } from './helpers';
   ```

3. Structure tests with beforeEach/afterAll:
   ```ts
   describe('Feature Tests', () => {
     beforeEach(async () => {
       await resetDatabase();
       // Seed test data here
     });

     afterAll(async () => {
       await disconnectDatabase();
     });

     it('should do something', async () => {
       const response = await request(app)
         .get('/api/v1/records')
         .set('Authorization', `Bearer ${token}`);

       expect(response.status).toBe(200);
     });
   });
   ```

## Best Practices

- Always reset database in beforeEach hook
- Disconnect after all tests complete
- Use descriptive test names
- Test both success and failure paths
- Check HTTP status codes and response structure
- Don't rely on database state between tests
- Use seed helpers for consistent test data
