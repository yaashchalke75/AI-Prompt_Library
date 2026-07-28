# AI Prompt Library

A full-stack AI Prompt Management application that allows users to create, organize, search, filter, and manage reusable AI prompts through a modern React interface backed by a RESTful Express API and MongoDB database.

---

## Features

- Create, edit and delete prompts
- Search and filter prompts
- Sort prompts
- Pin & favourite prompts
- Duplicate prompts
- Copy prompt to clipboard
- Drag & Drop reordering
- Import & Export prompts (JSON)
- Dashboard statistics
- Dark / Light theme
- Responsive UI
- Keyboard accessible
- Backend CRUD APIs
- MongoDB persistence
- Form validation & centralized error handling

---

# Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS v4
- React Hook Form
- Zod
- Axios
- dnd-kit
- React Hot Toast

## Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose

---

# Important

This project uses **MongoDB Atlas as the single source of truth** for storing prompts.

Prompt data is **not stored in LocalStorage** because the application includes a backend with a database. Storing prompts in both LocalStorage and MongoDB would create duplicate data sources and synchronization issues during Create, Update, and Delete operations.

LocalStorage is used **only** to persist the user's theme preference (Dark / Light mode).

---

# Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/yaashchalke75/AI-Prompt_Library.git

cd AI-Prompt_Library
```

---

## 2. Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

---

# Database Setup

This project uses **MongoDB Atlas** for persistent storage.

### Create a MongoDB Atlas Cluster

- Create a free MongoDB Atlas account
- Create an M0 Cluster
- Create a Database User
- Allow your IP Address in Network Access
- Copy the MongoDB Connection String

Add the connection string inside:

```env
backend/.env
```

Example

```env
MONGODB_URI=your_mongodb_connection_string
```

Once configured, the backend will automatically connect to MongoDB.

---

# Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_connection_string
CLIENT_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

# Run the Project

## Start Backend

```bash
cd backend

npm run dev
```

Runs on

```
http://localhost:5000
```

---

## Start Frontend

```bash
cd frontend

npm run dev
```

Runs on

```
http://localhost:5173
```

---

# Project Structure

```
AI-Prompt_Library
│
├── frontend
│   ├── components
│   ├── features
│   ├── hooks
│   ├── services
│   ├── store
│   ├── types
│   └── utils
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── services
│   ├── validators
│   └── utils
```

---

# What I Learned

Building this project helped me gain practical experience with:

- Designing a scalable full-stack application using React and Express.
- Managing complex application state using Redux Toolkit.
- Structuring backend code with controllers, services, middleware, and validators.
- Building reusable and accessible UI components.
- Integrating MongoDB Atlas with Mongoose for persistent data storage.
- Implementing robust form validation and centralized error handling.
- Developing REST APIs and connecting them seamlessly with the frontend.

---

# Challenges Faced

Some of the most valuable engineering challenges during development included:

- Designing drag-and-drop reordering while keeping the custom order synchronized with database updates.
- Creating a clean architecture that separates business logic from controllers and UI components.
- Handling API failures gracefully while keeping the user experience smooth through loading, error, and success states.
- Managing data consistency between frontend state and backend persistence without introducing duplicate sources of truth.
- Building reusable components that remain maintainable as new features are added.

---

# Thank You

Thank you for taking the time to review this project.

I hope this submission demonstrates my understanding of modern full-stack development practices, clean architecture, and building maintainable React applications.

I appreciate your time and feedback.
