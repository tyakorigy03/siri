import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthToken, getUserData } from '../../config/api';
import { getCurrentUser } from '../../services/auth';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        const user = getUserData();

        // No token or user data - redirect to login
        if (!token || !user) {
          setIsAuthenticated(false);
          setIsChecking(false);
          return;
        }

        // Validate token with backend by calling /auth/me
        try {
          await getCurrentUser();
          // Token is valid
          setIsAuthenticated(true);
          setIsChecking(false);
        } catch (error) {
          // Token is invalid or expired
          console.error('Token validation failed:', error);
          setIsAuthenticated(false);
          setIsChecking(false);
          // Don't show error toast - will be handled by API service
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (isChecking) {
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-50'>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4'></div>
          <p className='text-gray-600'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/' replace />;
  }

  return children;
}
