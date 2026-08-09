import express from 'express';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  bookmarkProject,
  addProjectReview,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/bookmark')
  .post(protect, bookmarkProject);

router.route('/:id/reviews')
  .post(protect, addProjectReview);

export default router;
