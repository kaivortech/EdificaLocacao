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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn('Firebase Analytics não disponível:', e);
}

export { analytics };
export default app;
