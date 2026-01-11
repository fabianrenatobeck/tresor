// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {

    apiKey: "AIzaSyDGItKXJeoAOOilQnAVqzZSKUblv5NYXbk",
    authDomain: "auth-wavestone.firebaseapp.com",
    projectId: "auth-wavestone",
    storageBucket: "auth-wavestone.firebasestorage.app",
    messagingSenderId: "164044271842",
    appId: "1:164044271842:web:ccb9f5be4eef74581c2ebb"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Funktion für den Login
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // WICHTIG: Das Token holen, um es an Spring Boot zu senden
        const token = await user.getIdToken();

        return { user, token };
    } catch (error) {
        console.error("Login Fehler", error);
        throw error;
    }
};