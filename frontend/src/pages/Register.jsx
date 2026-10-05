import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    mobileNumber: "",

    shippingDoorNo: "",
    shippingStreet: "",
    shippingCity: "",
    shippingDistrict: "",
    shippingState: "",
    shippingPostalCode: "",

    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userAlreadyExists, setUserAlreadyExists] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setUserAlreadyExists(false);

    /*
     * Frontend validation
     */

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(formData.shippingPostalCode)) {
      setError("Please enter a valid 6-digit PIN code.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Combine all shipping address fields
       * into one address string.
       */

      const address = [
        formData.shippingDoorNo,
        formData.shippingStreet,
        formData.shippingCity,
        formData.shippingDistrict,
        formData.shippingState,
        formData.shippingPostalCode,
      ]
        .filter((value) => value.trim() !== "")
        .join(", ");

      /*
       * Data expected by RegisterRequest.java
       */

      const registrationData = {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobileNumber,
        password: formData.password,
        gender: formData.gender,
        dob: formData.dateOfBirth,
        address: address,
      };

      /*
       * Send registration data to Spring Boot
       */

      const response = await fetch(
        "http://localhost:8080/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registrationData),
        }
      );

      /*
       * Read backend response
       */

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      /*
       * Handle duplicate user
       *
       * Backend should return HTTP 409
       * when email or mobile already exists.
       */

      if (response.status === 409) {
        setUserAlreadyExists(true);
        return;
      }

      /*
       * Handle other unsuccessful responses
       */

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Registration failed. Please try again."
        );
      }

      /*
       * Registration was successful.
       * Show the success state inside
       * the same registration page.
       */

      setRegistrationSuccess(true);

    } catch (error) {
      console.error("Registration error:", error);

      setError(
        error.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="register-page">

      {/* =================================================
          EXISTING USER POPUP
      ================================================= */}

      {userAlreadyExists && (
        <div className="register-modal-overlay">

          <div
            className="register-existing-user-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="existing-user-title"
          >

            <button
              type="button"
              className="register-modal-close"
              onClick={() => setUserAlreadyExists(false)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="register-modal-icon">
              !
            </div>

            <h2 id="existing-user-title">
              User Already Exists
            </h2>

            <p>
              An account with this email or mobile
              number already exists.
            </p>

            <div className="register-modal-actions">

              <button
                type="button"
                className="register-modal-login-button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>

              <button
                type="button"
                className="register-modal-register-button"
                onClick={() => {
                  setUserAlreadyExists(false);

                  setFormData({
                    fullName: "",
                    gender: "",
                    dateOfBirth: "",
                    email: "",
                    mobileNumber: "",

                    shippingDoorNo: "",
                    shippingStreet: "",
                    shippingCity: "",
                    shippingDistrict: "",
                    shippingState: "",
                    shippingPostalCode: "",

                    password: "",
                    confirmPassword: "",
                  });

                  setError("");
                  setRegistrationSuccess(false);
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
              >
                Register with Another Account
              </button>

            </div>

          </div>

        </div>
      )}

      <div className="register-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="register-header">

          <div className="register-header-text">

            <span className="register-badge">
              {registrationSuccess
                ? "Registration complete"
                : "Create your account"}
            </span>

            <h1>
              {registrationSuccess ? (
                <>
                  Welcome to <span>Bluecart.</span>
                </>
              ) : (
                <>
                  Join <span>Bluecart.</span>
                </>
              )}
            </h1>

            <p>
              {registrationSuccess
                ? "Your account is ready. You can now sign in and start shopping."
                : ""}
            </p>

          </div>

        </div>

        {/* =================================================
            SUCCESS STATE / REGISTRATION FORM
        ================================================= */}

        {registrationSuccess ? (

          <div className="register-success-inline">

            <div className="register-success-icon">
              ✓
            </div>

            <h2>
              Account Created Successfully
            </h2>

            <p>
              Your Bluecart account has been successfully
              created. You can now sign in and start shopping.
            </p>

            <button
              type="button"
              className="register-success-button"
              onClick={() => navigate("/login")}
            >
              Continue to Login
              <span>→</span>
            </button>

          </div>

        ) : (

          <form
            className="register-form"
            onSubmit={handleSubmit}
          >

            {/* =================================================
                1. PERSONAL INFORMATION
            ================================================= */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  01
                </div>

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Tell us a little about yourself.
                  </p>
                </div>

              </div>

              <div className="form-grid">

                {/* FULL NAME */}

                <div className="form-field full-width">

                  <label htmlFor="fullName">
                    Full Name
                    <span>*</span>
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="First & Last name"
                    value={formData.fullName}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />

                </div>

                {/* GENDER */}

                <div className="form-field">

                  <label htmlFor="gender">
                    Gender
                  </label>

                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select gender
                    </option>

                    <option value="male">
                      Male
                    </option>

                    <option value="female">
                      Female
                    </option>

                    <option value="other">
                      Other
                    </option>

                    <option value="prefer-not-to-say">
                      Prefer not to say
                    </option>
                  </select>

                </div>

                {/* DATE OF BIRTH */}

                <div className="form-field">

                  <label htmlFor="dateOfBirth">
                    Date of Birth
                  </label>

                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />

                </div>

                {/* EMAIL */}

                <div className="form-field">

                  <label htmlFor="email">
                    Email Address
                    <span>*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />

                  <small>
                    Use an email address you can access.
                  </small>

                </div>

                {/* MOBILE */}

                <div className="form-field">

                  <label htmlFor="mobileNumber">
                    Mobile Number
                    <span>*</span>
                  </label>

                  <div className="phone-input">

                    <span>
                      +91
                    </span>

                    <input
                      id="mobileNumber"
                      name="mobileNumber"
                      type="tel"
                      placeholder="Enter mobile number"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      autoComplete="tel"
                      maxLength="10"
                      inputMode="numeric"
                      required
                    />

                  </div>

                  <small>
                    Mobile verification can be added later
                    using OTP.
                  </small>

                </div>

              </div>

            </section>

            {/* =================================================
                2. CONTACT & LOCATION
            ================================================= */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  02
                </div>

                <div>

                  <h2>
                    Contact & Location
                  </h2>

                  <p>
                    Where should we deliver your orders?
                  </p>

                </div>

              </div>

              {/* SHIPPING ADDRESS */}

              <div className="address-heading">

                <h3>
                  Shipping Address
                </h3>

                <span>
                  Required
                </span>

              </div>

              <div className="form-grid">

                {/* DOOR NUMBER */}

                <div className="form-field">

                  <label htmlFor="shippingDoorNo">
                    Door No.
                    <span>*</span>
                  </label>

                  <input
                    id="shippingDoorNo"
                    name="shippingDoorNo"
                    type="text"
                    placeholder="e.g. 12-4-25"
                    value={formData.shippingDoorNo}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* STREET */}

                <div className="form-field">

                  <label htmlFor="shippingStreet">
                    Street
                    <span>*</span>
                  </label>

                  <input
                    id="shippingStreet"
                    name="shippingStreet"
                    type="text"
                    placeholder="Street / locality"
                    value={formData.shippingStreet}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* CITY */}

                <div className="form-field">

                  <label htmlFor="shippingCity">
                    City
                    <span>*</span>
                  </label>

                  <input
                    id="shippingCity"
                    name="shippingCity"
                    type="text"
                    placeholder="City"
                    value={formData.shippingCity}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* DISTRICT */}

                <div className="form-field">

                  <label htmlFor="shippingDistrict">
                    District
                    <span>*</span>
                  </label>

                  <input
                    id="shippingDistrict"
                    name="shippingDistrict"
                    type="text"
                    placeholder="District"
                    value={formData.shippingDistrict}
                    onChange={handleChange}
                    required
                  />

                </div>

                {/* STATE */}

                <div className="form-field">

                  <label htmlFor="shippingState">
                    State
                    <span>*</span>
                  </label>

                  <select
                    id="shippingState"
                    name="shippingState"
                    value={formData.shippingState}
                    onChange={handleChange}
                    required
                  >
                    <option value="">
                      Select state
                    </option>

                    <option value="Andhra Pradesh">
                      Andhra Pradesh
                    </option>

                    <option value="Arunachal Pradesh">
                      Arunachal Pradesh
                    </option>

                    <option value="Assam">
                      Assam
                    </option>

                    <option value="Bihar">
                      Bihar
                    </option>

                    <option value="Chhattisgarh">
                      Chhattisgarh
                    </option>

                    <option value="Delhi">
                      Delhi
                    </option>

                    <option value="Goa">
                      Goa
                    </option>

                    <option value="Gujarat">
                      Gujarat
                    </option>

                    <option value="Haryana">
                      Haryana
                    </option>

                    <option value="Himachal Pradesh">
                      Himachal Pradesh
                    </option>

                    <option value="Jharkhand">
                      Jharkhand
                    </option>

                    <option value="Karnataka">
                      Karnataka
                    </option>

                    <option value="Kerala">
                      Kerala
                    </option>

                    <option value="Madhya Pradesh">
                      Madhya Pradesh
                    </option>

                    <option value="Maharashtra">
                      Maharashtra
                    </option>

                    <option value="Odisha">
                      Odisha
                    </option>

                    <option value="Punjab">
                      Punjab
                    </option>

                    <option value="Rajasthan">
                      Rajasthan
                    </option>

                    <option value="Tamil Nadu">
                      Tamil Nadu
                    </option>

                    <option value="Telangana">
                      Telangana
                    </option>

                    <option value="Uttar Pradesh">
                      Uttar Pradesh
                    </option>

                    <option value="Uttarakhand">
                      Uttarakhand
                    </option>

                    <option value="West Bengal">
                      West Bengal
                    </option>

                  </select>

                </div>

                {/* POSTAL CODE */}

                <div className="form-field">

                  <label htmlFor="shippingPostalCode">
                    Postal / ZIP Code
                    <span>*</span>
                  </label>

                  <input
                    id="shippingPostalCode"
                    name="shippingPostalCode"
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit PIN code"
                    value={formData.shippingPostalCode}
                    onChange={handleChange}
                    maxLength="6"
                    required
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                3. ACCOUNT SECURITY
            ================================================= */}

            <section className="form-section">

              <div className="section-heading">

                <div className="section-number">
                  03
                </div>

                <div>

                  <h2>
                    Account Security
                  </h2>

                  <p>
                    Keep your Bluecart account protected.
                  </p>

                </div>

              </div>

              <div className="form-grid">

                {/* PASSWORD */}

                <div className="form-field">

                  <label htmlFor="password">
                    Password
                    <span>*</span>
                  </label>

                  <div className="password-input">

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  <small>
                    Use at least 8 characters with uppercase,
                    lowercase, number and special character.
                  </small>

                </div>

                {/* CONFIRM PASSWORD */}

                <div className="form-field">

                  <label htmlFor="confirmPassword">
                    Confirm Password
                    <span>*</span>
                  </label>

                  <div className="password-input">

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SUBMIT
            ================================================= */}

            <div className="register-submit-area">

              <p>
                By creating an account, you agree to our
                terms and privacy policy.
              </p>

              {error && (
                <div className="register-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="register-submit"
                disabled={loading}
              >
                {loading
                  ? "Creating account..."
                  : "Create account"}

                {!loading && (
                  <span>
                    →
                  </span>
                )}

              </button>

              <div className="already-account">

                <span>
                  Already have an account?
                </span>

                <Link to="/login">
                  Sign in
                </Link>

              </div>

            </div>

          </form>

        )}

      </div>

    </main>
  );
}

export default Register