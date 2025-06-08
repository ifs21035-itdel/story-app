import {
  createStoryItemTemplate,
  initMapOnStoryItem,
} from "../../utils/template-creator";

class SavedStoriesView {
  renderInitialStructure() {
    return `
      <section class="saved-stories-page">
        <h2>Cerita Tersimpan Offline</h2>
        <div id="saved-story-list" class="story-list">
          <p>Memuat cerita tersimpan...</p>
        </div>
      </section>
    `;
  }

  showStories(stories) {
    const storyListContainer = document.querySelector("#saved-story-list");
    if (!storyListContainer) return;

    if (stories && stories.length > 0) {
      storyListContainer.innerHTML = "";

      stories.forEach((story) => {
        storyListContainer.innerHTML += createStoryItemTemplate({
          story,
          isSavedPage: true,
        });
      });

      stories.forEach((story) => {
        if (story.lat && story.lon) {
          setTimeout(() => initMapOnStoryItem(story), 0);
        }
      });
    } else {
      storyListContainer.innerHTML =
        "<p>Tidak ada cerita yang Anda simpan untuk mode offline.</p>";
    }
  }

  getStoryIdFromElement(element) {
    const removeButton = element.closest(".remove-button");
    return removeButton ? removeButton.dataset.id : null;
  }
}

export default SavedStoriesView;
