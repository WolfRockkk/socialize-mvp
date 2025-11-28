// // =========================
// // IMPORTS
// // =========================
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   updateProfile
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

// import {
//   getFirestore,
//   collection,
//   query,
//   where,
//   getDocs,
//   doc,
//   setDoc
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";


// // =========================
// // GET auth & db (from main.js)
// // =========================
// const auth = getAuth();
// const db = getFirestore();


// // =========================
// // FORM HANDLER
// // =========================
// document.getElementById("signup-form").addEventListener("submit", handleSignup);

// async function handleSignup(e) {
//   e.preventDefault();

//   const btn = document.getElementById("signup-btn");
//   btn.disabled = true;

//   // Read fields
//   const first = document.getElementById("fname").value.trim();
//   const last = document.getElementById("lname").value.trim();
//   const username = document.getElementById("username").value.trim().toLowerCase();
//   const email = document.getElementById("email").value.trim();
//   const password = document.getElementById("password").value;
//   const confirm = document.getElementById("confirm-password").value;

//   // =========================
//   // VALIDATION
//   // =========================
//   if (password !== confirm) {
//     alert("Passwords do not match.");
//     btn.disabled = false;
//     return;
//   }

//   if (!/^[a-z0-9._]{3,20}$/.test(username)) {
//     alert("Username must be 3–20 characters, letters/numbers only.");
//     btn.disabled = false;
//     return;
//   }

//   // =========================
//   // CHECK USERNAME UNIQUENESS
//   // =========================
//   const q = query(collection(db, "users"), where("username", "==", username));
//   const snap = await getDocs(q);

//   if (!snap.empty) {
//     alert("This username is already taken.");
//     btn.disabled = false;
//     return;
//   }

//   // =========================
//   // CREATE AUTH ACCOUNT
//   // =========================
//   try {
//     const cred = await createUserWithEmailAndPassword(auth, email, password);

//     // Set displayName in Auth (optional but good)
//     await updateProfile(cred.user, {
//       displayName: username
//     });

//     // =========================
//     // WRITE USER DOCUMENT
//     // =========================
//     await setDoc(doc(db, "users", cred.user.uid), {
//       firstName: first,
//       lastName: last,
//       username: username,
//       email: email,

//       // Defaults for profile.html
//       city: "",
//       avatarURL: "",
//       preferences: [],
//       aboutMe: ""
//     });

//     alert("Account created! Please log in.");
//     window.location.href = "login.html";

//   } catch (err) {
//     console.error(err);
//     alert("Sign up error: " + err.message);
//   }

//   btn.disabled = false;
// }

// =========================
// IMPORTS
// =========================
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";  // ✅ FIXED!


// =========================
// GET auth & db (from window, set by main.js)
// =========================
const auth = window.auth;
const db = window.db;


// =========================
// FORM HANDLER
// =========================
const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", handleSignup);
}

async function handleSignup(e) {
  e.preventDefault();

  const btn = document.getElementById("signup-btn");
  btn.disabled = true;
  btn.textContent = "Creating account...";

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
  if (!first || !last || !username || !email || !password) {
    alert("Please fill in all fields.");
    btn.disabled = false;
    btn.textContent = "Sign Up";
    return;
  }

  if (password !== confirm) {
    alert("Passwords do not match.");
    btn.disabled = false;
    btn.textContent = "Sign Up";
    return;
  }

  if (password.length < 6) {
    alert("Password must be at least 6 characters.");
    btn.disabled = false;
    btn.textContent = "Sign Up";
    return;
  }

  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    alert("Username must be 3–20 characters, lowercase letters, numbers, dots, or underscores only.");
    btn.disabled = false;
    btn.textContent = "Sign Up";
    return;
  }

  // =========================
  // CHECK USERNAME UNIQUENESS
  // =========================
  try {
    const q = query(collection(db, "users"), where("username", "==", username));
    const snap = await getDocs(q);

    if (!snap.empty) {
      alert("This username is already taken. Please choose another.");
      btn.disabled = false;
      btn.textContent = "Sign Up";
      return;
    }
  } catch (err) {
    console.error("Error checking username:", err);
    alert("Error checking username. Please try again.");
    btn.disabled = false;
    btn.textContent = "Sign Up";
    return;
  }

  // =========================
  // CREATE AUTH ACCOUNT
  // =========================
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set displayName in Auth
    await updateProfile(cred.user, {
      displayName: username
    });

    // =========================
    // WRITE USER DOCUMENT
    // =========================
    const defaultAvatar = "assets/images/default-avatar.jpg";

    await setDoc(doc(db, "users", cred.user.uid), {
      firstName: first,
      lastName: last,
      username: username,
      email: email,
      city: "",
      avatarURL: defaultAvatar,
      preferences: [],
      aboutMe: "",
      connections: [], // For friends system
      createdAt: Date.now()
    });

    // =========================
    // SEND VERIFICATION EMAIL
    // =========================
    await sendEmailVerification(cred.user);

    console.log("Verification email sent to:", email);

    // Sign out user (can't access app until verified)
    await signOut(auth);

    // Success message
    alert(
      `Account created successfully!\n\n` +
      `A verification email has been sent to ${email}.\n\n` +
      `Please check your inbox and verify your email before logging in.`
    );

    // Redirect to login
    window.location.href = "login.html";

  } catch (err) {
    console.error("Sign up error:", err);

    let errorMessage = err.message;

    if (err.code === "auth/email-already-in-use") {
      errorMessage = "This email is already registered. Please login instead.";
    } else if (err.code === "auth/weak-password") {
      errorMessage = "Password should be at least 6 characters.";
    } else if (err.code === "auth/invalid-email") {
      errorMessage = "Please enter a valid email address.";
    }

    alert("Sign up error: " + errorMessage);
  }

  btn.disabled = false;
  btn.textContent = "Sign Up";
}


// ============================================
// GOOGLE SIGN-UP (signup.html)
// ============================================
const googleSignupBtn = document.getElementById("google-signup-btn");

if (googleSignupBtn) {
  googleSignupBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google sign-up successful:", user.email);
      
      // Check if user document already exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // New Google user - create document
        const nameParts = user.displayName ? user.displayName.split(" ") : ["", ""];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";
        
        await setDoc(userDocRef, {
          firstName: firstName,
          lastName: lastName,
          username: user.email.split("@")[0], // Use email prefix as username
          email: user.email,
          city: "",
          avatarURL: user.photoURL || "assets/images/default-avatar.jpg",
          preferences: [],
          aboutMe: "",
          connections: [],
          createdAt: Date.now(),
          authProvider: "google"
        });
        
        console.log("Created new user document for Google user");
        alert("Account created with Google! Welcome to Socialize!");
      } else {
        // User already exists - just log them in
        console.log("Existing Google user, logging in");
      }
      
      // Redirect to profile
      window.location.href = "profile.html";
      
    } catch (error) {
      console.error("Google sign-up error:", error);
      
      let errorMessage = error.message;
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-up cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        errorMessage = "An account already exists with this email using a different sign-in method.";
      }
      
      alert("Google sign-up error: " + errorMessage);
    }
  });
}