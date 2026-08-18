const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee'];

function pickAllowedFields(body, allowedList) {
  const result = {};
  for (const key of allowedList) {
    if (key in body) result[key] = body[key];
  }
  return result;
}

// Create a task (admin only — enforced by route middleware)
exports.createTask = asyncHandler(async (req, res) => {
  const data = pickAllowedFields(req.body, ALLOWED_FIELDS);

  if (!data.title || !data.title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTask = new Task({
    ...data,
    dueDate: data.dueDate || null,
    assignee: data.assignee || null,
    createdBy: req.user.id,
  });
  await newTask.save();

  const populatedTask = await Task.findById(newTask._id)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.commentedBy', 'name');

  res.status(201).json(populatedTask);
});

// Get all tasks (any verified user)
exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find()
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.commentedBy', 'name');
  res.status(200).json(tasks);
});

// Update a task — admins can edit everything, regular users can only change status
exports.updateTask = asyncHandler(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const allowedForRole = isAdmin ? ALLOWED_FIELDS : ['status'];
  const updates = pickAllowedFields(req.body, allowedForRole);

  if ('dueDate' in updates && !updates.dueDate) updates.dueDate = null;
  if ('assignee' in updates && !updates.assignee) updates.assignee = null;
  if ('title' in updates && !updates.title.trim()) {
    return res.status(400).json({ message: 'Title cannot be empty' });
  }

  const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  })
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.commentedBy', 'name');

  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json(updatedTask);
});

// Delete a task (admin only — enforced by route middleware)
exports.deleteTask = asyncHandler(async (req, res) => {
  const deletedTask = await Task.findByIdAndDelete(req.params.id);
  if (!deletedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json({ message: 'Task deleted successfully' });
});

// Add a comment (any verified user)
exports.addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  task.comments.push({ text: text.trim(), commentedBy: req.user.id });
  await task.save();

  const updatedTask = await Task.findById(req.params.id)
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email')
    .populate('comments.commentedBy', 'name');

  res.status(200).json(updatedTask);
});