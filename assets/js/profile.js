// // =======================
// // IMPORTS
// // =======================
// import { app, auth, db } from "./main.js";

// // --- AUTH ---
// import {
//   onAuthStateChanged
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

// // --- FIRESTORE ---
// import {
//   doc,
//   getDoc,
//   updateDoc
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// // --- STORAGE ---
// import {
//   getStorage,
//   ref as storageRef,
//   uploadBytes,
//   getDownloadURL
// } from "https://www.gstatic.com/firebasejs/12.2.0/firebase-storage.js";


// // =======================
// // CONSTANTS
// // =======================
// const storage = getStorage(app);

// // Default avatar if user never uploaded one
// const DEFAULT_AVATAR_URL = "assets/images/default-avatar.jpg";

// // All available preferences for the modal
// const ALL_PREFS = [
//   "Books",
//   "Drinks",
//   "Networking",
//   "Coding",
//   "Hiking",
//   "Movies",
//   "Board Games",
//   "Photography",
//   "Fitness",
//   "Volunteering",
// ];

// let userPrefs = []; // will be replaced by Firestore data



// // =======================
// // FIRESTORE UPDATE HELPER
// // =======================
// async function updateUserField(field, value) {
//   const user = auth.currentUser;
//   if (!user) return;

//   try {
//     const userRef = doc(db, "users", user.uid);
//     await updateDoc(userRef, { [field]: value });
//     console.log(`Updated ${field}:`, value);
//   } catch (err) {
//     console.error(`Error updating ${field}:`, err);
//   }
// }



// // =======================
// // AUTH CHECK + LOAD PROFILE DATA
// // =======================
// onAuthStateChanged(auth, async (user) => {
//   if (!user) {
//     // Not logged in → send back to login
//     window.location.href = "login.html";
//     return;
//   }

//   try {
//     const ref = doc(db, "users", user.uid);
//     const snap = await getDoc(ref);

//     if (!snap.exists()) {
//       console.warn("No user document found in Firestore.");
//       return;
//     }

//     const data = snap.data();

//     // ---------- Main info ----------
//     const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();
//     document.getElementById("profile-name").value =
//       fullName || "Add your name in Settings";

//     document.getElementById("profile-email").value = data.email || "";
//     document.getElementById("profile-username").value =
//       data.username ? `@${data.username}` : "@username";
//     document.getElementById("profile-city").value = data.city || "";

//     // ---------- Avatar ----------
//     const avatarEl = document.getElementById("avatar");
//     const avatarURL = data.avatarURL || DEFAULT_AVATAR_URL;

//     avatarEl.src = avatarURL;

//     // If doc had no avatarURL, set default in Firestore once
//     if (!data.avatarURL) {
//       await updateUserField("avatarURL", DEFAULT_AVATAR_URL);
//     }

//     // ---------- Bio ----------
//     const bioTextEl = document.getElementById("bioText");
//     const about = (data.aboutMe || "").trim();

//     bioTextEl.textContent =
//       about || 'Click "Edit" to tell others about yourself.';

//     // ---------- Preferences ----------
//     userPrefs = Array.isArray(data.preferences) ? data.preferences : [];
//     renderChips();
//   } catch (err) {
//     console.error("Error loading profile:", err);
//   }
// });



// // =======================
// // PREFERENCES UI / MODAL
// // =======================
// const chipsWrap = document.getElementById("chips");
// const prefModal = document.getElementById("prefModal");
// const prefList = document.getElementById("prefList");
// const prefCloseBtn = document.getElementById("prefClose");
// const prefApplyBtn = document.getElementById("prefApply");

// function renderChips() {
//   if (!chipsWrap) return;

//   chipsWrap.innerHTML = "";

//   // existing prefs
//   userPrefs.forEach((p) => {
//     const chip = document.createElement("span");
//     chip.className = "chip";
//     chip.textContent = p;
//     chipsWrap.appendChild(chip);
//   });

//   // "+" chip to open modal
//   const add = document.createElement("span");
//   add.className = "chip add";
//   add.textContent = "+";
//   add.title = "Edit preferences";
//   add.onclick = openPrefModal;
//   chipsWrap.appendChild(add);
// }

// function openPrefModal() {
//   if (!prefModal || !prefList) return;

//   prefList.innerHTML = "";

//   ALL_PREFS.forEach((name) => {
//     const row = document.createElement("div");
//     row.className = "pref-item";

//     const label = document.createElement("div");
//     label.className = "pref-name";
//     label.textContent = name;

//     const btn = document.createElement("button");
//     btn.className = "btn toggle";

//     const selected = userPrefs.includes(name);
//     btn.textContent = selected ? "Remove —" : "Add +";

//     btn.onclick = () => {
//       if (selected) {
//         // remove
//         userPrefs = userPrefs.filter((x) => x !== name);
//       } else {
//         // add
//         userPrefs.push(name);
//       }
//       // re-open to refresh buttons
//       openPrefModal();
//     };

//     row.append(label, btn);
//     prefList.appendChild(row);
//   });

//   prefModal.classList.add("show");
//   prefModal.setAttribute("aria-hidden", "false");
// }

// if (prefCloseBtn) {
//   prefCloseBtn.onclick = () => {
//     prefModal.classList.remove("show");
//     prefModal.setAttribute("aria-hidden", "true");
//   };
// }

// if (prefApplyBtn) {
//   prefApplyBtn.onclick = async () => {
//     prefModal.classList.remove("show");
//     prefModal.setAttribute("aria-hidden", "true");
//     renderChips();
//     await updateUserField("preferences", userPrefs);
//   };
// }



// // =======================
// // BIO EDIT LOGIC
// // =======================
// const bioEdit = document.getElementById("bioEdit");
// const bioView = document.getElementById("bioView");
// const bioText = document.getElementById("bioText");
// const bioBox = document.getElementById("bioEditBox");
// const bioTA = document.getElementById("bioTextarea");
// const bioSave = document.getElementById("bioSave");
// const bioCancel = document.getElementById("bioCancel");

// if (bioEdit) {
//   bioEdit.onclick = () => {
//     bioTA.value = bioText.textContent.trim();
//     bioView.style.display = "none";
//     bioBox.style.display = "block";
//   };
// }

// if (bioSave) {
//   bioSave.onclick = async (e) => {
//     e.preventDefault();
//     const text = bioTA.value.trim();

//     bioText.textContent =
//       text || 'Click "Edit" to tell others about yourself.';
//     bioView.style.display = "block";
//     bioBox.style.display = "none";

//     await updateUserField("aboutMe", text);
//   };
// }

// if (bioCancel) {
//   bioCancel.onclick = (e) => {
//     e.preventDefault();
//     bioView.style.display = "block";
//     bioBox.style.display = "none";
//   };
// }


// //TODO Wrong Logic
// // =======================
// // AVATAR UPLOAD
// // =======================
// const avatarEl = document.getElementById("avatar");
// const avatarInput = document.getElementById("avatarInput");
// const editPic = document.querySelector(".edit-pic");

// if (editPic && avatarInput) {
//   editPic.onclick = () => avatarInput.click();
// }

// if (avatarInput && avatarEl) {
//   avatarInput.onchange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const user = auth.currentUser;
//     if (!user) return;

//     // temporary preview
//     const preview = URL.createObjectURL(file);
//     avatarEl.src = preview;

//     try {
//       const imgRef = storageRef(storage, `avatars/${user.uid}.jpg`);
//       await uploadBytes(imgRef, file);
//       const url = await getDownloadURL(imgRef);

//       await updateUserField("avatarURL", url);
//       console.log("Avatar updated:", url);
//     } catch (err) {
//       console.error("Error uploading avatar:", err);
//     }
//   };
// }


// =======================
// IMPORTS
// =======================
import { app, auth, db } from "./main.js";

// --- AUTH ---
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-auth.js";

// --- FIRESTORE ---
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// --- STORAGE ---
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-storage.js";


// =======================
// CONSTANTS
// =======================
const storage = getStorage(app);

// Default avatar if user never uploaded one
const DEFAULT_AVATAR_URL = "assets/images/default-avatar.jpg";

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

    // ---------- Load User's Events ----------
    await loadUserEvents(user.uid);

    // ---------- Load Joined Events ----------
    await loadJoinedEvents(user.uid);

  } catch (err) {
    console.error("Error loading profile:", err);
  }
});



// =======================
// LOAD USER'S EVENTS
// =======================
async function loadUserEvents(userId) {
  try {
    // Query events where the current user is the creator
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef, 
      where("creatorId", "==", userId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Sort events by date in JavaScript (to avoid needing a Firestore index)
    const events = [];
    querySnapshot.forEach((docSnap) => {
      events.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });
    
    // Sort by date ascending
    events.sort((a, b) => {
      const dateA = new Date(a.data.date);
      const dateB = new Date(b.data.date);
      return dateA - dateB;
    });

    // Find the My Events section in the HTML
    // Look for the h3 that says "My Events" and insert after it
    const myEventsHeading = Array.from(document.querySelectorAll('.panel h3'))
      .find(h3 => h3.textContent.trim() === 'My Events');

    if (!myEventsHeading) {
      console.warn("My Events heading not found in HTML");
      return;
    }

    // Remove the dummy event if it exists
    const dummyEvent = myEventsHeading.nextElementSibling;
    if (dummyEvent && dummyEvent.classList.contains('conn-item')) {
      dummyEvent.remove();
    }

    // Check if user has any events
    if (events.length === 0) {
      const noEventsMsg = document.createElement('p');
      noEventsMsg.style.cssText = 'text-align:center; padding:20px; color:#5A6C7A; font-style:italic;';
      noEventsMsg.textContent = 'No events created yet. Create your first event!';
      myEventsHeading.insertAdjacentElement('afterend', noEventsMsg);
      return;
    }

    // Display each event
    events.forEach(({ id, data }) => {
      const eventCard = createMyEventCard(data, id);
      myEventsHeading.insertAdjacentElement('afterend', eventCard);
    });

    console.log(`Loaded ${events.length} events for user`);

  } catch (error) {
    console.error("Error loading user events:", error);
  }
}

// Create an event card for My Events section
function createMyEventCard(event, eventId) {
  const connItem = document.createElement('div');
  connItem.className = 'conn-item';
  connItem.dataset.eventId = eventId;

  // Format date
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Extract city from address
  const addressParts = event.address.split(',');
  const cityLocation = addressParts.length > 1 ? 
    addressParts[addressParts.length - 2].trim() : 
    event.address.split(',')[0];

  // Create a simple icon/image for the event (you can replace with actual event images later)
  const eventIcon = document.createElement('div');
  eventIcon.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #003D5B 0%, #005A87 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border: 3px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  `;
  eventIcon.textContent = '📅';

  const infoDiv = document.createElement('div');
  infoDiv.innerHTML = `
    <div class="conn-name">${event.eventName}</div>
    <div class="conn-meta">${formattedDate} • ${cityLocation}</div>
  `;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'conn-actions';
  
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn view';
  viewBtn.textContent = 'View';
  viewBtn.onclick = () => {
    openEventModal(event);
  };

  actionsDiv.appendChild(viewBtn);

  connItem.appendChild(eventIcon);
  connItem.appendChild(infoDiv);
  connItem.appendChild(actionsDiv);

  return connItem;
}



// =======================
// LOAD JOINED EVENTS
// =======================
async function loadJoinedEvents(userId) {
  try {
    // Query events where the current user is in the participants array
    const eventsRef = collection(db, "events");
    const q = query(
      eventsRef, 
      where("participants", "array-contains", userId),
      orderBy("date", "asc")
    );
    
    const querySnapshot = await getDocs(q);

    // Find the Joined Events section in the HTML
    const joinedEventsHeading = Array.from(document.querySelectorAll('.panel h3'))
      .find(h3 => h3.textContent.trim() === 'Joined Events');

    if (!joinedEventsHeading) {
      console.warn("Joined Events heading not found in HTML");
      return;
    }

    // Filter out events created by the user (those are in "My Events")
    const joinedEvents = [];
    querySnapshot.forEach((docSnap) => {
      const event = docSnap.data();
      if (event.creatorId !== userId) {
        joinedEvents.push({ id: docSnap.id, ...event });
      }
    });

    // Check if user has joined any events
    if (joinedEvents.length === 0) {
      const noEventsMsg = document.createElement('p');
      noEventsMsg.style.cssText = 'text-align:center; padding:20px; color:#5A6C7A; font-style:italic;';
      noEventsMsg.textContent = 'No joined events yet. Browse events to join!';
      joinedEventsHeading.insertAdjacentElement('afterend', noEventsMsg);
      return;
    }

    // Display each joined event
    joinedEvents.forEach(({ id, ...event }) => {
      const eventCard = createJoinedEventCard(event, id);
      joinedEventsHeading.insertAdjacentElement('afterend', eventCard);
    });

    console.log(`Loaded ${joinedEvents.length} joined events for user`);

  } catch (error) {
    console.error("Error loading joined events:", error);
  }
}

// Create an event card for Joined Events section
function createJoinedEventCard(event, eventId) {
  const connItem = document.createElement('div');
  connItem.className = 'conn-item';
  connItem.dataset.eventId = eventId;

  // Format date
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Extract city from address
  const addressParts = event.address.split(',');
  const cityLocation = addressParts.length > 1 ? 
    addressParts[addressParts.length - 2].trim() : 
    event.address.split(',')[0];

  // Create icon for joined events (different color)
  const eventIcon = document.createElement('div');
  eventIcon.style.cssText = `
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F5A623 0%, #E89610 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    border: 3px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  `;
  eventIcon.textContent = '🎉';

  const infoDiv = document.createElement('div');
  infoDiv.innerHTML = `
    <div class="conn-name">${event.eventName}</div>
    <div class="conn-meta">${formattedDate} • ${cityLocation}</div>
  `;

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'conn-actions';
  
  const viewBtn = document.createElement('button');
  viewBtn.className = 'btn view';
  viewBtn.textContent = 'View';
  viewBtn.onclick = () => {
    openEventModal(event);
  };

  actionsDiv.appendChild(viewBtn);

  connItem.appendChild(eventIcon);
  connItem.appendChild(infoDiv);
  connItem.appendChild(actionsDiv);

  return connItem;
}



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


//TODO Wrong Logic
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


// ============================================
// EVENT DETAILS MODAL
// ============================================

function openEventModal(event) {
  const modal = document.getElementById("event-modal");

  // Format date
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Populate modal
  document.getElementById("modal-event-name").textContent = event.eventName;
  document.getElementById("modal-date").textContent = formattedDate;
  document.getElementById("modal-location").textContent = event.address;
  
  const participantCount = event.participants?.length || 0;
  document.getElementById("modal-participants").textContent = `${participantCount}/${event.maxParticipants} people`;
  
  document.getElementById("modal-creator").textContent = event.creatorName || "Anonymous";
  document.getElementById("modal-description").textContent = event.description || "No description provided.";

  // Show modal
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeEventModal() {
  const modal = document.getElementById("event-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

// Close modal button
const modalCloseBtn = document.getElementById("modal-close-btn");
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeEventModal);
}

// Close button in actions
const closeModalBtn = document.getElementById("close-modal-btn");
if (closeModalBtn) {
  closeModalBtn.addEventListener("click", closeEventModal);
}

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeEventModal();
  }
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEventModal();
  }
});