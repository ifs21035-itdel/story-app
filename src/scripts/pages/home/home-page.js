import HomeView from "./home-view";
import HomePresenter from "./home-presenter";
import StoryApi from "../../data/api";

const HomePage = {
  _view: null,

  async render() {
    this._view = new HomeView();
    return this._view.renderInitialStructure();
  },

  async afterRender() {
    if (this._view) {
      this._view.initializeDOMReferences();
      new HomePresenter({ view: this._view, model: StoryApi });
    } else {
      console.error("HomePage: View not initialized before afterRender.");
    }
  },
};

export default HomePage;
