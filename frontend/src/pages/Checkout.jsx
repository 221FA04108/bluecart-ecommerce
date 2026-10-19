import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";
import { apiRequest } from "../Services/api";

import "./Checkout.css";


function Checkout() {

  const { currentUser } = useAuth();

  const {
    cartItems,
    loading: cartLoading,
    fetchCart
  } = useCart();


  const [paymentMethod, setPaymentMethod] = useState("card");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",

    doorNo: "",
    street: "",
    city: "",
    district: "",
    state: "",
    postalCode: "",

    billingDifferent: false,

    billingDoorNo: "",
    billingStreet: "",
    billingCity: "",
    billingDistrict: "",
    billingState: "",
    billingPostalCode: "",

    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",

    upiId: "",
  });


  const [orderPlaced, setOrderPlaced] = useState(false);

  const [orderNumber, setOrderNumber] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");


  

  useEffect(() => {

    if (!currentUser) {
      return;
    }

    setFormData((previous) => ({
      ...previous,

      fullName:
        previous.fullName ||
        currentUser.name ||
        "",

      email:
        previous.email ||
        currentUser.email ||
        "",

      phone:
        previous.phone ||
        currentUser.mobile ||
        ""
    }));

  }, [currentUser]);


  

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked
    } = e.target;


    setFormData((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value
    }));


    if (error) {
      setError("");
    }
  };


  

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (Number(item.price) || 0) *
        (Number(item.quantity) || 0),

    0
  );


  const shipping =
    subtotal >= 75
      ? 0
      : 10;


  const tax =
    subtotal * 0.08;


  const total =
    subtotal +
    shipping +
    tax;


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");


    

    if (paymentMethod !== "cod") {

      setError(
        "Online payment is not connected yet. Please select Cash on Delivery."
      );

      return;
    }


   

    if (!currentUser) {

      setError(
        "Please login before placing your order."
      );

      return;
    }


    /*
     * Make sure there are products in the cart.
     */

    if (!cartItems.length) {

      setError(
        "Your cart is empty."
      );

      return;
    }


    try {

      setPlacingOrder(true);


      

      const orderData = {

        paymentMethod: "COD",

        shippingDoorNo:
          formData.doorNo.trim(),

        shippingStreet:
          formData.street.trim(),

        shippingCity:
          formData.city.trim(),

        shippingDistrict:
          formData.district.trim(),

        shippingState:
          formData.state,

        shippingPostalCode:
          formData.postalCode.trim()
      };


      

      const data = await apiRequest(
        "/api/orders",
        {
          method: "POST",

          body: JSON.stringify(orderData)
        }
      );


      

      const createdOrderId =
        data?.orderId ||
        data?.id ||
        "";


      setOrderNumber(createdOrderId);


      

      try {

        await fetchCart();

      } catch (cartError) {

        console.error(
          "Unable to refresh cart after order:",
          cartError
        );

      }


      

      setOrderPlaced(true);


    } catch (error) {

      console.error(
        "Order placement error:",
        error
      );


      setError(
        error.message ||
        "Unable to place your order. Please try again."
      );


    } finally {

      setPlacingOrder(false);
    }
  };


  

  if (cartLoading) {

    return (

      <main className="checkout-page">

        <div className="checkout-container">

          <div className="checkout-status">

            <h2>
              Loading your cart...
            </h2>

          </div>

        </div>

      </main>
    );
  }


  

  if (!cartItems.length && !orderPlaced) {

    return (

      <main className="checkout-page">

        <div className="checkout-container">

          <div className="checkout-status">

            <h2>
              Your cart is empty
            </h2>

            <p>
              Add products to your cart before proceeding to checkout.
            </p>

            <Link
              to="/products"
              className="back-to-cart"
            >
              Continue shopping
            </Link>

          </div>

        </div>

      </main>
    );
  }


  

  if (orderPlaced) {

    return (

      <>

        <main className="checkout-page">

          <div className="order-success">

            <div className="success-icon">
              ✓
            </div>


            <span className="success-badge">
              Order confirmed
            </span>


            <h1>
              Thank you for your order!
            </h1>


            <p>
              Your order has been placed successfully.
              We'll send the order details to your email.
            </p>


            <div className="order-number">

              <span>
                Order number
              </span>

              <strong>
                {orderNumber || "Processing"}
              </strong>

            </div>


            <div className="success-buttons">

              <Link
                to="/products"
                className="success-primary"
              >
                Continue shopping

                

              </Link>


              <Link
                to="/"
                className="success-secondary"
              >
                Back to home
              </Link>

            </div>

          </div>

        </main>

      </>
    );
  }


  /*
   * =========================================================
   * CHECKOUT PAGE
   * =========================================================
   */

  return (

    <>

      <main className="checkout-page">

        <div className="checkout-container">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="checkout-header">

            <div>

              <span className="checkout-badge">
                Secure checkout
              </span>


              <h1>
                Complete your <span>order.</span>
              </h1>


              <p>
                Enter your details and choose your preferred
                payment method.
              </p>

            </div>


            <Link
              to="/cart"
              className="back-to-cart"
            >
              Back to cart
            </Link>

          </div>


          {/* =================================================
              CHECKOUT ERROR
          ================================================= */}

          {error && (

            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>

          )}


          {/* =================================================
              CHECKOUT LAYOUT
          ================================================= */}

          <form
            className="checkout-layout"
            onSubmit={handleSubmit}
          >


            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="checkout-main">


              {/* ===============================================
                  DELIVERY INFORMATION
              ================================================ */}

              <section className="checkout-section">

                <div className="checkout-section-heading">

                  <div className="checkout-number">
                    01
                  </div>

                  <div>

                    <h2>
                      Delivery Information
                    </h2>

                    <p>
                      Where should we deliver your order?
                    </p>

                  </div>

                </div>


                <div className="checkout-grid">


                  {/* FULL NAME */}

                  <div className="checkout-field full-width">

                    <label htmlFor="fullName">
                      Full Name <span>*</span>
                    </label>

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="First & Last name"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* EMAIL */}

                  <div className="checkout-field">

                    <label htmlFor="email">
                      Email Address <span>*</span>
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* PHONE */}

                  <div className="checkout-field">

                    <label htmlFor="phone">
                      Phone Number <span>*</span>
                    </label>

                    <div className="checkout-phone">

                      <span>
                        +91
                      </span>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="10-digit number"
                        value={formData.phone}
                        onChange={handleChange}
                        maxLength="10"
                        required
                      />

                    </div>

                  </div>


                  {/* DOOR */}

                  <div className="checkout-field">

                    <label htmlFor="doorNo">
                      Door No. <span>*</span>
                    </label>

                    <input
                      id="doorNo"
                      name="doorNo"
                      type="text"
                      placeholder="Door number"
                      value={formData.doorNo}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* STREET */}

                  <div className="checkout-field">

                    <label htmlFor="street">
                      Street <span>*</span>
                    </label>

                    <input
                      id="street"
                      name="street"
                      type="text"
                      placeholder="Street / locality"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* CITY */}

                  <div className="checkout-field">

                    <label htmlFor="city">
                      City <span>*</span>
                    </label>

                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* DISTRICT */}

                  <div className="checkout-field">

                    <label htmlFor="district">
                      District <span>*</span>
                    </label>

                    <input
                      id="district"
                      name="district"
                      type="text"
                      placeholder="District"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  {/* STATE */}

                  <div className="checkout-field">

                    <label htmlFor="state">
                      State <span>*</span>
                    </label>

                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select state
                      </option>

                      <option value="Andhra Pradesh">
                        Andhra Pradesh
                      </option>

                      <option value="Telangana">
                        Telangana
                      </option>

                      <option value="Karnataka">
                        Karnataka
                      </option>

                      <option value="Tamil Nadu">
                        Tamil Nadu
                      </option>

                      <option value="Maharashtra">
                        Maharashtra
                      </option>

                      <option value="Kerala">
                        Kerala
                      </option>

                      <option value="Delhi">
                        Delhi
                      </option>

                      <option value="Gujarat">
                        Gujarat
                      </option>

                      <option value="Rajasthan">
                        Rajasthan
                      </option>

                      <option value="West Bengal">
                        West Bengal
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>


                  {/* PIN */}

                  <div className="checkout-field">

                    <label htmlFor="postalCode">
                      Postal / ZIP Code <span>*</span>
                    </label>

                    <input
                      id="postalCode"
                      name="postalCode"
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit PIN code"
                      value={formData.postalCode}
                      onChange={handleChange}
                      maxLength="6"
                      required
                    />

                  </div>

                </div>

              </section>


              {/* =================================================
                  BILLING ADDRESS
              ================================================= */}

              <section className="checkout-section">

                <div className="checkout-section-heading">

                  <div className="checkout-number">
                    02
                  </div>

                  <div>

                    <h2>
                      Billing Address
                    </h2>

                    <p>
                      Choose where your billing information should go.
                    </p>

                  </div>

                </div>


                <label className="billing-checkbox">

                  <input
                    type="checkbox"
                    name="billingDifferent"
                    checked={formData.billingDifferent}
                    onChange={handleChange}
                  />

                  <span>
                    My billing address is different from my
                    delivery address
                  </span>

                </label>


                {formData.billingDifferent && (

                  <div className="billing-fields">

                    <div className="checkout-grid">


                      <div className="checkout-field">

                        <label htmlFor="billingDoorNo">
                          Door No. <span>*</span>
                        </label>

                        <input
                          id="billingDoorNo"
                          name="billingDoorNo"
                          type="text"
                          value={formData.billingDoorNo}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="billingStreet">
                          Street <span>*</span>
                        </label>

                        <input
                          id="billingStreet"
                          name="billingStreet"
                          type="text"
                          value={formData.billingStreet}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="billingCity">
                          City <span>*</span>
                        </label>

                        <input
                          id="billingCity"
                          name="billingCity"
                          type="text"
                          value={formData.billingCity}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="billingDistrict">
                          District <span>*</span>
                        </label>

                        <input
                          id="billingDistrict"
                          name="billingDistrict"
                          type="text"
                          value={formData.billingDistrict}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="billingState">
                          State <span>*</span>
                        </label>

                        <select
                          id="billingState"
                          name="billingState"
                          value={formData.billingState}
                          onChange={handleChange}
                          required
                        >

                          <option value="">
                            Select state
                          </option>

                          <option value="Andhra Pradesh">
                            Andhra Pradesh
                          </option>

                          <option value="Telangana">
                            Telangana
                          </option>

                          <option value="Karnataka">
                            Karnataka
                          </option>

                          <option value="Tamil Nadu">
                            Tamil Nadu
                          </option>

                          <option value="Maharashtra">
                            Maharashtra
                          </option>

                          <option value="Kerala">
                            Kerala
                          </option>

                          <option value="Delhi">
                            Delhi
                          </option>

                          <option value="Other">
                            Other
                          </option>

                        </select>

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="billingPostalCode">
                          Postal Code <span>*</span>
                        </label>

                        <input
                          id="billingPostalCode"
                          name="billingPostalCode"
                          type="text"
                          inputMode="numeric"
                          maxLength="6"
                          value={formData.billingPostalCode}
                          onChange={handleChange}
                          required
                        />

                      </div>

                    </div>

                  </div>

                )}

              </section>


              {/* =================================================
                  PAYMENT
              ================================================= */}

              <section className="checkout-section">

                <div className="checkout-section-heading">

                  <div className="checkout-number">
                    03
                  </div>

                  <div>

                    <h2>
                      Payment Method
                    </h2>

                    <p>
                      Choose your preferred payment option.
                    </p>

                  </div>

                </div>


                <div className="payment-options">


                  {/* CARD */}

                  <label
                    className={`payment-option ${
                      paymentMethod === "card"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <div className="payment-icon">
                      💳
                    </div>

                    <div className="payment-info">

                      <strong>
                        Credit / Debit Card
                      </strong>

                      <span>
                        Visa, Mastercard, RuPay
                      </span>

                    </div>

                  </label>


                  {/* UPI */}

                  <label
                    className={`payment-option ${
                      paymentMethod === "upi"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={paymentMethod === "upi"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <div className="payment-icon">
                      UPI
                    </div>

                    <div className="payment-info">

                      <strong>
                        UPI
                      </strong>

                      <span>
                        Google Pay, PhonePe, Paytm & more
                      </span>

                    </div>

                  </label>


                  {/* COD */}

                  <label
                    className={`payment-option ${
                      paymentMethod === "cod"
                        ? "selected"
                        : ""
                    }`}
                  >

                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) =>
                        setPaymentMethod(e.target.value)
                      }
                    />

                    <div className="payment-icon">
                      💵
                    </div>

                    <div className="payment-info">

                      <strong>
                        Cash on Delivery
                      </strong>

                      <span>
                        Pay when your order arrives
                      </span>

                    </div>

                  </label>

                </div>


                {/* CARD DETAILS */}

                {paymentMethod === "card" && (

                  <div className="payment-details">

                    <div className="checkout-grid">

                      <div className="checkout-field full-width">

                        <label htmlFor="cardNumber">
                          Card Number <span>*</span>
                        </label>

                        <input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          inputMode="numeric"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          maxLength="19"
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="cardName">
                          Name on Card <span>*</span>
                        </label>

                        <input
                          id="cardName"
                          name="cardName"
                          type="text"
                          placeholder="Name as shown on card"
                          value={formData.cardName}
                          onChange={handleChange}
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="expiryDate">
                          Expiry Date <span>*</span>
                        </label>

                        <input
                          id="expiryDate"
                          name="expiryDate"
                          type="text"
                          placeholder="MM / YY"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          maxLength="5"
                          required
                        />

                      </div>


                      <div className="checkout-field">

                        <label htmlFor="cvv">
                          CVV <span>*</span>
                        </label>

                        <input
                          id="cvv"
                          name="cvv"
                          type="password"
                          inputMode="numeric"
                          placeholder="•••"
                          value={formData.cvv}
                          onChange={handleChange}
                          maxLength="4"
                          required
                        />

                      </div>

                    </div>

                  </div>

                )}


                {/* UPI DETAILS */}

                {paymentMethod === "upi" && (

                  <div className="payment-details">

                    <div className="checkout-field">

                      <label htmlFor="upiId">
                        UPI ID <span>*</span>
                      </label>

                      <input
                        id="upiId"
                        name="upiId"
                        type="text"
                        placeholder="example@upi"
                        value={formData.upiId}
                        onChange={handleChange}
                        required
                      />

                      <small>
                        Example: yourname@okaxis
                      </small>

                    </div>

                  </div>

                )}


                {/* COD DETAILS */}

                {paymentMethod === "cod" && (

                  <div className="cod-message">

                    <span>
                      ✓
                    </span>

                    <p>
                      You will pay in cash when your order
                      is delivered to your address.
                    </p>

                  </div>

                )}

              </section>

            </div>


            {/* =================================================
                ORDER SUMMARY
            ================================================= */}

            <aside className="checkout-summary">

              <div className="summary-top">

                <h2>
                  Order Summary
                </h2>

                <span>
                  {cartItems.length} items
                </span>

              </div>


              {/* ITEMS */}

              <div className="checkout-products">

                {cartItems.map((item) => (

                  <div
                    className="checkout-product"
                    key={item.productId}
                  >

                    <div className="checkout-product-image">

                      <img
                        src={
                          item.imageUrl ||
                          item.image ||
                          (
                            Array.isArray(item.images)
                              ? item.images[0]
                              : ""
                          )
                        }
                        alt={item.name}
                      />

                      <span>
                        {item.quantity}
                      </span>

                    </div>


                    <div className="checkout-product-info">

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        {item.category}
                      </small>

                    </div>


                    <strong className="checkout-product-price">

                      ₹
                      {(
                        (Number(item.price) || 0) *
                        (Number(item.quantity) || 0)
                      ).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2
                        }
                      )}

                    </strong>

                  </div>

                ))}

              </div>


              {/* SUMMARY */}

              <div className="checkout-summary-lines">

                <div>

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {subtotal.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2
                      }
                    )}
                  </strong>

                </div>


                <div>

                  <span>
                    Shipping
                  </span>

                  <strong>

                    {shipping === 0
                      ? "FREE"
                      : `₹${shipping.toLocaleString(
                          "en-IN",
                          {
                            maximumFractionDigits: 2
                          }
                        )}`}

                  </strong>

                </div>


                <div>

                  <span>
                    Estimated tax
                  </span>

                  <strong>
                    ₹
                    {tax.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 2
                      }
                    )}
                  </strong>

                </div>

              </div>


              <div className="checkout-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹
                  {total.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 2
                    }
                  )}
                </strong>

              </div>


              {/* PLACE ORDER */}

              <button
                type="submit"
                className="place-order-button"
                disabled={placingOrder}
              >

                {placingOrder
                  ? "Placing order..."
                  : "Place order"}

              </button>


              <div className="checkout-security">

                <span>
                  🔒
                </span>

                <p>
                  Your payment information is encrypted
                  and secure.
                </p>

              </div>

            </aside>

          </form>

        </div>

      </main>

    </>
  );
}


export default Checkout;