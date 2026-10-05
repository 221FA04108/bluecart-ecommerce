import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useWishlist } from "../Context/WishlistContext";
import AddToCartButton from "../components/AddToCartButton";
import { apiRequest } from "../Services/api";

import "./ProductDetails.css";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isInWishlist, toggleWishlist } = useWishlist();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selected image in the product gallery
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);


    /* =========================
       Fetch Product
    ========================= */

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError("");

                /*
                 * apiRequest automatically attaches
                 * the JWT stored in sessionStorage.
                 */

                const data = await apiRequest(
                    `/api/products/${id}`
                );

                setProduct(data);

                // Always start the gallery from the first image
                setSelectedImageIndex(0);

            } catch (error) {
                console.error(error);

                /*
                 * apiRequest throws an error for
                 * unsuccessful responses.
                 */

                setError(error.message);

            } finally {
                setLoading(false);
            }
        };

        fetchProduct();

    }, [id]);


    /* =========================
       Loading State
    ========================= */

    if (loading) {
        return (
            <div className="product-details-page">

                <div className="product-details-loading">
                    Loading product...
                </div>

            </div>
        );
    }


    /* =========================
       Error State
    ========================= */

    if (error || !product) {
        return (
            <div className="product-details-page">

                <div className="product-details-error">

                    <h2>
                        {error || "Product not found"}
                    </h2>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                    >
                        Back to Products
                    </button>

                </div>

            </div>
        );
    }


    /* =========================
       Product Images
    ========================= */

    /*
     * New products:
     *     product.images
     *
     * Existing products:
     *     product.imageUrl
     *
     * We support both so existing products
     * do not break.
     */

    const productImages =
        Array.isArray(product.images) &&
        product.images.length > 0
            ? product.images
            : product.imageUrl
                ? [product.imageUrl]
                : [];


    /*
     * Make sure the selected index is always
     * inside the available image range.
     */

    const safeImageIndex =
        selectedImageIndex < productImages.length
            ? selectedImageIndex
            : 0;

    const selectedImage =
        productImages[safeImageIndex];


    /* =========================
       Thumbnail Selection
    ========================= */

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };


    /* =========================
       Wishlist
    ========================= */

    const liked = isInWishlist(product.id);

    const handleWishlist = () => {
        toggleWishlist(product);
    };


    /* =========================
       Product Details Page
    ========================= */

    return (
        <div className="product-details-page">

            <div className="product-details-container">


                {/* =========================
                   Back to Products
                ========================= */}

                <button
                    type="button"
                    className="back-to-products"
                    onClick={() => navigate("/products")}
                >
                    Back to Products
                </button>


                <div className="product-details-card">


                    {/* =========================
                       Image Gallery
                    ========================= */}

                    <div className="product-details-image-section">

                        <div className="product-image-gallery">


                            {/* =========================
                               Main Image
                            ========================= */}

                            <div className="product-main-image-wrapper">

                                {selectedImage ? (

                                    <img
                                        src={selectedImage}
                                        alt={`${product.name} - image ${
                                            safeImageIndex + 1
                                        }`}
                                        className="product-details-image"
                                    />

                                ) : (

                                    <div className="product-image-placeholder">
                                        No Image Available
                                    </div>

                                )}

                            </div>


                            {/* =========================
                               Thumbnail Images
                            ========================= */}

                            {productImages.length > 1 && (

                                <div className="product-image-thumbnails">

                                    {productImages.map(
                                        (image, index) => (

                                            <button
                                                type="button"
                                                key={`${image}-${index}`}
                                                className={
                                                    index === safeImageIndex
                                                        ? "product-thumbnail active"
                                                        : "product-thumbnail"
                                                }
                                                onClick={() =>
                                                    handleThumbnailClick(
                                                        index
                                                    )
                                                }
                                                aria-label={`View product image ${
                                                    index + 1
                                                }`}
                                            >

                                                <img
                                                    src={image}
                                                    alt={`${product.name} thumbnail ${
                                                        index + 1
                                                    }`}
                                                />

                                            </button>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                    </div>


                    {/* =========================
                       Information Section
                    ========================= */}

                    <div className="product-details-info">


                        {/* =========================
                           Product Name
                        ========================= */}

                        <div className="product-details-top">

                            <div>

                                {product.brand && (
                                    <p className="product-details-brand">
                                        {product.brand}
                                    </p>
                                )}

                                <h1>
                                    {product.name}
                                </h1>

                            </div>

                        </div>


                        {/* =========================
                           Price
                        ========================= */}

                        <div className="product-details-price">

                            ₹
                            {Number(product.price).toLocaleString(
                                "en-IN"
                            )}

                        </div>


                        {/* =========================
                           Variant / Colour
                        ========================= */}

                        {(product.variant || product.colour) && (

                            <div className="product-details-options">

                                {product.variant && (

                                    <div className="product-detail-option">

                                        <span className="option-label">
                                            Variant
                                        </span>

                                        <span className="option-value">
                                            {product.variant}
                                        </span>

                                    </div>

                                )}


                                {product.colour && (

                                    <div className="product-detail-option">

                                        <span className="option-label">
                                            Colour
                                        </span>

                                        <span className="option-value">
                                            {product.colour}
                                        </span>

                                    </div>

                                )}

                            </div>

                        )}


                        {/* =========================
                           Description
                        ========================= */}

                        {product.description && (

                            <div className="product-details-description">

                                <h3>
                                    Description
                                </h3>

                                <p>
                                    {product.description}
                                </p>

                            </div>

                        )}


                        {/* =========================
                           Stock
                        ========================= */}

                        {Number(product.stock) > 0 &&
                            Number(product.stock) <= 5 && (

                                <p className="product-details-stock-warning">
                                    Hurry! Only {product.stock} left
                                </p>

                            )
                        }


                        {Number(product.stock) === 0 && (

                            <p className="product-details-out-of-stock">
                                Out of Stock
                            </p>

                        )}


                        {/* =========================
                           Specifications
                        ========================= */}

                        {product.specifications &&
                            Object.keys(product.specifications).length > 0 && (

                                <div className="product-details-specifications">

                                    <h3>
                                        Specifications
                                    </h3>

                                    <div className="specifications-list">

                                        {Object.entries(
                                            product.specifications
                                        ).map(([key, value]) => (

                                            <div
                                                className="specification-row"
                                                key={key}
                                            >

                                                <span className="specification-name">
                                                    {key}
                                                </span>

                                                <span className="specification-value">
                                                    {value}
                                                </span>

                                            </div>

                                        ))}

                                    </div>

                                </div>

                            )
                        }


                        {/* =========================
                           Actions
                        ========================= */}

                        <div className="product-details-actions">


                            {/* Add to Cart */}

                            <AddToCartButton
                                product={product}
                                className="details-cart-button"
                            />


                            {/* Wishlist */}

                            <button
                                type="button"
                                className="details-wishlist-button"
                                onClick={handleWishlist}
                            >
                                {liked
                                    ? "♥ Unlike"
                                    : "♡ Add to Wishlist"}
                            </button>

                        </div>


                    </div>

                </div>

            </div>

        </div>
    );
}

export default ProductDetails;