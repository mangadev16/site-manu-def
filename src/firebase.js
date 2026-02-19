// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBqAl3CESrV_-M2602E1RDh0Q1t7Oa0wXE",
  authDomain: "manuelanutri-v1.firebaseapp.com",
  projectId: "manuelanutri-v1",
  storageBucket: "manuelanutri-v1.firebasestorage.app",
  messagingSenderId: "885310218164",
  appId: "1:885310218164:web:56ed1bf3bc046eb7fc5ce1",
  measurementId: "G-J5EPSHH2WW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const analytics = getAnalytics(app);