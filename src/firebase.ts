import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyATctr-is9khjLi3cljcCQQ3vFClALUJgw",
  authDomain: "mesda-roi-calculator.firebaseapp.com",
  projectId: "mesda-roi-calculator",
  storageBucket: "mesda-roi-calculator.firebasestorage.app",
  messagingSenderId: "132668726296",
  appId: "1:132668726296:web:0473904489f94d3c3df76d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
