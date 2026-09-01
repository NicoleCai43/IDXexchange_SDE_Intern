# IDX Exchange - Property Listing Platform

A full-stack real estate property listing application built with React, Express.js, and MySQL. Search, filter, sort, and explore properties with detailed information, image galleries, and open house schedules.

## Quick Start

### Prerequisites
- Node.js 16+
- npm 8+
- MySQL 8.0
- Git

### Setup (5 minutes)

**1. Clone & Database Setup**
```bash
git clone git@github.com:NicoleCai43/IDXexchange_SDE_Intern.git
cd IDXexchange_SDE_Intern

# Create database
mysql -u root -p
# In MySQL:
CREATE DATABASE rets;
USE rets;
SOURCE rets_property.sql;
SOURCE rets_openhouse.sql;
```

**2. Backend Setup**
```bash
cd backend
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=idxpass
DB_NAME=rets
PORT=5000
EOF

npm install
node scripts/createPropertyIndexes.js   # Create database indexes
npm run start                           # Runs on http://localhost:5000
```

**3. Frontend Setup (new terminal)**
```bash
cd frontend
npm install
npm run dev                             # Runs on http://localhost:3000
```

Visit `http://localhost:3000` in your browser.

## Features

✨ **Search & Filter** - City, zip, price range, beds, baths  
🔄 **Sorting** - By price, square footage, or bed count  
📄 **Pagination** - Navigate large property lists  
🖼️ **Image Gallery** - Full-screen lightbox with keyboard navigation  
🗺️ **Maps** - Google Maps integration for property locations  
🏠 **Open Houses** - Display upcoming open house information  
⚠️ **Error Handling** - Graceful error boundaries and messages  

## Project Structure

```
backend/                    # Express API server
├── db.js                   # MySQL connection pool
├── server.js               # Express app + middleware
├── routes/properties.js    # API endpoints + validation
├── scripts/
│   └── createPropertyIndexes.js
└── package.json

frontend/                   # React application
├── src/
│   ├── api/client.js       # API communication
│   ├── components/         # Reusable React components
│   ├── pages/              # Page-level components
│   ├── App.jsx             # Main router
│   └── styles.css
├── vite.config.js
└── package.json

.github/
└── pull_request_template.md
```

## Testing & Code Quality

```bash
# Frontend
cd frontend
npm test              # Tests with coverage
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix issues

# Backend
cd backend
npm test             # Run tests
```

**Coverage Goals:** 70%+ lines, functions, branches, statements

## Development

### Git Workflow
```bash
# Create feature branch from develop
git checkout develop
git checkout -b feat/feature-name

# Make changes with conventional commits
git commit -m "feat(sorting): add price sort toggle"
git push origin feat/feature-name
```

### Conventional Commits Format
```
feat(scope):    new feature
fix(scope):     bug fix
docs(scope):    documentation
test(scope):    test additions
refactor(scope): code restructuring
```

## API Endpoints

### GET /api/properties
Search properties with filters and sorting.

**Query Parameters:**
```
?limit=20              # Results per page
&offset=0              # Skip N results
&city=Denver           # Filter by city
&minPrice=200000       # Price range
&beds=3                # Min beds
&sortBy=L_SystemPrice  # Sort column
&sortOrder=asc         # asc/desc
```

### GET /api/properties/:id
Get full details for a single property.

### GET /api/properties/:id/openhouses
Get open house schedule.

[Complete API Documentation →](./DOCUMENTATION.md#api-reference)

## Architecture Highlights

### Request Flow
```
React Component → API Client → Vite Proxy → Express Server
  ↓ (with validation & query building)
MySQL Database → Response → State Update → Re-render
```

### Key Design Patterns

**Request Deduplication (useRef)**
- Prevents stale async updates when user navigates quickly
- Only processes response for most recent request

**Component Memoization (useCallback)**
- Prevents unnecessary re-renders of child components
- Improves performance for large property lists

**SQL Injection Prevention**
- Whitelist validation for sortBy column
- Parameterized queries with `?` placeholders
- Input validation before SQL construction

**Database Indexes**
- 7 indexes on common filter columns
- Single-column + composite indexes
- Dramatically improves query performance

[Deep Dive into Architecture →](./DOCUMENTATION.md#architecture-details)

## Known Issues & Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check MySQL running, .env correct |
| "Can't connect to backend" | Verify backend on 5000, CORS enabled |
| Slow property list | Run `node backend/scripts/createPropertyIndexes.js` |
| Tests failing | Run `npm install`, verify dependencies |

[Full Troubleshooting Guide →](./DOCUMENTATION.md#troubleshooting)

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18.3 |
| Build | Vite | 6.0 |
| Routing | React Router | 6.14 |
| Backend | Express | 4.x |
| Database | MySQL | 8.0 |
| Testing | Vitest | 1.5 |
| Code Quality | ESLint | 9.39 |

## Future Improvements

- [ ] Advanced date range filters
- [ ] Saved searches & favorites  
- [ ] User authentication
- [ ] Property comparison tool
- [ ] Virtual 3D tours
- [ ] Mortgage calculator
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Docker containerization

## Contributing

1. Create feature branch: `git checkout -b feat/your-feature`
2. Code with tests: `npm test && npm run lint`
3. Commit conventionally: `git commit -m "feat(scope): description"`
4. Push & create PR: GitHub PR template auto-fills
5. Code review → Merge to develop → Release to main

[Pull Request Template →](./.github/pull_request_template.md)

## License

Educational project for IDX Exchange internship program.

## Support

- **Setup Help:** See Quick Start section
- **Architecture Details:** See [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Code Explanations:** See inline comments in source files
- **Issues:** Open on GitHub or contact development team

---

**Status:** ✅ Complete (Sorting, Code Organization, Testing & Documentation)  
**Test Coverage:** 70%+  
**Lint:** ESLint ✓  
**Last Updated:** 2026-09-01  
**Version:** 1.0.0
