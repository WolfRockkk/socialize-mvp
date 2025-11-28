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
  orderBy
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// Get db from main.js
const db = window.db;

let map;
let infoWindow;
const markerEntries = [];
let allEvents = []; // Store all events globally

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
    querySnapshot.forEach((doc) => {
      allEvents.push({
        id: doc.id,
        ...doc.data()
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

  // Format date (convert YYYY-MM-DD to readable format)
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  // Extract city from address (simple approach - get last part before postal code)
  const addressParts = event.address.split(',');
  const cityLocation = addressParts.length > 1 ? addressParts[addressParts.length - 2].trim() : event.address;

  // Create tags (for now, just show participant count - you can add real tags later)
  const spotsLeft = event.maxParticipants - (event.participants?.length || 0);
  
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
      <span class="tag-pill">👤 ${event.participants?.length || 1}/${event.maxParticipants}</span>
      <span class="tag-pill">📍 ${event.address.substring(0, 30)}${event.address.length > 30 ? '...' : ''}</span>
    </div>
  `;

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

  // Click on marker → focus card
  marker.addListener("click", () => {
    selectEvent(index);
  });

  // Click on card → focus marker
  card.addEventListener("click", () => {
    selectEvent(index);
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

// Expose for Google Maps callback
window.initMap = initMap;