// src/scripts/utils/push-notification-helper.js
import CONFIG from "../config";
import StoryApi from "../data/api";
import Swal from "sweetalert2";

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotificationHelper = {
  async init() {
    if (!("PushManager" in window) || !("Notification" in window)) {
      console.warn(
        "Push messaging or Notifications are not supported in this browser."
      );
      this._hideSubscriptionButton();
      return;
    }

    this._registration = await navigator.serviceWorker.ready;
    this._updateSubscriptionButtonUI();
  },

  async requestPermissionAndSubscribe() {
    if (!this._registration) {
      console.error(
        "Service worker registration not ready for push subscription."
      );
      Swal.fire(
        "Error",
        "Service worker not ready. Please try again later.",
        "error"
      );
      return;
    }
    try {
      const permissionResult = await Notification.requestPermission();
      if (permissionResult !== "granted") {
        console.log("Notification permission not granted.");
        Swal.fire(
          "Permission Denied",
          "You've denied notification permissions. Please enable them in browser settings if you want to subscribe.",
          "warning"
        );
        throw new Error("Notification permission not granted.");
      }
      console.log("Notification permission granted.");
      await this._subscribeUser();
    } catch (error) {
      console.error(
        "Failed to request permission or subscribe the user: ",
        error
      );
      Swal.fire(
        "Subscription Failed",
        `Could not subscribe to notifications: ${error.message}`,
        "error"
      );
    }
  },

  async _subscribeUser() {
    try {
      const applicationServerKey = urlBase64ToUint8Array(
        CONFIG.VAPID_PUBLIC_KEY
      );
      const subscription = await this._registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("User is subscribed:", subscription);
      const subscriptionJson = subscription.toJSON();

      await StoryApi.subscribeToNotifications({
        endpoint: subscriptionJson.endpoint,
        keys: {
          p256dh: subscriptionJson.keys.p256dh,
          auth: subscriptionJson.keys.auth,
        },
      });

      console.log("Subscription sent to server.");
      localStorage.setItem("pushSubscriptionStatus", "subscribed");
      Swal.fire(
        "Subscribed!",
        "You are now subscribed to notifications.",
        "success"
      );
    } catch (error) {
      console.error(
        "Failed to subscribe the user on PushManager or send to server: ",
        error
      );
      localStorage.setItem("pushSubscriptionStatus", "unsubscribed");
      const currentSubscription =
        await this._registration.pushManager.getSubscription();
      if (currentSubscription) {
        await currentSubscription.unsubscribe();
      }
      throw error;
    } finally {
      this._updateSubscriptionButtonUI();
    }
  },

  async unsubscribeUser() {
    if (!this._registration) {
      console.error(
        "Service worker registration not ready for push unsubscription."
      );
      Swal.fire(
        "Error",
        "Service worker not ready. Please try again later.",
        "error"
      );
      return;
    }
    try {
      const subscription =
        await this._registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        const unsubscribed = await subscription.unsubscribe();
        if (unsubscribed) {
          console.log("User is unsubscribed from PushManager.");

          await StoryApi.unsubscribeFromNotifications({ endpoint });
          console.log("Unsubscription info sent to server.");
          Swal.fire(
            "Unsubscribed",
            "You have successfully unsubscribed from notifications.",
            "info"
          );
        } else {
          console.warn("Failed to unsubscribe from PushManager.");
        }
      } else {
        console.log("No active subscription to unsubscribe.");
      }
    } catch (error) {
      console.error("Error unsubscribing", error);
      Swal.fire(
        "Unsubscription Failed",
        `Could not unsubscribe: ${error.message}`,
        "error"
      );
    } finally {
      localStorage.setItem("pushSubscriptionStatus", "unsubscribed");
      this._updateSubscriptionButtonUI();
    }
  },

  async _updateSubscriptionButtonUI() {
    const subscribeButton = document.getElementById(
      "subscribePushNotification"
    );
    const notificationLiContainer = document.getElementById(
      "notification-li-container"
    );

    if (!subscribeButton || !notificationLiContainer) return;

    const currentSubscription = this._registration
      ? await this._registration.pushManager.getSubscription()
      : null;
    const permission = Notification.permission;

    if (permission === "denied") {
      subscribeButton.textContent = "Permissions Denied";
      subscribeButton.disabled = true;
      subscribeButton.classList.remove("button-danger");
      localStorage.setItem("pushSubscriptionStatus", "denied");
      notificationLiContainer.style.display = "list-item";
      subscribeButton.style.display = "inline-block";
      return;
    }

    if (currentSubscription) {
      subscribeButton.textContent = "Unsubscribe Notifications";
      subscribeButton.classList.add("button-danger");
      subscribeButton.onclick = () => this.unsubscribeUser();
      subscribeButton.disabled = false;
      localStorage.setItem("pushSubscriptionStatus", "subscribed");
    } else {
      subscribeButton.textContent = "Subscribe to Notifications";
      subscribeButton.classList.remove("button-danger");
      subscribeButton.onclick = () => this.requestPermissionAndSubscribe();
      subscribeButton.disabled = false;
      localStorage.setItem("pushSubscriptionStatus", "unsubscribed");
    }
    notificationLiContainer.style.display = "list-item";
    subscribeButton.style.display = "inline-block";
  },

  _hideSubscriptionButton() {
    const subscribeButton = document.getElementById(
      "subscribePushNotification"
    );
    const notificationLiContainer = document.getElementById(
      "notification-li-container"
    );
    if (subscribeButton) subscribeButton.style.display = "none";
    if (notificationLiContainer) notificationLiContainer.style.display = "none";
  },

  isSubscribed() {
    if (this._registration && this._registration.pushManager) {
      return this._registration.pushManager
        .getSubscription()
        .then((sub) => !!sub);
    }
    return Promise.resolve(
      localStorage.getItem("pushSubscriptionStatus") === "subscribed"
    );
  },
};

export default PushNotificationHelper;
