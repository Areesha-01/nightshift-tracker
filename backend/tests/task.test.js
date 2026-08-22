const request = require('supertest');
const app = require('../app');
require('./setup');

async function registerAndLogin(email = 'taskuser@example.com') {
  const user = {
    name: 'Task User',
    email,
    password: 'Test1234',
    adminCode: process.env.ADMIN_SECRET_CODE,
  };
  await request(app).post('/api/auth/register').send(user);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: user.password });
  return res.body.token;
}

describe('Task API', () => {
  test('GET /api/tasks - rejects a request without a token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/tasks - creates a task when authenticated', async () => {
    const token = await registerAndLogin();
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write tests', status: 'To Do', priority: 'High' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Write tests');
    expect(res.body.priority).toBe('High');
  });

  test('POST /api/tasks - rejects a task with an empty title', async () => {
    const token = await registerAndLogin('empty@example.com');
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '   ' });
    expect(res.statusCode).toBe(400);
  });

  test('GET /api/tasks - returns created tasks', async () => {
    const token = await registerAndLogin('list@example.com');
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task A' });
    await request(app).post('/api/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task B' });
    const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
  });

  test('PUT /api/tasks/:id - updates a task status', async () => {
    const token = await registerAndLogin('update@example.com');
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To be updated' });
    const res = await request(app)
      .put(`/api/tasks/${create.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'In Progress' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('In Progress');
  });

  test('PUT /api/tasks/:id - cannot overwrite createdBy via update (field whitelist)', async () => {
    const token = await registerAndLogin('whitelist@example.com');
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Whitelist test' });
    const originalCreatedBy = create.body.createdBy._id || create.body.createdBy;
    const res = await request(app)
      .put(`/api/tasks/${create.body._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ createdBy: '64f000000000000000000000' });
    expect(res.statusCode).toBe(200);
    const createdByAfter = res.body.createdBy._id || res.body.createdBy;
    expect(createdByAfter).toBe(originalCreatedBy);
  });

  test('DELETE /api/tasks/:id - deletes a task', async () => {
    const token = await registerAndLogin('delete@example.com');
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'To be deleted' });
    const res = await request(app)
      .delete(`/api/tasks/${create.body._id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/i);
  });

  test('DELETE /api/tasks/:id - returns 404 for a non-existent task', async () => {
    const token = await registerAndLogin('notfound@example.com');
    const res = await request(app)
      .delete('/api/tasks/64f000000000000000000000')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });

  test('POST /api/tasks/:id/comments - adds a comment to a task', async () => {
    const token = await registerAndLogin('comment@example.com');
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Commentable task' });
    const res = await request(app)
      .post(`/api/tasks/${create.body._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'This is a comment' });
    expect(res.statusCode).toBe(200);
    expect(res.body.comments.length).toBe(1);
    expect(res.body.comments[0].text).toBe('This is a comment');
  });

  test('POST /api/tasks/:id/comments - rejects an empty comment', async () => {
    const token = await registerAndLogin('emptycomment@example.com');
    const create = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'No empty comments' });
    const res = await request(app)
      .post(`/api/tasks/${create.body._id}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: '   ' });
    expect(res.statusCode).toBe(400);
  });
});