import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../Context/CartContext";
import { useAuth } from "../Context/AuthContext";

import "./Navbar.css";


function Navbar() {

    const { cartCount } = useCart();

    const {
        currentUser,
        isAuthenticated,
        logout
    } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();

    const [searchQuery, setSearchQuery] = useState("");

    const searchTimerRef = useRef(null);


    /*
     * Keep the search box synchronized with the URL.
     * This allows the search to remain visible when the
     * user navigates/reloads the Products page.
     */

    useEffect(() => {

        const params = new URLSearchParams(location.search);

        const search = params.get("search") || "";

        setSearchQuery(search);

    }, [location.search]);


    /*
     * Clear the pending search timer when the
     * component is unmounted.
     */

    useEffect(() => {

        return () => {

            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }

        };

    }, []);


    const handleLogout = () => {

        logout();

        navigate("/login");
    };


    /*
     * Enter is still supported, but it is no longer
     * required because live search happens automatically.
     */

    const handleSearchSubmit = (event) => {

        event.preventDefault();

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        const trimmedQuery = searchQuery.trim();

        if (!trimmedQuery) {

            navigate("/products");

            return;
        }

        navigate(
            `/products?search=${encodeURIComponent(trimmedQuery)}`
        );
    };


    /*
     * Live search.
     *
     * The user does not need to press Enter.
     * We wait 300ms after the user stops typing
     * before updating the URL.
     */

    const handleSearchChange = (event) => {

        const value = event.target.value;

        setSearchQuery(value);


        /*
         * Cancel the previous pending search.
         */

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }


        const trimmedQuery = value.trim();


        /*
         * If the search box is empty, immediately
         * return to the complete product catalogue.
         */

        if (!trimmedQuery) {

            navigate("/products");

            return;
        }


        /*
         * Wait 300ms before navigating.
         *
         * Products.jsx will then detect the URL change
         * and call the backend search API.
         */

        searchTimerRef.current = setTimeout(() => {

            navigate(
                `/products?search=${encodeURIComponent(trimmedQuery)}`
            );

        }, 300);
    };


    const handleSearchClear = () => {

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        setSearchQuery("");

        navigate("/products");
    };


    return (
        <nav className="navbar">


            {/* Logo */}

            <NavLink
                to="/"
                className="navbar-logo"
            >

                <div className="logo-icon">
                    b
                </div>

                <span>
                    bluecart
                </span>

            </NavLink>


            {/* Search */}

            <form
                className="navbar-search"
                onSubmit={handleSearchSubmit}
            >

                <input
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search products..."
                    aria-label="Search products"
                />


                {searchQuery && (

                    <button
                        type="button"
                        className="navbar-search-clear"
                        onClick={handleSearchClear}
                        aria-label="Clear search"
                    >
                        ×
                    </button>

                )}


                

            </form>


            {/* Navigation */}

            <div className="navbar-links">


                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Home
                </NavLink>


                <NavLink
                    to="/products"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Products
                </NavLink>


                <NavLink
                    to="/wishlist"
                    className={({ isActive }) =>
                        `nav-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Wishlist
                </NavLink>


                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        `nav-link cart-link ${
                            isActive ? "active" : ""
                        }`
                    }
                >
                    Cart

                    <span className="cart-count">
                        {cartCount}
                    </span>

                </NavLink>


                {!isAuthenticated ? (

                    <NavLink
                        to="/login"
                        className="login-button"
                    >
                        Login

                        

                    </NavLink>

                ) : (

                    <div className="navbar-user-menu">


                        {/* Username */}

                        <button
                            type="button"
                            className="navbar-user-trigger"
                            aria-label="Open user menu"
                        >
                            {currentUser?.name}
                        </button>


                        {/* Dropdown */}

                        <div className="navbar-user-dropdown">


                            <button
                                type="button"
                                className="navbar-user-menu-item"
                                onClick={() =>
                                    navigate("/profile")
                                }
                            >

                                <span className="navbar-user-menu-icon">
                                    
                                </span>

                                <span>
                                    My Profile
                                </span>

                            </button>


                            <button
                                type="button"
                                className="navbar-user-menu-item"
                                onClick={() =>
                                    navigate("/orders")
                                }
                            >

                                <span className="navbar-user-menu-icon">
                                    
                                </span>

                                <span>
                                    My Orders
                                </span>

                            </button>


                            <div className="navbar-user-menu-divider" />


                            <button
                                type="button"
                                className="navbar-user-menu-item logout"
                                onClick={handleLogout}
                            >

                                <span className="navbar-user-menu-icon">
                                    
                                </span>

                                <span>
                                    Logout
                                </span>

                            </button>


                        </div>

                    </div>

                )}

            </div>

        </nav>
    );
}


export default Navbar;