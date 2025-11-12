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
    
    // Re-authenticate user before deletion
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
    
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', user.uid));
    
    // Delete user from Firebase Auth
    await deleteUser(user);
    
    return true;
  } catch (error) {
    console.error('Delete account error:', error);
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
      role: 'user', // Default role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Send email verification
    await sendEmailVerification(user);

    return user;
  } catch (error) {
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
    
    return user;
  } catch (error) {
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
    return true;
  } catch (error) {
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
    return true;
  } catch (error) {
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
    }
    
    return true;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Terminate session before signing out
    terminateSession();
    await signOut(auth);
  } catch (error) {
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
    await setDoc(doc(db, 'users', userId), {
      ...userData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
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

// Update user role (Admin only)
export const updateUserRole = async (userId, newRole) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      role: newRole,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// Delete user by admin
export const deleteUserByAdmin = async (userId) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};