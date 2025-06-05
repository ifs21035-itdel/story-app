class AddStoryPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._photoFile = null;
    this._selectedLat = null;
    this._selectedLon = null;

    this._view.attachFormSubmitListener(this._handleAddStorySubmit.bind(this));
    this._view.attachCameraControlListeners({
      takePictureHandler: this._handleTakePicture.bind(this),
      captureHandler: this._handleCapture.bind(this),
      retakeHandler: this._handleRetake.bind(this),
    });
    this._view.attachFileUploadListener({
      uploadButtonClickHandler: this._handleUploadButtonClick.bind(this),
      fileInputChangeHandler: this._handleFileInputChange.bind(this),
    });
    this._view.initMapPicker(this._handleMapClick.bind(this));
  }

  _handleMapClick(latlng) {
    this._selectedLat = latlng.lat;
    this._selectedLon = latlng.lng;
    this._view.updateMapMarkerAndCoords(latlng.lat, latlng.lng);
  }

  async _handleTakePicture() {
    this._photoFile = null;
    await this._view.showCameraPreview(async () => {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    });
  }

  _handleCapture() {
    const dataUrl = this._view.capturePhotoFromPreview();
    if (dataUrl) {
      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          this._photoFile = new File([blob], "story_photo_capture.jpg", {
            type: "image/jpeg",
          });
        });
    }
  }

  _handleRetake() {
    this._handleTakePicture();
  }

  _handleUploadButtonClick() {
    this._photoFile = null;
    this._view.triggerPhotoFileUpload();
  }

  _handleFileInputChange(file) {
    this._photoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this._view.displayUploadedPhoto(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  async _handleAddStorySubmit() {
    const description = this._view.getDescription();

    if (!description || !this._photoFile) {
      this._view.displayError("Please provide a description and a photo.");
      return;
    }

    this._view.showLoading("Posting story...");
    try {
      await this._model.addNewStory({
        description,
        photo: this._photoFile,
        lat: this._selectedLat,
        lon: this._selectedLon,
      });
      this._view.hideLoading();
      this._view.displaySuccess("Story added successfully!");
      this._view.resetForm();
      this._photoFile = null;
      this._selectedLat = null;
      this._selectedLon = null;

      setTimeout(() => {
        window.location.hash = "#/home";
      }, 1500);
    } catch (error) {
      console.error("AddStoryPresenter Error:", error);
      this._view.hideLoading();
      this._view.displayError(`Failed to add story: ${error.message}`);
    }
  }

  cleanup() {
    this._view.cleanup();
    this._photoFile = null;
    this._selectedLat = null;
    this._selectedLon = null;
  }
}

export default AddStoryPresenter;
