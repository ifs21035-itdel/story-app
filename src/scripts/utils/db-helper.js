// src/scripts/utils/db-helper.js
import { openDB } from "idb";
import CONFIG from "../config";

const { DATABASE_NAME, DATABASE_VERSION, OBJECT_STORE_NAME } = CONFIG;

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      database.createObjectStore(OBJECT_STORE_NAME, { keyPath: "id" });
    }
  },
});

const StoryDb = {
  async getStory(id) {
    if (!id) {
      console.warn("getStory: id is undefined");
      return null;
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    if (!story || !story.id) {
      console.warn("putStory: story or story.id is undefined", story);
      return undefined;
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async putAllStories(stories) {
    if (!stories || !Array.isArray(stories)) {
      console.warn(
        "putAllStories: stories is not an array or undefined",
        stories
      );
      return;
    }
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const putPromises = stories.map((story) => {
      if (story && story.id) {
        return store.put(story);
      }
      return Promise.resolve();
    });
    await Promise.all(putPromises);
    return tx.done;
  },

  async deleteStory(id) {
    if (!id) {
      console.warn("deleteStory: id is undefined");
      return;
    }
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async clearAllStories() {
    const tx = (await dbPromise).transaction(OBJECT_STORE_NAME, "readwrite");
    const store = tx.objectStore(OBJECT_STORE_NAME);
    await store.clear();
    return tx.done;
  },
};

export default StoryDb;
