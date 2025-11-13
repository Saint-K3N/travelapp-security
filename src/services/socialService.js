import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Get social connections
export const getSocialConnections = async (userId) => {
  try {
    const docRef = doc(db, 'socialConnections', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // Return default if no connections exist
      return {
        facebook: false,
        instagram: false,
        twitter: false
      };
    }
  } catch (error) {
    console.error('Error getting social connections:', error);
    throw error;
  }
};

// Update social connections
export const updateSocialConnections = async (userId, connections) => {
  try {
    await setDoc(doc(db, 'socialConnections', userId), {
      ...connections,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Error updating social connections:', error);
    throw error;
  }
};

// Save Twitter OAuth tokens
export const saveTwitterTokens = async (userId, tokens) => {
  try {
    await setDoc(doc(db, 'socialTokens', userId), {
      twitter: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
        tokenType: tokens.tokenType,
        connectedAt: serverTimestamp()
      }
    }, { merge: true });

    // Also update connection status
    await updateSocialConnections(userId, { twitter: true });
  } catch (error) {
    console.error('Error saving Twitter tokens:', error);
    throw error;
  }
};

// Get Twitter tokens
export const getTwitterTokens = async (userId) => {
  try {
    const docRef = doc(db, 'socialTokens', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists() && docSnap.data().twitter) {
      return docSnap.data().twitter;
    }
    return null;
  } catch (error) {
    console.error('Error getting Twitter tokens:', error);
    throw error;
  }
};

// Remove Twitter connection
export const disconnectTwitter = async (userId) => {
  try {
    // Remove tokens
    await setDoc(doc(db, 'socialTokens', userId), {
      twitter: null
    }, { merge: true });

    // Update connection status
    await updateSocialConnections(userId, { twitter: false });
  } catch (error) {
    console.error('Error disconnecting Twitter:', error);
    throw error;
  }
};

// Remove Facebook connection
export const disconnectFacebook = async (userId) => {
  try {
    // Remove tokens
    await setDoc(doc(db, 'socialTokens', userId), {
      facebook: null
    }, { merge: true });

    // Update connection status
    await updateSocialConnections(userId, { facebook: false });
  } catch (error) {
    console.error('Error disconnecting Facebook:', error);
    throw error;
  }
};

// Remove Instagram connection
export const disconnectInstagram = async (userId) => {
  try {
    // Remove tokens
    await setDoc(doc(db, 'socialTokens', userId), {
      instagram: null
    }, { merge: true });

    // Update connection status
    await updateSocialConnections(userId, { instagram: false });
  } catch (error) {
    console.error('Error disconnecting Instagram:', error);
    throw error;
  }
};