import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../utils/auth';

/**
 * Hook to automatically log out users after 30 minutes of inactivity
 * Resets timer on any user activity (mouse, keyboard, clicks)
 */
export default function useSessionTimeout() {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  
  // 30 minutes in milliseconds
  const TIMEOUT_DURATION = 30 * 60 * 1000;

  // Handle logout
  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  // Reset the inactivity timer
  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  };

  // Throttled activity handler (max once per second)
  const handleActivity = useRef(
    (() => {
      let lastCall = 0;
      return () => {
        const now = Date.now();
        if (now - lastCall >= 1000) {
          lastCall = now;
          resetTimer();
        }
      };
    })()
  ).current;

  useEffect(() => {
    // Start the timer on mount
    resetTimer();

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity, { passive: true });

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, []);

  return null;
}
