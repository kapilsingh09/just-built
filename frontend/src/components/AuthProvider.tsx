'use client';

import { useEffect, useState } from 'react';
import { axiosInstance } from '@/lib/axios';
import { useAuthStore } from '@/store/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, clearAuth, setLoading } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const initAuth = async () => {
      try {
        // Attempt to refresh the token using the HttpOnly cookie
        const res = await axiosInstance.post('/auth/refresh-token');
        const accessToken = res.data.accessToken;

        // If successful, fetch the user profile
        // We temporarily pass the token since Zustand might not be fully updated
        const userRes = await axiosInstance.get('/auth/me', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Store both user and token in Zustand
        setAuth(userRes.data.user, accessToken);
      } catch (error) {
        // Refresh token invalid or not present -> user is logged out
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, setLoading]);

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) return null;

  return <>{children}</>;
}
