import SavedStoriesView from "./saved-stories-view";
import SavedStoriesPresenter from "./saved-stories-presenter";
import StoryDb from "../../utils/db-helper";

const SavedStoriesPage = {
  async render() {
    this._view = new SavedStoriesView();
    return this._view.renderInitialStructure();
  },

  async afterRender() {
    new SavedStoriesPresenter({ view: this._view, model: StoryDb });
  },
};

export default SavedStoriesPage;
