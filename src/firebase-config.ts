import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgGG_ChCi4e_2SOFzNgQNYFzZdyZVuAUE",
  authDomain: "ghost-catcher-deel.firebaseapp.com",
  projectId: "ghost-catcher-deel",
  storageBucket: "ghost-catcher-deel.firebasestorage.app",
  messagingSenderId: "594589070066",
  appId: "1:594589070066:web:97dd8da8a4e2e3fe23966b",
  measurementId: "G-6X27HDHD7D"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
(window as any).ghostDB = db; // Expose to console

