
process.env.NODE_ENV = 'test';
require('dotenv').config();
const mongoose = require('mongoose');

beforeAll(async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_testing_only';
  await mongoose.connect(process.env.MONGO_URI, { dbName: 'nightshift_test' });
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});