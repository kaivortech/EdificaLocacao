import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDo1Ym6t1YYXYlLUZJNHYn7Z53k6QtF4nI",
  authDomain: "edifica-locacao-7e1df.firebaseapp.com",
  projectId: "edifica-locacao-7e1df",
  storageBucket: "edifica-locacao-7e1df.firebasestorage.app",
  messagingSenderId: "644761671319",
  appId: "1:644761671319:web:09b675a8b8e56c883afbd2",
  measurementId: "G-8NLVPC84FL"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exports dos serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
