const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));
const request = require('supertest');
const app = require('../../src/app');

describe('PUT /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app)
      .put('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('update a plain text fragment and get expected properties', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const id = res.body.fragment.id;

    expect(res.statusCode).toBe(201);
    await wait();

    const resPut = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('update fragment');

    expect(resPut.statusCode).toBe(201);
    expect(resPut.body.status).toBe('ok');
    expect(resPut.body.fragment.type).toEqual('text/plain');
    expect(resPut.body.fragment.size).toEqual(15);
    await wait();

    const resGet = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(200);
    expect(resGet.body.status).toBe('ok');
    expect(resGet.body.fragment).toEqual(resPut.body.fragment);
  });

  test('returns 404 error when id is not found', async () => {
    const resPut = await request(app)
      .put(`/v1/fragments/id`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('update fragment');

    expect(resPut.statusCode).toBe(404);
  });

  test('update fragment with different content type returns 400', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    const id = res.body.fragment.id;
    await wait();

    const resPut = await request(app)
      .put(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is updated fragment');

    expect(resPut.statusCode).toBe(400);
    expect(resPut.body.status).toBe('error');
  });
});
