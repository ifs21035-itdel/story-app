class RegisterPresenter {
  constructor({ view, model }) {
    this._view = view;
    this._model = model;

    this._view.attachFormSubmitListener(this._handleRegisterSubmit.bind(this));
  }

  async _handleRegisterSubmit(formData) {
    try {
      await this._model.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      this._view.displayRegistrationSuccess();

      setTimeout(() => {
        window.location.hash = "#/login";
      }, 2000);
    } catch (error) {
      console.error("RegisterPresenter Error:", error);
      this._view.displayRegistrationError(error.message);
    }
  }
}

export default RegisterPresenter;
