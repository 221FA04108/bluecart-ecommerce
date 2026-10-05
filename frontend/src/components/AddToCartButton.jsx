import { useState } from "react";
import { useCart } from "../Context/CartContext";

function AddToCartButton({
    product,
    className = "cart-button"
}) {

    const {
        addToCart,
        removeFromCart,
        isInCart
    } = useCart();

    const [processing, setProcessing] = useState(false);

    const addedToCart = isInCart(product.id);


    const handleCartAction = async () => {

        if (processing) {
            return;
        }

        try {

            setProcessing(true);

            if (addedToCart) {

                await removeFromCart(product.id);

            } else {

                await addToCart(product);

            }

        } catch (error) {

            console.error(
                "Error updating cart:",
                error
            );

        } finally {

            setProcessing(false);

        }
    };


    return (
        <button
            className={`${className} ${
                addedToCart ? "added" : ""
            }`}
            onClick={handleCartAction}
            disabled={processing}
        >
            {processing
                ? addedToCart
                    ? "Removing..."
                    : "Adding..."
                : addedToCart
                    ? "Remove from cart"
                    : "Add to Cart"}
        </button>
    );
}

export default AddToCartButton;