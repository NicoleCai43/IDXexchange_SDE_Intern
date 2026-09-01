# IDX Exchange - Complete Documentation

## Project Overview & Architecture

### About This Project
IDX Exchange is a full-stack real estate property listing platform built with React, Express.js, and MySQL. It's designed for the IDX Exchange internship program to demonstrate modern web development practices including frontend development, backend APIs, database design, testing, and deployment practices.

### Key Features
- **Property Search & Filtering**: Search by city, zip, price, beds, and baths
- **Sorting**: Sort by price, square footage, or bed count in ascending or descending order
- **Pagination**: Browse large property lists with compact pagination controls
- **Property Details**: Full property information with image gallery and location maps
- **Open Houses**: Display open house schedules parsed from property data
- **Error Handling**: Graceful error boundaries and user-friendly error messages

### Technical Stack
- **Frontend**: React 18, Vite 6, React Router 6, Vitest, ESLint
- **Backend**: Node.js, Express 4, MySQL2/Promise
- **Database**: MySQL 8 with 7 optimized indexes
- **Testing**: Vitest (frontend & backend), React Testing Library
- **Code Quality**: ESLint, PropTypes, conventional commits

## Architecture Details

### Request-Response Flow

```
User Action (click filter button)
    ↓
ListingPage.jsx updates state
    ↓
Calls loadProperties(newFilters)
    ↓
client.js builds query string
    ↓
fetch() sends GET /api/properties?city=Denver&minPrice=200000...
    ↓
Vite dev server proxies to backend:5000
    ↓
Express server receives request
    ↓
Request logger middleware logs timestamp, method, path
    ↓
Route handler in properties.js processes request:
  1. validateQuery() checks parameter types and bounds
  2. buildPropertyQuery() constructs SQL WHERE clause
  3. Filter values combined with AND logic
  4. sortBy column validated against SORT_WHITELIST (SQL injection protection)
  5. ORDER BY clause added if sorting requested
  6. LIMIT/OFFSET added for pagination
    ↓
pool.query() executes SQL against MySQL
    ↓
Result rows returned (e.g., 20 properties + total count)
    ↓
Response sent: {results: [...], total: 245}
    ↓
Frontend receives response
    ↓
ListingPage updates properties state
    ↓
Components re-render with new data
    ↓
User sees filtered/sorted property list
```

### Key Components & Their Responsibilities

#### `src/api/client.js` - API Communication Layer
**Purpose**: Centralize all backend API calls with error handling.

**Key Functions**:
```javascript
// Core fetch wrapper with error handling
requestJson(path) 
  - Handles network errors
  - Validates response format
  - Throws descriptive errors

// Dynamically build query string
fetchProperties({limit, offset, city, zipcode, minPrice, ...})
  - Filters out empty values to keep URL clean
  - Sends GET /api/properties?city=Denver&minPrice=200000...
  - Returns {results: [], total: number}

// Get single property details
fetchPropertyDetail(id)
  - Sends GET /api/properties/:id
  - Returns full property object
```

**Why Separate**: Keeps API logic isolated, easier to test, easier to switch from fetch to axios later.

#### `src/pages/ListingPage.jsx` - Main Listing Page
**Purpose**: Orchestrate the listing experience with filters, sorting, and pagination.

**Key State** (11 useState calls + 1 useRef):
```javascript
const [properties, setProperties] = useState([])        // Search results
const [total, setTotal] = useState(0)                 // Total match count
const [page, setPage] = useState(1)                   // Current page number
const [filters, setFilters] = useState({})            // Active filters
const [sortBy, setSortBy] = useState("")              // Sort column
const [sortOrder, setSortOrder] = useState("asc")    // asc or desc
const [loading, setLoading] = useState(true)         // Loading indicator
const [error, setError] = useState("")                // Error message
const requestIdRef = useRef(0)                       // Prevent stale updates
```

**Complex Logic Explained**:
```javascript
// Prevents race condition: if user clicks "next page" then "prev page" quickly,
// we only process the response for the most recent request
const loadProperties = useCallback(async (params = {}, pageNumber = 1) => {
  const currentRequestId = ++requestIdRef.current; // Increment ID
  setLoading(true);
  
  const data = await fetchProperties({...params});
  
  // Only update state if this is still the current request
  if (requestIdRef.current !== currentRequestId) return;
  
  setProperties(data.results);
  setTotal(data.total);
  setPage(pageNumber);
}, [sortBy, sortOrder]); // Must include these to use their latest values
```

#### `src/components/PropertyFilters.jsx` - Filter Form
**Purpose**: Capture user filter preferences and submit them.

**Key Behavior**:
```javascript
function handleSubmit(event) {
  // Build object with only non-empty values
  const params = Object.entries(formValues)
    .filter(([_, value]) => value !== '')
    .reduce((acc, [key, value]) => ({...acc, [key]: value}), {});
  
  // Send to parent (ListingPage)
  onSearch(params);
}
```

**Why Non-Empty Filtering**: Keeps URL clean: `/api/properties?city=Denver` instead of `/api/properties?city=Denver&zip=&minPrice=&maxPrice=`

#### `src/components/PropertyImageGallery.jsx` - Full Image Gallery
**Purpose**: Display full-size images in a lightbox with keyboard controls.

**Key Logic**:
```javascript
// Parse photos from multiple possible formats
function parsePhotos(rawPhotos) {
  if (Array.isArray(rawPhotos)) return rawPhotos;        // Already array
  if (typeof rawPhotos === 'string') 
    return JSON.parse(rawPhotos);  // JSON string
  return [];                        // Invalid format
}

useEffect(() => {
  if (!lightboxOpen) return;  // Only listen when lightbox open
  
  function onKey(e) {
    if (e.key === 'Escape') setLightboxOpen(false);
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  }
  
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);  // Cleanup
}, [lightboxOpen, mainIndex]);
```

**Why useRef for lightboxInnerRef**: Focus management - after closing lightbox, focus returns to the open button so keyboard users don't lose their place.

#### `backend/routes/properties.js` - API Endpoints
**Purpose**: Provide REST endpoints for property search, detail, and open houses.

**Key Validation Function** (prevents SQL injection):
```javascript
const SORT_WHITELIST = new Set(['L_SystemPrice', 'LM_Int2_3', 'L_Keyword2']);

function validateQuery(params) {
  const { sortBy, sortOrder } = params;
  
  // Only allow whitelisted columns for ORDER BY
  if (sortBy && !SORT_WHITELIST.has(sortBy)) {
    throw new Error(`Invalid sortBy: ${sortBy}`);
  }
  
  // Only allow asc/desc
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    throw new Error(`Invalid sortOrder: ${sortOrder}`);
  }
  
  // Validate numeric ranges
  if (params.minPrice && isNaN(Number(params.minPrice))) {
    throw new Error('minPrice must be a number');
  }
}
```

**Why Whitelist**: User could send `sortBy=L_Address;DROP TABLE properties;--` to execute arbitrary SQL. Whitelist ensures only safe columns are used.

**Dynamic Query Building**:
```javascript
function buildPropertyQuery(filters) {
  let query = 'SELECT * FROM rets_property WHERE 1=1';
  const values = [];
  
  if (filters.city) {
    query += ' AND L_City = ?';
    values.push(filters.city);
  }
  
  if (filters.minPrice) {
    query += ' AND L_SystemPrice >= ?';
    values.push(Number(filters.minPrice));
  }
  
  // ... more filters combined with AND
  
  // Add sorting if requested
  if (filters.sortBy) {
    query += ` ORDER BY ${filters.sortBy} ${filters.sortOrder || 'ASC'}`;
  }
  
  // Add pagination
  query += ' LIMIT ? OFFSET ?';
  values.push(Number(filters.limit), Number(filters.offset));
  
  return { query, values };
}
```

**Why `?` placeholders**: Prevents SQL injection by escaping special characters in user input.

#### `backend/db.js` - Database Connection Pool
**Purpose**: Manage MySQL connections efficiently.

**Key Code**:
```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,           // Max 10 concurrent connections
  queueLimit: 0                  // Unlimited queued requests
});

// Use with async/await
const [rows, fields] = await pool.query(sql, values);
```

**Why Connection Pool**: Creating a new connection for each request is slow. Pool reuses connections, reducing latency.

## Testing Strategy

### Frontend Tests (Vitest + React Testing Library)

**Test Files**:
- `src/api/client.test.js` - Test fetch utilities (3 tests)
- `src/components/*.test.jsx` - Test components in isolation (8 tests)

**Testing Philosophy**:
- Test user behavior, not implementation details
- Mock external APIs and dependencies
- Use `waitFor()` for async operations
- Use `getByRole()` / `getByLabelText()` for accessibility

**Example Test**:
```javascript
// Test that PropertyFilters submits only non-empty values
test('calls onSearch with only non-empty values', async () => {
  const mockSearch = vi.fn();
  render(
    <PropertyFilters
      initialFilters={{}}
      onSearch={mockSearch}
      onClear={() => {}}
    />
  );
  
  // User fills in city and price
  await userEvent.type(screen.getByLabelText('City'), 'Denver');
  await userEvent.type(screen.getByLabelText('Min Price'), '200000');
  
  // User clicks search
  await userEvent.click(screen.getByText('Search'));
  
  // Verify form submitted with only non-empty values
  expect(mockSearch).toHaveBeenCalledWith({
    city: 'Denver',
    minPrice: '200000'
  });
});
```

**Coverage Goals**: 70%+ lines, functions, branches, statements

### Backend Tests (Vitest)

**Test Files**:
- `backend/routes/properties.test.js` - Test validation and query building

**Example Test**:
```javascript
test('validates sortBy against whitelist', () => {
  const params = { sortBy: 'L_Address; DROP TABLE properties;--' };
  
  expect(() => validateQuery(params))
    .toThrow('Invalid sortBy');
});

test('buildPropertyQuery includes ORDER BY when sorting requested', () => {
  const { query } = buildPropertyQuery({
    sortBy: 'L_SystemPrice',
    sortOrder: 'desc',
    limit: 20,
    offset: 0
  });
  
  expect(query).toContain('ORDER BY L_SystemPrice DESC');
});
```

## Performance Optimizations

### Database Indexes
```sql
-- Single column indexes
CREATE INDEX idx_rets_property_city ON rets_property(L_City);
CREATE INDEX idx_rets_property_zip ON rets_property(L_Zip);
CREATE INDEX idx_rets_property_price ON rets_property(L_SystemPrice);
CREATE INDEX idx_rets_property_beds ON rets_property(L_Keyword2);
CREATE INDEX idx_rets_property_baths ON rets_property(LM_Dec_3);

-- Composite indexes for common filter combinations
CREATE INDEX idx_rets_property_city_price_beds ON rets_property(L_City, L_SystemPrice, L_Keyword2);
CREATE INDEX idx_rets_property_price_date ON rets_property(L_SystemPrice, listing_date);
```

**Impact**: Without indexes, queries scan entire table (slow). With indexes, MySQL finds matching rows using B-tree structure (fast).

### Frontend Optimizations

**Request Deduplication** (requestIdRef):
- Prevents stale async updates from slow network requests
- Improves UX: user gets latest data, not overwritten by old requests

**Component Memoization** (useCallback):
```javascript
// Without useCallback: function recreated on every render
// -> Causes child components to re-render even if props haven't changed
const loadProperties = useCallback(async () => {...}, [sortBy, sortOrder]);
// Only recreates when sortBy or sortOrder changes
```

**Query Parameter Optimization**:
```javascript
// Don't send empty values in URL
const params = Object.entries(filters)
  .filter(([_, v]) => v !== '')
  .reduce((acc, [k, v]) => ({...acc, [k]: v}), {});
```

## Code Quality Standards

### ESLint Configuration
- PropTypes validation (error if prop type missing)
- React Hooks validation (error if deps array wrong)
- Console warnings for console.log in production code
- Accessibility rules

### PropTypes Usage
Every component must have PropTypes for all props:
```javascript
PropertyCard.propTypes = {
  property: PropTypes.shape({
    L_ListingID: PropTypes.string,
    L_Address: PropTypes.string,
    L_Photos: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
  }).isRequired
};
```

### Code Comments
Comments explain **WHY** not WHAT:

**Good Comment**:
```javascript
// useRef prevents stale async state updates when user navigates quickly
const requestIdRef = useRef(0);
```

**Bad Comment**:
```javascript
// Increment request ID
requestIdRef.current++;  // Already obvious from code
```

## Common Tasks

### Adding a New Filter

1. **Add to PropertyFilters.jsx**:
```javascript
const [formValues, setFormValues] = useState({
  ...
  newFilter: initialFilters.newFilter || "",
});
```

2. **Update validation in backend**:
```javascript
function validateQuery(params) {
  if (params.newFilter && isNaN(Number(params.newFilter))) {
    throw new Error('newFilter must be numeric');
  }
}
```

3. **Add to query builder**:
```javascript
if (filters.newFilter) {
  query += ' AND column_name = ?';
  values.push(filters.newFilter);
}
```

4. **Add test**:
```javascript
test('filters by newFilter correctly', async () => {
  const result = await fetchProperties({ newFilter: 'value' });
  expect(result.results[0]).toHaveProperty('newFilter', 'value');
});
```

### Debugging

**Frontend**:
- Use React DevTools browser extension to inspect component state
- Use Network tab in DevTools to see API requests/responses
- Use Console for error messages

**Backend**:
- Check backend logs: look for "Request logged: ..." messages
- Use `console.log()` to debug (will show in terminal)
- Check MySQL directly: `SELECT * FROM rets_property WHERE ...;`

**Database**:
- Run `EXPLAIN SELECT ...` to see if query uses indexes
- Run `SHOW INDEXES FROM rets_property;` to verify indexes exist
- Check row count: `SELECT COUNT(*) FROM rets_property;`

## Deployment Considerations

### Environment Variables
Create `.env` file in backend/:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=rets
PORT=5000
```

### Production Checklist
- [ ] Remove console.log statements
- [ ] Set NODE_ENV=production
- [ ] Use secure database password
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Run full test suite
- [ ] Check test coverage is 70%+
- [ ] Run ESLint and fix errors
- [ ] Update README with deployment instructions

## Troubleshooting

### Backend won't start
- Check if port 5000 is already in use: `netstat -an | grep 5000`
- Check if MySQL is running and accessible
- Check `.env` file has correct database credentials
- Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

### Frontend shows "Unable to connect to backend"
- Check backend is running: `curl http://localhost:5000/api/properties`
- Check CORS is enabled (should see `Access-Control-Allow-Origin: *` in response headers)
- Check proxy configuration in vite.config.js

### Tests failing
- Run with more verbose output: `npm test -- --reporter=verbose`
- Check if all dependencies are installed: `npm install`
- Clear node_modules and reinstall if stuck: `rm -rf node_modules && npm install`

### Database queries slow
- Check if indexes exist: `SHOW INDEXES FROM rets_property;`
- Check if queries use indexes: `EXPLAIN SELECT ...;`
- Run index creation script: `node backend/scripts/createPropertyIndexes.js`

---

This documentation provides the "why" behind architectural decisions and the "how" for common tasks. For specific questions, refer to inline code comments or create an issue on GitHub.
