const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @desc    Create a new project (creator becomes Admin)
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id], // Admin is also a member
    });

    // Update user role to Admin
    await User.findByIdAndUpdate(req.user._id, { role: 'Admin' });

    const populated = await Project.findById(project._id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all projects for logged-in user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    })
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if user is a member or admin
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    const isAdmin = project.admin._id.toString() === req.user._id.toString();

    if (!isMember && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this project',
      });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add member to project
 * @route   POST /api/projects/:id/members
 * @access  Private (Admin only)
 */
const addMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if requester is admin
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can add members',
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Check if already a member
    if (project.members.includes(user._id)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project',
      });
    }

    project.members.push(user._id);
    await project.save();

    const populated = await Project.findById(project._id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove member from project
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private (Admin only)
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if requester is admin
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can remove members',
      });
    }

    // Cannot remove admin from project
    if (req.params.userId === project.admin.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the project admin',
      });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();

    // Remove task assignments for removed member
    await Task.updateMany(
      { project: project._id, assignedTo: req.params.userId },
      { $unset: { assignedTo: '' } }
    );

    const populated = await Project.findById(project._id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 * @access  Private (Admin only)
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Check if requester is admin
    if (project.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only project admin can delete this project',
      });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    await Project.findByIdAndDelete(project._id);

    res.status(200).json({
      success: true,
      message: 'Project and all associated tasks deleted',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  addMember,
  removeMember,
  deleteProject,
};
