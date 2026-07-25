const Task = require('../models/Task');

// Create a task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignee } = req.body;
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      assignee: assignee || null,
      createdBy: req.user.id
    });
    await newTask.save();
    const populatedTask = await Task.findById(newTask._id)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };
    if ('dueDate' in updates && !updates.dueDate) updates.dueDate = null;
    if ('assignee' in updates && !updates.assignee) updates.assignee = null;

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};