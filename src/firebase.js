// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  deleteDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDqpwoZcJXIEYrlA2XO2T1HXHMOqU5l__k",
  authDomain: "clinic-management-system-98fed.firebaseapp.com",
  projectId: "clinic-management-system-98fed",
  storageBucket: "clinic-management-system-98fed.appspot.com",
  messagingSenderId: "311929827699",
  appId: "1:311929827699:web:8e73e809e56fa453925506",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  deleteDoc,
  where,
  updateDoc,
  query,
};
