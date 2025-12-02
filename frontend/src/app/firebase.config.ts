// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyAebOdahGfQdgCQWDqQZjjqioqarOBH448",
  authDomain: "heaters-5f943.firebaseapp.com",
  projectId: "heaters-5f943",
  storageBucket: "heaters-5f943.firebasestorage.app",
  messagingSenderId: "591505138954",
  appId: "1:591505138954:web:20bd911a09ce2e09a4c6f3",
  measurementId: "G-91B978QLZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);