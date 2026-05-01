const express = require('express');
const {
  createProject,
  getProjects,
  getProject,
  addMember,
  removeMember,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/').get(getProjects).post(createProject);
router.route('/:id').get(getProject).delete(deleteProject);
router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
