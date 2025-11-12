import { useEffect, useCallback } from "react";
import {
  validateSession,
  updateLastActivity,
  terminateSession,
} from "../services/SessionService";
import { logoutUser } from "../services/authService";

export const useSession = (isLoggedIn) => {
  // Handle session timeout
  const handleTimeout = useCallback(async (reason) => {
    console.log(`Session timeout: ${reason}`);

    try {
      terminateSession();
      await logoutUser();

      // Reload the page which will show login form since user is logged out
      window.location.href = "/profile";
    } catch (error) {
      console.error("Error handling timeout:", error);
    }
  }, []);

  // Check session validity
  const checkSession = useCallback(() => {
    if (!isLoggedIn) return;

    const validation = validateSession();
    if (!validation.valid) {
      handleTimeout(validation.reason);
    }
  }, [isLoggedIn, handleTimeout]);

  // Start monitoring
  useEffect(() => {
    if (!isLoggedIn) return;

    // Check every 60 seconds
    const interval = setInterval(checkSession, 60000);

    // Update activity on user interactions
    const updateActivity = () => updateLastActivity();
    window.addEventListener("mousedown", updateActivity);
    window.addEventListener("keydown", updateActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener("mousedown", updateActivity);
      window.removeEventListener("keydown", updateActivity);
    };
  }, [isLoggedIn, checkSession]);
};
