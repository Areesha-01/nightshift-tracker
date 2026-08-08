const request = require('supertest');
const app = require('../app');
require('./setup');

describe('Auth API', () => {
  const validUser = { name: 'Test User', email: 'test@example.com', password: 'Test1234' };

  test('POST /api/auth/register - creates a new user with valid data', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('User registered successfully');
  });

  test('POST /api/auth/register - rejects a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'weak@example.com', password: 'abc' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/at least 8 characters/i);
  });

  test('POST /api/auth/register - rejects an invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, email: 'notanemail' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  test('POST /api/auth/register - rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test('POST /api/auth/login - logs in with correct credentials and returns a token', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(validUser.email);
  });

  test('POST /api/auth/login - rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'WrongPass1' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });

  test('POST /api/auth/login - rejects an unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nouser@example.com', password: 'Test1234' });
    expect(res.statusCode).toBe(400);
  });
});