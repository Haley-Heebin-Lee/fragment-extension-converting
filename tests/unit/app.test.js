const request = require('supertest');

const app = require('../../src/app');

describe('404 error handler', () => {
  test('get HTTP 404 error when route is not found', () =>
    request(app).get('/not-found').expect(404));
});
