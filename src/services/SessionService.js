import { auth, db } from "../config/firebase";
import { browserSessionPersistence, setPersistence } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Session configuration
const SESSION_CONFIG = {
  ABSOLUTE_TIMEOUT: 5 * 60 * 60 * 1000, // 5 hours
  INACTIVITY_TIMEOUT: 15 * 60 * 1000, // 15 minutes
};

/**
 * Configure secure session persistence
 * Equivalent to setting session cookie flags in PHP
 */
export const configureSessionPersistence = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    console.log("✅ Session persistence configured");
    return true;
  } catch (error) {
    console.error("Error configuring session:", error);
    return false;
  }
};

/**
 * Initialize session after login
 * Stores session start time, user agent, and last activity
 */
export const initializeSession = async (user) => {
  try {
    const now = Date.now();
    const sessionId = `session_${now}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const userAgent = navigator.userAgent;

    // Store session data in sessionStorage
    const sessionData = {
      userId: user.uid,
      sessionId: sessionId,
      sessionStart: now,
      lastActivity: now,
      userAgent: userAgent,
    };

    sessionStorage.setItem("session_data", JSON.stringify(sessionData));

    // Store session metadata in Firestore
    await setDoc(doc(db, "sessions", user.uid), {
      sessionId: sessionId,
      userAgent: userAgent,
      lastActivity: serverTimestamp(),
      sessionStart: serverTimestamp(),
    });

    console.log("✅ Session initialized");
    return sessionData;
  } catch (error) {
    console.error("Error initializing session:", error);
    throw error;
  }
};

/**
 * Validate current session
 * Checks timeout and user agent
 */
export const validateSession = () => {
  const sessionDataStr = sessionStorage.getItem("session_data");

  if (!sessionDataStr) {
    return { valid: false, reason: "NO_SESSION" };
  }

  const sessionData = JSON.parse(sessionDataStr);
  const now = Date.now();

  // Check absolute timeout (5 hours)
  if (now - sessionData.sessionStart > SESSION_CONFIG.ABSOLUTE_TIMEOUT) {
    terminateSession();
    return { valid: false, reason: "ABSOLUTE_TIMEOUT" };
  }

  // Check inactivity timeout (15 minutes)
  if (now - sessionData.lastActivity > SESSION_CONFIG.INACTIVITY_TIMEOUT) {
    terminateSession();
    return { valid: false, reason: "INACTIVITY_TIMEOUT" };
  }

  // Validate user agent (detect session hijacking)
  if (sessionData.userAgent !== navigator.userAgent) {
    terminateSession();
    return { valid: false, reason: "USER_AGENT_MISMATCH" };
  }

  return { valid: true };
};

/**
 * Update last activity timestamp
 * Call this on user interactions
 */
export const updateLastActivity = () => {
  const sessionDataStr = sessionStorage.getItem("session_data");
  if (sessionDataStr) {
    const sessionData = JSON.parse(sessionDataStr);
    sessionData.lastActivity = Date.now();
    sessionStorage.setItem("session_data", JSON.stringify(sessionData));
  }
};

/**
 * Terminate session
 * Clear all session data
 */
export const terminateSession = () => {
  sessionStorage.removeItem("session_data");
  console.log("Session terminated");
};

/**
 * Get time remaining before timeout
 */
export const getTimeRemaining = () => {
  const sessionDataStr = sessionStorage.getItem("session_data");
  if (!sessionDataStr) return null;

  const sessionData = JSON.parse(sessionDataStr);
  const now = Date.now();

  return {
    absoluteRemaining:
      SESSION_CONFIG.ABSOLUTE_TIMEOUT - (now - sessionData.sessionStart),
    inactivityRemaining:
      SESSION_CONFIG.INACTIVITY_TIMEOUT - (now - sessionData.lastActivity),
  };
};
