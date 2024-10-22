// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Importa getStorage

const firebaseConfig = {
  // Tu configuración de Firebase
  apiKey: "AIzaSyAIjKKx98CQPpUaW12MUD_jyz10PIwrJhY",
  authDomain: "drive2u-2f885.firebaseapp.com",
  projectId: "drive2u-2f885",
  storageBucket: "drive2u-2f885.appspot.com",
  messagingSenderId: "736588832874",
  appId: "1:736588832874:web:057fee5a54616554806a13",
  measurementId: "G-VBSH11NX0Y",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Inicializa storage

// Exporta auth, db y storage
export { auth, db, storage };
