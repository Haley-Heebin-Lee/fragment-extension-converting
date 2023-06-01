const request = require('supertest');
const app = require('../../src/app');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/id').expect(401));

  test('incorrect credentials are denied', () =>
    request(app).delete('/v1/fragments/id').auth('invalid@email.com', 'password').expect(401));

  test('returns 404 when id is not found', async () => {
    const deleted = await request(app)
      .delete('/v1/fragments/id')
      .auth('user1@email.com', 'password1');

    expect(deleted.statusCode).toBe(404);
  });

  test('returns 200 after DELETE and returns 404 when GET the id', async () => {
    const postRes = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('This is fragment');
    const id = postRes.body.fragment.id;
    //save data

    const deleted = await request(app)
      .delete(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    //delete data

    expect(deleted.statusCode).toBe(200); //check 200 return

    const getRes = await request(app)
      .get(`/v1/fragments/${id}`)
      .auth('user1@email.com', 'password1');
    //get by deleted id

    expect(getRes.statusCode).toBe(404);
    //should return 404
  });
});
