// =======================
// IMPORTS
// =======================
import { auth, db, app } from "./main.js";

import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";


// =======================
// CONSTANTS
// =======================
const storage = getStorage(app);

// Default avatar if user never uploaded one
const DEFAULT_AVATAR_URL = "https://i.imgur.com/1X3bQGv.png";

// All available preferences for the modal
const ALL_PREFS = [
  "Books",
  "Drinks",
  "Networking",
  "Coding",
  "Hiking",
  "Movies",
  "Board Games",
  "Photography",
  "Fitness",
  "Volunteering",
];

let userPrefs = []; // will be replaced by Firestore data



// =======================
// FIRESTORE UPDATE HELPER
// =======================
async function updateUserField(field, value) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { [field]: value });
    console.log(`Updated ${field}:`, value);
  } catch (err) {
    console.error(`Error updating ${field}:`, err);
  }
}



// =======================
// AUTH CHECK + LOAD PROFILE DATA
// =======================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in → send back to login
    window.location.href = "login.html";
    return;
  }

  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn("No user document found in Firestore.");
      return;
    }

    const data = snap.data();

    // ---------- Main info ----------
    const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
    document.getElementById("profile-name").value =
      fullName || "Add your name in Settings";

    document.getElementById("profile-email").value = data.email || "";
    document.getElementById("profile-username").value =
      data.username ? `@${data.username}` : "@username";
    document.getElementById("profile-city").value = data.city || "";

    // ---------- Avatar ----------
    const avatarEl = document.getElementById("avatar");
    const avatarURL = data.avatarURL || DEFAULT_AVATAR_URL;

    avatarEl.src = avatarURL;

    // If doc had no avatarURL, set default in Firestore once
    if (!data.avatarURL) {
      await updateUserField("avatarURL", DEFAULT_AVATAR_URL);
    }

    // ---------- Bio ----------
    const bioTextEl = document.getElementById("bioText");
    const about = (data.aboutMe || "").trim();

    bioTextEl.textContent =
      about || 'Click "Edit" to tell others about yourself.';

    // ---------- Preferences ----------
    userPrefs = Array.isArray(data.preferences) ? data.preferences : [];
    renderChips();
  } catch (err) {
    console.error("Error loading profile:", err);
  }
});



// =======================
// PREFERENCES UI / MODAL
// =======================
const chipsWrap = document.getElementById("chips");
const prefModal = document.getElementById("prefModal");
const prefList = document.getElementById("prefList");
const prefCloseBtn = document.getElementById("prefClose");
const prefApplyBtn = document.getElementById("prefApply");

function renderChips() {
  if (!chipsWrap) return;

  chipsWrap.innerHTML = "";

  // existing prefs
  userPrefs.forEach((p) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = p;
    chipsWrap.appendChild(chip);
  });

  // "+" chip to open modal
  const add = document.createElement("span");
  add.className = "chip add";
  add.textContent = "+";
  add.title = "Edit preferences";
  add.onclick = openPrefModal;
  chipsWrap.appendChild(add);
}

function openPrefModal() {
  if (!prefModal || !prefList) return;

  prefList.innerHTML = "";

  ALL_PREFS.forEach((name) => {
    const row = document.createElement("div");
    row.className = "pref-item";

    const label = document.createElement("div");
    label.className = "pref-name";
    label.textContent = name;

    const btn = document.createElement("button");
    btn.className = "btn toggle";

    const selected = userPrefs.includes(name);
    btn.textContent = selected ? "Remove —" : "Add +";

    btn.onclick = () => {
      if (selected) {
        // remove
        userPrefs = userPrefs.filter((x) => x !== name);
      } else {
        // add
        userPrefs.push(name);
      }
      // re-open to refresh buttons
      openPrefModal();
    };

    row.append(label, btn);
    prefList.appendChild(row);
  });

  prefModal.classList.add("show");
  prefModal.setAttribute("aria-hidden", "false");
}

if (prefCloseBtn) {
  prefCloseBtn.onclick = () => {
    prefModal.classList.remove("show");
    prefModal.setAttribute("aria-hidden", "true");
  };
}

if (prefApplyBtn) {
  prefApplyBtn.onclick = async () => {
    prefModal.classList.remove("show");
    prefModal.setAttribute("aria-hidden", "true");
    renderChips();
    await updateUserField("preferences", userPrefs);
  };
}



// =======================
// BIO EDIT LOGIC
// =======================
const bioEdit = document.getElementById("bioEdit");
const bioView = document.getElementById("bioView");
const bioText = document.getElementById("bioText");
const bioBox = document.getElementById("bioEditBox");
const bioTA = document.getElementById("bioTextarea");
const bioSave = document.getElementById("bioSave");
const bioCancel = document.getElementById("bioCancel");

if (bioEdit) {
  bioEdit.onclick = () => {
    bioTA.value = bioText.textContent.trim();
    bioView.style.display = "none";
    bioBox.style.display = "block";
  };
}

if (bioSave) {
  bioSave.onclick = async (e) => {
    e.preventDefault();
    const text = bioTA.value.trim();

    bioText.textContent =
      text || 'Click "Edit" to tell others about yourself.';
    bioView.style.display = "block";
    bioBox.style.display = "none";

    await updateUserField("aboutMe", text);
  };
}

if (bioCancel) {
  bioCancel.onclick = (e) => {
    e.preventDefault();
    bioView.style.display = "block";
    bioBox.style.display = "none";
  };
}



// =======================
// AVATAR UPLOAD
// =======================
const avatarEl = document.getElementById("avatar");
const avatarInput = document.getElementById("avatarInput");
const editPic = document.querySelector(".edit-pic");

if (editPic && avatarInput) {
  editPic.onclick = () => avatarInput.click();
}

if (avatarInput && avatarEl) {
  avatarInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const user = auth.currentUser;
    if (!user) return;

    // temporary preview
    const preview = URL.createObjectURL(file);
    avatarEl.src = preview;

    try {
      const imgRef = storageRef(storage, `avatars/${user.uid}.jpg`);
      await uploadBytes(imgRef, file);
      const url = await getDownloadURL(imgRef);

      await updateUserField("avatarURL", url);
      console.log("Avatar updated:", url);
    } catch (err) {
      console.error("Error uploading avatar:", err);
    }
  };
}
