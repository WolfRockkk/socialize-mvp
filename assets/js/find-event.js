// // assets/js/find-event.js

// let map;
// let infoWindow;
// const markerEntries = [];

// // Dummy events for map pins (rough Ottawa-ish coords)
// const dummyEvents = [
//   {
//     title: "Board Games & Drinks – This Saturday",
//     lat: 45.3478,
//     lng: -75.7365,
//   },
//   {
//     title: "Morning Coffee & Language Exchange",
//     lat: 45.4180,
//     lng: -75.7060,
//   },
//   {
//     title: "Sunday Walk & Photo Meetup",
//     lat: 45.4005,
//     lng: -75.7045,
//   },
// ];

// // Called by Google Maps script when it’s ready
// async function initMap() {
//   const { Map } = await google.maps.importLibrary("maps");

//   const initialCenter = { lat: 45.404, lng: -75.73 }; // Ottawa area

//   map = new Map(document.getElementById("map"), {
//     center: initialCenter,
//     zoom: 13,
//   });

//   infoWindow = new google.maps.InfoWindow();

//   const cards = document.querySelectorAll(".event-card");

//   cards.forEach((card, idx) => {
//     const evt = dummyEvents[idx];
//     if (!evt) return;

//     const position = { lat: evt.lat, lng: evt.lng };

//     const marker = new google.maps.Marker({
//       map,
//       position,
//       title: evt.title,
//     });

//     const entry = { marker, card };
//     markerEntries.push(entry);

//     // Click on marker → focus card
//     marker.addListener("click", () => {
//       selectEvent(idx);
//     });

//     // Click on card → focus marker
//     card.addEventListener("click", () => {
//       selectEvent(idx);
//     });
//   });

//   // Focus first event by default if any
//   if (markerEntries.length > 0) {
//     selectEvent(0);
//   }
// }

// // Focus an event: center map, open info window, highlight card
// function selectEvent(index) {
//   const entry = markerEntries[index];
//   if (!entry) return;

//   const { marker, card } = entry;

//   map.panTo(marker.getPosition());
//   map.setZoom(14);

//   const title =
//     card.querySelector(".event-title")?.textContent || marker.getTitle();
//   const locationText =
//     card.querySelector(".event-location")?.textContent || "";

//   infoWindow.setContent(
//     `<div style="font-size:14px;font-weight:600;">${title}</div>
//      <div style="font-size:12px; margin-top:2px;">${locationText}</div>`
//   );
//   infoWindow.open({ map, anchor: marker });

//   // Highlight active card
//   document.querySelectorAll(".event-card").forEach((c) =>
//     c.classList.remove("event-card-active")
//   );
//   card.classList.add("event-card-active");
// }

// // Expose for Google Maps callback
// window.initMap = initMap;


// Import Firebase functions
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// Wait for auth and db to be initialized by main.js
function getAuth() {
  return window.auth;
}

function getDb() {
  return window.db;
}

let map;
let infoWindow;
const markerEntries = [];
let allEvents = []; // Store all events globally
let currentEventId = null; // Track which event modal is showing

// Called by Google Maps script when it's ready
async function initMap() {
  const { Map } = await google.maps.importLibrary("maps");

  const initialCenter = { lat: 45.404, lng: -75.73 }; // Ottawa area

  map = new Map(document.getElementById("map"), {
    center: initialCenter,
    zoom: 13,
  });

  infoWindow = new google.maps.InfoWindow();

  // Load events from Firebase
  await loadEvents();
}

// Load events from Firestore and display them
async function loadEvents() {
  try {
    const auth = getAuth();
    const db = getDb();
    
    // Wait for Firebase to initialize (with retry limit)
    if (!db || !auth) {
      console.log("Waiting for Firebase to initialize...");
      setTimeout(loadEvents, 200);
      return;
    }
    
    // Extra check: make sure user is authenticated before loading
    let retries = 0;
    while (!auth.currentUser && retries < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    const eventListContainer = document.querySelector(".event-list");
    
    // Show loading message
    eventListContainer.innerHTML = '<p style="text-align:center; padding:40px; color:#003D5B;">Loading events...</p>';

    // Query events from Firestore, ordered by date
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    // Clear the container
    eventListContainer.innerHTML = "";

    // Check if there are any events
    if (querySnapshot.empty) {
      eventListContainer.innerHTML = '<p style="text-align:center; padding:40px; color:#003D5B;">No events found. Create the first one!</p>';
      return;
    }

    // Store all events
    allEvents = [];
    querySnapshot.forEach((docSnap) => {
      allEvents.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    console.log("Loaded events:", allEvents);

    // Display each event
    allEvents.forEach((event, index) => {
      const eventCard = createEventCard(event, index);
      eventListContainer.appendChild(eventCard);

      // Add marker to map if location exists
      if (event.location && event.location.lat && event.location.lng) {
        addMarkerForEvent(event, index, eventCard);
      }
    });

    // Focus first event by default if any
    if (markerEntries.length > 0) {
      selectEvent(0);
    }

  } catch (error) {
    console.error("Error loading events:", error);
    const eventListContainer = document.querySelector(".event-list");
    eventListContainer.innerHTML = '<p style="text-align:center; padding:40px; color:#E74C3C;">Error loading events. Please refresh the page.</p>';
  }
}

// Create an event card element
function createEventCard(event, index) {
  const article = document.createElement("article");
  article.className = "event-card";
  article.dataset.index = index;
  article.dataset.eventId = event.id;

  // Format date (convert YYYY-MM-DD to readable format)
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Extract city from address
  const addressParts = event.address.split(',');
  const cityLocation = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : event.address;

  // Participant count
  const participantCount = event.participants?.length || 0;
  const spotsLeft = event.maxParticipants - participantCount;
  
  article.innerHTML = `
    <div class="event-main">
      <div class="event-title-row">
        <span class="event-arrow">▾</span>
        <h3 class="event-title">${event.eventName}</h3>
      </div>
      <div class="event-meta-row">
        <div class="event-date">
          <span class="event-date-icon">📅</span>
          <span>${formattedDate}</span>
        </div>
        <div class="event-location">
          <span>${cityLocation}</span>
        </div>
      </div>
    </div>
    <div class="event-tags">
      <span class="tag-pill">👤 ${participantCount}/${event.maxParticipants}</span>
      <span class="tag-pill">📍 ${event.address.substring(0, 30)}${event.address.length > 30 ? '...' : ''}</span>
      <button class="btn-view-details">View Details</button>
    </div>
  `;

  // Click event card to show on map (not open modal)
  article.addEventListener("click", (e) => {
    // If clicking the "View Details" button, open modal instead
    if (e.target.classList.contains('btn-view-details')) {
      e.stopPropagation();
      openEventModal(event);
    } else {
      // Otherwise, just show on map
      selectEvent(index);
    }
  });

  return article;
}

// Add a marker to the map for an event
function addMarkerForEvent(event, index, card) {
  const position = { 
    lat: event.location.lat, 
    lng: event.location.lng 
  };

  const marker = new google.maps.Marker({
    map,
    position,
    title: event.eventName,
  });

  const entry = { marker, card, event };
  markerEntries.push(entry);

  // Click on marker → open modal
  marker.addListener("click", () => {
    openEventModal(event);
  });

  // Highlight on hover
  card.addEventListener("mouseenter", () => {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(null), 750);
  });
}

// Focus an event: center map, open info window, highlight card
function selectEvent(index) {
  const entry = markerEntries[index];
  if (!entry) return;

  const { marker, card, event } = entry;

  map.panTo(marker.getPosition());
  map.setZoom(15);

  // Format date for info window
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const spotsLeft = event.maxParticipants - (event.participants?.length || 0);

  infoWindow.setContent(
    `<div style="font-family: 'Istok Web', sans-serif; padding: 10px;">
       <div style="font-size:16px;font-weight:700; color:#003D5B; margin-bottom:8px;">${event.eventName}</div>
       <div style="font-size:13px; color:#5A6C7A; margin-bottom:4px;">📅 ${formattedDate}</div>
       <div style="font-size:13px; color:#5A6C7A; margin-bottom:4px;">📍 ${event.address}</div>
       <div style="font-size:13px; color:#5A6C7A;">👤 ${spotsLeft} spots left</div>
     </div>`
  );
  infoWindow.open({ map, anchor: marker });

  // Highlight active card
  document.querySelectorAll(".event-card").forEach((c) =>
    c.classList.remove("event-card-active")
  );
  card.classList.add("event-card-active");

  // Scroll card into view
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ============================================
// EVENT DETAILS MODAL
// ============================================

function openEventModal(event) {
  const auth = getAuth();
  const modal = document.getElementById("event-modal");
  currentEventId = event.id;

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

  // Check if user is already joined
  const user = auth.currentUser;
  const isJoined = event.participants?.includes(user.uid) || false;
  const isFull = participantCount >= event.maxParticipants;
  const isCreator = event.creatorId === user.uid;

  // Show/hide buttons
  const joinBtn = document.getElementById("join-event-btn");
  const leaveBtn = document.getElementById("leave-event-btn");
  const fullBtn = document.getElementById("event-full-btn");

  if (isCreator) {
    // Creator can't join/leave their own event
    joinBtn.style.display = "none";
    leaveBtn.style.display = "none";
    fullBtn.style.display = "block";
    fullBtn.textContent = "You created this event";
    fullBtn.disabled = true;
  } else if (isJoined) {
    // User has joined - show leave button
    joinBtn.style.display = "none";
    leaveBtn.style.display = "block";
    fullBtn.style.display = "none";
  } else if (isFull) {
    // Event is full
    joinBtn.style.display = "none";
    leaveBtn.style.display = "none";
    fullBtn.style.display = "block";
    fullBtn.textContent = "Event Full";
    fullBtn.disabled = true;
  } else {
    // User can join
    joinBtn.style.display = "block";
    leaveBtn.style.display = "none";
    fullBtn.style.display = "none";
  }

  // Show modal
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeEventModal() {
  const modal = document.getElementById("event-modal");
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  currentEventId = null;
}

// Close modal button
const modalCloseBtn = document.getElementById("modal-close-btn");
if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeEventModal);
}

// Close modal when clicking overlay
const modalOverlay = document.querySelector(".modal-overlay");
if (modalOverlay) {
  modalOverlay.addEventListener("click", closeEventModal);
}

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeEventModal();
  }
});

// ============================================
// JOIN EVENT
// ============================================
const joinEventBtn = document.getElementById("join-event-btn");

if (joinEventBtn) {
  joinEventBtn.addEventListener("click", async () => {
    if (!currentEventId) return;

    const auth = getAuth();
    const db = getDb();
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to join events.");
      return;
    }

    try {
      joinEventBtn.disabled = true;
      joinEventBtn.textContent = "Joining...";

      const eventRef = doc(db, "events", currentEventId);
      
      // Add user to participants array
      await updateDoc(eventRef, {
        participants: arrayUnion(user.uid)
      });

      console.log("Joined event successfully!");

      // Refresh the event data
      await refreshEventData(currentEventId);

      alert("You've joined the event! Check 'My Profile' to see your joined events.");

    } catch (error) {
      console.error("Error joining event:", error);
      alert("Error joining event: " + error.message);
    } finally {
      joinEventBtn.disabled = false;
      joinEventBtn.textContent = "Join Event";
    }
  });
}

// ============================================
// LEAVE EVENT
// ============================================
const leaveEventBtn = document.getElementById("leave-event-btn");

if (leaveEventBtn) {
  leaveEventBtn.addEventListener("click", async () => {
    if (!currentEventId) return;

    const auth = getAuth();
    const db = getDb();
    const user = auth.currentUser;
    if (!user) return;

    const confirm = window.confirm("Are you sure you want to leave this event?");
    if (!confirm) return;

    try {
      leaveEventBtn.disabled = true;
      leaveEventBtn.textContent = "Leaving...";

      const eventRef = doc(db, "events", currentEventId);
      
      // Remove user from participants array
      await updateDoc(eventRef, {
        participants: arrayRemove(user.uid)
      });

      console.log("Left event successfully!");

      // Refresh the event data
      await refreshEventData(currentEventId);

      alert("You've left the event.");

    } catch (error) {
      console.error("Error leaving event:", error);
      alert("Error leaving event: " + error.message);
    } finally {
      leaveEventBtn.disabled = false;
      leaveEventBtn.textContent = "Leave Event";
    }
  });
}

// ============================================
// REFRESH EVENT DATA
// ============================================
async function refreshEventData(eventId) {
  try {
    const db = getDb();
    
    // Fetch updated event from Firestore
    const eventRef = doc(db, "events", eventId);
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      console.error("Event not found");
      closeEventModal();
      return;
    }

    const updatedEvent = {
      id: eventSnap.id,
      ...eventSnap.data()
    };

    // Update in allEvents array
    const eventIndex = allEvents.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      allEvents[eventIndex] = updatedEvent;
    }

    // Update the event card in the list
    const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
    if (eventCard) {
      const participantCount = updatedEvent.participants?.length || 0;
      const participantPill = eventCard.querySelector(".tag-pill");
      if (participantPill) {
        participantPill.textContent = `👤 ${participantCount}/${updatedEvent.maxParticipants}`;
      }
    }

    // Reopen modal with updated data
    closeEventModal();
    setTimeout(() => {
      openEventModal(updatedEvent);
    }, 100);

  } catch (error) {
    console.error("Error refreshing event data:", error);
  }
}

// Expose for Google Maps callback
window.initMap = initMap;
window.actualInitMap = initMap; // For the placeholder to call