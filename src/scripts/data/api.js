import CONFIG from "../config";

const StoryApi = {
  async register({ name, email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  },

  async login({ email, password }) {
    const response = await fetch(`${CONFIG.BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.loginResult;
  },

  async addNewStory({ description, photo, lat, lon }) {
    const token = this.getUserToken();
    if (!token) {
      throw new Error("User not logged in");
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${CONFIG.BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson;
  },

  async getAllStories(page = 1, size = 10) {
    const token = this.getUserToken();
    let url = `${CONFIG.BASE_URL}/stories?page=${page}&size=${size}`;

    const headers = {};
    if (token) {
      url += "&location=1";
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { headers });
    const responseJson = await response.json();

    if (responseJson.error) {
      throw new Error(responseJson.message);
    }
    return responseJson.listStory;
  },

  async subscribeToNotifications({ endpoint, keys }) {
    const token = this.getUserToken();
    if (!token) {
      throw new Error("User not logged in. Cannot subscribe to notifications.");
    }

    const payload = {
      endpoint,
      keys,
    };

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      console.error("API Subscribe Error:", responseJson);
      throw new Error(
        responseJson.message || "Failed to subscribe to notifications via API."
      );
    }
    return responseJson;
  },

  async unsubscribeFromNotifications({ endpoint }) {
    const token = this.getUserToken();
    if (!token) {
      console.warn("User not logged in during unsubscription attempt.");
      return {
        error: false,
        message: "User not logged in, unsubscription skipped locally.",
      };
    }

    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });
    const responseJson = await response.json();
    if (responseJson.error) {
      console.error("API Unsubscribe Error:", responseJson);
      throw new Error(
        responseJson.message ||
          "Failed to unsubscribe from notifications via API."
      );
    }
    return responseJson;
  },

  getUserToken() {
    return localStorage.getItem(CONFIG.USER_TOKEN_KEY);
  },

  saveUserToken(token) {
    localStorage.setItem(CONFIG.USER_TOKEN_KEY, token);
  },

  removeUserToken() {
    localStorage.removeItem(CONFIG.USER_TOKEN_KEY);
  },
};

export default StoryApi;
