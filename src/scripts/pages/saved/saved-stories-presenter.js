import Swal from "sweetalert2";

class SavedStoriesPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._storyListContainer = document.querySelector("#saved-story-list");

    this._loadSavedStories();
    this._attachEventListeners();
  }

  async _loadSavedStories() {
    try {
      const stories = await this._model.getAllStories();
      this._view.showStories(stories);
    } catch (error) {
      console.error("Failed to load saved stories:", error);
      Swal.fire("Error", "Gagal memuat cerita tersimpan.", "error");
    }
  }

  _attachEventListeners() {
    if (this._storyListContainer) {
      this._storyListContainer.addEventListener("click", (event) => {
        const storyId = this._view.getStoryIdFromElement(event.target);
        if (storyId) {
          this._handleDeleteStory(storyId);
        }
      });
    }
  }

  async _handleDeleteStory(id) {
    try {
      await this._model.deleteStory(id);
      Swal.fire(
        "Berhasil!",
        "Cerita telah dihapus dari daftar tersimpan.",
        "success"
      );
      this._loadSavedStories();
    } catch (error) {
      console.error("Failed to delete story:", error);
      Swal.fire("Error", "Gagal menghapus cerita.", "error");
    }
  }
}

export default SavedStoriesPresenter;
