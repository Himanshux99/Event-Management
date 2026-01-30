// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLuE0uP0QCToW36fYYvUDWvJjnnr00iC8",
  authDomain: "event-management-8aa74.firebaseapp.com",
  projectId: "event-management-8aa74",
  storageBucket: "event-management-8aa74.firebasestorage.app",
  messagingSenderId: "937049996593",
  appId: "1:937049996593:web:d54b2fbd81ae227208c410",
  measurementId: "G-C32RFQL7HS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);