import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../Services/api";
import "./Order.css";

function Order() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await apiRequest("/api/orders/my-orders");

                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch orders:", err);
                setError(err.message || "Unable to load your orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "—";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    const formatCurrency = (amount) => {
        const value = Number(amount || 0);

        return value.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    };

    if (loading) {
        return (
            <main className="orders-page">
                <div className="orders-loading">
                    <div className="orders-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="orders-page">
                <div className="orders-error">
                    <h2>Unable to load orders</h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="orders-page">

            <section className="orders-header">
                <div>
                    <p className="orders-eyebrow">BLUECART</p>

                    <h1>My Orders</h1>

                    <p className="orders-subtitle">
                        View and manage your recent purchases.
                    </p>
                </div>

                <div className="orders-count">
                    {orders.length}{" "}
                    {orders.length === 1 ? "Order" : "Orders"}
                </div>
            </section>

            {orders.length === 0 ? (
                <section className="orders-empty">

                    <div className="orders-empty-icon">
                        🛍️
                    </div>

                    <h2>No orders yet</h2>

                    <p>
                        You haven't placed any orders yet.
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate("/products")}
                    >
                        Start Shopping
                    </button>

                </section>
            ) : (
                <section className="orders-list">

                    {orders.map((order) => (
                        <article
                            className="order-card"
                            key={order.orderId}
                        >

                            <div className="order-card-header">

                                <div>
                                    <span className="order-label">
                                        Order ID
                                    </span>

                                    <strong className="order-id">
                                        {order.orderId}
                                    </strong>
                                </div>

                                <div className="order-date">

                                    <span className="order-label">
                                        Ordered on
                                    </span>

                                    <strong>
                                        {formatDate(order.createdAt)}
                                    </strong>

                                </div>

                            </div>

                            <div className="order-status-row">

                                <span
                                    className={`order-status status-${(
                                        order.status || "placed"
                                    )
                                        .toLowerCase()
                                        .replaceAll("_", "-")}`}
                                >
                                    {order.status || "PLACED"}
                                </span>

                            </div>

                            <div className="order-products">

                                {(order.items || []).map((item, index) => (

                                    <div
                                        className="order-product"
                                        key={`${order.orderId}-${item.productId}-${index}`}
                                    >

                                        <div className="order-product-image">

                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={
                                                        item.productName ||
                                                        "Product"
                                                    }
                                                />
                                            ) : (
                                                <div className="order-product-placeholder">
                                                    📦
                                                </div>
                                            )}

                                        </div>

                                        <div className="order-product-info">

                                            <h3>
                                                {item.productName ||
                                                    "Product"}
                                            </h3>

                                            <p>
                                                Quantity: {item.quantity}
                                            </p>

                                            {item.variant && (
                                                <p>
                                                    Variant: {item.variant}
                                                </p>
                                            )}

                                            {item.colour && (
                                                <p>
                                                    Colour: {item.colour}
                                                </p>
                                            )}

                                        </div>

                                        <div className="order-product-price">
                                            {formatCurrency(item.itemTotal)}
                                        </div>

                                    </div>

                                ))}

                            </div>

                            <div className="order-card-footer">

                                <div className="order-total">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatCurrency(order.total)}
                                    </strong>

                                </div>

                                <button
                                    type="button"
                                    className="order-details-button"
                                    onClick={() =>
                                        navigate(
                                            `/orders/${order.orderId}`
                                        )
                                    }
                                >
                                    View Order
                                </button>

                            </div>

                        </article>
                    ))}

                </section>
            )}

        </main>
    );
}

export default Order;