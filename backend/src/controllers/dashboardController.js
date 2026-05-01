const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * @desc    Get dashboard analytics
 * @route   GET /api/dashboard
 * @access  Private
 */
const getDashboard = async (req, res, next) => {
  try {
    // Get all projects for the user
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    });

    const projectIds = projects.map((p) => p._id);

    // Total tasks across user's projects
    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds },
    });

    // Tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Format tasks by status
    const statusMap = { 'To Do': 0, 'In Progress': 0, 'Done': 0 };
    tasksByStatus.forEach((item) => {
      statusMap[item._id] = item.count;
    });

    // Overdue tasks (due date is in the past and status is not Done)
    const overdueTasks = await Task.countDocuments({
      project: { $in: projectIds },
      dueDate: { $lt: new Date() },
      status: { $ne: 'Done' },
    });

    // Tasks per user
    const tasksPerUser = await Task.aggregate([
      { $match: { project: { $in: projectIds }, assignedTo: { $exists: true } } },
      {
        $group: {
          _id: '$assignedTo',
          total: { $sum: 1 },
          done: {
            $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
          },
          toDo: {
            $sum: { $cond: [{ $eq: ['$status', 'To Do'] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          email: '$user.email',
          total: 1,
          done: 1,
          inProgress: 1,
          toDo: 1,
        },
      },
    ]);

    // Tasks by priority
    const tasksByPriority = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const priorityMap = { Low: 0, Medium: 0, High: 0 };
    tasksByPriority.forEach((item) => {
      priorityMap[item._id] = item.count;
    });

    // Recent tasks
    const recentTasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        totalProjects: projects.length,
        tasksByStatus: statusMap,
        tasksByPriority: priorityMap,
        overdueTasks,
        tasksPerUser,
        recentTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard };
