
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  projectId: "prylics-think-everything",
  appId: "1:506171404766:web:ef925b965d89f2fff3ed4f",
  storageBucket: "prylics-think-everything.appspot.com",
  apiKey: "AIzaSyD8JeIII1TY695lLQ6ySPdq1LAs2dUOhjY",
  authDomain: "prylics-think-everything.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "506171404766",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
