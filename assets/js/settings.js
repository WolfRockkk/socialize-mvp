// // =======================
// // Firebase Imports
// // =======================
// import {
//   onAuthStateChanged,
//   updateEmail,
//   updatePassword,
//   reauthenticateWithCredential,
//   EmailAuthProvider,
//   sendEmailVerification,
//   signOut,
//   deleteUser
// } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// import {
//   doc,
//   getDoc,
//   updateDoc
// } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// import {
//   getStorage,
//   ref as storageRef,
//   uploadBytes,
//   getDownloadURL
// } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";


// // Firebase Storage reference
// const storage = getStorage(app);


// // =======================
// // Load User Into Settings Page
// // =======================
// onAuthStateChanged(auth, async (user) => {
//   if (!user) return (window.location.href = "login.html");

//   const ref = doc(db, "users", user.uid);
//   const snap = await getDoc(ref);

//   if (!snap.exists()) return;

//   const data = snap.data();

//   document.getElementById("settings-name").value =
//     `${data.firstName} ${data.lastName}`;

//   document.getElementById("settings-email").value = data.email;
//   document.getElementById("settings-username").value = "@" + data.username;
//   document.getElementById("settings-city").value = data.city || "";
// });


// // =======================
// // Firestore update helper
// // =======================
// async function updateUserField(field, value) {
//   const user = auth.currentUser;
//   if (!user) return;

//   try {
//     await updateDoc(doc(db, "users", user.uid), { [field]: value });
//   } catch (err) {
//     alert("Update error: " + err.message);
//   }
// }


// // ==================================================
// // --------------- EMAIL CHANGE MODAL ----------------
// // ==================================================
// const emailModal  = document.getElementById("emailModal");
// const emailSave   = document.getElementById("emailSave");
// const emailCancel = document.getElementById("emailCancel");

// document.getElementById("changeEmailBtn").onclick = () => {
//   emailModal.classList.add("show");
// };

// emailCancel.onclick = () => {
//   emailModal.classList.remove("show");
// };

// async function changeEmail(newEmail, password) {
//   const user = auth.currentUser;
//   if (!user) return alert("Not logged in.");

//   try {
//     const cred = EmailAuthProvider.credential(user.email, password);
//     await reauthenticateWithCredential(user, cred);

//     await updateEmail(user, newEmail);
//     await sendEmailVerification(user);

//     await updateUserField("email", newEmail);

//     alert("Email updated! Check your inbox to verify.");
//   } catch (err) {
//     alert("Error updating email: " + err.message);
//   }
// }

// emailSave.onclick = async () => {
//   const newEmail = document.getElementById("newEmail").value.trim();
//   const pass     = document.getElementById("emailPassword").value;
//   await changeEmail(newEmail, pass);
//   emailModal.classList.remove("show");
// };


// // ==================================================
// // ----------- GENERAL MODAL FOR OTHER FIELDS --------
// // ==================================================
// const modal        = document.getElementById("settingsModal");
// const modalTitle   = document.getElementById("modal-title");
// const modalBody    = document.getElementById("modal-body");
// const modalError   = document.getElementById("modal-error");
// const modalForm    = document.getElementById("modal-form");
// const modalCancel  = document.getElementById("modal-cancel");

// let currentField = null;


// // Attach change-link button handlers
// document.querySelectorAll(".change-link").forEach(btn => {
//   btn.addEventListener("click", () => openModal(btn.dataset.field));
// });


// function openModal(field) {
//   currentField = field;
//   modalError.textContent = "";
//   modalBody.innerHTML = "";

//   switch (field) {
//     case "name": {
//       modalTitle.textContent = "Change Name";

//       const full = document.getElementById("settings-name").value.trim();
//       const [first = "", ...rest] = full.split(" ");
//       const last = rest.join(" ");

//       modalBody.innerHTML = `
//         <label>First Name</label>
//         <input id="modal-first" type="text" value="${first}">
//         <label>Last Name</label>
//         <input id="modal-last" type="text" value="${last}">
//       `;
//       break;
//     }

//     case "username": {
//       modalTitle.textContent = "Change Username";
//       const raw = document.getElementById("settings-username").value.replace("@", "");

//       modalBody.innerHTML = `
//         <label>New Username</label>
//         <input id="modal-username" type="text" value="${raw}">
//       `;
//       break;
//     }

//     case "city": {
//       modalTitle.textContent = "Change City";
//       const city = document.getElementById("settings-city").value;

//       modalBody.innerHTML = `
//         <label>City</label>
//         <input id="modal-city" type="text" value="${city}">
//       `;
//       break;
//     }

//     case "password": {
//       modalTitle.textContent = "Change Password";

//       modalBody.innerHTML = `
//         <label>Current Password</label>
//         <input id="modal-pass-current" type="password">

//         <label>New Password</label>
//         <input id="modal-pass-new" type="password">

//         <label>Confirm Password</label>
//         <input id="modal-pass-confirm" type="password">
//       `;
//       break;
//     }
//   }

//   modal.classList.add("show");
// }


// function closeModal() {
//   modal.classList.remove("show");
//   currentField = null;
// }

// modalCancel.onclick = closeModal;


// // ===============================
// // Modal Save Logic
// // ===============================
// modalForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   modalError.textContent = "";

//   const user = auth.currentUser;
//   if (!user) return;

//   try {
//     switch (currentField) {
//       case "name": {
//         const first = document.getElementById("modal-first").value.trim();
//         const last  = document.getElementById("modal-last").value.trim();
//         await updateUserField("firstName", first);
//         await updateUserField("lastName", last);
//         document.getElementById("settings-name").value = `${first} ${last}`;
//         break;
//       }

//       case "username": {
//         let username = document.getElementById("modal-username").value.trim().toLowerCase();
//         if (!/^[a-z0-9_]+$/.test(username))
//           throw new Error("Username must contain only lowercase letters, numbers, or _");

//         await updateUserField("username", username);
//         document.getElementById("settings-username").value = "@" + username;
//         break;
//       }

//       case "city": {
//         const city = document.getElementById("modal-city").value.trim();
//         await updateUserField("city", city);
//         document.getElementById("settings-city").value = city;
//         break;
//       }

//       case "password": {
//         const oldP = document.getElementById("modal-pass-current").value;
//         const newP = document.getElementById("modal-pass-new").value;
//         const cP   = document.getElementById("modal-pass-confirm").value;

//         if (newP !== cP) throw new Error("Passwords do not match");

//         const cred = EmailAuthProvider.credential(user.email, oldP);
//         await reauthenticateWithCredential(user, cred);
//         await updatePassword(user, newP);

//         alert("Password updated.");
//         break;
//       }
//     }

//     closeModal();
//   } catch (err) {
//     modalError.textContent = err.message;
//   }
// });


// // =======================
// // Logout + Delete account
// // =======================
// document.getElementById("logoutBtn").onclick = () => {
//   signOut(auth);
//   window.location.href = "login.html";
// };

// document.getElementById("deleteBtn").onclick = async () => {
//   if (!confirm("Are you sure? This cannot be undone.")) return;

//   try {
//     await deleteUser(auth.currentUser);
//     window.location.href = "signup.html";
//   } catch (err) {
//     alert("Error: " + err.message);
//   }
// };


// =======================
// Firebase Imports
// =======================
import {
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification,
  signOut,
  deleteUser
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

// NOTE: auth and db are created in main.js and attached to window
// e.g. window.auth = auth; window.db = db;
const statusBox = document.getElementById("settings-status");

// =======================
// Load User Into Settings Page
// =======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("settings-name").value =
      `${data.firstName || ""} ${data.lastName || ""}`.trim();
    document.getElementById("settings-email").value     = data.email || "";
    document.getElementById("settings-username").value  = data.username ? "@" + data.username : "";
    document.getElementById("settings-city").value      = data.city || "";

  } catch (err) {
    console.error(err);
    if (statusBox) statusBox.textContent = "Error loading settings.";
  }
});

// =======================
// Firestore update helper
// =======================
async function updateUserField(field, value) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid), { [field]: value });
    console.log(`Updated ${field}:`, value);
  } catch (err) {
    console.error(err);
    alert("Update error: " + err.message);
  }
}

// ==================================================
// --------------- EMAIL CHANGE MODAL ---------------
// ==================================================
const emailModal  = document.getElementById("emailModal");
const emailSave   = document.getElementById("emailSave");
const emailCancel = document.getElementById("emailCancel");
const changeEmailBtn = document.getElementById("changeEmailBtn");

if (changeEmailBtn) {
  changeEmailBtn.addEventListener("click", () => {
    emailModal.classList.add("show");
    emailModal.setAttribute("aria-hidden", "false");
  });
}

if (emailCancel) {
  emailCancel.addEventListener("click", () => {
    emailModal.classList.remove("show");
    emailModal.setAttribute("aria-hidden", "true");
  });
}

// Change email with reauth + verification
async function changeEmail(newEmail, password) {
  const user = auth.currentUser;
  if (!user) {
    alert("You are not logged in.");
    return;
  }

  try {
    // reauthenticate
    const cred = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, cred);

    // update email in Auth
    await updateEmail(user, newEmail);

    // send verification email
    await sendEmailVerification(user);

    // update Firestore
    await updateUserField("email", newEmail);

    document.getElementById("settings-email").value = newEmail;

    alert("Email updated! Please check your inbox to verify the new email.");
  } catch (err) {
    console.error(err);
    alert("Error updating email: " + err.message);
  }
}

if (emailSave) {
  emailSave.addEventListener("click", async () => {
    const newEmail = document.getElementById("newEmail").value.trim();
    const pass     = document.getElementById("emailPassword").value;

    if (!newEmail || !pass) {
      alert("Please fill in both fields.");
      return;
    }

    await changeEmail(newEmail, pass);
    emailModal.classList.remove("show");
    emailModal.setAttribute("aria-hidden", "true");
  });
}

// ==================================================
// ---------- GENERAL MODAL (name/username/city/password)
// ==================================================
const modal        = document.getElementById("settingsModal");
const modalTitle   = document.getElementById("modal-title");
const modalBody    = document.getElementById("modal-body");
const modalError   = document.getElementById("modal-error");
const modalForm    = document.getElementById("modal-form");
const modalCancel  = document.getElementById("modal-cancel");

let currentField = null;

// Open modal for specific field
function openModal(field) {
  currentField = field;
  modalError.textContent = "";
  modalBody.innerHTML = "";

  switch (field) {
    case "name": {
      modalTitle.textContent = "Change Name";

      const full = document.getElementById("settings-name").value.trim();
      const [first = "", ...rest] = full.split(" ");
      const last = rest.join(" ");

      modalBody.innerHTML = `
        <div class="modal-field">
          <label class="modal-label">First name</label>
          <input id="modal-first" class="modal-input" type="text" value="${first}">
        </div>
        <div class="modal-field">
          <label class="modal-label">Last name</label>
          <input id="modal-last" class="modal-input" type="text" value="${last}">
        </div>
      `;
      break;
    }

    case "username": {
      modalTitle.textContent = "Change Username";

      const raw = document
        .getElementById("settings-username")
        .value.replace(/^@/, "");

      modalBody.innerHTML = `
        <div class="modal-field">
          <label class="modal-label">New username (lowercase)</label>
          <input id="modal-username" class="modal-input" type="text" value="${raw}">
        </div>
      `;
      break;
    }

    case "city": {
      modalTitle.textContent = "Change City";

      const city = document.getElementById("settings-city").value;

      modalBody.innerHTML = `
        <div class="modal-field">
          <label class="modal-label">City</label>
          <input id="modal-city" class="modal-input" type="text" value="${city}">
        </div>
      `;
      break;
    }

    case "password": {
      modalTitle.textContent = "Change Password";

      modalBody.innerHTML = `
        <div class="modal-field">
          <label class="modal-label">Current password</label>
          <input id="modal-pass-current" class="modal-input" type="password">
        </div>
        <div class="modal-field">
          <label class="modal-label">New password</label>
          <input id="modal-pass-new" class="modal-input" type="password">
        </div>
        <div class="modal-field">
          <label class="modal-label">Confirm new password</label>
          <input id="modal-pass-confirm" class="modal-input" type="password">
        </div>
      `;
      break;
    }

    default:
      // Should not happen now
      modalTitle.textContent = "Edit";
      modalBody.innerHTML = `<p>Nothing to edit.</p>`;
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  currentField = null;
}

if (modalCancel) {
  modalCancel.addEventListener("click", (e) => {
    e.preventDefault();
    closeModal();
  });
}

// Attach openModal ONLY to change-link buttons that have data-field
document.querySelectorAll(".change-link[data-field]").forEach(btn => {
  btn.addEventListener("click", () => {
    const field = btn.dataset.field; // "name" | "username" | "city" | "password"
    openModal(field);
  });
});

// Handle modal form submission
modalForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  modalError.textContent = "";

  const user = auth.currentUser;
  if (!user) {
    modalError.textContent = "You are not logged in.";
    return;
  }

  try {
    switch (currentField) {
      case "name": {
        const first = document.getElementById("modal-first").value.trim();
        const last  = document.getElementById("modal-last").value.trim();

        await updateUserField("firstName", first);
        await updateUserField("lastName", last);

        document.getElementById("settings-name").value =
          `${first} ${last}`.trim();
        break;
      }

      case "username": {
        let username = document.getElementById("modal-username").value.trim().toLowerCase();

        if (!username.match(/^[a-z0-9_]+$/)) {
          throw new Error("Username must contain lowercase letters, numbers, or _ only.");
        }

        // TODO: enforce uniqueness via a usernames collection (future stage)
        await updateUserField("username", username);
        document.getElementById("settings-username").value = "@" + username;
        break;
      }

      case "city": {
        const city = document.getElementById("modal-city").value.trim();
        await updateUserField("city", city);
        document.getElementById("settings-city").value = city;
        break;
      }

      case "password": {
        const oldP = document.getElementById("modal-pass-current").value;
        const newP = document.getElementById("modal-pass-new").value;
        const cP   = document.getElementById("modal-pass-confirm").value;

        if (!oldP || !newP || !cP) {
          throw new Error("Please fill in all password fields.");
        }

        if (newP !== cP) {
          throw new Error("New passwords do not match.");
        }

        const cred = EmailAuthProvider.credential(user.email, oldP);
        await reauthenticateWithCredential(user, cred);
        await updatePassword(user, newP);

        alert("Password updated.");
        break;
      }
    }

    closeModal();
  } catch (err) {
    console.error(err);
    modalError.textContent = err.message;
  }
});

// =======================
// Logout + Delete account
// =======================
const logoutBtn = document.getElementById("logoutBtn");
const deleteBtn = document.getElementById("delete-account");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;

    try {
      await deleteUser(auth.currentUser);
      window.location.href = "signup.html";
    } catch (err) {
      alert("Error deleting account: " + err.message);
    }
  });
}
