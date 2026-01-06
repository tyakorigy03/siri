# Frontend-Backend API Integration Setup Guide

This guide explains how the frontend connects to the backend API.

## Configuration

### 1. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

**Note:** The API base URL defaults to `http://localhost:5000/api/v1` if not specified.

### 2. Backend Server

Ensure your backend server is running on port 5000 (or update the URL accordingly).

```bash
cd backend
npm install
npm run dev
```

## API Service Structure

The frontend uses a service-based architecture for API calls:

### Base API Client (`src/services/api.js`)
- Handles all HTTP requests
- Manages authentication tokens
- Handles errors and network issues
- Automatically adds Authorization headers

### Service Modules

All API services are located in `src/services/`:

- **`auth.js`** - Authentication (login, register, logout)
- **`businessDay.js`** - Business day operations (open, close, history)
- **`sales.js`** - Sales and POS transactions
- **`inventory.js`** - Stock levels, movements, transfers
- **`expenses.js`** - Expense management and approvals
- **`purchases.js`** - Purchase orders and supplier invoices
- **`products.js`** - Product catalog management
- **`customers.js`** - Customer management
- **`branches.js`** - Branch information
- **`cashSessions.js`** - Cashier session management
- **`reports.js`** - Business reports and analytics

## Authentication

### Login Flow

1. User logs in via `auth.login(email, password)`
2. Token is stored in `localStorage` as `auth_token`
3. User data is stored in `localStorage` as `user_data`
4. All subsequent API calls include the token in headers

### Token Management

- Tokens are automatically included in API requests
- On 401 (Unauthorized), tokens are cleared and user is redirected to login
- Use `getAuthToken()` and `getUserData()` from `src/config/api.js` to access current user

## Usage Example

### In a Component

```javascript
import { useState, useEffect } from 'react';
import { getCurrentBusinessDay } from '../services/businessDay';
import { getSalesSummary } from '../services/sales';

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const businessDay = await getCurrentBusinessDay();
        const sales = await getSalesSummary({ date_from: '2026-01-05' });
        setData({ businessDay, sales });
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  return <div>{/* Your component */}</div>;
}
```

## Error Handling

All API calls throw errors that should be caught:

```javascript
try {
  const result = await openBusinessDay({ branch_id: 1, opening_float: 500000 });
  // Success
} catch (error) {
  // Handle error
  console.error('Error:', error.message);
  alert('Failed: ' + error.message);
}
```

## API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

Errors return:

```json
{
  "success": false,
  "message": "Error description",
  "error": { /* additional error info */ }
}
```

## Updated Components

The following components have been updated to use the API:

- ✅ **Manager Dashboard** (`src/pages/manager/managerDashboard.jsx`)
  - Loads current business day
  - Fetches sales summary
  - Displays active cash sessions
  - Generates alerts from data

- ✅ **Open Business Day** (`src/components/views/openBussinessDay.jsx`)
  - Loads branches from API
  - Opens business day via API
  - Shows last business day info

## Next Steps

To connect more components:

1. Import the relevant service functions
2. Replace mock data with API calls
3. Add loading states
4. Handle errors appropriately
5. Update state when data changes

## Testing

1. Start backend server: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Login with valid credentials
4. Test API-connected features

## Troubleshooting

### CORS Errors
- Ensure backend CORS is configured to allow frontend origin
- Check `backend/src/app.js` CORS settings

### 401 Unauthorized
- Check if token is stored: `localStorage.getItem('auth_token')`
- Verify token is valid (not expired)
- Re-login if needed

### Network Errors
- Verify backend server is running
- Check API base URL in `.env`
- Verify network connectivity

### Data Not Loading
- Check browser console for errors
- Verify API endpoints match backend routes
- Check network tab for failed requests
