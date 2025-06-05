// src/scripts/utils/auth-helper.js
import StoryApi from "../data/api";
import PushNotificationHelper from "./push-notification-helper";
import Swal from "sweetalert2";

const AuthHelper = {
  isUserLoggedIn() {
    return !!StoryApi.getUserToken();
  },

  updateLoginLogoutLink() {
    const authLinkContainer = document.getElementById("auth-link-container");
    const notificationLiContainer = document.getElementById(
      "notification-li-container"
    );

    if (!authLinkContainer || !notificationLiContainer) {
      console.warn("Auth or Notification UI elements not found.");
      return;
    }

    if (this.isUserLoggedIn()) {
      const userName = localStorage.getItem("STORY_APP_USER_NAME") || "User";
      authLinkContainer.innerHTML = `
        <span>Hi, ${userName}!</span>
        <button id="logoutButton" class="button button-danger" style="margin-left:10px; padding: 5px 10px;">Logout</button>
      `;

      document
        .getElementById("logoutButton")
        .addEventListener("click", async () => {
          const isSubscribed = await PushNotificationHelper.isSubscribed();
          if (isSubscribed) {
            try {
              console.log(
                "Attempting to unsubscribe from push notifications on logout..."
              );
              await PushNotificationHelper.unsubscribeUser();
            } catch (error) {
              console.error("Failed to unsubscribe on logout:", error);
            }
          }
          StoryApi.removeUserToken();
          localStorage.removeItem("STORY_APP_USER_NAME");
          localStorage.removeItem("pushSubscriptionStatus");
          this.updateLoginLogoutLink();
          window.location.hash = "#/login";
        });

      notificationLiContainer.style.display = "list-item";
      PushNotificationHelper.init().catch((err) =>
        console.error("PushNotificationHelper init failed:", err)
      );
    } else {
      authLinkContainer.innerHTML = '<a href="#/login">Login</a>';
      notificationLiContainer.style.display = "none";
      const subscribeButton = document.getElementById(
        "subscribePushNotification"
      );
      if (subscribeButton) subscribeButton.style.display = "none";
    }
  },

  storeUserName(name) {
    localStorage.setItem("STORY_APP_USER_NAME", name);
  },
};

export default AuthHelper;
