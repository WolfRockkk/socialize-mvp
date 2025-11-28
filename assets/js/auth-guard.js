// auth-guard.js
// Protects pages - redirects to login if not authenticated

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

const auth = window.auth;

// Wait for auth to be initialized
if (!auth) {
  console.error("Auth not initialized! Make sure main.js loads first.");
}

// Check auth state
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // No user logged in - redirect to login
    console.log("No user logged in, redirecting to login...");
    window.location.href = "login.html";
  } else {
    console.log("User authenticated:", user.email);
  }
});