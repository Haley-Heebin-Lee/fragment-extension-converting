const request = require('supertest');

const app = require('../../src/app');
//const { listFragments } = require('../../src/model/data');

const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('GET /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragments array', async () => {
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(Array.isArray(res.body.fragments)).toBe(true);
  });

  // TODO: we'll need to add tests to check the contents of the fragments array later
  test('authenticated users get a fragments array of ids', async () => {
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment 1');

    const res2 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment 2');

    await wait();
    const res = await request(app).get('/v1/fragments').auth('user1@email.com', 'password1');

    //const fragments = await listFragments('user1@email.com', 0);
    const id1 = res1.body.fragment.id;
    const id2 = res2.body.fragment.id;

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([id1, id2]);
  });

  test('authenticated users get expanded fragment', async () => {
    const post1 = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment 1');

    const frag1 = post1.body.fragment;

    const post2 = await request(app)
      .post('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .set('Content-Type', 'text/plain')
      .send('This is fragment 2');

    const frag2 = post2.body.fragment;

    await wait();
    const res = await request(app)
      .get('/v1/fragments')
      .auth('user2@email.com', 'password2')
      .query({ expand: 1 });

    //const fragments = await listFragments('user2@email.com', 1);
    //used to work, why it doesn't work with listFragment now????why????

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragments).toEqual([frag1, frag2]);
  });
});
