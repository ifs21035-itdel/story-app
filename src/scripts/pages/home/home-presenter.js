// src/scripts/pages/home/home-presenter.js
import Swal from "sweetalert2";
import StoryDb from "../../utils/db-helper";

class HomePresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;
    this._loadStories();
  }

  async _loadStories() {
    this._view.showLoading();
    let displayedFromCache = false;

    try {
      const cachedStories = await StoryDb.getAllStories();
      if (cachedStories && cachedStories.length > 0) {
        this._view.displayStories(cachedStories);
        displayedFromCache = true;
        console.log("Stories displayed from IndexedDB cache.");
      }
    } catch (dbError) {
      console.error(
        "HomePresenter Error: Failed to load stories from IndexedDB:",
        dbError
      );
    }

    try {
      const storiesFromApi = await this._model.getAllStories();

      if (storiesFromApi && storiesFromApi.length > 0) {
        this._view.displayStories(storiesFromApi);
        await StoryDb.clearAllStories();
        await StoryDb.putAllStories(storiesFromApi);
        console.log("Stories fetched from API and updated in IndexedDB.");
      } else if (!displayedFromCache) {
        this._view.displayStories([]);
        console.log("No stories from API and nothing in cache.");
      }
    } catch (apiError) {
      console.error(
        "HomePresenter Error: Failed to load stories from API:",
        apiError
      );
      if (!displayedFromCache) {
        this._view.displayError(apiError.message || "Failed to fetch stories.");
      }
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: `Failed to load stories from the server: ${apiError.message}. Displaying cached data if available.`,
      });
    } finally {
      this._view.hideLoading();
    }
  }
}

export default HomePresenter;
