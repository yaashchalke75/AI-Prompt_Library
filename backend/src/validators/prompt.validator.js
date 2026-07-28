const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { CATEGORIES, LIMITS } = require('../utils/constants');

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

/**
 * Validates the body for creating a new prompt.
 * Throws ApiError.badRequest with field-level error details on failure.
 */
const validateCreatePrompt = (req, _res, next) => {
  const { title, content, category, description, tags } = req.body;
  const errors = {};

  if (!isNonEmptyString(title)) {
    errors.title = 'Title is required and cannot be empty';
  } else if (title.trim().length > LIMITS.TITLE_MAX) {
    errors.title = `Title cannot exceed ${LIMITS.TITLE_MAX} characters`;
  }

  if (!isNonEmptyString(content)) {
    errors.content = 'Prompt content is required and cannot be empty';
  } else if (content.trim().length > LIMITS.CONTENT_MAX) {
    errors.content = `Prompt content cannot exceed ${LIMITS.CONTENT_MAX} characters`;
  }

  if (!isNonEmptyString(category)) {
    errors.category = 'Category is required';
  } else if (!CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (description.length > LIMITS.DESCRIPTION_MAX) {
      errors.description = `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`;
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.tags = 'Tags must be an array of strings';
    } else if (tags.length > LIMITS.MAX_TAGS) {
      errors.tags = `Cannot have more than ${LIMITS.MAX_TAGS} tags`;
    } else if (!tags.every((t) => typeof t === 'string')) {
      errors.tags = 'Each tag must be a string';
    }
  }

  if (Object.keys(errors).length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }

  return next();
};

/**
 * Validates the body for updating a prompt. All fields optional, but if
 * present must satisfy the same constraints as create.
 */
const validateUpdatePrompt = (req, _res, next) => {
  const { title, content, category, description, tags, isFavorite, isPinned, order } = req.body;
  const errors = {};

  if (title !== undefined) {
    if (!isNonEmptyString(title)) {
      errors.title = 'Title cannot be empty';
    } else if (title.trim().length > LIMITS.TITLE_MAX) {
      errors.title = `Title cannot exceed ${LIMITS.TITLE_MAX} characters`;
    }
  }

  if (content !== undefined) {
    if (!isNonEmptyString(content)) {
      errors.content = 'Prompt content cannot be empty';
    } else if (content.trim().length > LIMITS.CONTENT_MAX) {
      errors.content = `Prompt content cannot exceed ${LIMITS.CONTENT_MAX} characters`;
    }
  }

  if (category !== undefined && !CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
  }

  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.description = 'Description must be a string';
    } else if (description.length > LIMITS.DESCRIPTION_MAX) {
      errors.description = `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`;
    }
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string')) {
      errors.tags = 'Tags must be an array of strings';
    } else if (tags.length > LIMITS.MAX_TAGS) {
      errors.tags = `Cannot have more than ${LIMITS.MAX_TAGS} tags`;
    }
  }

  if (isFavorite !== undefined && typeof isFavorite !== 'boolean') {
    errors.isFavorite = 'isFavorite must be a boolean';
  }

  if (isPinned !== undefined && typeof isPinned !== 'boolean') {
    errors.isPinned = 'isPinned must be a boolean';
  }

  if (order !== undefined && typeof order !== 'number') {
    errors.order = 'order must be a number';
  }

  if (Object.keys(errors).length > 0) {
    return next(ApiError.badRequest('Validation failed', errors));
  }

  return next();
};

/**
 * Validates that :id route params are well-formed Mongo ObjectIds before
 * hitting the database, avoiding cast errors leaking as 500s.
 */
const validateObjectId = (paramName = 'id') => (req, _res, next) => {
  const value = req.params[paramName];
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return next(ApiError.badRequest(`Invalid ${paramName}`));
  }
  return next();
};

/**
 * Validates the body for bulk import: expects { prompts: [...] }.
 */
const validateImportPrompts = (req, _res, next) => {
  const { prompts } = req.body;

  if (!Array.isArray(prompts)) {
    return next(ApiError.badRequest('Import payload must contain a "prompts" array'));
  }

  if (prompts.length === 0) {
    return next(ApiError.badRequest('Import payload contains no prompts'));
  }

  if (prompts.length > 1000) {
    return next(ApiError.badRequest('Cannot import more than 1000 prompts at once'));
  }

  const rowErrors = [];
  prompts.forEach((p, index) => {
    if (!p || typeof p !== 'object') {
      rowErrors.push({ index, error: 'Entry must be an object' });
      return;
    }
    if (!isNonEmptyString(p.title)) {
      rowErrors.push({ index, error: 'Missing or empty title' });
    }
    if (!isNonEmptyString(p.content)) {
      rowErrors.push({ index, error: 'Missing or empty content' });
    }
    if (!isNonEmptyString(p.category) || !CATEGORIES.includes(p.category)) {
      rowErrors.push({ index, error: 'Missing or invalid category' });
    }
  });

  if (rowErrors.length > 0) {
    return next(ApiError.badRequest('Some prompts failed validation', rowErrors));
  }

  return next();
};

module.exports = {
  validateCreatePrompt,
  validateUpdatePrompt,
  validateObjectId,
  validateImportPrompts,
};
