import { auth } from './firebaseConfig';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

export const signUpUser = async (email: string, password: string) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    return await signOut(auth);
  } catch (error) {
    console.error('Error signing out user:', error);
    throw error;
  }
};