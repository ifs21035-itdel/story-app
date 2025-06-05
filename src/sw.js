// src/sw.js
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import CONFIG from "./scripts/config";

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.href.startsWith(`${CONFIG.BASE_URL}/stories`),
  new NetworkFirst({
    cacheName: "story-api-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) =>
    request.destination === "image" &&
    url.href.includes("story-api.dicoding.dev"),
  new CacheFirst({
    cacheName: "story-images-cache",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ request, url }) =>
    request.destination === "image" && url.pathname.endsWith("logo.png"),
  new CacheFirst({
    cacheName: "static-images-cache",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener("install", () => {
  console.log("Service Worker: Install");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activate");
  event.waitUntil(self.clients.claim());
});

// --- Push Notification Handling ---
self.addEventListener("push", (event) => {
  console.log("Service Worker: Push Received.");
  let notificationData = {
    title: "New Story App Notification",
    options: {
      body: "You have a new update from Story App!",
      icon: "./icons/icon-192x192.png",
      badge: "./icons/icon-192x192.png",
      image: "",
      data: { url: "/" },
    },
  };

  if (event.data) {
    try {
      const dataText = event.data.text();
      console.log("Push data text:", dataText);
      const parsedData = JSON.parse(dataText);

      notificationData.title = parsedData.title || notificationData.title;
      if (parsedData.options) {
        notificationData.options.body =
          parsedData.options.body || notificationData.options.body;
        notificationData.options.icon =
          parsedData.options.icon || notificationData.options.icon;
        notificationData.options.badge =
          parsedData.options.badge || notificationData.options.badge;
        notificationData.options.image =
          parsedData.options.image || notificationData.options.image;
        if (parsedData.options.data && parsedData.options.data.url) {
          notificationData.options.data.url = parsedData.options.data.url;
        } else if (parsedData.data && parsedData.data.url) {
          notificationData.options.data.url = parsedData.data.url;
        }
      }
    } catch (e) {
      console.error("Error parsing push data:", e);
    }
  }

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationData.options
    )
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Service Worker: Notification click Received.");
  event.notification.close();

  const urlToOpen =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const MAPPED_URL = new URL(urlToOpen, self.location.origin).href;
        const existingClient = windowClients.find(
          (client) => client.url === MAPPED_URL
        );

        if (existingClient) {
          return existingClient.focus();
        }
        return clients.openWindow(urlToOpen);
      })
  );
});
