import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    Outlet
} from "react-router-dom";


import Order from "./pages/Order";
import Navbar from "./components/navbar";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import ManagementOrderDetails from "./management/pages/ManagementOrderDetails";


import {
    AuthProvider,
    useAuth
} from "./Context/AuthContext";

import {
    WishlistProvider
} from "./Context/WishlistContext";

import {
    CartProvider
} from "./Context/CartContext";


import ManagementLayout from "./management/components/ManagementLayout";

import ManagementDashboard from "./management/pages/ManagementDashboard";
import ManageProducts from "./management/pages/ManageProducts";
import AddProduct from "./management/pages/AddProduct";
import EditProduct from "./management/pages/EditProduct";
import ManageOrders from "./management/pages/ManageOrders";
import ManageReturns from "./management/pages/ManageReturns";
import ManageCancellationRequests from "./management/pages/ManageCancellationRequests";



/* =====================================================
   MANAGEMENT ROUTE PROTECTION
===================================================== */

function ManagementRoute() {

    const {
        isAuthenticated,
        isAdmin,
        loading
    } = useAuth();


    /* =================================================
       WAIT FOR AUTH SESSION RESTORATION
    ================================================= */

    if (loading) {
        return null;
    }


    /* =================================================
       NOT AUTHENTICATED
    ================================================= */

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }


    /* =================================================
       NOT ADMIN
    ================================================= */

    if (!isAdmin) {

        return (
            <Navigate
                to="/"
                replace
            />
        );
    }


    /* =================================================
       ADMIN ACCESS GRANTED
    ================================================= */

    return <Outlet />;
}



/* =====================================================
   CUSTOMER LAYOUT
===================================================== */

function CustomerLayout() {

    return (
        <>

            <Navbar />

            <Outlet />

        </>
    );
}



/* =====================================================
   MAIN APPLICATION
===================================================== */

function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <WishlistProvider>

                    <CartProvider>

                        <Routes>


                            {/* =========================================
                                MANAGEMENT APPLICATION
                            ========================================= */}

                            <Route
                                element={
                                    <ManagementRoute />
                                }
                            >

                                <Route
                                    path="/management"
                                    element={
                                        <ManagementLayout />
                                    }
                                >


                                    {/* =================================
                                        MANAGEMENT DASHBOARD
                                    ================================= */}

                                    <Route
                                        index
                                        element={
                                            <ManagementDashboard />
                                        }
                                    />


                                    {/* =================================
                                        PRODUCTS
                                    ================================= */}

                                    <Route
                                        path="products"
                                        element={
                                            <ManageProducts />
                                        }
                                    />


                                    <Route
                                        path="products/add"
                                        element={
                                            <AddProduct />
                                        }
                                    />


                                    <Route
                                        path="products/edit/:id"
                                        element={
                                            <EditProduct />
                                        }
                                    />


                                    {/* =================================
                                        ORDERS
                                    ================================= */}

                                    <Route
                                        path="orders"
                                        element={
                                            <ManageOrders />
                                        }
                                    />


                                    <Route
                                        path="orders/:orderId"
                                        element={
                                            <ManagementOrderDetails />
                                        }
                                    />


                                    {/* =================================
                                        RETURNS
                                    ================================= */}

                                    <Route
                                        path="returns"
                                        element={
                                            <ManageReturns />
                                        }
                                    />


                                    {/* =================================
                                        CANCELLATION REQUESTS
                                    ================================= */}

                                    <Route
                                        path="cancellations"
                                        element={
                                            <ManageCancellationRequests />
                                        }
                                    />


                                </Route>

                            </Route>



                            {/* =========================================
                                CUSTOMER APPLICATION
                            ========================================= */}

                            <Route
                                element={
                                    <CustomerLayout />
                                }
                            >


                                {/* =================================
                                    HOME
                                ================================= */}

                                <Route
                                    path="/"
                                    element={
                                        <Home />
                                    }
                                />


                                {/* =================================
                                    PRODUCTS
                                ================================= */}

                                <Route
                                    path="/products"
                                    element={
                                        <Products />
                                    }
                                />


                                <Route
                                    path="/products/:id"
                                    element={
                                        <ProductDetails />
                                    }
                                />


                                {/* =================================
                                    PROFILE
                                ================================= */}

                                <Route
                                    path="/profile"
                                    element={
                                        <Profile />
                                    }
                                />


                                {/* =================================
                                    ORDERS
                                ================================= */}

                                <Route
                                    path="/orders"
                                    element={
                                        <Order />
                                    }
                                />


                                <Route
                                    path="/orders/:orderId"
                                    element={
                                        <OrderDetails />
                                    }
                                />


                                {/* =================================
                                    WISHLIST
                                ================================= */}

                                <Route
                                    path="/wishlist"
                                    element={
                                        <Wishlist />
                                    }
                                />


                                {/* =================================
                                    CART
                                ================================= */}

                                <Route
                                    path="/cart"
                                    element={
                                        <Cart />
                                    }
                                />


                                {/* =================================
                                    CHECKOUT
                                ================================= */}

                                <Route
                                    path="/checkout"
                                    element={
                                        <Checkout />
                                    }
                                />


                                {/* =================================
                                    LOGIN
                                ================================= */}

                                <Route
                                    path="/login"
                                    element={
                                        <Login />
                                    }
                                />


                                {/* =================================
                                    REGISTER
                                ================================= */}

                                <Route
                                    path="/register"
                                    element={
                                        <Register />
                                    }
                                />


                            </Route>


                        </Routes>

                    </CartProvider>

                </WishlistProvider>

            </AuthProvider>

        </BrowserRouter>
    );
}


export default App;