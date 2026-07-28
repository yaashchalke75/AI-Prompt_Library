const asyncHandler = require('express-async-handler');
const promptService = require('../services/prompt.service');
const { sendSuccess } = require('../utils/apiResponse');

const getPrompts = asyncHandler(async (req, res) => {
  const { search, category, favoritesOnly, sort } = req.query;
  const prompts = await promptService.getAllPrompts({ search, category, favoritesOnly, sort });
  return sendSuccess(res, { data: prompts, message: 'Prompts fetched successfully' });
});

const getPrompt = asyncHandler(async (req, res) => {
  const prompt = await promptService.getPromptById(req.params.id);
  return sendSuccess(res, { data: prompt, message: 'Prompt fetched successfully' });
});

const createPrompt = asyncHandler(async (req, res) => {
  const prompt = await promptService.createPrompt(req.body);
  return sendSuccess(res, { statusCode: 201, data: prompt, message: 'Prompt created successfully' });
});

const updatePrompt = asyncHandler(async (req, res) => {
  const prompt = await promptService.updatePrompt(req.params.id, req.body);
  return sendSuccess(res, { data: prompt, message: 'Prompt updated successfully' });
});

const deletePrompt = asyncHandler(async (req, res) => {
  await promptService.deletePrompt(req.params.id);
  return sendSuccess(res, { data: null, message: 'Prompt deleted successfully' });
});

const duplicatePrompt = asyncHandler(async (req, res) => {
  const prompt = await promptService.duplicatePrompt(req.params.id);
  return sendSuccess(res, { statusCode: 201, data: prompt, message: 'Prompt duplicated successfully' });
});

const reorderPrompts = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;
  const prompts = await promptService.reorderPrompts(orderedIds);
  return sendSuccess(res, { data: prompts, message: 'Prompts reordered successfully' });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await promptService.getDashboardStats();
  return sendSuccess(res, { data: stats, message: 'Dashboard stats fetched successfully' });
});

const exportPrompts = asyncHandler(async (req, res) => {
  const prompts = await promptService.getAllPrompts({});
  return sendSuccess(res, { data: prompts, message: 'Prompts exported successfully' });
});

const importPrompts = asyncHandler(async (req, res) => {
  const results = await promptService.importPrompts(req.body.prompts);
  return sendSuccess(res, { data: results, message: 'Import completed' });
});

module.exports = {
  getPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  reorderPrompts,
  getDashboardStats,
  exportPrompts,
  importPrompts,
};
