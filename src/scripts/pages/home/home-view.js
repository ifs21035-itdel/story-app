import {
  createHomePageTemplate,
  createStoryItemTemplate,
  initMapOnStoryItem,
} from "../../utils/template-creator";

class HomeView {
  constructor() {
    this.storyListContainer = null;
  }

  renderInitialStructure() {
    return createHomePageTemplate();
  }

  initializeDOMReferences() {
    this.storyListContainer = document.querySelector("#story-list");
    if (!this.storyListContainer) {
      console.error(
        "HomeView Error: Story list container (#story-list) not found in the DOM."
      );
    }
  }

  showLoading() {
    if (this.storyListContainer) {
      this.storyListContainer.innerHTML = "<p>Loading stories...</p>";
    } else {
      console.warn(
        "HomeView: Story list container not available for showLoading."
      );
    }
  }

  hideLoading() {}

  displayStories(storiesData) {
    if (!this.storyListContainer) {
      console.error("HomeView Error: Story list container not available.");
      return;
    }
    this.storyListContainer.innerHTML = "";

    if (storiesData && storiesData.length > 0) {
      storiesData.forEach((data) => {
        this.storyListContainer.innerHTML += createStoryItemTemplate(data);
      });

      storiesData.forEach(({ story }) => {
        if (story.lat && story.lon) {
          setTimeout(() => initMapOnStoryItem(story), 0);
        }
      });
    } else {
      this.storyListContainer.innerHTML =
        "<p>No stories found. Be the first to add one!</p>";
    }
  }

  displayError(message) {
    if (this.storyListContainer) {
      this.storyListContainer.innerHTML = `<p>Error loading stories: ${message}. Please try again later.</p>`;
    } else {
      console.error(
        "HomeView Error: Story list container not available to display error."
      );
    }
  }
}

export default HomeView;
