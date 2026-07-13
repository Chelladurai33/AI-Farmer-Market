const request = require('supertest');
const app = require('../src/index');

describe('Health Check', () => {
  it('GET /health should return 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Auth Routes', () => {
  it('POST /api/auth/register - missing fields should return 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login - invalid credentials should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'notexist@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /api/products - public endpoint should work', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('products');
  });
});

describe('Protected Routes', () => {
  it('GET /api/users/me - without token should return 401', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });

  it('POST /api/products - without token should return 401', async () => {
    const res = await request(app).post('/api/products').send({});
    expect(res.status).toBe(401);
  });
});
