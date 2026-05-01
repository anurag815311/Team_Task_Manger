const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private (Admin of the project)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, status, assignedTo, project } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if requester is admin of the project
    if (projectDoc.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can create tasks',
      });
    }

    // If assignedTo is provided, verify user is a member
    if (assignedTo) {
      const isMember = projectDoc.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!isMember) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user is not a member of this project',
        });
      }
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      status,
      assignedTo,
      project,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks (filtered by project, with search & filter support)
 * @route   GET /api/tasks?project=xxx&status=xxx&priority=xxx&search=xxx
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, search, assignedTo } = req.query;
    const filter = {};

    if (project) {
      // Verify user has access to this project
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({
          success: false,
          message: 'Project not found',
        });
      }

      const isMember = projectDoc.members.some(
        (m) => m.toString() === req.user._id.toString()
      );
      const isAdmin = projectDoc.admin.toString() === req.user._id.toString();

      if (!isMember && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view tasks in this project',
        });
      }

      filter.project = project;

      // Members can only see their own tasks
      if (!isAdmin) {
        filter.assignedTo = req.user._id;
      }
    } else {
      // Get all tasks user is involved with
      const projects = await Project.find({
        $or: [{ admin: req.user._id }, { members: req.user._id }],
      });
      const projectIds = projects.map((p) => p._id);
      filter.project = { $in: projectIds };
    }

    // Apply filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Apply search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private (Admin can update all fields, Members can only update status)
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);
    const isAdmin = project.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this task',
      });
    }

    // Members can only update status
    if (!isAdmin && isAssigned) {
      const allowedFields = ['status'];
      const updateFields = Object.keys(req.body);
      const isValidUpdate = updateFields.every((field) =>
        allowedFields.includes(field)
      );

      if (!isValidUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Members can only update task status',
        });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin only)
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    const project = await Project.findById(task.project);
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can delete tasks',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };
