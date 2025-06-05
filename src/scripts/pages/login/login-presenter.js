class LoginPresenter {
  constructor({ view, model, authHelper }) {
    this._view = view;
    this._model = model;
    this._authHelper = authHelper;

    this._view.attachFormSubmitListener(this._handleLoginSubmit.bind(this));
  }

  async _handleLoginSubmit(formData) {
    try {
      const loginResult = await this._model.login({
        email: formData.email,
        password: formData.password,
      });

      this._model.saveUserToken(loginResult.token);
      this._authHelper.storeUserName(loginResult.name);
      this._authHelper.updateLoginLogoutLink();

      this._view.displayLoginSuccess(loginResult.name);

      setTimeout(() => {
        window.location.hash = "#/home";
      }, 1500);
    } catch (error) {
      console.error("LoginPresenter Error:", error);
      this._view.displayLoginError(error.message);
    }
  }
}

export default LoginPresenter;
