# Apache Server + CSV Survey Storage Guide

This stack removes all Supabase functions and relies solely on the on-prem Node.js CSV backend to keep survey data inside your network perimeter.

## Overview
- **Frontend:** React app served by Apache (static build in `dist/`).
- **Backend:** Lightweight Node.js service (`server/index.js`) running on the same host to receive survey submissions.
- **Storage:** All survey responses are appended to a CSV file on disk for easy auditing and offline backup.

## Data Flow
1. User submits the survey form in the React app.
2. Apache proxies `/api` requests to the Node.js backend (default `http://127.0.0.1:4000`).
3. The backend validates the payload and appends it to `data/survey-responses.csv`, creating the file with headers if needed.

## Survey Schema (CSV Columns)
| Column        | Description                                      |
|---------------|--------------------------------------------------|
| id            | UUID assigned at receipt                         |
| email         | Respondent email                                 |
| profession    | Professional role                                |
| experience    | AI experience level                              |
| aiAreas       | Semicolon-separated list of selected AI areas    |
| challenge     | Biggest AI challenge                             |
| expectations  | Expectations from the content                    |
| timeSpent     | Weekly time spent with AI                        |
| frustration   | Free-form frustrations                           |
| dataConsent   | `true`/`false` flag confirming consent           |
| createdAt     | ISO 8601 timestamp when stored                   |

## Backend Endpoints
- `POST /api/survey` — accepts JSON payload matching the schema above, enforces consent and required fields, and appends to CSV.
- `GET /api/survey/export` — returns the CSV file with download headers.
- `GET /health` — simple status check and CSV path echo.

## Running the Backend
```bash
# from the repo root on your server
PORT=4000 DATA_DIR=/var/www/survey-data node server/index.js
```
- If `DATA_DIR` is not set, data is written to `./data/survey-responses.csv` relative to the repo root.
- Set `CORS_ORIGIN` if you are not proxying through Apache and need to lock down allowed origins.

## Apache Proxy Example
Add this inside your VirtualHost to keep traffic on-prem and avoid CORS:
```apache
ProxyPass /api http://127.0.0.1:4000/api
ProxyPassReverse /api http://127.0.0.1:4000/api
```

## CSV Handling Notes
- Values are quoted and internal quotes are escaped for spreadsheet compatibility.
- `aiAreas` is stored as a semicolon-separated list for readability.
- The backend creates the CSV with headers automatically on first write.

## Maintenance Tips
- Rotate or back up `data/survey-responses.csv` regularly (cron + copy to secure storage).
- Monitor the backend log (`Stored survey response ...`) to confirm writes.
- Verify download via `curl -O http://<your-domain>/api/survey/export`.
