const mongoose = require('mongoose');
const { CATEGORIES, LIMITS } = require('../utils/constants');

const { Schema } = mongoose;

const promptSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [LIMITS.TITLE_MAX, `Title cannot exceed ${LIMITS.TITLE_MAX} characters`],
    },
    content: {
      type: String,
      required: [true, 'Prompt content is required'],
      trim: true,
      minlength: [1, 'Prompt content cannot be empty'],
      maxlength: [LIMITS.CONTENT_MAX, `Prompt content cannot exceed ${LIMITS.CONTENT_MAX} characters`],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [LIMITS.DESCRIPTION_MAX, `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: 'Category must be one of the predefined categories',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: [
        {
          validator: (arr) => arr.length <= LIMITS.MAX_TAGS,
          message: `Cannot have more than ${LIMITS.MAX_TAGS} tags`,
        },
        {
          validator: (arr) => arr.every((tag) => typeof tag === 'string' && tag.length <= LIMITS.TAG_MAX),
          message: `Each tag must be at most ${LIMITS.TAG_MAX} characters`,
        },
      ],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    // Explicit manual ordering position, used for drag-and-drop persistence.
    // Lower values render first within their pin group.
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt (Created Date) and updatedAt (Last Updated Date)
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Normalize tags: trim, drop empties, de-duplicate case-insensitively.
promptSchema.pre('validate', function normalizeTags(next) {
  if (Array.isArray(this.tags)) {
    const seen = new Set();
    this.tags = this.tags
      .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
      .filter((tag) => tag.length > 0)
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }
  next();
});

// Indexes to support search, filter and sort efficiently.
promptSchema.index({ title: 'text', content: 'text' });
promptSchema.index({ category: 1 });
promptSchema.index({ isFavorite: 1 });
promptSchema.index({ isPinned: 1, order: 1 });
promptSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Prompt', promptSchema);
