import RegisterView from "./register-view";
import RegisterPresenter from "./register-presenter";
import StoryApi from "../../data/api";
import AuthHelper from "../../utils/auth-helper";

const RegisterPage = {
  _view: null,

  async render() {
    if (AuthHelper.isUserLoggedIn()) {
      window.location.hash = "#/home";
      return "<p>Already logged in. Redirecting...</p>";
    }
    this._view = new RegisterView();
    return this._view.renderInitialStructure();
  },

  async afterRender() {
    if (AuthHelper.isUserLoggedIn()) return;

    if (this._view) {
      this._view.initializeDOMReferences();
      new RegisterPresenter({
        view: this._view,
        model: StoryApi,
      });
    } else {
      console.error("RegisterPage: View not initialized for afterRender.");
    }
  },
};

export default RegisterPage;
