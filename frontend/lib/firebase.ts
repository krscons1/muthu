import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCFZGic84mxvzboKZveir7uVfpwwQODiXg",
    authDomain: "mtracker-1477c.firebaseapp.com",
    projectId: "mtracker-1477c",
    storageBucket: "mtracker-1477c.firebasestorage.app",
    messagingSenderId: "56408393734",
    appId: "1:56408393734:web:5a6d04a7e4436bdebd5b87",
    measurementId: "G-XBQ4436ZGP"
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);




