import LoginView from "./login-view";
import LoginPresenter from "./login-presenter";
import StoryApi from "../../data/api";
import AuthHelper from "../../utils/auth-helper";

const LoginPage = {
  _view: null,

  async render() {
    if (AuthHelper.isUserLoggedIn()) {
      window.location.hash = "#/home";
      return "<p>Already logged in. Redirecting...</p>";
    }
    this._view = new LoginView();
    return this._view.renderInitialStructure();
  },

  async afterRender() {
    if (AuthHelper.isUserLoggedIn()) return;
    if (this._view) {
      this._view.initializeDOMReferences();
      new LoginPresenter({
        view: this._view,
        model: StoryApi,
        authHelper: AuthHelper,
      });
    } else {
      console.error("LoginPage: View not initialized for afterRender.");
    }
  },
};

export default LoginPage;
