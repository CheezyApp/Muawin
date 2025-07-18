const Task = require('../models/Task');

// Add a new task
const addTask = async (req, res) => {
  try {
    const { taskName, date, deadline, zone, branch } = req.body;

    if (!taskName || !date || !deadline || !zone || !branch) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newTask = new Task({
      taskName,
      date,
      deadline,
      zone,
      branch,
    });

    await newTask.save();
    res.status(201).json({ message: 'Task added successfully', task: newTask });
  } catch (error) {
    // console.error('Error adding task:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const { zone, branch } = req.query;
    let filter = {};
    
    if (zone && zone !== 'All') {
      filter.zone = zone;
    }
    if (branch && branch !== 'All') {
      filter.branch = branch;
    }

    const tasks = await Task.find(filter);
    res.status(200).json(tasks);
  } catch (error) {
    // console.error('Error fetching tasks:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Get a task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    // console.error('Error fetching task:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { taskName, date, deadline, zone, branch } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { taskName, date, deadline, zone, branch },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
  } catch (error) {
    // console.error('Error updating task:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    // console.error('Error deleting task:', error);


    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
}; 