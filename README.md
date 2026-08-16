# IDX Exchange Intern

This repository contains a React frontend and an Express backend for IDX property listings.

## Project structure

- `backend/` - Express API server and database access code
- `frontend/` - Vite-powered React application

## Local setup

### Backend

1. Open a terminal in `backend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run start
   ```

The backend listens on `http://localhost:3000` and exposes the `/api/properties` and `/api/health` endpoints.

### Frontend

1. Open a terminal in `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend app:
   ```bash
   npm run dev
   ```

The frontend runs at `http://localhost:5000` and proxies API requests to `http://localhost:3000`.

## Testing

From `frontend/`:

```bash
npm test
```

This runs Vitest and validates the API client and property filter component tests.

## Notes

- The backend uses `backend/.env` for database configuration and port settings.
- The frontend is configured to proxy `/api` requests to the backend.
- The repository is organized with clean top-level folders for GitHub.

## Developer Notes (sorting, performance, and maintenance)

- Server-side sorting: the API supports `sortBy` and `sortOrder` query parameters for `/api/properties` (whitelisted fields only). Example: `/api/properties?sortBy=L_SystemPrice&sortOrder=asc`.
- Frontend: `frontend/src/api/client.js` will forward any non-empty query params to the backend. `frontend/src/components/ListingPage.jsx` includes the UI and logic to persist sorting across pages and reset sorting when filters change.
- Performance (Part B): a script to create helpful indexes is provided at `backend/scripts/createPropertyIndexes.js`. It creates single-column and composite indexes and prints `SHOW INDEXES` and an example `EXPLAIN` for a representative query. To run it against your MySQL DB:

```bash
cd backend
npm install
node scripts/createPropertyIndexes.js
```

- The SQL file `backend/sql/properties_indexes.sql` contains the same index suggestions and an EXPLAIN example for reference. Note: this SQL file may be ignored by `.gitignore` in this repo; use the script above for idempotent index creation.
- Request timing: the backend logs request durations (ms) in `backend/server.js` via a small middleware that logs timestamp, method, path, status, and duration on response finish.
- Error handling: the React app includes an `ErrorBoundary` at `frontend/src/components/ErrorBoundary.jsx` and routes are wrapped in it to catch runtime errors and provide a fallback UI.

## How to run tests

- Frontend:

```bash
cd frontend
npm install
npm test
```

- Backend:

```bash
cd backend
npm install
npm test
```

If you'd like, I can run the index script against your database and capture the `EXPLAIN` output, then add the results to this README.
