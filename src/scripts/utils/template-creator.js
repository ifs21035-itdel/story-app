import "leaflet/dist/leaflet.css";
import L from "leaflet";
import customMarkerIconUrl from "../../public/favicon.png";

const storyMarkerIcon = L.icon({
  iconUrl: customMarkerIconUrl,
  iconSize: [16, 16],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const createStoryItemTemplate = (story) => `
  <article class="story-item">
    <img class="story-item__image" src="${
      story.photoUrl
    }" alt="Story image from ${story.name}: ${story.description.substring(
  0,
  50
)}..." loading="lazy">
    <div class="story-item__content">
      <h3 class="story-item__title">${story.name}</h3>
      <p class="story-item__description">${story.description}</p>
      <div class="story-item__details">
        <p><strong>Created:</strong> ${new Date(
          story.createdAt
        ).toLocaleDateString()}</p>
        ${
          story.lat && story.lon
            ? `<p><strong>Location:</strong> ${story.lat.toFixed(
                4
              )}, ${story.lon.toFixed(4)}</p>`
            : "<p>Location not available</p>"
        }
      </div>
      ${
        story.lat && story.lon
          ? `<div id="map-${story.id}" class="story-item__map-container"></div>`
          : ""
      }
    </div>
  </article>
`;

const createHomePageTemplate = () => `
  <section>
    <h2>Discover Stories</h2>
    <div id="story-list" class="story-list">
      <p>Loading stories...</p>
    </div>
  </section>
`;

const createLoginPageTemplate = () => `
  <section class="login-page">
    <h2>Login</h2>
    <form id="loginForm">
      <div class="form-group">
        <label for="loginEmail">Email</label>
        <input type="email" id="loginEmail" name="email" required>
      </div>
      <div class="form-group">
        <label for="loginPassword">Password</label>
        <input type="password" id="loginPassword" name="password" required>
      </div>
      <button type="submit" class="button">Login</button>
      <p class="auth-switch">Don't have an account? <a href="#/register">Register here</a></p>
    </form>
  </section>
`;

const createRegisterPageTemplate = () => `
  <section class="register-page">
    <h2>Register</h2>
    <form id="registerForm">
      <div class="form-group">
        <label for="registerName">Name</label>
        <input type="text" id="registerName" name="name" required>
      </div>
      <div class="form-group">
        <label for="registerEmail">Email</label>
        <input type="email" id="registerEmail" name="email" required>
      </div>
      <div class="form-group">
        <label for="registerPassword">Password</label>
        <input type="password" id="registerPassword" name="password" minlength="8" required>
      </div>
      <button type="submit" class="button">Register</button>
      <p class="auth-switch">Already have an account? <a href="#/login">Login here</a></p>
    </form>
  </section>
`;

const createAddStoryPageTemplate = () => `
  <section class="add-story-page">
    <h2>Add New Story</h2>
    <form id="addStoryForm">
      <div class="form-group">
        <label for="storyDescription">Description</label>
        <textarea id="storyDescription" name="description" rows="4" required></textarea>
      </div>
      
      <div class="form-group">
        <label for="storyPhoto">Photo</label>
        <input type="file" id="storyPhotoFile" name="photoFile" accept="image/*" style="display: none;">
        <button type="button" id="takePictureButton" class="button">Take Picture with Camera</button>
        <button type="button" id="uploadPictureButton" class="button" style="margin-left: 10px;">Upload File</button>
        <div id="camera-container" style="display:none; margin-top:10px;">
            <video id="camera-preview" autoplay playsinline></video>
            <button type="button" id="captureButton" class="button" style="margin-top:5px;">Capture</button>
            <button type="button" id="retakeButton" class="button button-danger" style="margin-top:5px; display:none;">Retake</button>
        </div>
        <img id="photo-result" src="#" alt="Captured or uploaded photo" style="display:none; max-width: 100%; margin-top:10px;"/>
      </div>

      <div class="form-group">
        <label for="storyLocation">Location (Optional - Click on map to select)</label>
        <div id="map-picker" style="height: 300px; width: 100%; border: 1px solid #ccc;"></div>
        <input type="hidden" id="storyLat" name="latitude">
        <input type="hidden" id="storyLon" name="longitude">
        <p id="selected-coordinates">No location selected.</p>
      </div>
      
      <button type="submit" class="button">Post Story</button>
    </form>
  </section>
`;

const initMapOnStoryItem = (story) => {
  if (story.lat && story.lon) {
    const mapId = `map-${story.id}`;
    const mapContainer = document.getElementById(mapId);
    if (mapContainer && !mapContainer._leaflet_id) {
      const map = L.map(mapId).setView([story.lat, story.lon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      L.marker([story.lat, story.lon], { icon: storyMarkerIcon })
        .addTo(map)
        .bindPopup(
          `<b>${story.name}</b><br>${story.description.substring(0, 50)}...`
        )
        .openPopup();
    }
  }
};

export {
  createStoryItemTemplate,
  createHomePageTemplate,
  createLoginPageTemplate,
  createRegisterPageTemplate,
  createAddStoryPageTemplate,
  initMapOnStoryItem,
};
