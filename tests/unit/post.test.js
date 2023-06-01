const request = require('supertest');

const app = require('../../src/app');
const { readFragment } = require('../../src/model/data');
const fs = require('mz/fs');

const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('authenticated users post a fragments array successfully', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment 1 from test');

    await wait();
    const fragment = await readFragment(res.body.fragment.ownerId, res.body.fragment.id);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toEqual(fragment);
  });

  test('authenticated users post a fragments array with not supported type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/javascript')
      .send('This is fragment 1 with wrong type');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });

  test('response include a Location header with a URL to GET the fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toEqual(
      `${process.env.API_URL}/v1/fragments/${res.body.fragment.id}`
    );
  });

  test('return 201 when posting image fragment', async () => {
    const filePath = `${__dirname}/../testFile/truffle.jpg`;
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(filePath));

    expect(res.statusCode).toBe(201);
  });
});
