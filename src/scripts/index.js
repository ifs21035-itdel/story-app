// src/scripts/index.js
import "../styles/styles.css";
import App from "./pages/app";
import AuthHelper from "./utils/auth-helper";
import swRegister from "./utils/sw-register";

const app = new App({
  content: document.querySelector("#main-content"),
});

window.addEventListener("load", async () => {
  AuthHelper.updateLoginLogoutLink();
  app.renderPage();

  try {
    await swRegister();
  } catch (error) {
    console.warn("SW Registration failed. App will work online only.", error);
  }
});

window.addEventListener("hashchange", () => {
  app.renderPage();
});

const skipLink = document.querySelector(".skip-link");
const mainContent = document.querySelector("#main-content");

if (skipLink && mainContent) {
  skipLink.addEventListener("click", (event) => {
    event.preventDefault();
    mainContent.focus();
  });
}
