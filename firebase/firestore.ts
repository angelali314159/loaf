import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { app } from './firebaseConfig';

// Initialize Firestore
export const db = getFirestore(app);

export const saveUserProfile = async (userId: string, userData: any) => {
  try {
    await setDoc(doc(db, 'users', userId), userData);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    return docSnap.exists() ? docSnap.data() : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};