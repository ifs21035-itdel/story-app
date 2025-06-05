import { createLoginPageTemplate } from "../../utils/template-creator";
import Swal from "sweetalert2";

class LoginView {
  constructor() {
    this.form = null;
  }

  renderInitialStructure() {
    return createLoginPageTemplate();
  }

  initializeDOMReferences() {
    this.form = document.querySelector("#loginForm");
    if (!this.form) {
      console.error("LoginView Error: Login form (#loginForm) not found.");
    }
  }

  getFormData() {
    if (!this.form) return null;
    const email = this.form.elements.loginEmail.value;
    const password = this.form.elements.loginPassword.value;
    return { email, password };
  }

  displayLoginError(message) {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: message,
    });
  }

  displayLoginSuccess(userName) {
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: `Welcome back, ${userName}!`,
      timer: 1500,
      showConfirmButton: false,
    });
  }

  attachFormSubmitListener(handler) {
    if (this.form) {
      this.form.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = this.getFormData();
        if (formData) {
          handler(formData);
        }
      });
    }
  }
}

export default LoginView;
