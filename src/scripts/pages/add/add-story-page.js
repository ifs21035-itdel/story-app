import AddStoryView from "./add-story-view";
import AddStoryPresenter from "./add-story-presenter";
import StoryApi from "../../data/api";
import AuthHelper from "../../utils/auth-helper";
import Swal from "sweetalert2";

const AddStoryPage = {
  _view: null,
  _presenter: null,

  async render() {
    if (!AuthHelper.isUserLoggedIn()) {
      Swal.fire({
        icon: "warning",
        title: "Not Logged In",
        text: "You need to login to add a story.",
      }).then(() => {
        window.location.hash = "#/login";
      });
      return "<p>Redirecting to login...</p>";
    }

    this._view = new AddStoryView();
    return this._view.renderInitialStructure();
  },

  async afterRender() {
    if (!AuthHelper.isUserLoggedIn()) return;

    if (this._view) {
      this._view.initializeDOMReferences();
      this._presenter = new AddStoryPresenter({
        view: this._view,
        model: StoryApi,
      });
    } else {
      console.error("AddStoryPage: View not initialized for afterRender.");
    }
  },

  _cleanup() {
    if (this._presenter && typeof this._presenter.cleanup === "function") {
      this._presenter.cleanup();
    } else if (this._view && typeof this._view.cleanup === "function") {
      this._view.cleanup();
    }
    this._view = null;
    this._presenter = null;
  },
};

export default AddStoryPage;
