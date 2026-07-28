const express = require('express');
const controller = require('../controllers/prompt.controller');
const {
  validateCreatePrompt,
  validateUpdatePrompt,
  validateObjectId,
  validateImportPrompts,
} = require('../validators/prompt.validator');

const router = express.Router();

// Dashboard
router.get('/prompts/stats', controller.getDashboardStats);

// Import / Export (declared before /:id to avoid route collisions)
router.get('/prompts/export', controller.exportPrompts);
router.post('/prompts/import', validateImportPrompts, controller.importPrompts);

// Reorder (drag & drop persistence)
router.patch('/prompts/reorder', controller.reorderPrompts);

// Duplicate
router.post('/prompts/:id/duplicate', validateObjectId(), controller.duplicatePrompt);

// Core CRUD
router.get('/prompts', controller.getPrompts);
router.get('/prompts/:id', validateObjectId(), controller.getPrompt);
router.post('/prompts', validateCreatePrompt, controller.createPrompt);
router.put('/prompts/:id', validateObjectId(), validateUpdatePrompt, controller.updatePrompt);
router.delete('/prompts/:id', validateObjectId(), controller.deletePrompt);

module.exports = router;
