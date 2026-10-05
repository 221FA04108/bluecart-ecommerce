import { BrowserRouter, Routes, Route } from "react-router-dom";
import Order from "./pages/Order";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";

import { AuthProvider } from "./Context/AuthContext";
import { WishlistProvider } from "./Context/WishlistContext";
import { CartProvider } from "./Context/CartContext";


function App() {

    return (
        <BrowserRouter>

            <AuthProvider>

                <WishlistProvider>

                    <CartProvider>

                        <Navbar />

                        <Routes>

                            <Route
                                path="/"
                                element={<Home />}
                            />

                            <Route
                                path="/products"
                                element={<Products />}
                            />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/orders" element={<Order />} />

                            <Route
                                path="/products/:id"
                                element={<ProductDetails />}
                            />
                            

                            <Route
                                path="/wishlist"
                                element={<Wishlist />}
                            />

                            <Route
                                path="/cart"
                                element={<Cart />}
                            />

                            <Route
                                path="/checkout"
                                element={<Checkout />}
                            />

                            <Route
                                path="/login"
                                element={<Login />}
                            />

                            <Route
                                path="/register"
                                element={<Register />}
                            />

                        </Routes>

                    </CartProvider>

                </WishlistProvider>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;