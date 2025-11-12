// Service to handle login attempts and account lockout
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Get lockout data from localStorage
const getLockoutData = (email) => {
  if (!email) return null;
  
  const key = `lockout_${email}`;
  const data = localStorage.getItem(key);
  
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Error parsing lockout data:', error);
    return null;
  }
};

// Save lockout data to localStorage
const saveLockoutData = (email, data) => {
  if (!email) return;
  
  const key = `lockout_${email}`;
  const jsonData = JSON.stringify(data);
  localStorage.setItem(key, jsonData);
};

// Clear lockout data
const clearLockoutData = (email) => {
  if (!email) return;
  
  const key = `lockout_${email}`;
  localStorage.removeItem(key);
};

// Check if account is locked
export const isAccountLocked = (email) => {
  const lockoutData = getLockoutData(email);
  
  if (!lockoutData) return { locked: false };
  
  const now = Date.now();
  const unlockTime = lockoutData.lockoutUntil;
  
  // 1. Check if a lock is currently ACTIVE
  if (unlockTime && now < unlockTime) {
    const remainingTime = unlockTime - now;
    return { 
      locked: true, 
      remainingTime: Math.ceil(remainingTime / 1000), // in seconds
      unlockTime: unlockTime
    };
  }
  
  // 2. Check if a lock has EXPIRED
  if (unlockTime && now >= unlockTime) {
    // Lockout period has expired, clear it and return unlocked
    clearLockoutData(email);
    return { locked: false };
  }
  
  // 3. If no 'unlockTime' is set, the account is not locked.
  return { locked: false };
};

// Record failed login attempt
export const recordFailedAttempt = (email) => {
  if (!email) return { locked: false };
  
  let lockoutData = getLockoutData(email);
  
  if (!lockoutData) {
    lockoutData = {
      attempts: 0,
      firstAttemptTime: Date.now()
    };
  }
  
  lockoutData.attempts += 1;
  lockoutData.lastAttemptTime = Date.now();
  
  // Check if max attempts reached
  if (lockoutData.attempts >= MAX_ATTEMPTS) {
    lockoutData.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    saveLockoutData(email, lockoutData);
    
    return {
      locked: true,
      remainingTime: LOCKOUT_DURATION / 1000, // in seconds
      unlockTime: lockoutData.lockoutUntil
    };
  }
  
  saveLockoutData(email, lockoutData);
  
  return {
    locked: false,
    attempts: lockoutData.attempts,
    remainingAttempts: MAX_ATTEMPTS - lockoutData.attempts
  };
};

// Reset attempts after successful login
export const resetAttempts = (email) => {
  clearLockoutData(email);
};

// Get remaining attempts
export const getRemainingAttempts = (email) => {
  const lockoutData = getLockoutData(email);
  
  if (!lockoutData) {
    return MAX_ATTEMPTS;
  }
  
  // Check if lockout has expired
  const lockStatus = isAccountLocked(email);
  if (lockStatus.locked) {
    return 0;
  }
  
  return MAX_ATTEMPTS - lockoutData.attempts;
};

// Get lockout information for a specific user (for admin use)
export const getLockoutInfo = (email) => {
  if (!email) return null;
  
  const lockoutData = getLockoutData(email);
  
  if (!lockoutData) {
    return {
      attempts: 0,
      isLocked: false,
      remainingAttempts: MAX_ATTEMPTS
    };
  }
  
  const lockStatus = isAccountLocked(email);
  
  return {
    attempts: lockoutData.attempts,
    isLocked: lockStatus.locked,
    remainingAttempts: lockStatus.locked ? 0 : MAX_ATTEMPTS - lockoutData.attempts,
    lockoutUntil: lockoutData.lockoutUntil,
    lastAttemptTime: lockoutData.lastAttemptTime,
    firstAttemptTime: lockoutData.firstAttemptTime
  };
};

// Format time for display (MM:SS)
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};