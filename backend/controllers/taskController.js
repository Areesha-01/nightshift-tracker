const Task = require('../models/Task');
const asyncHandler = require('../utils/asyncHandler');

// Only these fields may ever be written by a client — prevents
// someone from slipping createdBy or _id into a request body.
const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate', 'assignee'];

function pickAllowedFields(body) {
  const result = {};
  for (const key of ALLOWED_FIELDS) {
    if (key in body) result[key] = body[key];
  }
  return result;
}

// Create a task
exports.createTask = asyncHandler(async (req, res) => {
  const data = pickAllowedFields(req.body);

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
    .populate('createdBy', 'name email');

  res.status(201).json(populatedTask);
});

// Get all tasks
exports.getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find()
    .populate('assignee', 'name email')
    .populate('createdBy', 'name email');
  res.status(200).json(tasks);
});

// Update a task
exports.updateTask = asyncHandler(async (req, res) => {
  const updates = pickAllowedFields(req.body);

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
    .populate('createdBy', 'name email');

  if (!updatedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json(updatedTask);
});

// Delete a task
exports.deleteTask = asyncHandler(async (req, res) => {
  const deletedTask = await Task.findByIdAndDelete(req.params.id);
  if (!deletedTask) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(200).json({ message: 'Task deleted successfully' });
});