import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    apiRequest
} from "../../Services/api";

import "../styles/Management.css";


function ManagementOrderDetails() {

    const navigate = useNavigate();

    const {
        orderId
    } = useParams();


    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // Fetch Order
    // =====================================================

    const fetchOrder = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                const data =
                    await apiRequest(
                        `/api/management/orders/${encodeURIComponent(
                            orderId
                        )}`
                    );


                setOrder(data);

            } catch (requestError) {

                console.error(
                    "Management order details error:",
                    requestError
                );


                setOrder(null);

                setError(
                    requestError.message ||
                    "Unable to load order details."
                );

            } finally {

                setLoading(false);

            }

        },
        [orderId]
    );


    useEffect(() => {

        fetchOrder();

    }, [fetchOrder]);


    // =====================================================
    // Helpers
    // =====================================================

    const formatDate = (dateValue) => {

        if (!dateValue) {
            return "—";
        }

        const date =
            new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
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


    const formatAmount = (amount) => {

        if (
            amount === null ||
            amount === undefined
        ) {
            return "—";
        }

        return `₹${Number(amount).toLocaleString(
            "en-IN"
        )}`;

    };


    const getStatusClass = (status) => {

        const normalizedStatus =
            (
                status ||
                ""
            )
                .trim()
                .toUpperCase();


        switch (normalizedStatus) {

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
    // Loading
    // =====================================================

    if (loading) {

        return (

            <section className="management-order-details-page">

                <div className="management-page-heading">

                    <div>

                        <h1>
                            Order Details
                        </h1>

                        <p>
                            Loading order information...
                        </p>

                    </div>

                </div>


                <div className="management-products-table-panel">

                    <div className="management-products-table-state">

                        <div className="management-table-spinner" />

                        <p>
                            Loading order...
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    // =====================================================
    // Error
    // =====================================================

    if (error || !order) {

        return (

            <section className="management-order-details-page">

                <div className="management-page-heading">

                    <div>

                        <h1>
                            Order Details
                        </h1>

                        <p>
                            Unable to load the selected order.
                        </p>

                    </div>

                </div>


                <div
                    className="management-orders-error"
                    role="alert"
                >

                    <span>
                        {error ||
                            "Order was not found."}
                    </span>

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={() =>
                            navigate(
                                "/management/orders"
                            )
                        }
                    >
                        Back to Orders
                    </button>

                </div>

            </section>

        );

    }


    // =====================================================
    // Render
    // =====================================================

    return (

        <section className="management-order-details-page">

            {/* =================================================
               HEADER
            ================================================= */}

            <div className="management-page-heading">

                <div>

                    <button
                        type="button"
                        className="management-order-back-button"
                        onClick={() =>
                            navigate(
                                "/management/orders"
                            )
                        }
                    >
                         Back to Orders
                    </button>

                    <h1>
                        Order Details
                    </h1>

                    <p>
                        Review customer, delivery,
                        payment and item information.
                    </p>

                </div>

            </div>


            {/* =================================================
               ORDER SUMMARY
            ================================================= */}

            <div className="management-order-details-card">

                <div className="management-order-details-header">

                    <div>

                        <span className="management-order-details-label">
                            Order ID
                        </span>

                        <h2>
                            {order.orderId}
                        </h2>

                    </div>


                    <span
                        className={
                            `management-order-status ${getStatusClass(
                                order.status
                            )}`
                        }
                    >
                        {(
                            order.status ||
                            "UNKNOWN"
                        ).replaceAll(
                            "_",
                            " "
                        )}
                    </span>

                </div>


                <div className="management-order-details-grid">

                    <div>

                        <span>
                            Order Date
                        </span>

                        <strong>
                            {formatDate(
                                order.createdAt
                            )}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Payment Method
                        </span>

                        <strong>
                            {order.paymentMethod ||
                                "—"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Customer
                        </span>

                        <strong>
                            {order.customerName ||
                                "—"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Email
                        </span>

                        <strong>
                            {order.email ||
                                "—"}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Mobile
                        </span>

                        <strong>
                            {order.mobile ||
                                "—"}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
               CUSTOMER ADDRESS
            ================================================= */}

            <div className="management-order-details-card">

                <div className="management-order-details-section-heading">

                    <h2>
                        Shipping Address
                    </h2>

                </div>


                <div className="management-order-address">

                    <p>
                        {order.shippingDoorNo ||
                            ""}
                    </p>

                    <p>
                        {order.shippingStreet ||
                            ""}
                    </p>

                    <p>
                        {order.shippingCity ||
                            ""}
                    </p>

                    <p>
                        {order.shippingDistrict ||
                            ""}
                    </p>

                    <p>
                        {order.shippingState ||
                            ""}
                        {" "}
                        {order.shippingPostalCode ||
                            ""}
                    </p>

                </div>

            </div>


            {/* =================================================
               ORDER ITEMS
            ================================================= */}

            <div className="management-order-details-card">

                <div className="management-order-details-section-heading">

                    <h2>
                        Order Items
                    </h2>

                </div>


                <div className="management-order-items">

                    {(order.items || []).map(
                        (item, index) => (

                            <div
                                className="management-order-item"
                                key={`${item.productId}-${index}`}
                            >

                                <div className="management-order-item-image">

                                    {item.imageUrl ? (

                                        <img
                                            src={item.imageUrl}
                                            alt={
                                                item.name ||
                                                "Product"
                                            }
                                        />

                                    ) : (

                                        <div>
                                            📦
                                        </div>

                                    )}

                                </div>


                                <div className="management-order-item-info">

                                    <strong>
                                        {item.name ||
                                            "Product"}
                                    </strong>

                                    <span>
                                        Product ID:{" "}
                                        {item.productId ||
                                            "—"}
                                    </span>

                                    {item.variant && (

                                        <span>
                                            Variant:{" "}
                                            {item.variant}
                                        </span>

                                    )}

                                    {item.colour && (

                                        <span>
                                            Colour:{" "}
                                            {item.colour}
                                        </span>

                                    )}

                                    <span>
                                        Quantity:{" "}
                                        {item.quantity ||
                                            0}
                                    </span>

                                </div>


                                <strong className="management-order-item-price">

                                    {formatAmount(
                                        item.itemTotal
                                    )}

                                </strong>

                            </div>

                        )
                    )}

                </div>

            </div>


            {/* =================================================
               PAYMENT SUMMARY
            ================================================= */}

            <div className="management-order-details-card">

                <div className="management-order-details-section-heading">

                    <h2>
                        Order Summary
                    </h2>

                </div>


                <div className="management-order-summary">

                    <div>
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            {formatAmount(
                                order.subtotal
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Shipping
                        </span>

                        <strong>
                            {formatAmount(
                                order.shipping
                            )}
                        </strong>
                    </div>


                    <div>
                        <span>
                            Tax
                        </span>

                        <strong>
                            {formatAmount(
                                order.tax
                            )}
                        </strong>
                    </div>


                    <div className="management-order-summary-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            {formatAmount(
                                order.total
                            )}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =================================================
               DELIVERY INFORMATION
            ================================================= */}

            {(order.trackingNumber ||
                order.carrier ||
                order.estimatedDelivery ||
                order.deliveredAt ||
                order.cancelledAt) && (

                <div className="management-order-details-card">

                    <div className="management-order-details-section-heading">

                        <h2>
                            Delivery Information
                        </h2>

                    </div>


                    <div className="management-order-details-grid">

                        <div>

                            <span>
                                Carrier
                            </span>

                            <strong>
                                {order.carrier ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Tracking Number
                            </span>

                            <strong>
                                {order.trackingNumber ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Estimated Delivery
                            </span>

                            <strong>
                                {order.estimatedDelivery ||
                                    "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Delivered At
                            </span>

                            <strong>
                                {order.deliveredAt
                                    ? formatDate(
                                          order.deliveredAt
                                      )
                                    : "—"}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Cancelled At
                            </span>

                            <strong>
                                {order.cancelledAt
                                    ? formatDate(
                                          order.cancelledAt
                                      )
                                    : "—"}
                            </strong>

                        </div>

                    </div>

                </div>

            )}

        </section>

    );

}


export default ManagementOrderDetails;