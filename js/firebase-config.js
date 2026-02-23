// this stores API key for firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyB2DccAwpNnzfNPhhP6KQJ58xVOEFsLB8Y",
  authDomain: "lhok-e77ba.firebaseapp.com",
  projectId: "lhok-e77ba",
  storageBucket: "lhok-e77ba.firebasestorage.app",
  messagingSenderId: "228980882242",
  appId: "1:228980882242:web:6c5a9f0c36544aba03e6db"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);