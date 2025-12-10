# Apache Server + MySQL/MariaDB Survey Storage Guide

This stack removes all Supabase functions and relies on a MySQL/MariaDB database on a separate VM to store survey data securely within your network perimeter.

## Overview
- **Frontend:** React app served by Apache (static build in `dist/`).
- **Backend:** Lightweight Node.js service (`server/index.js`) running on the same host to receive survey submissions.
- **Database:** MySQL/MariaDB on separate VM (10.10.9.191:3306) - database: `ankieta_db`, host: `mariadb-cloud`
- **Storage:** All survey responses are stored in the `survey_responses` table with automatic schema creation.

## Data Flow
1. User submits the survey form in the React app.
2. Apache proxies `/api` requests to the Node.js backend (default `http://127.0.0.1:4000`).
3. The backend validates the payload and inserts it into the MySQL/MariaDB database, creating the table if needed.

## Database Schema (survey_responses table)
| Column        | Type          | Description                                      |
|---------------|---------------|--------------------------------------------------|
| id            | VARCHAR(36)   | UUID assigned at receipt (PRIMARY KEY)           |
| email         | VARCHAR(255)  | Respondent email                                 |
| profession    | VARCHAR(255)  | Professional role                                |
| experience    | VARCHAR(255)  | AI experience level                              |
| aiAreas       | TEXT          | Semicolon-separated list of selected AI areas    |
| challenge     | TEXT          | Biggest AI challenge                             |
| expectations  | TEXT          | Expectations from the content                    |
| timeSpent     | VARCHAR(255)  | Weekly time spent with AI                        |
| frustration   | TEXT          | Free-form frustrations                           |
| dataConsent   | BOOLEAN       | Consent flag (must be TRUE)                      |
| createdAt     | DATETIME      | Timestamp when stored (auto-generated)           |

**Indexes:**
- `idx_email` on `email` column
- `idx_createdAt` on `createdAt` column

## Database Configuration
The application connects to a MySQL/MariaDB database with the following default settings:

```bash
DB_HOST=mariadb-cloud          # or 10.10.9.191
DB_PORT=3306
DB_USER=ankieta_user
DB_PASSWORD=zaq1@WSXDupa
DB_NAME=ankieta_db
```

## Backend Endpoints
- `POST /api/survey` — accepts JSON payload matching the schema above, enforces consent and required fields, inserts into database
- `GET /api/survey/export` — exports all survey responses as CSV file
- `GET /health` — database connection status check

## Initial Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Database Connection
Create a `.env` file in the `server/` directory (use `.env.example` as template):
```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 3. Initialize Database
This will create the `survey_responses` table if it doesn't exist:
```bash
cd server
npm run init-db
```

### 4. Running the Backend
```bash
cd server
npm start
```

Or with custom configuration:
```bash
PORT=4000 DB_HOST=10.10.9.191 node server/index.js
```

## Apache Proxy Example
Add this inside your VirtualHost to keep traffic on-prem and avoid CORS:
```apache
ProxyPass /api http://127.0.0.1:4000/api
ProxyPassReverse /api http://127.0.0.1:4000/api
ProxyPass /health http://127.0.0.1:4000/health
ProxyPassReverse /health http://127.0.0.1:4000/health
```

## Database Features
- **Automatic table creation:** The table is created automatically on first startup if it doesn't exist
- **UTF-8 support:** Full UTF-8 (utf8mb4) character support for international characters
- **Connection pooling:** Optimized connection pooling for better performance
- **Data integrity:** Primary key and indexes ensure data consistency

## Maintenance Tips
- **Backup:** Regularly backup the `ankieta_db` database using `mysqldump`:
  ```bash
  mysqldump -h mariadb-cloud -u ankieta_user -p ankieta_db > survey_backup_$(date +%Y%m%d).sql
  ```
- **Monitor:** Check backend logs for `Stored survey response ... to database` messages
- **Export:** Download survey data via `curl -O http://<your-domain>/api/survey/export`
- **Health check:** Monitor database connectivity via `curl http://<your-domain>/health`
