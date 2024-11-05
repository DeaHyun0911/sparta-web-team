import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCG2IzmkAHSNV_G4_38AU7z1-4FPNuZFm8",
  authDomain: "sparta-web-team.firebaseapp.com",
  projectId: "sparta-web-team",
  storageBucket: "sparta-web-team.firebasestorage.app",
  messagingSenderId: "861376660551",
  appId: "1:861376660551:web:7def49e256024e7b8a5d62",
  measurementId: "G-2W4FV36RSN"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchData(collectionName) {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map(doc => doc.data());
    return data;
  }

export { db, collection, addDoc, getDocs, fetchData };