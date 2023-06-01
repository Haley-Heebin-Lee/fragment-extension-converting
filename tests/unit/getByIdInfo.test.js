const request = require('supertest');

const app = require('../../src/app');
//const { readFragmentData } = require('../../src/model/data');

const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  //working on it for A2
  test('authenticated users get fragment info by id', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment from getbyidInfo test');

    await wait();
    const id = res.body.fragment.id;
    const fragment = res.body.fragment;

    const resGet = await request(app)
      .get(`/v1/fragments/${id}/info`)
      .auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(200);
    expect(resGet.body.status).toBe('ok');
    expect(resGet.body.fragment).toEqual(fragment);
  });

  test('no fragment data by given id', async () => {
    await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment from getbyidInfo test');

    const resGet = await request(app)
      .get('/v1/fragments/id/info')
      .auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(404);
    expect(resGet.body.status).toBe('error');
  });
});
