// main.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";


// 1. Your Firebase Config (paste yours here)
const firebaseConfig = {
  apiKey: "AIzaSyAhv_am4OeJT72LM860g9ahK7ba4PeOYF8",
  authDomain: "socialize-27e25.firebaseapp.com",
  projectId: "socialize-27e25",
  storageBucket: "socialize-27e25.firebasestorage.app",
  messagingSenderId: "390071019251",
  appId: "1:390071019251:web:9dffd2561bd7e32153b986",
  measurementId: "G-JL5FF49XEM"
};

// 2. Init Firebase + Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// Database SETUP
const db = getFirestore(app);

window.app  = app;
window.auth = auth;
window.db   = db;

// ✅ SIGN UP
const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect fields
    const first = document.getElementById("fname").value.trim();
    const last = document.getElementById("lname").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm-password").value;

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Create user in Firebase Authentication
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Set Firebase Auth display name
      await updateProfile(cred.user, {
        displayName: username
      });

      // --- Firestore user document ---
      const userRef = doc(db, "users", cred.user.uid);

      const defaultAvatar = "https://api.dicebear.com/7.x/thumbs/svg?seed=user";



      await setDoc(userRef, {
        firstName: first,
        lastName: last,
        username: username,
        email: email,
        city: "",
        avatarURL: defaultAvatar,
        aboutMe: "",
        preferences: [],
        createdAt: Date.now()
      });

      alert("Account created! Redirecting...");

      // Redirect to profile
      window.location.href = "profile.html";

    } catch (err) {
      alert(err.message);
    }
  });
}


// ✅ LOGIN
const signinForm = document.getElementById("signin-form");
if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "profile.html"; // ✅ redirect to profile later
    } catch (err) {
      alert(err.message);
    }
  });
}

// ✅ SIGN OUT (used later inside profile page)
const signoutBtn = document.getElementById("signout-btn");
if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// ✅ USER STATE LISTENER (we’ll use it later for protected pages)
onAuthStateChanged(auth, (user) => {
  console.log("Auth state:", user ? "Logged in" : "Logged out");
});

export { app, auth, db };





