import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";

import { useAuth } from "./AuthContext";
import { apiRequest } from "../Services/api";


const CartContext = createContext();


export function CartProvider({ children }) {

    const {
        currentUser,
        isAuthenticated,
        loading: authLoading
    } = useAuth();


    const [cartItems, setCartItems] = useState([]);

    const [loading, setLoading] = useState(true);


    /*
     * =====================================================
     * AUTHENTICATED USER ID
     * =====================================================
     *
     * The user's actual DynamoDB ID is obtained from
     * AuthContext.
     *
     * Previously this was hardcoded as USER001.
     */

    const userId = currentUser?.id;


    /*
     * =====================================================
     * CHECK WHETHER PRODUCT IS IN CART
     * =====================================================
     */

    const isInCart = (productId) => {

        return cartItems.some(
            (item) =>
                item.productId === productId
        );

    };


    /*
     * =====================================================
     * FETCH USER CART
     * =====================================================
     */

    const fetchCart = useCallback(async () => {

        /*
         * Wait until AuthContext has finished
         * restoring the login session.
         */

        if (authLoading) {

            return;

        }


        /*
         * No authenticated user means
         * there is no cart to load.
         */

        if (!isAuthenticated || !userId) {

            setCartItems([]);

            setLoading(false);

            return;

        }


        try {

            setLoading(true);


            /*
             * apiRequest automatically adds:
             *
             * Authorization: Bearer <JWT>
             */

            const data = await apiRequest(
                `/api/cart/${userId}`
            );


            /*
             * Make sure cartItems is always
             * an array.
             */

            setCartItems(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (error) {

            console.error(
                "Error fetching cart:",
                error
            );


            setCartItems([]);

        } finally {

            setLoading(false);

        }

    }, [
        authLoading,
        isAuthenticated,
        userId
    ]);


    /*
     * =====================================================
     * LOAD USER-SPECIFIC CART
     * =====================================================
     */

    useEffect(() => {

        /*
         * AuthContext must finish restoring
         * the session first.
         */

        if (authLoading) {

            return;

        }


        /*
         * If the user logs out, remove the
         * previous user's cart from React state.
         */

        if (!isAuthenticated || !userId) {

            setCartItems([]);

            setLoading(false);

            return;

        }


        /*
         * User is authenticated.
         * Load only that user's cart.
         */

        fetchCart();

    }, [
        authLoading,
        isAuthenticated,
        userId,
        fetchCart
    ]);


    /*
     * =====================================================
     * ADD PRODUCT TO CART
     * =====================================================
     */

    const addToCart = async (product) => {

        /*
         * User must be logged in.
         */

        if (!isAuthenticated || !userId) {

            throw new Error(
                "Please login to add products to your cart."
            );

        }


        try {

            /*
             * apiRequest automatically attaches
             * the JWT Authorization header.
             */

            const savedItem = await apiRequest(
                "/api/cart",
                {
                    method: "POST",

                    body: JSON.stringify({
                        userId: userId,
                        productId: product.id,
                        quantity: 1
                    })
                }
            );


            /*
             * Update local cart state immediately.
             */

            setCartItems((currentItems) => {

                const existingItem =
                    currentItems.find(
                        (item) =>
                            item.productId ===
                            savedItem.productId
                    );


                /*
                 * Product already exists.
                 * Backend increments the quantity.
                 */

                if (existingItem) {

                    return currentItems.map(
                        (item) =>

                            item.productId ===
                            savedItem.productId

                                ? {
                                    ...item,
                                    quantity:
                                        savedItem.quantity
                                }

                                : item
                    );

                }


                /*
                 * Product is newly added.
                 */

                return [
                    ...currentItems,

                    {
                        ...product,

                        userId: userId,

                        productId: product.id,

                        quantity:
                            savedItem.quantity
                    }
                ];

            });


        } catch (error) {

            console.error(
                "Error adding to cart:",
                error
            );

            throw error;

        }

    };


    /*
     * =====================================================
     * UPDATE CART QUANTITY
     * =====================================================
     */

    const updateQuantity = async (
        productId,
        quantity
    ) => {

        /*
         * Quantity cannot be less than 1.
         */

        if (quantity < 1) {

            return;

        }


        /*
         * User must be authenticated.
         */

        if (!isAuthenticated || !userId) {

            throw new Error(
                "Please login to update your cart."
            );

        }


        try {

            /*
             * PUT /api/cart/{userId}/{productId}
             *
             * JWT is automatically attached
             * by apiRequest().
             */

            const updatedItem =
                await apiRequest(
                    `/api/cart/${userId}/${productId}?quantity=${quantity}`,
                    {
                        method: "PUT"
                    }
                );


            /*
             * Update local React state.
             */

            setCartItems(
                (currentItems) =>

                    currentItems.map(
                        (item) =>

                            item.productId === productId

                                ? {
                                    ...item,
                                    quantity:
                                        updatedItem.quantity
                                }

                                : item
                    )
            );


        } catch (error) {

            console.error(
                "Error updating quantity:",
                error
            );

            throw error;

        }

    };


    /*
     * =====================================================
     * REMOVE PRODUCT FROM CART
     * =====================================================
     */

    const removeFromCart = async (
        productId
    ) => {

        /*
         * User must be authenticated.
         */

        if (!isAuthenticated || !userId) {

            throw new Error(
                "Please login to remove products from your cart."
            );

        }


        try {

            /*
             * DELETE /api/cart/{userId}/{productId}
             *
             * JWT is automatically attached
             * by apiRequest().
             */

            await apiRequest(
                `/api/cart/${userId}/${productId}`,
                {
                    method: "DELETE"
                }
            );


            /*
             * Remove product from local state.
             */

            setCartItems(
                (currentItems) =>

                    currentItems.filter(
                        (item) =>
                            item.productId !== productId
                    )
            );


        } catch (error) {

            console.error(
                "Error removing from cart:",
                error
            );

            throw error;

        }

    };


    /*
     * =====================================================
     * TOTAL CART COUNT
     * =====================================================
     */

    const cartCount = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.quantity || 0),
        0
    );


    /*
     * =====================================================
     * CART CONTEXT PROVIDER
     * =====================================================
     */

    return (

        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                loading,

                addToCart,

                updateQuantity,

                removeFromCart,

                fetchCart,

                isInCart
            }}
        >

            {children}

        </CartContext.Provider>

    );

}


/*
 * =========================================================
 * CART HOOK
 * =========================================================
 */

export function useCart() {

    return useContext(CartContext);

}