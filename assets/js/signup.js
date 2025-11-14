// =========================
// IMPORTS
// =========================
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";


// =========================
// GET auth & db (from main.js)
// =========================
const auth = getAuth();
const db = getFirestore();


// =========================
// FORM HANDLER
// =========================
document.getElementById("signup-form").addEventListener("submit", handleSignup);

async function handleSignup(e) {
  e.preventDefault();

  const btn = document.getElementById("signup-btn");
  btn.disabled = true;

  // Read fields
  const first = document.getElementById("fname").value.trim();
  const last = document.getElementById("lname").value.trim();
  const username = document.getElementById("username").value.trim().toLowerCase();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;

  // =========================
  // VALIDATION
  // =========================
  if (password !== confirm) {
    alert("Passwords do not match.");
    btn.disabled = false;
    return;
  }

  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    alert("Username must be 3–20 characters, letters/numbers only.");
    btn.disabled = false;
    return;
  }

  // =========================
  // CHECK USERNAME UNIQUENESS
  // =========================
  const q = query(collection(db, "users"), where("username", "==", username));
  const snap = await getDocs(q);

  if (!snap.empty) {
    alert("This username is already taken.");
    btn.disabled = false;
    return;
  }

  // =========================
  // CREATE AUTH ACCOUNT
  // =========================
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set displayName in Auth (optional but good)
    await updateProfile(cred.user, {
      displayName: username
    });

    // =========================
    // WRITE USER DOCUMENT
    // =========================
    await setDoc(doc(db, "users", cred.user.uid), {
      firstName: first,
      lastName: last,
      username: username,
      email: email,

      // Defaults for profile.html
      city: "",
      avatarURL: "",
      preferences: [],
      aboutMe: ""
    });

    alert("Account created! Please log in.");
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("Sign up error: " + err.message);
  }

  btn.disabled = false;
}
