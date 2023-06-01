const request = require('supertest');

const app = require('../../src/app');
const fs = require('mz/fs');

const wait = async (ms = 10) => new Promise((resolve) => setTimeout(resolve, ms));

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/id')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('authenticated users get a fragments by id', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment from getbyid test');

    await wait();
    const id = res.body.fragment.id;

    //const read = await readFragmentData('user1@email.com', id);

    const resGet = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(200);
    // expect(resGet.body.status).toBe('ok');
    //expect(resGet.body.fragment).toEqual(read);
    expect(resGet.text).toEqual('This is fragment from getbyid test');
  });

  test('authenticated users get a fragment by not found id', async () => {
    const resGet = await request(app).get('/v1/fragments/1').auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(404);
    expect(resGet.body.status).toBe('error');
  });

  //convert md to html
  test('markdown data can be converted to html', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# This is fragment for converting test');
    const id = postRes.body.fragment.id;

    const getRes = await request(app)
      .get(`/v1/fragments/${id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getRes.statusCode).toBe(200);
    expect(getRes.headers['content-type']).toEqual('text/html; charset=utf-8');
  });

  test('get a fragments with application/json type by id', async () => {
    const jsonData = { name: 'Heebin Lee' };
    const resJson = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send(jsonData);

    await wait();
    const id = resJson.body.fragment.id;

    const getJson = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(getJson.statusCode).toBe(200);
    expect(getJson.text).toEqual(JSON.stringify(jsonData));
    expect(getJson.headers['content-type']).toEqual('application/json; charset=utf-8');
  });

  test('get the image fragment by id', async () => {
    const filePath = `${__dirname}/../testFile/truffle.jpg`;
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(filePath));

    expect(res.statusCode).toBe(201);
    const id = res.body.fragment.id;

    const resGet = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');

    expect(resGet.statusCode).toBe(200);
    expect(resGet.headers['content-type']).toEqual('image/jpeg');
  });

  test('convert an image file to another image formats', async () => {
    const filePath = `${__dirname}/../testFile/truffle.jpg`;
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/jpeg')
      .send(fs.readFileSync(filePath));

    expect(res.statusCode).toBe(201);

    const id = res.body.fragment.id;

    const resToPng = await request(app)
      .get(`/v1/fragments/${id}.png`)
      .auth('user1@email.com', 'password1');

    expect(resToPng.statusCode).toBe(200);
    expect(resToPng.headers['content-type']).toEqual('image/png');

    const resToWebp = await request(app)
      .get(`/v1/fragments/${id}.webp`)
      .auth('user1@email.com', 'password1');

    expect(resToWebp.statusCode).toBe(200);
    expect(resToWebp.headers['content-type']).toEqual('image/webp');
  });
});
