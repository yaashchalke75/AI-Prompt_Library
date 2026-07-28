# AI Prompt Library

Full-stack app for creating, organizing, searching, and managing reusable AI prompts.

## Stack
- **Frontend**: React 19 + TypeScript, Vite, Redux Toolkit, Tailwind CSS v4, react-hook-form + zod, @dnd-kit, react-hot-toast
- **Backend**: Node.js + Express, MongoDB Atlas + Mongoose
- **State**: Redux Toolkit (source of truth = backend API; LocalStorage used only for theme preference)

## Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env and set MONGODB_URI to your MongoDB Atlas connection string
npm install
npm run dev        # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env   # defaults to http://localhost:5000/api, edit if needed
npm install
npm run dev        # starts on http://localhost:5173
```

Open http://localhost:5173 in your browser. Make sure the backend is running first.

## Important note on verification

This project's backend was built and logic-tested (validators, route wiring,
service logic) in a sandboxed environment **without network access to MongoDB
Atlas**. The Mongoose schema, queries, and CRUD logic follow standard,
well-established patterns and were verified as thoroughly as possible without
a live database connection, but **you should test the full CRUD flow against
your real Atlas cluster** before relying on this as final/graded work —
ideally with a REST client (Postman/Thunder Client) hitting each endpoint,
then through the actual UI.

## Architecture notes

- **Pinning + sorting + drag-and-drop**: pinned prompts always float to the
  top as a group; the selected sort (Newest/Oldest/A-Z/Z-A) applies within
  each pin group; drag-and-drop sets an explicit `order` field used as the
  final tiebreaker, effectively acting as a "custom" order layer.
- **LocalStorage vs backend DB**: the backend/MongoDB is the single source of
  truth for prompt data (per the assignment's explicit CRUD-via-API
  requirement). LocalStorage is used only for the dark/light theme
  preference — not as a duplicate copy of prompt data — to avoid two
  independent stores that could drift out of sync.
- **Folder structure**: backend follows config/models/controllers/services/
  routes/middleware/validators/utils separation. Frontend follows
  app (store)/features (Redux slices)/components (ui, layout, prompt,
  dashboard, common)/hooks/services/types/constants/utils.

## Features implemented

- Dashboard: total prompts, favorites, categories in use, recently added
- Full CRUD, duplicate, favorite/unfavorite, pin/unpin, copy to clipboard
- Drag-and-drop reordering (persisted via `PATCH /prompts/reorder`)
- Search (title + content), category filter, favorites-only filter, sort
  (Newest/Oldest/A-Z/Z-A)
- All 10 required categories, color-coded
- Import/export as JSON, with both client-side and server-side validation
- Dark/light theme toggle, persisted in LocalStorage
- Redux Toolkit for global state
- Backend REST API with MongoDB/Mongoose, full validation and centralized
  error handling
- Responsive layout (mobile/tablet/desktop), keyboard shortcuts (`n` new
  prompt, `/` focus search), focus-trapped accessible modals, loading/empty/
  error states, toast notifications
