const firebaseConfig = {
  apiKey: "AIzaSyA_3LXdJIPT0XgV173EEIxlq-CW4eye0b0",
  authDomain: "saldo-app-350a6.firebaseapp.com",
  projectId: "saldo-app-350a6",
  storageBucket: "saldo-app-350a6.firebasestorage.app",
  messagingSenderId: "802769127743",
  appId: "1:802769127743:web:799ec1c5af3fa944d0ab8a"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore();
