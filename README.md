# Planora Backend API

> RESTful API for Planora - Digital Planner & Journal, built with Node.js + Express + Supabase

## 🚀 Tech Stack

- **Node.js** + **Express.js** — Server framework
- **Supabase** — PostgreSQL database + auth
- **Google Gemini AI** — AI-powered features
- **JWT** — Authentication
- **bcryptjs** — Password hashing
- **Helmet + Rate Limiting** — Security

## 📁 Project Structure

```
planora-backend/
├── controllers/
│   ├── authController.js
│   ├── taskController.js
│   ├── journalController.js
│   ├── goalController.js
│   ├── habitController.js
│   ├── moodController.js
│   ├── eventController.js
│   ├── aiController.js
│   └── dashboardController.js
├── routes/
│   ├── authRoutes.js
│   ├── taskRoutes.js
│   ├── journalRoutes.js
│   ├── goalRoutes.js
│   ├── habitRoutes.js
│   ├── moodRoutes.js
│   ├── eventRoutes.js
│   ├── aiRoutes.js
│   └── dashboardRoutes.js
├── middleware/
│   └── auth.js
├── config/
│   ├── supabase.js
│   └── schema.sql
├── app.js
└── server.js
```

## 🗄️ Database Schema

### Tables
| Table | Description |
|-------|-------------|
| `users` | User accounts with preferences |
| `tasks` | Task management with categories, priorities |
| `events` | Calendar events with reminders |
| `journal_entries` | Daily journal entries with mood |
| `goals` | Goal tracking with progress |
| `goal_milestones` | Milestone sub-goals |
| `habits` | Habit definitions with streaks |
| `habit_logs` | Daily habit completion logs |
| `mood_logs` | Daily mood tracking (1-10 scale) |

### Relationships
- `users` → `tasks` (1:N)
- `users` → `events` (1:N)
- `users` → `journal_entries` (1:N)
- `users` → `goals` (1:N)
- `goals` → `goal_milestones` (1:N)
- `users` → `habits` (1:N)
- `habits` → `habit_logs` (1:N)
- `users` → `mood_logs` (1:N)

## 📖 API Documentation

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Tasks
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/tasks` | Get all tasks (filterable) |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PUT | `/api/tasks/reorder` | Reorder tasks |

### Journal
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/journal` | Get all entries |
| GET | `/api/journal/:id` | Get single entry |
| POST | `/api/journal` | Create entry |
| PUT | `/api/journal/:id` | Update entry |
| DELETE | `/api/journal/:id` | Delete entry |

### Goals, Habits, Moods, Events
Similar CRUD patterns — see `routes/` folder.

### AI (Gemini)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/ai/analyze` | Productivity analysis |
| POST | `/api/ai/journal-prompts` | Generate prompts |
| POST | `/api/ai/chat` | Chat with Plora AI |
| POST | `/api/ai/suggest-goals` | Suggest goals |

## ⚙️ Installation

```bash
# Clone repository
git clone <your-backend-repo-url>
cd planora-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Fill in your .env:
# SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET, GEMINI_API_KEY

# Run schema in Supabase SQL editor
# (config/schema.sql)

# Start development
npm run dev

# Start production
npm start
```

## 🔧 Environment Variables

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=https://your-netlify-app.netlify.app

SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

JWT_SECRET=your_jwt_secret_min_32_chars

GEMINI_API_KEY=your_google_gemini_api_key
```

## ☁️ Deployment (Render)

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables in Render dashboard
7. Deploy!
