// Service to handle login attempts and account lockout
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Get lockout data from localStorage
const getLockoutData = (email) => {
  if (!email) return null;
  
  const key = `lockout_${email}`;
  console.log('GETTING from localStorage - Key:', key); // Debug
  const data = localStorage.getItem(key);
  console.log('RAW data retrieved:', data); // Debug
  
  if (!data) return null;
  
  try {
    const parsed = JSON.parse(data);
    console.log('PARSED data:', parsed); // Debug
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
  console.log('SAVING to localStorage - Key:', key, 'Data:', jsonData); // Debug
  localStorage.setItem(key, jsonData);
  
  // Verify it was saved
  const saved = localStorage.getItem(key);
  console.log('VERIFIED save - Retrieved:', saved); // Debug
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
  //    (Do NOT clear data here, as it contains the attempt count)
  return { locked: false };
};

// Record failed login attempt
export const recordFailedAttempt = (email) => {
  if (!email) return { locked: false };
  
  console.log('recordFailedAttempt called with email:', JSON.stringify(email)); // Debug - show exact email
  
  let lockoutData = getLockoutData(email);
  
  console.log('Before recording attempt - Current data:', lockoutData); // Debug
  
  if (!lockoutData) {
    lockoutData = {
      attempts: 0,
      firstAttemptTime: Date.now()
    };
  }
  
  lockoutData.attempts += 1;
  lockoutData.lastAttemptTime = Date.now();
  
  console.log('After increment - Attempts:', lockoutData.attempts); // Debug
  
  // Check if max attempts reached
  if (lockoutData.attempts >= MAX_ATTEMPTS) {
    lockoutData.lockoutUntil = Date.now() + LOCKOUT_DURATION;
    saveLockoutData(email, lockoutData);
    
    console.log('LOCKED! Lockout until:', new Date(lockoutData.lockoutUntil)); // Debug
    
    return {
      locked: true,
      remainingTime: LOCKOUT_DURATION / 1000, // in seconds
      unlockTime: lockoutData.lockoutUntil
    };
  }
  
  saveLockoutData(email, lockoutData);
  
  const result = {
    locked: false,
    attempts: lockoutData.attempts,
    remainingAttempts: MAX_ATTEMPTS - lockoutData.attempts
  };
  
  console.log('Returning result:', result); // Debug
  
  return result;
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

// Format time for display (MM:SS)
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};