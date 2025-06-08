import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/login/login-page";
import RegisterPage from "../pages/register/register-page";
import AddStoryPage from "../pages/add/add-story-page";
import SavedStoriesPage from "../pages/saved/saved-stories-page";

const routes = {
  "/": HomePage,
  "/home": HomePage,
  "/login": LoginPage,
  "/register": RegisterPage,
  "/add-story": AddStoryPage,
  "/saved": SavedStoriesPage,
};

export default routes;
