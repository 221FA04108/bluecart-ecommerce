import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    apiRequest
} from "../../Services/api";

import "../styles/Management.css";


function ManagementDashboard() {

    const navigate = useNavigate();


    // =====================================================
    // STATE
    // =====================================================

    const [products, setProducts] =
        useState([]);

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // FETCH DASHBOARD DATA
    // =====================================================

    const fetchDashboardData = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                // =================================================
                // Fetch products and orders together
                // =================================================

                const [
                    productsData,
                    ordersData
                ] = await Promise.all([
                    apiRequest(
                        "/api/management/products"
                    ),
                    apiRequest(
                        "/api/management/orders"
                    )
                ]);


                setProducts(
                    Array.isArray(productsData)
                        ? productsData
                        : []
                );


                setOrders(
                    Array.isArray(ordersData)
                        ? ordersData
                        : []
                );

            } catch (requestError) {

                console.error(
                    "Management dashboard load error:",
                    requestError
                );


                setProducts([]);

                setOrders([]);


                setError(
                    requestError.message ||
                    "Unable to load dashboard data."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {

        fetchDashboardData();

    }, [fetchDashboardData]);


    // =====================================================
    // DASHBOARD STATISTICS
    // =====================================================

    const totalProducts =
        products.length;


    const totalOrders =
        orders.length;


    /*
     * Pending orders currently means orders
     * that are still in PLACED status and
     * awaiting confirmation.
     */

    const pendingOrders =
        orders.filter(
            (order) =>
                (
                    order.status ||
                    ""
                )
                    .trim()
                    .toUpperCase() ===
                "PLACED"
        ).length;


    /*
     * Same low-stock rule already used
     * in the customer product UI:
     *
     * stock > 0 && stock <= 5
     */

    const lowStockProducts =
        products.filter(
            (product) => {

                const stock =
                    Number(
                        product.stock
                    );

                return (
                    Number.isFinite(stock) &&
                    stock > 0 &&
                    stock <= 5
                );

            }
        );


    const lowStockCount =
        lowStockProducts.length;


    const outOfStockCount =
        products.filter(
            (product) =>
                Number(product.stock) === 0
        ).length;


    const totalAvailableStock =
        products.reduce(
            (
                total,
                product
            ) => {

                const stock =
                    Number(
                        product.stock
                    );

                return (
                    total +
                    (
                        Number.isFinite(stock)
                            ? stock
                            : 0
                    )
                );

            },
            0
        );


    // =====================================================
    // RECENT ORDERS
    // =====================================================

    const recentOrders =
        useMemo(() => {

            return [...orders]
                .sort(
                    (
                        first,
                        second
                    ) => {

                        const firstDate =
                            new Date(
                                first.createdAt ||
                                0
                            ).getTime();

                        const secondDate =
                            new Date(
                                second.createdAt ||
                                0
                            ).getTime();

                        return (
                            secondDate -
                            firstDate
                        );

                    }
                )
                .slice(0, 5);

        }, [orders]);


    // =====================================================
    // HELPERS
    // =====================================================

    const formatDate = (
        dateValue
    ) => {

        if (!dateValue) {

            return "—";

        }


        const date =
            new Date(
                dateValue
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return dateValue;

        }


        return date.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    const formatCurrency = (
        amount
    ) => {

        const value =
            Number(
                amount || 0
            );


        return value.toLocaleString(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        );

    };


    const getStatusClass = (
        status
    ) => {

        const normalizedStatus =
            (
                status ||
                ""
            )
                .trim()
                .toUpperCase();


        switch (
            normalizedStatus
        ) {

            case "PLACED":
                return "management-order-status-placed";

            case "CONFIRMED":
                return "management-order-status-confirmed";

            case "SHIPPED":
                return "management-order-status-shipped";

            case "IN_TRANSIT":
                return "management-order-status-transit";

            case "OUT_FOR_DELIVERY":
                return "management-order-status-out-for-delivery";

            case "DELIVERED":
                return "management-order-status-delivered";

            case "CANCELLED":
                return "management-order-status-cancelled";

            default:
                return "management-order-status-default";

        }

    };


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loading) {

        return (

            <div className="management-dashboard">

                <div className="management-dashboard-heading">

                    <div>

                        <h1 className="management-page-title">
                            Dashboard
                        </h1>

                        <p className="management-page-description">
                            Overview of your Bluecart store operations.
                        </p>

                    </div>

                </div>


                <div className="management-products-table-panel">

                    <div className="management-products-table-state">

                        <div className="management-table-spinner" />

                        <h3>
                            Loading dashboard...
                        </h3>

                        <p>
                            Fetching products and order information.
                        </p>

                    </div>

                </div>

            </div>

        );

    }


    // =====================================================
    // DASHBOARD
    // =====================================================

    return (

        <div className="management-dashboard">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="management-dashboard-heading">

                <div>

                    <h1 className="management-page-title">
                        Dashboard
                    </h1>

                    <p className="management-page-description">
                        Overview of your Bluecart store operations.
                    </p>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div
                    className="management-orders-error"
                    role="alert"
                >

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={
                            fetchDashboardData
                        }
                    >
                        Retry
                    </button>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="management-dashboard-stats">


                {/* TOTAL PRODUCTS */}

                <div className="management-stat-card">

                    <div className="management-stat-header">

                        <span className="management-stat-label">
                            Total Products
                        </span>

                        <span className="management-stat-icon">
                            ▤
                        </span>

                    </div>


                    <div className="management-stat-value">

                        {totalProducts}

                    </div>


                    <div className="management-stat-note">
                        Products currently in catalogue
                    </div>

                </div>


                {/* TOTAL ORDERS */}

                <div className="management-stat-card">

                    <div className="management-stat-header">

                        <span className="management-stat-label">
                            Total Orders
                        </span>

                        <span className="management-stat-icon">
                            ≡
                        </span>

                    </div>


                    <div className="management-stat-value">

                        {totalOrders}

                    </div>


                    <div className="management-stat-note">
                        Orders received by Bluecart
                    </div>

                </div>


                {/* PENDING ORDERS */}

                <div className="management-stat-card">

                    <div className="management-stat-header">

                        <span className="management-stat-label">
                            Pending Orders
                        </span>

                        <span className="management-stat-icon warning">
                            !
                        </span>

                    </div>


                    <div className="management-stat-value">

                        {pendingOrders}

                    </div>


                    <div className="management-stat-note">
                        Orders awaiting confirmation
                    </div>

                </div>


                {/* LOW STOCK */}

                <div className="management-stat-card">

                    <div className="management-stat-header">

                        <span className="management-stat-label">
                            Low Stock
                        </span>

                        <span className="management-stat-icon danger">
                            !
                        </span>

                    </div>


                    <div className="management-stat-value">

                        {lowStockCount}

                    </div>


                    <div className="management-stat-note">
                        Products with 1–5 units remaining
                    </div>

                </div>


            </section>


            {/* =================================================
                LOWER DASHBOARD AREA
            ================================================= */}

            <section className="management-dashboard-grid">


                {/* =================================================
                    RECENT ORDERS
                ================================================= */}

                <div className="management-dashboard-panel">

                    <div className="management-panel-header">

                        <div>

                            <h2 className="management-panel-title">
                                Recent Orders
                            </h2>

                            <p className="management-panel-description">
                                Latest customer orders
                            </p>

                        </div>


                        <button
                            type="button"
                            className="management-secondary-button"
                            onClick={() =>
                                navigate(
                                    "/management/orders"
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {recentOrders.length === 0 ? (

                        <div className="management-empty-state">

                            <div className="management-empty-icon">
                                ≡
                            </div>

                            <h3>
                                No orders yet
                            </h3>

                            <p>
                                Customer orders will appear here
                                once they are placed.
                            </p>

                        </div>

                    ) : (

                        <div className="management-dashboard-recent-orders">

                            {recentOrders.map(
                                (order) => {

                                    const itemCount =
                                        Array.isArray(
                                            order.items
                                        )
                                            ? order.items.reduce(
                                                  (
                                                      total,
                                                      item
                                                  ) =>
                                                      total +
                                                      Number(
                                                          item.quantity ||
                                                          0
                                                      ),
                                                  0
                                              )
                                            : 0;


                                    const normalizedStatus =
                                        (
                                            order.status ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase();


                                    return (

                                        <div
                                            className="management-dashboard-order-row"
                                            key={
                                                order.orderId
                                            }
                                        >

                                            <div className="management-dashboard-order-main">

                                                <strong>
                                                    {order.orderId ||
                                                        "—"}
                                                </strong>

                                                <span>
                                                    {order.customerName ||
                                                        "Unknown customer"}
                                                </span>

                                            </div>


                                            <div className="management-dashboard-order-date">

                                                {formatDate(
                                                    order.createdAt
                                                )}

                                            </div>


                                            <div className="management-dashboard-order-items">

                                                {itemCount}{" "}
                                                {itemCount === 1
                                                    ? "item"
                                                    : "items"}

                                            </div>


                                            <div className="management-dashboard-order-total">

                                                {formatCurrency(
                                                    order.total
                                                )}

                                            </div>


                                            <span
                                                className={
                                                    `management-order-status ${getStatusClass(
                                                        normalizedStatus
                                                    )}`
                                                }
                                            >

                                                {(
                                                    normalizedStatus ||
                                                    "UNKNOWN"
                                                ).replaceAll(
                                                    "_",
                                                    " "
                                                )}

                                            </span>


                                            <button
                                                type="button"
                                                className="management-table-action"
                                                onClick={() =>
                                                    navigate(
                                                        `/management/orders/${encodeURIComponent(
                                                            order.orderId
                                                        )}`
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    )}

                </div>


                {/* =================================================
                    INVENTORY OVERVIEW
                ================================================= */}

                <div className="management-dashboard-panel">

                    <div className="management-panel-header">

                        <div>

                            <h2 className="management-panel-title">
                                Inventory Overview
                            </h2>

                            <p className="management-panel-description">
                                Product stock information
                            </p>

                        </div>

                    </div>


                    <div className="management-inventory-placeholder">


                        {/* AVAILABLE STOCK */}

                        <div className="management-inventory-row">

                            <span>
                                Stock availability
                            </span>

                            <strong className="management-dashboard-inventory-value">
                                {totalAvailableStock}
                            </strong>

                        </div>


                        {/* LOW STOCK */}

                        <div className="management-inventory-row">

                            <span>
                                Low-stock products
                            </span>

                            <strong className="management-dashboard-inventory-value management-dashboard-inventory-warning">
                                {lowStockCount}
                            </strong>

                        </div>


                        {/* OUT OF STOCK */}

                        <div className="management-inventory-row">

                            <span>
                                Out-of-stock products
                            </span>

                            <strong className="management-dashboard-inventory-value management-dashboard-inventory-danger">
                                {outOfStockCount}
                            </strong>

                        </div>


                        {/* TOTAL CATALOGUE */}

                        <div className="management-inventory-row">

                            <span>
                                Catalogue products
                            </span>

                            <strong className="management-dashboard-inventory-value">
                                {totalProducts}
                            </strong>

                        </div>


                    </div>

                </div>

            </section>


            {/* =================================================
                QUICK ACTIONS
            ================================================= */}

            <section className="management-dashboard-panel management-quick-actions">

                <div className="management-panel-header">

                    <div>

                        <h2 className="management-panel-title">
                            Quick Actions
                        </h2>

                        <p className="management-panel-description">
                            Common management tasks
                        </p>

                    </div>

                </div>


                <div className="management-quick-action-list">


                    <button
                        type="button"
                        className="management-quick-action"
                        onClick={() =>
                            navigate(
                                "/management/products"
                            )
                        }
                    >

                        <span className="management-quick-action-icon">
                            +
                        </span>

                        <span>
                            Add or manage products
                        </span>

                    </button>


                    <button
                        type="button"
                        className="management-quick-action"
                        onClick={() =>
                            navigate(
                                "/management/orders"
                            )
                        }
                    >

                        <span className="management-quick-action-icon">
                            ≡
                        </span>

                        <span>
                            Review orders
                        </span>

                    </button>


                    <button
                        type="button"
                        className="management-quick-action"
                        onClick={() =>
                            navigate(
                                "/management/returns"
                            )
                        }
                    >

                        <span className="management-quick-action-icon">
                            ↩
                        </span>

                        <span>
                            Review returns
                        </span>

                    </button>


                </div>

            </section>


        </div>

    );

}


export default ManagementDashboard;