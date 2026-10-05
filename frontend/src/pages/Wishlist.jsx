import ProductCard from "../components/ProductCardtemp";
import { useWishlist } from "../Context/WishlistContext";
import "./Wishlist.css";

function Wishlist() {
    const { wishlist } = useWishlist();

    return (
        <div className="wishlist-page">

            <section className="wishlist-header">
                <h1>My Wishlist</h1>
                <p>Products you've saved for later.</p>
            </section>

            {wishlist.length === 0 ? (
                <div className="empty-wishlist">
                    <div className="empty-heart">♡</div>

                    <h2>Your wishlist is empty</h2>

                    <p>
                        Like products you love and they'll appear here.
                    </p>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {wishlist.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            )}

        </div>
    );
}

export default Wishlist;