import { createRegisterPageTemplate } from "../../utils/template-creator";
import Swal from "sweetalert2";

class RegisterView {
  constructor() {
    this.form = null;
  }

  renderInitialStructure() {
    return createRegisterPageTemplate();
  }

  initializeDOMReferences() {
    this.form = document.querySelector("#registerForm");
    if (!this.form) {
      console.error(
        "RegisterView Error: Register form (#registerForm) not found."
      );
    }
  }

  getFormData() {
    if (!this.form) return null;
    const name = this.form.elements.registerName.value;
    const email = this.form.elements.registerEmail.value;
    const password = this.form.elements.registerPassword.value;
    return { name, email, password };
  }

  displayRegistrationError(message) {
    Swal.fire({
      icon: "error",
      title: "Registration Failed",
      text: message,
    });
  }

  displayRegistrationSuccess() {
    Swal.fire({
      icon: "success",
      title: "Registration Successful!",
      text: "You can now log in with your new account.",
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

export default RegisterView;
