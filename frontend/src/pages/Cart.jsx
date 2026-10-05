import { Link } from "react-router-dom";
import { useCart } from "../Context/CartContext";

import "./Cart.css";

function Cart() {

  const {
    cartItems,
    loading,
    updateQuantity,
    removeFromCart
  } = useCart();

  const handleQuantityChange = async (productId, change, currentQuantity) => {

    const newQuantity = currentQuantity + change;

    if (newQuantity < 1) {
      return;
    }

    await updateQuantity(productId, newQuantity);
  };

  const handleRemove = async (productId) => {

    await removeFromCart(productId);
  };

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  const shipping =
    subtotal >= 75 || subtotal === 0
      ? 0
      : 10;

  const tax = subtotal * 0.08;

  const total = subtotal + shipping + tax;

  if (loading) {
    return (
      <main className="cart-page">

        <div className="cart-container">

          <div className="cart-header">

            <div>
              <span className="cart-badge">
                Your selection
              </span>

              <h1>
                Shopping <span>Cart</span>
              </h1>

              <p>
                Review your items before continuing to checkout.
              </p>
            </div>

            <Link
              to="/products"
              className="continue-shopping"
            >
               Continue shopping
            </Link>

          </div>

          <div className="empty-cart">

            <h2>
              Loading your cart...
            </h2>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="cart-page">

      <div className="cart-container">

        {/* HEADER */}

        <div className="cart-header">

          <div>

            <span className="cart-badge">
              Your selection
            </span>

            <h1>
              Shopping <span>Cart</span>
            </h1>

            <p>
              Review your items before continuing to checkout.
            </p>

          </div>

          <Link
            to="/products"
            className="continue-shopping"
          >
             Continue shopping
          </Link>

        </div>


        {/* EMPTY CART */}

        {cartItems.length === 0 ? (

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Looks like you haven't added anything to your
              cart yet.
            </p>

            <Link
              to="/products"
              className="shop-button"
            >
              Start shopping
              <span></span>
            </Link>

          </div>

        ) : (

          /* CART CONTENT */

          <div className="cart-layout">

            {/* CART ITEMS */}

            <section className="cart-items-section">

              <div className="cart-items-header">

                <h2>
                  Your Items
                </h2>

                <span>
                  {cartItems.length}{" "}
                  {cartItems.length === 1
                    ? "item"
                    : "items"}
                </span>

              </div>


              <div className="cart-items">

                {cartItems.map((item) => (

                  <article
                    className="cart-item"
                    key={item.productId}
                  >

                    {/* IMAGE */}

                    <div className="cart-item-image">

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                      />

                    </div>


                    {/* DETAILS */}

                    <div className="cart-item-details">

                      <span className="cart-item-category">
                        {item.category}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      <p className="cart-item-price">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>

                      <button
                        className="remove-item"
                        onClick={() =>
                          handleRemove(item.productId)
                        }
                      >
                        Remove
                      </button>

                    </div>


                    {/* QUANTITY */}

                    <div className="quantity-control">

                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            -1,
                            item.quantity
                          )
                        }
                        disabled={item.quantity === 1}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.productId,
                            1,
                            item.quantity
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>

                    </div>


                    {/* ITEM TOTAL */}

                    <div className="cart-item-total">

                      <span>
                        ₹{(
                          Number(item.price) *
                          item.quantity
                        ).toLocaleString("en-IN")}
                      </span>

                    </div>

                  </article>

                ))}

              </div>

            </section>


            {/* ORDER SUMMARY */}

            <aside className="order-summary">

              <div className="summary-header">

                <h2>
                  Order Summary
                </h2>

                <span>
                  Secure checkout
                </span>

              </div>


              <div className="summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{subtotal.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Shipping
                </span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping.toFixed(2)}`}
                </strong>

              </div>


              <div className="summary-row">

                <span>
                  Estimated tax
                </span>

                <strong>
                  ₹{tax.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </strong>

              </div>


              <div className="free-shipping-note">

                <span>✦</span>

                {shipping === 0
                  ? "You've unlocked free shipping!"
                  : `Add ₹${(75 - subtotal).toFixed(
                      2
                    )} more for free shipping.`}

              </div>


              <div className="summary-divider"></div>


              <div className="summary-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </strong>

              </div>


              <Link
                to="/checkout"
                className="checkout-button"
              >
                Proceed to checkout
                <span>→</span>
              </Link>


              <div className="secure-note">

                <span>🔒</span>

                <p>
                  Secure payment and encrypted
                  checkout
                </p>

              </div>

            </aside>

          </div>

        )}

      </div>

    </main>
  );
}

export default Cart;