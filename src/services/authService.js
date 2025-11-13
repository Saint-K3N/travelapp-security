import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { initializeSession, terminateSession, configureSessionPersistence } from './SessionService';
import { 
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { deleteDoc } from 'firebase/firestore';
import { logAuditTrail } from './auditService';

// Validate email format
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
const validatePassword = (password) => {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  return true;
};

export const deleteUserAccount = async (password) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    const userEmail = user.email;
    const userId = user.uid;
    
    // Get user data before deletion
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Delete user from Firebase Auth
    await deleteUser(user);
    
    // Log account deletion (note: this happens after deletion, so user context is lost)
    await logAuditTrail('USER_ACCOUNT_DELETED', {
      email: userEmail,
      userId: userId,
      username: userData.username,
      role: userData.role,
      deletedBy: 'self',
      success: true
    });
    
    return true;
  } catch (error) {
    console.error('Delete account error:', error);
    
    // Log failed deletion attempt
    await logAuditTrail('USER_ACCOUNT_DELETE_FAILED', {
      email: auth.currentUser?.email,
      userId: auth.currentUser?.uid,
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Register new user with email verification
export const registerUser = async (email, password, username) => {
  try {
    // Validate inputs
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    validatePassword(password);
    
    if (!username || username.trim().length === 0) {
      throw new Error('Username is required');
    }

    // Configure session persistence
    await configureSessionPersistence();

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile with username
    await updateProfile(user, {
      displayName: username
    });

    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      username: username,
      email: email,
      profilePic: 'https://via.placeholder.com/150',
      emailVerified: false,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send email verification
    await sendEmailVerification(user);
    
    // Log successful registration
    await logAuditTrail('USER_REGISTRATION_SUCCESS', {
      email: email,
      userId: user.uid,
      username: username,
      success: true
    });

    return user;
  } catch (error) {
    // Log failed registration
    await logAuditTrail('USER_REGISTRATION_FAILED', {
      email: email,
      username: username,
      errorCode: error.code || 'unknown',
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};


// Resend email verification
export const resendVerificationEmail = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user is currently signed in');
    }
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendEmailVerification(user);
    return true;
  } catch (error) {
    throw error;
  }
};

// Login user with email verification check
export const loginUser = async (email, password) => {
  const startTime = Date.now();
  
  try {
    // Validate inputs
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    if (!password || password.trim().length === 0) {
      throw new Error('Password is required');
    }

    // Configure session persistence
    await configureSessionPersistence();

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Check if email is verified
    if (!user.emailVerified) {
      // Sign out the user immediately
      await signOut(auth);
      
      // Log failed login attempt due to unverified email
      await logAuditTrail('LOGIN_FAILED_UNVERIFIED_EMAIL', {
        email: email,
        userId: user.uid,
        reason: 'Email not verified',
        success: false
      });
      
      const error = new Error('Please verify your email before logging in. We sent a verification link to your email address. Click the link to activate your account.');
      error.code = 'auth/email-not-verified';
      throw error;
    }
    
    // Update Firestore if email verification status changed
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists() && !userDoc.data().emailVerified) {
      await setDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }
    
    // Initialize session after successful login
    await initializeSession(user);
    
    // Get user role for audit log
    const userData = userDoc.exists() ? userDoc.data() : {};
    const userRole = userData.role || 'user';
    
    // Log successful login (single entry based on role)
    const isAdmin = userRole === 'admin' || userRole === 'superadmin';

    await logAuditTrail(isAdmin ? 'ADMIN_LOGIN_SUCCESS' : 'USER_LOGIN_SUCCESS', {
      email: email,
      userId: user.uid,
      username: user.displayName || userData.username,
      role: userRole,
      emailVerified: user.emailVerified,
      loginDuration: Date.now() - startTime,
      success: true
    });
    
    return user;
  } catch (error) {
    // Log failed login attempt with error details
    await logAuditTrail('USER_LOGIN_FAILED', {
      email: email,
      errorCode: error.code || 'unknown',
      errorMessage: error.message,
      loginDuration: Date.now() - startTime,
      success: false
    });
    
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email) => {
  try {
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }
    
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    await sendPasswordResetEmail(auth, email);
    
    // Log password reset request
    await logAuditTrail('PASSWORD_RESET_REQUESTED', {
      email: email,
      success: true
    });
    
    return true;
  } catch (error) {
    // Log failed password reset request
    await logAuditTrail('PASSWORD_RESET_REQUEST_FAILED', {
      email: email,
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Verify password reset code
export const verifyResetCode = async (code) => {
  try {
    const email = await verifyPasswordResetCode(auth, code);
    return email;
  } catch (error) {
    throw error;
  }
};

// Confirm password reset
export const resetPassword = async (code, newPassword) => {
  try {
    validatePassword(newPassword);
    await confirmPasswordReset(auth, code, newPassword);
    
    // Log successful password reset
    await logAuditTrail('PASSWORD_RESET_SUCCESS', {
      resetCode: code.substring(0, 10) + '...', // Only log partial code for security
      success: true
    });
    
    return true;
  } catch (error) {
    // Log failed password reset
    await logAuditTrail('PASSWORD_RESET_FAILED', {
      resetCode: code.substring(0, 10) + '...',
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Verify email with action code
export const verifyEmail = async (code) => {
  try {
    await applyActionCode(auth, code);
    
    // Update Firestore
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, 'users', user.uid), {
        emailVerified: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      // Log email verification
      await logAuditTrail('EMAIL_VERIFIED', {
        email: user.email,
        userId: user.uid,
        success: true
      });
    }
    
    return true;
  } catch (error) {
    // Log failed email verification
    await logAuditTrail('EMAIL_VERIFICATION_FAILED', {
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const user = auth.currentUser;
    const userEmail = user?.email;
    const userId = user?.uid;
    
    // Terminate session before signing out
    terminateSession();
    await signOut(auth);
    
    // Log successful logout
    await logAuditTrail('USER_LOGOUT_SUCCESS', {
      email: userEmail,
      userId: userId,
      success: true
    });
  } catch (error) {
    // Log failed logout
    await logAuditTrail('USER_LOGOUT_FAILED', {
      email: auth.currentUser?.email,
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    throw error;
  }
};

// Check if user exists in Firestore
export const checkUserExists = async (email) => {
  try {
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Update user profile
export const updateUserProfile = async (userId, userData) => {
  try {
    // Get old data for comparison
    const userDoc = await getDoc(doc(db, 'users', userId));
    const oldData = userDoc.exists() ? userDoc.data() : {};
    
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Log profile update
    await logAuditTrail('USER_PROFILE_UPDATED', {
      userId: userId,
      updatedFields: Object.keys(userData),
      oldValues: oldData,
      newValues: userData,
      success: true
    });
  } catch (error) {
    // Log failed profile update
    await logAuditTrail('USER_PROFILE_UPDATE_FAILED', {
      userId: userId,
      errorMessage: error.message,
      success: false
    });
    
    throw error;
  }
};

// Get all users (Admin only)
export const getAllUsers = async () => {
  try {
    const { collection, getDocs, orderBy, query } = await import('firebase/firestore');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({
        uid: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Check if user is admin
export const checkIfAdmin = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data().role === 'admin';
    }
    return false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Update updateUserRole function
export const updateUserRole = async (userId, newRole) => {
  try {
    // Get old role for comparison
    const userDoc = await getDoc(doc(db, 'users', userId));
    const oldRole = userDoc.exists() ? userDoc.data().role : 'unknown';
    
    await setDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    // Log role change
    await logAuditTrail('ROLE_UPDATED', {
      targetUserId: userId,
      targetUserEmail: userDoc.data()?.email,
      oldRole: oldRole,
      newRole: newRole,
      success: true
    });
    
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    
    await logAuditTrail('ROLE_UPDATE_FAILED', {
      targetUserId: userId,
      attemptedRole: newRole,
      error: error.message,
      success: false
    });
    
    throw error;
  }
};

// Update deleteUserByAdmin function
export const deleteUserByAdmin = async (userId) => {
  try {
    // Get user data before deletion for audit log
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    await deleteDoc(doc(db, 'users', userId));
    
    // Log the deletion
    await logAuditTrail('USER_DELETED', {
      targetUserId: userId,
      targetUserEmail: userData.email,
      targetUsername: userData.username,
      success: true
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Log failed attempt
    await logAuditTrail('USER_DELETE_FAILED', {
      targetUserId: userId,
      error: error.message,
      success: false
    });
    
    throw error;
  }
};