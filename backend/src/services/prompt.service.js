const Prompt = require('../models/Prompt.model');
const ApiError = require('../utils/ApiError');

const ALLOWED_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'a-z': { title: 1 },
  'z-a': { title: -1 },
};

/**
 * Builds a Mongo query object from validated query params.
 */
const buildFilterQuery = ({ search, category, favoritesOnly }) => {
  const query = {};

  if (category) {
    query.category = category;
  }

  if (favoritesOnly === 'true' || favoritesOnly === true) {
    query.isFavorite = true;
  }

  if (search && search.trim().length > 0) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { content: { $regex: escaped, $options: 'i' } },
    ];
  }

  return query;
};

const getAllPrompts = async ({ search, category, favoritesOnly, sort }) => {
  const query = buildFilterQuery({ search, category, favoritesOnly });
  const sortKey = ALLOWED_SORTS[sort] ? sort : 'newest';

  // Pinned prompts always float to top, then requested sort applies within
  // each pin group, with manual `order` as the final tiebreaker for custom
  // drag-and-drop arrangement.
  const prompts = await Prompt.find(query)
    .sort({ isPinned: -1, ...ALLOWED_SORTS[sortKey], order: 1 })
    .lean({ virtuals: true });

  return prompts;
};

const getPromptById = async (id) => {
  const prompt = await Prompt.findById(id).lean({ virtuals: true });
  if (!prompt) {
    throw ApiError.notFound('Prompt not found');
  }
  return prompt;
};

const createPrompt = async (data) => {
  // New prompts default to the back of the manual order.
  const maxOrderDoc = await Prompt.findOne().sort({ order: -1 }).select('order').lean();
  const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

  const prompt = await Prompt.create({
    title: data.title.trim(),
    content: data.content.trim(),
    description: data.description ? data.description.trim() : '',
    category: data.category,
    tags: Array.isArray(data.tags) ? data.tags : [],
    isFavorite: Boolean(data.isFavorite),
    isPinned: Boolean(data.isPinned),
    order: nextOrder,
  });

  return prompt.toJSON();
};

const updatePrompt = async (id, data) => {
  const prompt = await Prompt.findById(id);
  if (!prompt) {
    throw ApiError.notFound('Prompt not found');
  }

  const updatableFields = [
    'title',
    'content',
    'description',
    'category',
    'tags',
    'isFavorite',
    'isPinned',
    'order',
  ];

  updatableFields.forEach((field) => {
    if (data[field] !== undefined) {
      prompt[field] = typeof data[field] === 'string' ? data[field].trim() : data[field];
    }
  });

  await prompt.save(); // triggers schema validation on update
  return prompt.toJSON();
};

const deletePrompt = async (id) => {
  const prompt = await Prompt.findByIdAndDelete(id);
  if (!prompt) {
    throw ApiError.notFound('Prompt not found');
  }
  return prompt.toJSON();
};

const duplicatePrompt = async (id) => {
  const original = await Prompt.findById(id);
  if (!original) {
    throw ApiError.notFound('Prompt not found');
  }

  const maxOrderDoc = await Prompt.findOne().sort({ order: -1 }).select('order').lean();
  const nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

  const duplicate = await Prompt.create({
    title: `${original.title} (Copy)`,
    content: original.content,
    description: original.description,
    category: original.category,
    tags: original.tags,
    isFavorite: false,
    isPinned: false,
    order: nextOrder,
  });

  return duplicate.toJSON();
};

/**
 * Persists new manual ordering after a drag-and-drop reorder.
 * `orderedIds` is an array of prompt IDs in their new desired order.
 */
const reorderPrompts = async (orderedIds) => {
  const existingCount = await Prompt.countDocuments({ _id: { $in: orderedIds } });
  if (existingCount !== orderedIds.length) {
    throw ApiError.badRequest('One or more prompt IDs are invalid');
  }

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { order: index } },
    },
  }));

  await Prompt.bulkWrite(bulkOps);
  return getAllPrompts({});
};

const getDashboardStats = async () => {
  const [total, favorites, categoryAgg, recent] = await Promise.all([
    Prompt.countDocuments(),
    Prompt.countDocuments({ isFavorite: true }),
    Prompt.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Prompt.find().sort({ createdAt: -1 }).limit(5).lean({ virtuals: true }),
  ]);

  const categoryCounts = categoryAgg.reduce((acc, { _id, count }) => {
    acc[_id] = count;
    return acc;
  }, {});

  return {
    totalPrompts: total,
    favoritePrompts: favorites,
    categoriesCount: Object.keys(categoryCounts).length,
    categoryCounts,
    recentlyAdded: recent,
  };
};

const importPrompts = async (promptsData) => {
  const maxOrderDoc = await Prompt.findOne().sort({ order: -1 }).select('order').lean();
  let nextOrder = maxOrderDoc ? maxOrderDoc.order + 1 : 0;

  const results = { imported: 0, failed: 0, errors: [] };
  const toInsert = [];

  promptsData.forEach((p, index) => {
    try {
      toInsert.push({
        title: String(p.title).trim(),
        content: String(p.content).trim(),
        description: p.description ? String(p.description).trim() : '',
        category: p.category,
        tags: Array.isArray(p.tags) ? p.tags.filter((t) => typeof t === 'string') : [],
        isFavorite: Boolean(p.isFavorite),
        isPinned: false,
        order: nextOrder++,
      });
    } catch (err) {
      results.failed += 1;
      results.errors.push({ index, error: 'Malformed entry' });
    }
  });

  if (toInsert.length > 0) {
    const inserted = await Prompt.insertMany(toInsert, { ordered: false });
    results.imported = inserted.length;
  }

  return results;
};

module.exports = {
  getAllPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  reorderPrompts,
  getDashboardStats,
  importPrompts,
};
