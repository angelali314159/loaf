// auth.ts
import { getAuth } from "firebase/auth";
import { app } from "./firebaseConfig"; // Import the 'app' instance from your config file

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

export { auth };
