// // main.js
// // Firebase App
// import {
//   initializeApp
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";

// // Firebase Auth
// import {
//   getAuth,
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   signOut,
//   updateProfile,
//   onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

// // Firestore
// import {
//   getFirestore,
//   doc,
//   setDoc
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// // Storage (for avatars)
// import {
//   getStorage
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-storage.js";






// // Right one 
// const firebaseConfig = {
//   apiKey: "AIzaSyC-mixWkL4e-pQWDH7yHD04fny_BJdYd50",
//   authDomain: "socialize-27e25.firebaseapp.com",
//   projectId: "socialize-27e25",
//   storageBucket: "socialize-27e25.firebasestorage.app",
//   messagingSenderId: "390071019251",
//   appId: "1:390071019251:web:9dffd2561bd7e32153b986",
//   measurementId: "G-JL5FF49XEM"
// };

// // 2. Init Firebase + Auth
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);


// // Database SETUP
// const db = getFirestore(app);

// window.app  = app;
// window.auth = auth;
// window.db   = db;

// // ✅ SIGN UP
// const signupForm = document.getElementById("signup-form");

// if (signupForm) {
//   signupForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     // Collect fields
//     const first = document.getElementById("fname").value.trim();
//     const last = document.getElementById("lname").value.trim();
//     const username = document.getElementById("username").value.trim();
//     const email = document.getElementById("email").value.trim();
//     const password = document.getElementById("password").value;
//     const confirm = document.getElementById("confirm-password").value;

//     if (password !== confirm) {
//       alert("Passwords do not match.");
//       return;
//     }

//     try {
//       // Create user in Firebase Authentication
//       const cred = await createUserWithEmailAndPassword(auth, email, password);

//       // Set Firebase Auth display name
//       await updateProfile(cred.user, {
//         displayName: username
//       });

//       // --- Firestore user document ---
//       const userRef = doc(db, "users", cred.user.uid);

//       const defaultAvatar = "assets/images/default-avatar.png" || "FETCH HERE THE NEW PICTURE";



//       await setDoc(userRef, {
//         firstName: first,
//         lastName: last,
//         username: username,
//         email: email,
//         city: "",
//         avatarURL: defaultAvatar,
//         aboutMe: "",
//         preferences: [],
//         createdAt: Date.now()
//       });

//       alert("Account created! Redirecting...");

//       // Redirect to profile
//       window.location.href = "profile.html";

//     } catch (err) {
//       alert(err.message);
//     }
//   });
// }


// // ✅ LOGIN
// const signinForm = document.getElementById("signin-form");
// if (signinForm) {
//   signinForm.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const email = document.getElementById("signin-email").value.trim();
//     const password = document.getElementById("signin-password").value;

//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       window.location.href = "profile.html"; // ✅ redirect to profile later
//     } catch (err) {
//       alert(err.message);
//     }
//   });
// }

// // ✅ SIGN OUT (used later inside profile page)
// const signoutBtn = document.getElementById("signout-btn");
// if (signoutBtn) {
//   signoutBtn.addEventListener("click", async () => {
//     await signOut(auth);
//     window.location.href = "login.html";
//   });
// }

// // ✅ USER STATE LISTENER (we’ll use it later for protected pages)
// onAuthStateChanged(auth, (user) => {
//   console.log("Auth state:", user ? "Logged in" : "Logged out");
// });

// export { app, auth, db };



// main.js
// Firebase App
import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-app.js";

// Firebase Auth
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

// Firestore
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// Storage (for avatars)
import {
  getStorage
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-storage.js";


// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-mixWkL4e-pQWDH7yHD04fny_BJdYd50",
  authDomain: "socialize-27e25.firebaseapp.com",
  projectId: "socialize-27e25",
  storageBucket: "socialize-27e25.firebasestorage.app",
  messagingSenderId: "390071019251",
  appId: "1:390071019251:web:9dffd2561bd7e32153b986",
  measurementId: "G-JL5FF49XEM"
};

// Init Firebase + Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make available globally for other scripts
window.app  = app;
window.auth = auth;
window.db   = db;


// ============================================
// LOGIN LOGIC (login.html only)
// ============================================
const signinForm = document.getElementById("signin-form");

if (signinForm) {
  signinForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        alert(
          "Please verify your email before logging in.\n\n" +
          "Check your inbox for the verification link.\n\n" +
          "Didn't receive it? Check your spam folder or click 'Resend Verification' below."
        );
        
        // Sign out unverified user
        await signOut(auth);
        
        // Show resend button
        showResendVerificationOption(email, password);
        return;
      }

      // Email is verified, allow login
      console.log("Login successful!");
      window.location.href = "profile.html";

    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = err.message;
      
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (err.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again.";
      }
      
      alert(errorMessage);
    }
  });
}


// ============================================
// RESEND VERIFICATION EMAIL
// ============================================
function showResendVerificationOption(email, password) {
  const resendBtn = document.getElementById("resend-verification-btn");
  
  if (resendBtn) {
    resendBtn.style.display = "block";
    
    resendBtn.onclick = async () => {
      try {
        // Re-authenticate to get user object
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send verification email
        await sendEmailVerification(user);
        
        alert("Verification email sent! Please check your inbox.");
        
        // Sign out again
        await signOut(auth);
      } catch (err) {
        console.error("Resend error:", err);
        alert("Error sending verification email: " + err.message);
      }
    };
  }
}


// ============================================
// SIGN OUT BUTTON (for profile/settings pages)
// ============================================
const signoutBtn = document.getElementById("signout-btn");

if (signoutBtn) {
  signoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}


// ============================================
// GOOGLE SIGN-IN (login.html)
// ============================================
const googleSigninBtn = document.getElementById("google-signin-btn");

if (googleSigninBtn) {
  googleSigninBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      console.log("Google sign-in successful:", user.email);
      
      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // First time Google user - create document
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
      }
      
      // Redirect to profile
      window.location.href = "profile.html";
      
    } catch (error) {
      console.error("Google sign-in error:", error);
      
      let errorMessage = error.message;
      
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in cancelled. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups for this site.";
      }
      
      alert("Google sign-in error: " + errorMessage);
    }
  });
}


// ============================================
// AUTH STATE LISTENER
// ============================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User logged in:", user.email);
    console.log("Email verified:", user.emailVerified);
  } else {
    console.log("No user logged in");
  }
});


// Export for use in other modules
export { app, auth, db };