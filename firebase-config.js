// ===================================
// FIREBASE CONFIGURATION
// ===================================
// Replace with YOUR Firebase config!

const firebaseConfig = {
    apiKey: "AIzaSyBUXT3jdC1miTjbyG5dcuRdd8oSqzT4OMo",
    authDomain: "aurababymarket.firebaseapp.com",
    projectId: "aurababymarket",
    storageBucket: "aurababymarket.firebasestorage.app",
    messagingSenderId: "335246667462",
    appId: "1:335246667462:web:3b39c5bc78e05a674971c7",
    measurementId: "G-KSFT7RBPL3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Export instances
const auth = firebase.auth();
const db = firebase.firestore();

console.log('Firebase initialized successfully!');
