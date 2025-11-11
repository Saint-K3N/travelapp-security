import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Add new travel plan
export const addTravelPlan = async (userId, planData) => {
  try {
    const docRef = await addDoc(collection(db, 'travelPlans'), {
      userId: userId,
      title: planData.title,
      country: planData.country,
      description: planData.description,
      startDate: Timestamp.fromDate(planData.startDate),
      endDate: Timestamp.fromDate(planData.endDate),
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Get all travel plans for a user
export const getUserTravelPlans = async (userId) => {
  try {
    const q = query(
      collection(db, 'travelPlans'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const plans = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      plans.push({
        id: doc.id,
        ...data,
        startDate: data.startDate.toDate(),
        endDate: data.endDate.toDate()
      });
    });
    
    return plans;
  } catch (error) {
    throw error;
  }
};

// Update travel plan
export const updateTravelPlan = async (planId, planData) => {
  try {
    const planRef = doc(db, 'travelPlans', planId);
    await updateDoc(planRef, {
      title: planData.title,
      country: planData.country,
      description: planData.description,
      startDate: Timestamp.fromDate(planData.startDate),
      endDate: Timestamp.fromDate(planData.endDate)
    });
  } catch (error) {
    throw error;
  }
};

// Delete travel plan
export const deleteTravelPlan = async (planId) => {
  try {
    await deleteDoc(doc(db, 'travelPlans', planId));
  } catch (error) {
    throw error;
  }
};