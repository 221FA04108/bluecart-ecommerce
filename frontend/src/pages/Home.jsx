function Home() {
  return (
    <>
      

      <main className="home">
        <section className="hero">

          {/* LEFT SIDE */}
          <div className="hero-content">

            <div className="hero-badge">
              New season, considered goods <span>✦</span>
            </div>

            <h1>
              Find your next
              <br />
              <span>favorite</span> thing.
            </h1>

            <p>
              Thoughtfully selected essentials to make everyday life
              feel a little more extraordinary.
            </p>

            <div className="hero-buttons">

              <button className="primary-button">
                Shop new arrivals
                <span>→</span>
              </button>

              <button className="secondary-button">
                Explore our edit
              </button>

            </div>

            <div className="hero-stats">

             

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="hero-visual">

            {/* Yellow background circle */}
            <div className="hero-circle"></div>

            {/* Headphones */}
            <div className="headphone-wrapper">
              <img
                src=""
                alt="Aero Headphones"
                className="hero-headphones"
              />
            </div>

            {/* FREE SHIPPING CARD */}
            <div className="shipping-card">

              <strong>Free shipping</strong>

              <span>
                on orders ₹7500+.
              </span>

            </div>

            {/* PRODUCT CARD */}
            <div className="product-card-mini">

              <small>BESTSELLER</small>

              <strong>
                Aero Headphones
              </strong>

              <span>
                From ₹12900
              </span>

            </div>

          </div>

        </section>
      </main>
    </>
  );
}

export default Home;