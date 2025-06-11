// src/scripts/utils/sw-register.js
const swRegister = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker not supported in the browser");
    return Promise.reject(new Error("Service Worker not supported"));
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "./sw.bundle.js",
      {
        scope: "/story-app/",
      }
    );
    console.log(
      "Service Worker registered successfully with scope:",
      registration.scope
    );

    if (registration.installing) {
      console.log("Service worker installing");
    } else if (registration.waiting) {
      console.log("Service worker installed");
    } else if (registration.active) {
      console.log("Service worker active");
    }
    return registration;
  } catch (error) {
    console.error("Service Worker registration failed:", error);
    return Promise.reject(error);
  }
};

export default swRegister;
