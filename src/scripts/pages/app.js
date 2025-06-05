import UrlParser from "../routes/url-parser";
import routes from "../routes/routes";
import AuthHelper from "../utils/auth-helper";

class App {
  constructor({ content }) {
    this._content = content;
    this._currentPageObject = null;
  }

  async renderPage() {
    const url = UrlParser.parseActiveUrlWithCombiner();
    const pageOrchestrator = routes[url] || routes["/"];

    if (
      this._currentPageObject &&
      typeof this._currentPageObject._cleanup === "function"
    ) {
      console.log(
        `Cleaning up previous page: ${this._currentPageObject.constructor.name}`
      );
      this._currentPageObject._cleanup();
    }

    this._currentPageObject = pageOrchestrator;

    const renderContent = async () => {
      this._content.innerHTML = await pageOrchestrator.render();
      await pageOrchestrator.afterRender();
      AuthHelper.updateLoginLogoutLink();
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.setAttribute("tabindex", "-1");
        mainContent.focus();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderContent);
    } else {
      renderContent();
    }
  }
}

export default App;
