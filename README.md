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
