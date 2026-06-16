# GitHub Profile Analyzer API

## 1. Project Description

A production-grade **REST API** built with Node.js and Express that:
- Fetches GitHub user profile data via the GitHub Public API
- Calculates useful insights (account age, popularity score, follower ratio, repos/year)
- Stores everything in a MySQL database
- Exposes endpoints to analyze new profiles and retrieve stored ones

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL |
| DB Driver | mysql2 (raw SQL, no ORM) |
| HTTP Client | axios |
| Config | dotenv |
| Security | helmet |
| CORS | cors |
| Logging | morgan |
| Dev Server | nodemon |

---

## 3. Folder Structure

```
github-profile-analyzer/
├── src/
│   ├── config/
│   │   └── db.js                 # MySQL connection pool
│   ├── controllers/
│   │   └── githubController.js   # Request/response handlers
│   ├── routes/
│   │   └── githubRoutes.js       # URL → controller mapping
│   ├── services/
│   │   └── githubService.js      # Business logic, GitHub API calls
│   ├── models/
│   │   └── profileModel.js       # All raw SQL queries
│   ├── middleware/
│   │   └── errorHandler.js       # Centralized error handler
│   └── utils/
│       └── calculateInsights.js  # Pure calculation functions
├── database/
│   └── schema.sql                # MySQL table definition
├── app.js                        # Express app configuration
├── server.js                     # Entry point
├── .env.example                  # Environment variable template
├── .gitignore
├── package.json
├── README.md
└── postman_collection.json
```

---

## 4. Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/github-profile-analyzer.git
cd github-profile-analyzer

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your real MySQL credentials

# 4. Create the database and table
# Log in to MySQL and run:
mysql -u root -p < database/schema.sql
# OR manually paste the contents of database/schema.sql into MySQL Workbench

# 5. Start the server
npm run dev      # development (auto-restart on changes)
npm start        # production
```

---

## 5. Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `yourpassword` |
| `DB_NAME` | MySQL database name | `github_analyzer` |
| `GITHUB_API_BASE` | GitHub API base URL | `https://api.github.com` |

---

## 6. Database Schema

```sql
CREATE TABLE IF NOT EXISTS github_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  followers INT DEFAULT 0,
  following INT DEFAULT 0,
  public_repos INT DEFAULT 0,
  public_gists INT DEFAULT 0,
  profile_url VARCHAR(255),
  account_created DATE,
  account_age_years DECIMAL(4,2),
  followers_following_ratio DECIMAL(10,2),
  repos_per_year DECIMAL(10,2),
  popularity_score INT,
  analyzed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 7. API Endpoints

| Method | URL | Description |
|---|---|---|
| `GET` | `/health` | Health check — verify server is running |
| `POST` | `/api/profile/:username` | Analyze GitHub user and store in DB |
| `GET` | `/api/profiles` | Get all stored profiles |
| `GET` | `/api/profile/:username` | Get one stored profile by username |

---

## 8. Example Requests & Responses

### Health Check
**Request:**
```
GET http://localhost:3000/health
```
**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-15T10:30:00.000Z"
}
```

---

### POST /api/profile/:username — Analyze & Store Profile
**Request:**
```
POST http://localhost:3000/api/profile/torvalds
```
**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile analyzed successfully",
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "avatar_url": "https://avatars.githubusercontent.com/u/1024025?v=4",
    "bio": "Nothing",
    "followers": 240000,
    "following": 0,
    "public_repos": 7,
    "public_gists": 0,
    "profile_url": "https://github.com/torvalds",
    "account_created": "2011-09-03",
    "account_age_years": 12.53,
    "popularity_score": 487,
    "followers_following_ratio": 240000,
    "repos_per_year": 0.56,
    "analyzed_at": "2024-03-15T10:30:00.000Z"
  }
}
```
**User Not Found Response (404):**
```json
{
  "success": false,
  "message": "GitHub user not found"
}
```

---

### GET /api/profiles — Get All Profiles
**Request:**
```
GET http://localhost:3000/api/profiles
```
**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "username": "torvalds", "name": "Linus Torvalds", "..." : "..." },
    { "username": "gaearon", "name": "Dan Abramov", "..." : "..." }
  ]
}
```

---

### GET /api/profile/:username — Get One Profile
**Request:**
```
GET http://localhost:3000/api/profile/torvalds
```
**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "...": "..."
  }
}
```
**Not Found Response (404):**
```json
{
  "success": false,
  "message": "Profile not found. Use POST /api/profile/torvalds to analyze it first."
}
```

---

## 9. Deployment

### Deploy to Render + Railway MySQL

#### Step 1 — Set Up MySQL on Railway
1. Go to [railway.app](https://railway.app) and create a new project
2. Add a **MySQL** plugin
3. Copy the connection credentials from the Railway dashboard:
   - `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_PORT`
4. Connect to Railway MySQL using a tool like **TablePlus** or MySQL CLI and run `database/schema.sql`

#### Step 2 — Deploy API to Render
1. Go to [render.com](https://render.com) and create a **New Web Service**
2. Connect your GitHub repository
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add Environment Variables in Render dashboard:
   - `PORT=3000` (Render sets its own PORT, but this is a fallback)
   - `DB_HOST` → Railway host
   - `DB_USER` → Railway user
   - `DB_PASSWORD` → Railway password
   - `DB_NAME` → Railway database name
   - `GITHUB_API_BASE=https://api.github.com`
6. Click **Deploy**

---

## 10. Postman Collection

A ready-to-use Postman collection is included at `postman_collection.json`.

**To import:**
1. Open **Postman**
2. Click **Import** → **File**
3. Select `postman_collection.json`
4. Set the `base_url` variable to `http://localhost:3000` (or your deployed URL)
5. All 4 endpoints are ready to test