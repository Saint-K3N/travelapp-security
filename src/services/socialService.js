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
    throw error;
  }
};