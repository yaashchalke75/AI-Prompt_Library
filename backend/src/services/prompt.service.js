const Prompt = require('../models/Prompt.model');
const ApiError = require('../utils/ApiError');

const ALLOWED_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  'a-z': { title: 1 },
  'z-a': { title: -1 },
};

// ---------------------------------------------------------------------------
// BUG FIX #1: id / _id / __v serialization
//
// `.lean()` (with or without `{ virtuals: true }`) returns a PLAIN JS OBJECT,
// not a Mongoose document. Plain objects have no `.toJSON()` method, so the
// schema's `toJSON.transform` (which renames `_id` -> `id` and strips `__v`)
// never runs. That's why the API was leaking `_id`/`__v` to the frontend.
//
// Fix: two small serialization helpers that manually apply the same
// transform logic the schema already defines, so every response — whether
// it came from `.lean()`, `.toJSON()`, or a raw Mongoose document — ends up
// in the exact same shape. This keeps a single source of truth for "what a
// prompt looks like over the wire" without touching the schema itself.
// ---------------------------------------------------------------------------

/**
 * Converts a single prompt (either a lean plain object or a Mongoose
 * document) into the canonical API shape: `id` instead of `_id`, no `__v`,
 * all other fields preserved as-is.
 */
const serializePrompt = (doc) => {
  if (!doc) return doc;

  // Mongoose documents (e.g. from `prompt.save()`) already have a working
  // `.toJSON()` that applies the schema transform correctly — reuse it
  // instead of duplicating the field-mapping logic.
  if (typeof doc.toJSON === 'function') {
    return doc.toJSON();
  }

  // Otherwise `doc` is a plain object from `.lean()`. Manually reproduce
  // the same transform: rename _id -> id, drop _id and __v, keep everything
  // else untouched.
  const { _id, __v, ...rest } = doc;
  return {
    id: _id ? _id.toString() : undefined,
    ...rest,
  };
};

/** Serializes an array of prompts (lean objects or documents) uniformly. */
const serializePrompts = (docs) => docs.map(serializePrompt);

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

  // -------------------------------------------------------------------
  // BUG FIX #2: manual drag-and-drop order being ignored
  //
  // The previous sort was:
  //   { isPinned: -1, ...ALLOWED_SORTS[sortKey], order: 1 }
  // e.g. for sort=newest: { isPinned: -1, createdAt: -1, order: 1 }
  //
  // Mongo applies compound sort keys strictly left-to-right. `order` was
  // listed last, so it only ever broke ties on IDENTICAL createdAt/title
  // values — which almost never happens. In practice this meant: drag a
  // card to reorder it -> `reorderPrompts` correctly persists new `order`
  // values -> the next fetch re-sorts by createdAt/title and the manual
  // arrangement visually reverts. The feature was silently broken.
  //
  // Decision (flagging this because the original spec is ambiguous here):
  // "custom drag order" and "sort by date/name" are two different modes
  // that can't both be primary at once. I'm treating `order` as the
  // authoritative arrangement WITHIN each pin group whenever the caller
  // hasn't explicitly asked for a dropdown sort other than the default.
  // Concretely:
  //   - Pinned prompts always float to top (as before).
  //   - Within each pin group, if the requested sort is the default
  //     ("newest"), we sort primarily by manual `order`, since that's the
  //     mode drag-and-drop is meant to control.
  //   - If the user explicitly picks Oldest / A-Z / Z-A, that becomes the
  //     primary sort within each pin group (an explicit user choice should
  //     win over a stale manual arrangement), with `order` only as the
  //     final tiebreaker.
  // This preserves both drag-and-drop (under the default view) and the
  // explicit sort dropdown (when the user actually picks one), rather than
  // one silently overriding the other on every fetch.
  // -------------------------------------------------------------------
  const sortSpec =
    sortKey === 'newest'
      ? { isPinned: -1, order: 1, createdAt: -1 }
      : { isPinned: -1, ...ALLOWED_SORTS[sortKey], order: 1 };

  const prompts = await Prompt.find(query).sort(sortSpec).lean({ virtuals: true });

  // Serialize before returning so the controller/frontend always receives
  // `id`, never `_id`/`__v`.
  return serializePrompts(prompts);
};

const getPromptById = async (id) => {
  const prompt = await Prompt.findById(id).lean({ virtuals: true });
  if (!prompt) {
    throw ApiError.notFound('Prompt not found');
  }
  return serializePrompt(prompt);
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

  // `prompt` here is a real Mongoose document, so `serializePrompt` will
  // route through `.toJSON()` (already correct) — kept for consistency so
  // every method in this file goes through the same helper, not because
  // this particular line was broken.
  return serializePrompt(prompt);
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
  return serializePrompt(prompt);
};

const deletePrompt = async (id) => {
  const prompt = await Prompt.findByIdAndDelete(id);
  if (!prompt) {
    throw ApiError.notFound('Prompt not found');
  }
  return serializePrompt(prompt);
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

  return serializePrompt(duplicate);
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
  // getAllPrompts() already serializes internally, so no double-work here.
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
    // `recent` came from `.lean({ virtuals: true })`, so it needs the same
    // serialization as every other list of prompts — this was leaking
    // _id/__v too, just less obviously since dashboard cards don't use
    // prompt.id directly today. Fixing it here for consistency and to
    // avoid the same class of bug resurfacing if this list is ever
    // rendered as cards.
    recentlyAdded: serializePrompts(recent),
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
  // Exported so this can be unit-tested directly, and reused if another
  // service ever needs to serialize a Prompt the same way.
  serializePrompt,
  serializePrompts,
};