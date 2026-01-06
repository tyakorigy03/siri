# Authentication & Login Setup

## ✅ Completed Setup

### 1. Login Page Created (`src/pages/Login.jsx`)
- Beautiful, responsive login form
- Email and password fields with validation
- Show/hide password toggle
- Form validation with error messages
- Toast notifications for success/error
- Auto-redirect if already logged in
- Redirects to dashboard after successful login

### 2. Protected Routes (`src/components/auth/ProtectedRoute.jsx`)
- Checks authentication before rendering protected routes
- Validates token with backend API (`/auth/me`)
- Shows loading state while checking
- Redirects to login if not authenticated
- Prevents unnecessary API calls when not authenticated

### 3. API Error Handling (`src/services/api.js`)
- Shows toast message before redirecting on 401 errors
- 1.5 second delay to allow toast to display
- Clears tokens and user data on 401
- Handles network errors gracefully

### 4. Backend Routes Added
- ✅ Created `staffSession.routes.js` for cash session management
- ✅ Added routes to main router (`/staff-sessions`)
- ✅ Added branch routes (`/branches`)
- ✅ Added employee routes (`/employees`)

## 🔐 Authentication Flow

### Login Process:
1. User enters email/password on login page
2. Frontend calls `POST /api/v1/auth/login`
3. Backend validates credentials and returns JWT token
4. Token and user data stored in localStorage
5. User redirected to dashboard

### Protected Route Access:
1. User navigates to `/dashboard/manager`
2. `ProtectedRoute` checks for token in localStorage
3. If token exists, validates with backend (`GET /auth/me`)
4. If valid, renders protected content
5. If invalid/missing, redirects to login

### API Request Flow:
1. All API requests include `Authorization: Bearer <token>` header
2. Backend validates token on each request
3. If token invalid/expired (401):
   - Frontend shows toast: "Session expired. Please login again."
   - Clears localStorage
   - Redirects to login after 1.5 seconds

## 📋 Backend API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /login` - Login user (public)
- `POST /register` - Register new user (public)
- `GET /me` - Get current user (protected)
- `POST /logout` - Logout (protected)
- `POST /refresh` - Refresh token (protected)
- `PUT /change-password` - Change password (protected)

### Staff Sessions (`/api/v1/staff-sessions`)
- `POST /open` - Open cash session (protected)
- `POST /close` - Close cash session (protected)
- `GET /current` - Get current session (protected)
- `GET /history` - Get session history (protected)
- `GET /:id` - Get session details (protected)
- `GET /variance-report` - Get variance report (manager/owner/accountant)

### Business Day (`/api/v1/cashbook`)
- `POST /business-day/open` - Open business day (manager/owner)
- `POST /business-day/close` - Close business day (manager/owner)
- `GET /business-day/current` - Get current business day (protected)
- `GET /business-day/history` - Get history (protected)

## 🚀 Usage

### To Login:
1. Navigate to `/` or `/login`
2. Enter email and password
3. Click "Sign In"
4. On success, redirected to dashboard

### To Logout:
```javascript
import { logout } from '../services/auth';
logout(); // Clears tokens and redirects to login
```

### To Check Authentication:
```javascript
import { isAuthenticated } from '../services/auth';
if (isAuthenticated()) {
  // User is logged in
}
```

## 🐛 Fixed Issues

1. ✅ **Redirect without message** - Now shows toast before redirecting
2. ✅ **Missing login page** - Created beautiful login page
3. ✅ **No route protection** - Added ProtectedRoute component
4. ✅ **Missing staff-sessions routes** - Created route file and added to router
5. ✅ **API response format mismatch** - Fixed cash sessions service to handle response format
6. ✅ **Token validation** - ProtectedRoute now validates token with backend

## 📝 Next Steps

1. **Test Login Flow:**
   - Start backend: `cd backend && npm run dev`
   - Start frontend: `cd frontend && npm run dev`
   - Navigate to `http://localhost:5173`
   - Login with valid credentials

2. **Create Test User:**
   - Use backend API: `POST /api/v1/auth/register`
   - Or use database seed script

3. **Environment Setup:**
   - Ensure backend `.env` has `JWT_SECRET` and `JWT_EXPIRE`
   - Ensure frontend `.env` has `VITE_API_BASE_URL`

## 🔍 Troubleshooting

### Issue: Redirected to login immediately
- **Cause:** No token in localStorage
- **Solution:** Login first, then access dashboard

### Issue: "Session expired" toast appears
- **Cause:** Token expired or invalid
- **Solution:** Login again

### Issue: API calls fail with 401
- **Cause:** Token missing or expired
- **Solution:** Check token in localStorage, login if needed

### Issue: Login fails
- **Cause:** Invalid credentials or backend not running
- **Solution:** Check backend is running, verify credentials, check network tab
