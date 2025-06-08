// src/scripts/pages/home/home-presenter.js
import Swal from "sweetalert2";
import StoryDb from "../../utils/db-helper";

class HomePresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._stories = [];
    this._loadStories();
    this._attachSaveButtonListeners();
  }

  async _loadStories() {
    this._view.showLoading();
    try {
      const storiesFromApi = await this._model.getAllStories();
      this._stories = storiesFromApi;

      if (storiesFromApi && storiesFromApi.length > 0) {
        this._view.displayStories(
          storiesFromApi.map((story) => ({ story, isSavedPage: false }))
        );
      } else {
        this._view.displayStories([]);
      }
    } catch (error) {
    } finally {
      this._view.hideLoading();
    }
  }

  _attachSaveButtonListeners() {
    const storyListContainer = document.querySelector("#story-list");
    if (storyListContainer) {
      storyListContainer.addEventListener("click", async (event) => {
        const saveButton = event.target.closest(".save-button");
        if (saveButton) {
          const storyId = saveButton.dataset.id;
          await this._handleSaveStory(storyId);

          saveButton.textContent = "Tersimpan";
          saveButton.disabled = true;
          saveButton.classList.remove("button");
          saveButton.classList.add("button-success");
        }
      });
    }
  }

  async _handleSaveStory(id) {
    const storyToSave = this._stories.find((story) => story.id === id);
    if (storyToSave) {
      try {
        await StoryDb.putStory(storyToSave);
        Swal.fire(
          "Berhasil!",
          "Cerita telah disimpan untuk akses offline.",
          "success"
        );
      } catch (error) {
        console.error("Failed to save story to IndexedDB:", error);
        Swal.fire("Error", "Gagal menyimpan cerita.", "error");
      }
    } else {
      console.warn("Story with id not found to save:", id);
    }
  }
}

export default HomePresenter;
