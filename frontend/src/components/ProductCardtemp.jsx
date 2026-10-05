import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../Context/WishlistContext";
import AddToCartButton from "./AddToCartButton";

function ProductCard({ product }) {
    const navigate = useNavigate();

    const { isInWishlist, toggleWishlist } = useWishlist();

    const liked = isInWishlist(product.id);

    /*
     * Use the new images array from DynamoDB.
     * Fall back to imageUrl for older products.
     */
    const productImages =
        Array.isArray(product.images) &&
        product.images.length > 0
            ? product.images
            : product.imageUrl
                ? [product.imageUrl]
                : [];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const currentImage =
        productImages[currentImageIndex] || product.imageUrl;


    /* =========================
       Wishlist
    ========================= */

    const handleLike = (event) => {
        event.stopPropagation();

        toggleWishlist(product);
    };


    /* =========================
       Product Details
    ========================= */

    const handleViewProduct = () => {
        navigate(`/products/${product.id}`);
    };


    /* =========================
       Image Navigation
    ========================= */

    const handlePreviousImage = (event) => {
        event.stopPropagation();

        if (productImages.length <= 1) {
            return;
        }

        setCurrentImageIndex((currentIndex) =>
            currentIndex === 0
                ? productImages.length - 1
                : currentIndex - 1
        );
    };


    const handleNextImage = (event) => {
        event.stopPropagation();

        if (productImages.length <= 1) {
            return;
        }

        setCurrentImageIndex((currentIndex) =>
            currentIndex === productImages.length - 1
                ? 0
                : currentIndex + 1
        );
    };


    const handleImageIndicator = (event, index) => {
        event.stopPropagation();

        setCurrentImageIndex(index);
    };


    return (
        <article className="product-card">

            {/* =========================
               Product Image
            ========================= */}

            <div className="product-image-container">

                {currentImage ? (
                    <img
                        src={currentImage}
                        alt={product.name}
                        className="product-image"
                    />
                ) : (
                    <div className="product-image-placeholder">
                        No Image
                    </div>
                )}


                {/* Wishlist */}

                <button
                    type="button"
                    className={`like-button ${
                        liked ? "liked" : ""
                    }`}
                    onClick={handleLike}
                    aria-label={
                        liked
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                    }
                >
                    {liked ? "♥" : "♡"}
                </button>


                {/* Previous Image */}

                {productImages.length > 1 && (
                    <button
                        type="button"
                        className="product-image-nav product-image-prev"
                        onClick={handlePreviousImage}
                        aria-label="Previous image"
                    >
                        ‹
                    </button>
                )}


                {/* Next Image */}

                {productImages.length > 1 && (
                    <button
                        type="button"
                        className="product-image-nav product-image-next"
                        onClick={handleNextImage}
                        aria-label="Next image"
                    >
                        ›
                    </button>
                )}


                {/* Image Indicators */}

                {productImages.length > 1 && (
                    <div className="product-image-indicators">

                        {productImages.map((_, index) => (
                            <button
                                type="button"
                                key={index}
                                className={
                                    index === currentImageIndex
                                        ? "product-image-dot active"
                                        : "product-image-dot"
                                }
                                onClick={(event) =>
                                    handleImageIndicator(
                                        event,
                                        index
                                    )
                                }
                                aria-label={`View image ${
                                    index + 1
                                }`}
                            />
                        ))}

                    </div>
                )}

            </div>


            {/* =========================
               Product Information
            ========================= */}

            <div className="product-info">

                {/* Brand */}

                {product.brand && (
                    <p className="product-brand">
                        {product.brand}
                    </p>
                )}


                {/* Product Name */}

                <h3 className="product-name">
                    {product.name}
                </h3>


                {/* Price */}

                <p className="product-price">
                    ₹{Number(product.price).toLocaleString("en-IN")}
                </p>


                {/* Low Stock */}

                {Number(product.stock) > 0 &&
                    Number(product.stock) <= 5 && (
                        <p className="low-stock-alert">
                            Hurry! Only {product.stock} left
                        </p>
                    )
                }


                {/* Out of Stock */}

                {Number(product.stock) === 0 && (
                    <p className="out-of-stock">
                        Out of Stock
                    </p>
                )}


                {/* =========================
                   Actions
                ========================= */}

                <div className="product-card-actions">

                    <button
                        type="button"
                        className="view-product-button"
                        onClick={handleViewProduct}
                    >
                        View Product
                    </button>


                    {Number(product.stock) > 0 && (
                        <div className="product-card-cart-wrapper">
                            <AddToCartButton
                                product={product}
                            />
                        </div>
                    )}

                </div>

            </div>

        </article>
    );
}

export default ProductCard;