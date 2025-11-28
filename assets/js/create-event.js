// let map;
// let marker;
// let placeAutocomplete;

// // Called by Google Maps script when it’s ready
// async function initMap() {
//   // Load Maps + Places (New)
//   const { Map } = await google.maps.importLibrary("maps");
//   await google.maps.importLibrary("places");

//   const initialCenter = { lat: 45.4215, lng: -75.6972 }; // Ottawa-ish

//   // Create the map
//   map = new Map(document.getElementById("map"), {
//     center: initialCenter,
//     zoom: 12,
//   });

//   // Classic marker (no mapId required)
//   marker = new google.maps.Marker({
//     map,
//     position: initialCenter,
//   });

//   // ====== Address autocomplete INSIDE the form ======
//   const container = document.getElementById("address-autocomplete");

//   placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});
//   placeAutocomplete.placeholder = "Enter event address…";

//   container.appendChild(placeAutocomplete);

//   const hiddenAddressInput = document.getElementById("event-address-value");
//   const debugBox = document.getElementById("debug");

//   placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
//     if (!placePrediction) return;

//     const place = placePrediction.toPlace();

//     // Fetch location + formatted address
//     await place.fetchFields({
//       fields: ["location", "viewport", "formattedAddress"],
//     });

//     if (!place.location) {
//       alert("Selected place has no location data.");
//       return;
//     }

//     // Update map & marker
//     if (place.viewport) {
//       map.fitBounds(place.viewport);
//     } else {
//       map.setCenter(place.location);
//       map.setZoom(15);
//     }

//     marker.setPosition(place.location);

//     // Save address in hidden input (just to have it in form data)
//     hiddenAddressInput.value = place.formattedAddress || "";

//     // Show debug info
//     debugBox.textContent =
//       `Selected address: ${place.formattedAddress}\n` +
//       `Lat: ${place.location.lat()}  Lng: ${place.location.lng()}`;
//   });

//   // ====== Handle form submit (just log to console for now) ======
//   const form = document.getElementById("event-form");

//   form.addEventListener("submit", (e) => {
//     e.preventDefault(); // don't actually reload page

//     const name = document.getElementById("event-name").value.trim();
//     const max = document.getElementById("max-participants").value;
//     const date = document.getElementById("event-date").value;
//     const address = hiddenAddressInput.value;

//     const payload = {
//       name,
//       maxParticipants: max,
//       date,
//       address,
//       // If you want, also store coords from last debugBox / global state
//     };

//     console.log("Form submit payload:", payload);
//     alert("Check console for submitted form data!");

//     // In your real app, you'd send this to Firestore here.
//   });
// }

// // For the callback
// window.initMap = initMap;


// Import Firebase functions
import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.0/firebase-firestore.js";

// Get auth and db from main.js
const auth = window.auth;
const db = window.db;

let map;
let marker;
let placeAutocomplete;
let selectedLocation = null; // Store the selected place location

// Called by Google Maps script when it's ready
async function initMap() {
  // Load Maps + Places (New)
  const { Map } = await google.maps.importLibrary("maps");
  await google.maps.importLibrary("places");

  const initialCenter = { lat: 45.4215, lng: -75.6972 }; // Ottawa center

  // Create the map with restrictions
  map = new Map(document.getElementById("map"), {
    center: initialCenter,
    zoom: 12,
    restriction: {
      latLngBounds: {
        north: 45.54, // North of Ottawa
        south: 45.30, // South of Ottawa
        east: -75.50,  // East of Ottawa
        west: -75.90   // West of Ottawa
      },
      strictBounds: false // Allow panning slightly outside but centers back
    }
  });

  // Classic marker (no mapId required)
  marker = new google.maps.Marker({
    map,
    position: initialCenter,
  });

  // ====== Address autocomplete INSIDE the form ======
  const container = document.getElementById("address-autocomplete");

  placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
    componentRestrictions: { country: "ca" }, // Restrict to Canada
    locationBias: {
      center: { lat: 45.4215, lng: -75.6972 }, // Ottawa center
      radius: 50000 // 50km radius around Ottawa
    }
  });
  placeAutocomplete.placeholder = "Enter event address in Ottawa...";

  container.appendChild(placeAutocomplete);

  const hiddenAddressInput = document.getElementById("event-address-value");
  const debugBox = document.getElementById("debug");

  placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }) => {
    if (!placePrediction) return;

    const place = placePrediction.toPlace();

    // Fetch location + formatted address
    await place.fetchFields({
      fields: ["location", "viewport", "formattedAddress"],
    });

    if (!place.location) {
      alert("Selected place has no location data.");
      return;
    }

    // Update map & marker
    if (place.viewport) {
      map.fitBounds(place.viewport);
    } else {
      map.setCenter(place.location);
      map.setZoom(15);
    }

    marker.setPosition(place.location);

    // Save location coordinates globally
    selectedLocation = {
      lat: place.location.lat(),
      lng: place.location.lng()
    };

    // Save address in hidden input
    hiddenAddressInput.value = place.formattedAddress || "";

    // Show debug info
    debugBox.textContent =
      `Selected address: ${place.formattedAddress}\n` +
      `Lat: ${selectedLocation.lat}  Lng: ${selectedLocation.lng}`;
  });

  // ====== Handle form submit - SAVE TO FIREBASE ======
  const form = document.getElementById("event-form");
  const submitBtn = document.getElementById("submit-btn");

  // Character counter for description
  const descriptionInput = document.getElementById("event-description");
  const charCount = document.querySelector(".char-count");

  if (descriptionInput && charCount) {
    descriptionInput.addEventListener("input", () => {
      const length = descriptionInput.value.length;
      charCount.textContent = `${length}/500`;
      
      if (length > 450) {
        charCount.style.color = "#E74C3C";
      } else {
        charCount.style.color = "#5A6C7A";
      }
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Check if user is logged in
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to create an event.");
      window.location.href = "login.html";
      return;
    }

    // Get form values
    const name = document.getElementById("event-name").value.trim();
    const max = document.getElementById("max-participants").value;
    const date = document.getElementById("event-date").value;
    const description = document.getElementById("event-description").value.trim();
    const address = hiddenAddressInput.value;

    // Validation
    if (!name) {
      alert("Please enter an event name.");
      return;
    }

    if (!max) {
      alert("Please select max participants.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }

    if (!description) {
      alert("Please add a description for your event.");
      return;
    }

    if (description.length < 10) {
      alert("Description must be at least 10 characters.");
      return;
    }

    if (!address || !selectedLocation) {
      alert("Please select an address from the autocomplete dropdown.");
      return;
    }

    // Disable submit button to prevent double submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating...";

    try {
      // Get user data from Firestore to include creator name
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const creatorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || "Anonymous";

      // Create event object
      const eventData = {
        eventName: name,
        maxParticipants: parseInt(max),
        date: date,
        description: description,
        address: address,
        location: selectedLocation, // Store coordinates for map display
        creatorId: user.uid,
        creatorName: creatorName,
        participants: [user.uid], // Creator is automatically a participant
        createdAt: serverTimestamp(),
        status: "active" // Could be: active, cancelled, completed
      };

      // Save to Firestore
      const eventsRef = collection(db, "events");
      const docRef = await addDoc(eventsRef, eventData);

      console.log("Event created with ID:", docRef.id);

      // Show success message
      alert("Event created successfully!");

      // Reset form
      form.reset();
      hiddenAddressInput.value = "";
      selectedLocation = null;
      
      // Reset map to initial position
      map.setCenter({ lat: 45.4215, lng: -75.6972 });
      map.setZoom(12);
      marker.setPosition({ lat: 45.4215, lng: -75.6972 });

      if (debugBox) {
        debugBox.textContent = "Event created! Create another or go to Find Events.";
      }

      // Optional: Redirect to Find Event or My Profile after 2 seconds
      setTimeout(() => {
        window.location.href = "find-event.html";
      }, 2000);

    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event: " + error.message);
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = "Save";
    }
  });
}

// For the callback
window.initMap = initMap;