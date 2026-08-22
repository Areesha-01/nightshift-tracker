const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const userRoutes = require('./routes/userRoutes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://nightshift-tracker.vercel.app',
  ],
}));
app.use(express.json());

// Recursively removes MongoDB operator keys ($gt, $where, etc.) from an object,
// mutating it in place instead of reassigning — required for Express 5 compatibility.
function sanitizeObject(obj) {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeObject(obj[key]);
      }
    }
  }
  return obj;
}

function mongoSanitizeMiddleware(req, res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.params);
  sanitizeObject(req.query);
  next();
}

app.use(mongoSanitizeMiddleware);

app.get('/', (req, res) => {
  res.send('NightShift API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;