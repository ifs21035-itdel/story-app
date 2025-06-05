import { createAddStoryPageTemplate } from "../../utils/template-creator";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Swal from "sweetalert2";
import customMarkerIconUrl from "../../../public/favicon.png";

const addPageMapPickerIcon = L.icon({
  iconUrl: customMarkerIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

class AddStoryView {
  constructor() {
    this.form = null;
    this.descriptionInput = null;
    this.storyPhotoFileInput = null;
    this.takePictureButton = null;
    this.uploadPictureButton = null;
    this.cameraContainer = null;
    this.cameraPreview = null;
    this.captureButton = null;
    this.retakeButton = null;
    this.photoResult = null;
    this.mapPickerContainer = null;
    this.selectedCoordsDisplay = null;
    this.storyLatInput = null;
    this.storyLonInput = null;

    this._map = null;
    this._marker = null;
    this._cameraStream = null;
  }

  renderInitialStructure() {
    return createAddStoryPageTemplate();
  }

  initializeDOMReferences() {
    this.form = document.querySelector("#addStoryForm");
    this.descriptionInput = document.querySelector("#storyDescription");
    this.storyPhotoFileInput = document.querySelector("#storyPhotoFile");
    this.takePictureButton = document.querySelector("#takePictureButton");
    this.uploadPictureButton = document.querySelector("#uploadPictureButton");
    this.cameraContainer = document.querySelector("#camera-container");
    this.cameraPreview = document.querySelector("#camera-preview");
    this.captureButton = document.querySelector("#captureButton");
    this.retakeButton = document.querySelector("#retakeButton");
    this.photoResult = document.querySelector("#photo-result");
    this.mapPickerContainer = document.querySelector("#map-picker");
    this.selectedCoordsDisplay = document.querySelector(
      "#selected-coordinates"
    );
    this.storyLatInput = document.querySelector("#storyLat");
    this.storyLonInput = document.querySelector("#storyLon");

    if (!this.form || !this.mapPickerContainer) {
      console.error("AddStoryView: Essential form elements not found.");
    }
  }

  getDescription() {
    return this.descriptionInput ? this.descriptionInput.value : "";
  }

  initMapPicker(mapClickHandler) {
    if (this.mapPickerContainer && !this.mapPickerContainer._leaflet_id) {
      this._map = L.map(this.mapPickerContainer).setView(
        [-6.2, 106.816666],
        10
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this._map);

      this._map.on("click", (e) => {
        mapClickHandler(e.latlng);
      });
    }
  }

  updateMapMarkerAndCoords(lat, lon) {
    if (!this._map) return;
    const latLng = [lat, lon];
    if (this._marker) {
      this._marker.setLatLng(latLng);
    } else {
      this._marker = L.marker(latLng, { icon: addPageMapPickerIcon }).addTo(
        this._map
      );
    }
    this._marker
      .bindPopup(`Selected: ${lat.toFixed(4)}, ${lon.toFixed(4)}`)
      .openPopup();

    if (this.storyLatInput) this.storyLatInput.value = lat;
    if (this.storyLonInput) this.storyLonInput.value = lon;
    if (this.selectedCoordsDisplay)
      this.selectedCoordsDisplay.textContent = `Selected: Lat: ${lat.toFixed(
        4
      )}, Lon: ${lon.toFixed(4)}`;
  }

  async showCameraPreview(streamHandler) {
    if (
      !this.cameraContainer ||
      !this.cameraPreview ||
      !this.photoResult ||
      !this.captureButton ||
      !this.retakeButton
    )
      return;
    this.cameraContainer.style.display = "block";
    this.photoResult.style.display = "none";
    this.retakeButton.style.display = "none";
    this.captureButton.style.display = "inline-block";
    this.cameraPreview.style.display = "block";

    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach((track) => track.stop());
    }
    try {
      this._cameraStream = await streamHandler();
      this.cameraPreview.srcObject = this._cameraStream;
    } catch (err) {
      console.error("View: Error setting camera stream", err);
      this.hideCamera();
      Swal.fire("Camera Error", "Could not access the camera.", "error");
    }
  }

  hideCamera() {
    if (this.cameraContainer) this.cameraContainer.style.display = "none";
    if (this.cameraPreview) this.cameraPreview.style.display = "none";
    if (this._cameraStream) {
      this._cameraStream.getTracks().forEach((track) => track.stop());
      this._cameraStream = null;
    }
    if (this.cameraPreview) this.cameraPreview.srcObject = null;
  }

  capturePhotoFromPreview() {
    if (
      !this.cameraPreview ||
      !this.photoResult ||
      !this.captureButton ||
      !this.retakeButton
    )
      return null;
    const canvas = document.createElement("canvas");
    canvas.width = this.cameraPreview.videoWidth;
    canvas.height = this.cameraPreview.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(this.cameraPreview, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg");
    this.photoResult.src = dataUrl;
    this.photoResult.style.display = "block";
    this.cameraPreview.style.display = "none";
    this.captureButton.style.display = "none";
    this.retakeButton.style.display = "inline-block";
    this.hideCamera();
    return dataUrl;
  }

  displayUploadedPhoto(dataUrl) {
    if (!this.photoResult) return;
    this.photoResult.src = dataUrl;
    this.photoResult.style.display = "block";
    this.hideCamera();
  }

  triggerPhotoFileUpload() {
    if (this.storyPhotoFileInput) this.storyPhotoFileInput.click();
  }

  resetForm() {
    if (this.form) this.form.reset();
    if (this.photoResult) {
      this.photoResult.style.display = "none";
      this.photoResult.src = "#";
    }
    if (this.selectedCoordsDisplay)
      this.selectedCoordsDisplay.textContent = "No location selected.";
    if (this.storyLatInput) this.storyLatInput.value = "";
    if (this.storyLonInput) this.storyLonInput.value = "";
    if (this._marker && this._map) {
      this._marker.remove();
      this._marker = null;
    }
    this.hideCamera();
  }

  displayError(message) {
    Swal.fire({ icon: "error", title: "Error", text: message });
  }

  showLoading(title = "Processing...") {
    Swal.fire({
      title: title,
      text: "Please wait.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }

  hideLoading() {
    Swal.close();
  }

  displaySuccess(message) {
    Swal.fire({ icon: "success", title: "Success!", text: message });
  }

  attachFormSubmitListener(handler) {
    if (this.form) {
      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        handler();
      });
    }
  }

  attachCameraControlListeners({
    takePictureHandler,
    captureHandler,
    retakeHandler,
  }) {
    if (this.takePictureButton)
      this.takePictureButton.addEventListener("click", takePictureHandler);
    if (this.captureButton)
      this.captureButton.addEventListener("click", captureHandler);
    if (this.retakeButton)
      this.retakeButton.addEventListener("click", retakeHandler);
  }

  attachFileUploadListener({
    uploadButtonClickHandler,
    fileInputChangeHandler,
  }) {
    if (this.uploadPictureButton)
      this.uploadPictureButton.addEventListener(
        "click",
        uploadButtonClickHandler
      );
    if (this.storyPhotoFileInput)
      this.storyPhotoFileInput.addEventListener("change", (event) => {
        if (event.target.files && event.target.files[0]) {
          fileInputChangeHandler(event.target.files[0]);
        }
      });
  }

  cleanup() {
    this.hideCamera();
    if (this._map && typeof this._map.remove === "function") {
      try {
        this._map.remove();
      } catch (e) {
        console.warn("Error removing map on cleanup:", e);
      }
    }
    this._map = null;
    this._marker = null;
  }
}

export default AddStoryView;
