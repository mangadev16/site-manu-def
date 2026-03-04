import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ADICIONADO: Importação necessária

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
export const db = getFirestore(app); // Agora vai funcionar porque a função foi importada
const analytics = getAnalytics(app);