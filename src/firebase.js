import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXKshX0Ccq3o8qmAsa0dizNymiwx_KT0s",
  authDomain: "yoozoo-6e04d.firebaseapp.com",
  projectId: "yoozoo-6e04d",
  storageBucket: "yoozoo-6e04d.firebasestorage.app",
  messagingSenderId: "903180479377",
  appId: "1:903180479377:web:ff0c745dea2408d6b64830"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
