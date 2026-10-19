import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../Services/api";
import "./OrderDetails.css";

const RETURN_REASONS = [
    {
        value: "DAMAGED_PRODUCT",
        label: "Damaged Product",
    },
    {
        value: "DEFECTIVE_PRODUCT",
        label: "Defective Product",
    },
    {
        value: "WRONG_PRODUCT",
        label: "Wrong Product",
    },
    {
        value: "MISSING_PARTS",
        label: "Missing Parts",
    },
    {
        value: "NOT_AS_DESCRIBED",
        label: "Product Not as Described",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];

function OrderDetails() {
    const navigate = useNavigate();
    const { orderId } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =====================================================
    // Return State
    // =====================================================

    const [selectedReturnItem, setSelectedReturnItem] =
        useState(null);

    const [returnReason, setReturnReason] = useState("");
    const [otherReturnReason, setOtherReturnReason] =
        useState("");

    const [returnQuantity, setReturnQuantity] = useState(1);

    const [returnSubmitting, setReturnSubmitting] =
        useState(false);

    const [returnError, setReturnError] = useState("");
    const [returnSuccess, setReturnSuccess] = useState("");

    const [returnedProductIds, setReturnedProductIds] =
        useState(new Set());

    // =====================================================
    // Cancellation State
    // =====================================================

    const [showCancelConfirmation, setShowCancelConfirmation] =
        useState(false);

    const [showCancellationRequest, setShowCancellationRequest] =
        useState(false);

    const [cancellationReason, setCancellationReason] =
        useState("");

    const [cancellationSubmitting, setCancellationSubmitting] =
        useState(false);

    const [cancellationError, setCancellationError] =
        useState("");

    const [cancellationSuccess, setCancellationSuccess] =
        useState("");

    // =====================================================
    // Fetch Order
    // =====================================================

    const fetchOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest(
                `/api/orders/${encodeURIComponent(orderId)}`
            );

            setOrder(data);
        } catch (err) {
            setError(
                err.message ||
                "Failed to load order details."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    // =====================================================
    // Formatting Helpers
    // =====================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return dateValue;
        }

        return date.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value) => {
        const amount = Number(value || 0);

        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // =====================================================
    // Status Helpers
    // =====================================================

    const normalizedStatus =
        (order?.status || "")
            .trim()
            .toUpperCase();

    const isDelivered =
        normalizedStatus === "DELIVERED";

    const isCancelled =
        normalizedStatus === "CANCELLED";

    const canDirectlyCancel =
        normalizedStatus === "PLACED" ||
        normalizedStatus === "CONFIRMED";

    const canRequestCancellation =
        normalizedStatus === "SHIPPED" ||
        normalizedStatus === "IN_TRANSIT" ||
        normalizedStatus === "OUT_FOR_DELIVERY";

    const canShowCancellation =
        !isDelivered &&
        !isCancelled &&
        (
            canDirectlyCancel ||
            canRequestCancellation
        );

    // =====================================================
    // Direct Cancellation
    // =====================================================

    const openCancelConfirmation = () => {
        setCancellationError("");
        setCancellationSuccess("");
        setShowCancelConfirmation(true);
    };

    const closeCancelConfirmation = () => {
        if (cancellationSubmitting) {
            return;
        }

        setShowCancelConfirmation(false);
        setCancellationError("");
    };

    const handleDirectCancellation = async () => {
        try {
            setCancellationSubmitting(true);
            setCancellationError("");

            await apiRequest(
                `/api/orders/${encodeURIComponent(order.orderId)}/cancel`,
                {
                    method: "PUT",
                }
            );

            setCancellationSuccess(
                "Your order has been cancelled successfully."
            );

            setShowCancelConfirmation(false);

            await fetchOrder();
        } catch (err) {
            setCancellationError(
                err.message ||
                "Failed to cancel the order."
            );
        } finally {
            setCancellationSubmitting(false);
        }
    };

    // =====================================================
    // Cancellation Request
    // =====================================================

    const openCancellationRequest = () => {
        setCancellationReason("");
        setCancellationError("");
        setCancellationSuccess("");
        setShowCancellationRequest(true);
    };

    const closeCancellationRequest = () => {
        if (cancellationSubmitting) {
            return;
        }

        setShowCancellationRequest(false);
        setCancellationReason("");
        setCancellationError("");
    };

    const handleCancellationRequestSubmit = async (event) => {
        event.preventDefault();

        if (!cancellationReason.trim()) {
            setCancellationError(
                "Please provide a reason for cancellation."
            );
            return;
        }

        try {
            setCancellationSubmitting(true);
            setCancellationError("");

            /*
             * The current backend CancellationRequestController
             * expects userId, orderId and reason as request
             * parameters, not as a JSON request body.
             */
            const storedUser = sessionStorage.getItem(
                "bluecart_user"
            );

            let userId = "";

            try {
                const parsedUser = storedUser
                    ? JSON.parse(storedUser)
                    : null;

                userId = parsedUser?.id || "";
            } catch (parseError) {
                console.error(
                    "Unable to read logged-in user:",
                    parseError
                );
            }

            if (!userId) {
                setCancellationError(
                    "Unable to identify the logged-in user. Please login again."
                );
                return;
            }

            const params = new URLSearchParams({
                userId,
                orderId: order.orderId,
                reason: cancellationReason.trim(),
            });

            await apiRequest(
                `/api/cancellation-requests?${params.toString()}`,
                {
                    method: "POST",
                }
            );

            setCancellationSuccess(
                "Cancellation request submitted successfully. It is now awaiting admin approval."
            );

            setCancellationReason("");

            setTimeout(() => {
                setShowCancellationRequest(false);
                setCancellationSuccess("");
            }, 2200);

        } catch (err) {
            setCancellationError(
                err.message ||
                "Failed to submit cancellation request."
            );
        } finally {
            setCancellationSubmitting(false);
        }
    };

    // =====================================================
    // Return Functions
    // =====================================================

    const openReturnModal = (item) => {
        setSelectedReturnItem(item);
        setReturnReason("");
        setOtherReturnReason("");
        setReturnQuantity(1);
        setReturnError("");
        setReturnSuccess("");
    };

    const closeReturnModal = () => {
        if (returnSubmitting) {
            return;
        }

        setSelectedReturnItem(null);
        setReturnReason("");
        setOtherReturnReason("");
        setReturnQuantity(1);
        setReturnError("");
    };

    const handleReturnQuantityChange = (event) => {
        const maxQuantity =
            Number(selectedReturnItem?.quantity || 1);

        const value = Number(event.target.value);

        if (!Number.isFinite(value)) {
            return;
        }

        const validQuantity = Math.min(
            Math.max(Math.floor(value), 1),
            maxQuantity
        );

        setReturnQuantity(validQuantity);
    };

    const handleReturnSubmit = async (event) => {
        event.preventDefault();

        if (!selectedReturnItem) {
            return;
        }

        if (!returnReason) {
            setReturnError(
                "Please select a return reason."
            );
            return;
        }

        if (
            returnReason === "OTHER" &&
            !otherReturnReason.trim()
        ) {
            setReturnError(
                "Please provide the reason for selecting Other."
            );
            return;
        }

        const quantity = Number(returnQuantity);

        const purchasedQuantity =
            Number(selectedReturnItem.quantity || 1);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > purchasedQuantity
        ) {
            setReturnError(
                `Return quantity must be between 1 and ${purchasedQuantity}.`
            );
            return;
        }

        try {
            setReturnSubmitting(true);
            setReturnError("");
            setReturnSuccess("");

            const requestBody = {
                orderId: order.orderId,
                productId: selectedReturnItem.productId,
                quantity,
                returnReason,
                otherReturnReason:
                    returnReason === "OTHER"
                        ? otherReturnReason.trim()
                        : "",
            };

            await apiRequest(
                "/api/returns",
                {
                    method: "POST",
                    body: JSON.stringify(requestBody),
                }
            );

            setReturnedProductIds((previous) => {
                const updated = new Set(previous);

                updated.add(
                    selectedReturnItem.productId
                );

                return updated;
            });

            setReturnSuccess(
                "Return request submitted successfully."
            );

            setReturnReason("");
            setOtherReturnReason("");

            setTimeout(() => {
                setSelectedReturnItem(null);
                setReturnSuccess("");
            }, 1800);

        } catch (err) {
            setReturnError(
                err.message ||
                "Failed to submit return request."
            );
        } finally {
            setReturnSubmitting(false);
        }
    };

    // =====================================================
    // Loading
    // =====================================================

    if (loading) {
        return (
            <div className="order-details-page">
                <div className="order-details-state">
                    Loading order details...
                </div>
            </div>
        );
    }

    // =====================================================
    // Error
    // =====================================================

    if (error) {
        return (
            <div className="order-details-page">
                <div className="order-details-state order-details-error">
                    {error}
                </div>
            </div>
        );
    }

    // =====================================================
    // No Order
    // =====================================================

    if (!order) {
        return (
            <div className="order-details-page">
                <div className="order-details-state">
                    Order not found.
                </div>
            </div>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <div className="order-details-page">

            {/* Header */}

            <div className="order-details-header">

                <div>

                    <button
                        type="button"
                        className="order-details-back-button"
                        onClick={() => navigate("/my-orders")}
                    >
                        My Orders
                    </button>

                    <h1>
                        Order Details
                    </h1>

                    <p className="order-details-order-id">
                        Order ID:{" "}
                        <strong>
                            {order.orderId}
                        </strong>
                    </p>

                    <p className="order-details-date">
                        Placed on{" "}
                        {formatDateTime(order.createdAt)}
                    </p>

                </div>

                <div className="order-details-status">

                    <span
                        className={`order-status-pill ${(
                            order.status || ""
                        ).toLowerCase()}`}
                    >
                        {order.status}
                    </span>

                </div>

            </div>

            {/* Cancellation Success */}

            {cancellationSuccess &&
                !showCancellationRequest &&
                !showCancelConfirmation && (
                    <div
                        className="order-cancellation-success"
                        role="status"
                    >
                        {cancellationSuccess}
                    </div>
                )}

            {/* Items */}

            <section className="order-details-section">

                <div className="order-details-section-header">

                    <h2>
                        Items
                    </h2>

                    <span>
                        {order.items?.length || 0}{" "}
                        {order.items?.length === 1
                            ? "item"
                            : "items"}
                    </span>

                </div>

                <div className="order-details-items">

                    {order.items?.map((item, index) => {

                        const productKey =
                            item.productId ||
                            `item-${index}`;

                        const hasReturned =
                            returnedProductIds.has(
                                item.productId
                            );

                        return (
                            <div
                                className="order-details-item"
                                key={productKey}
                            >

                                <div className="order-details-item-image-wrapper">

                                    <img
                                        src={item.imageUrl}
                                        alt={
                                            item.name ||
                                            item.productName ||
                                            "Product"
                                        }
                                        className="order-details-item-image"
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />

                                </div>

                                <div className="order-details-item-info">

                                    <h3>
                                        {item.name ||
                                            item.productName}
                                    </h3>

                                    {item.category && (
                                        <p>
                                            <span>
                                                Category:
                                            </span>{" "}
                                            {item.category}
                                        </p>
                                    )}

                                    {item.variant && (
                                        <p>
                                            <span>
                                                Variant:
                                            </span>{" "}
                                            {item.variant}
                                        </p>
                                    )}

                                    {item.colour && (
                                        <p>
                                            <span>
                                                Colour:
                                            </span>{" "}
                                            {item.colour}
                                        </p>
                                    )}

                                    <p>
                                        <span>
                                            Quantity:
                                        </span>{" "}
                                        {item.quantity}
                                    </p>

                                    {/* Existing Return Logic */}

                                    {isDelivered && (
                                        <div className="return-item-action">

                                            {hasReturned ? (
                                                <span className="return-requested-label">
                                                    Return Requested
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="return-item-button"
                                                    onClick={() =>
                                                        openReturnModal(
                                                            item
                                                        )
                                                    }
                                                >
                                                    Return Item
                                                </button>
                                            )}

                                        </div>
                                    )}

                                </div>

                                <div className="order-details-item-price">
                                    {formatCurrency(
                                        item.itemTotal
                                    )}
                                </div>

                            </div>
                        );
                    })}

                </div>

            </section>

            {/* Cancellation Action */}

            {canShowCancellation && (
                <section className="order-details-section">

                    <div className="order-cancellation-section">

                        <div>
                            <h2>
                                Need to cancel this order?
                            </h2>

                            {canDirectlyCancel ? (
                                <p>
                                    You can cancel this order
                                    directly while it is{" "}
                                    <strong>
                                        {normalizedStatus
                                            .replaceAll(
                                                "_",
                                                " "
                                            )
                                            .toLowerCase()}
                                    </strong>
                                    .
                                </p>
                            ) : (
                                <p>
                                    This order has already
                                    been shipped. You can
                                    raise a cancellation
                                    request for admin approval.
                                </p>
                            )}
                        </div>

                        {canDirectlyCancel ? (
                            <button
                                type="button"
                                className="order-cancel-button"
                                onClick={
                                    openCancelConfirmation
                                }
                            >
                                Cancel Order
                            </button>
                        ) : (
                            <button
                                type="button"
                                className="order-cancel-button"
                                onClick={
                                    openCancellationRequest
                                }
                            >
                                Request Cancellation
                            </button>
                        )}

                    </div>

                </section>
            )}

            {/* Delivery Address */}

            <section className="order-details-section">

                <h2>
                    Delivery Address
                </h2>

                <div className="order-details-address">

                    <p>
                        <strong>
                            {order.customerName}
                        </strong>
                    </p>

                    <p>
                        {order.shippingDoorNo}
                    </p>

                    <p>
                        {order.shippingStreet}
                    </p>

                    <p>
                        {order.shippingCity},{" "}
                        {order.shippingDistrict}
                    </p>

                    <p>
                        {order.shippingState} -{" "}
                        {order.shippingPostalCode}
                    </p>

                    {order.mobile && (
                        <p>
                            <strong>
                                Mobile:
                            </strong>{" "}
                            {order.mobile}
                        </p>
                    )}

                    {order.email && (
                        <p>
                            <strong>
                                Email:
                            </strong>{" "}
                            {order.email}
                        </p>
                    )}

                </div>

            </section>

            {/* Payment */}

            <section className="order-details-section">

                <h2>
                    Payment
                </h2>

                <div className="order-details-payment">

                    <p>
                        <span>
                            Payment Method
                        </span>

                        <strong>
                            {order.paymentMethod}
                        </strong>
                    </p>

                </div>

            </section>

            {/* Order Summary */}

            <section className="order-details-section">

                <h2>
                    Order Summary
                </h2>

                <div className="order-details-summary">

                    <div>
                        <span>
                            Subtotal
                        </span>

                        <strong>
                            {formatCurrency(
                                order.subtotal
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Shipping
                        </span>

                        <strong>
                            {formatCurrency(
                                order.shipping
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            Tax
                        </span>

                        <strong>
                            {formatCurrency(
                                order.tax
                            )}
                        </strong>
                    </div>

                    <div className="order-details-total">

                        <span>
                            Total
                        </span>

                        <strong>
                            {formatCurrency(
                                order.total
                            )}
                        </strong>

                    </div>

                </div>

            </section>

            {/* Delivery Information */}

            {order.estimatedDelivery && (
                <section className="order-details-section">

                    <h2>
                        Delivery Information
                    </h2>

                    <div className="order-details-delivery">

                        <p>
                            <span>
                                Estimated Delivery
                            </span>

                            <strong>
                                {formatDate(
                                    order.estimatedDelivery
                                )}
                            </strong>
                        </p>

                        {order.trackingNumber && (
                            <p>
                                <span>
                                    Tracking Number
                                </span>

                                <strong>
                                    {order.trackingNumber}
                                </strong>
                            </p>
                        )}

                        {order.carrier && (
                            <p>
                                <span>
                                    Carrier
                                </span>

                                <strong>
                                    {order.carrier}
                                </strong>
                            </p>
                        )}

                        {order.deliveredAt && (
                            <p>
                                <span>
                                    Delivered On
                                </span>

                                <strong>
                                    {formatDateTime(
                                        order.deliveredAt
                                    )}
                                </strong>
                            </p>
                        )}

                    </div>

                </section>
            )}

            {/* =====================================================
                Direct Cancellation Confirmation Modal
            ===================================================== */}

            {showCancelConfirmation && (
                <div
                    className="order-cancellation-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !cancellationSubmitting
                        ) {
                            closeCancelConfirmation();
                        }
                    }}
                >

                    <div
                        className="order-cancellation-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="order-cancellation-modal-header">

                            <div>
                                <h2>
                                    Cancel Order?
                                </h2>

                                <p>
                                    Order ID:{" "}
                                    {order.orderId}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCancelConfirmation
                                }
                                disabled={
                                    cancellationSubmitting
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        <div className="order-cancellation-modal-content">

                            <p>
                                Are you sure you want to
                                cancel this order?
                            </p>

                            <p>
                                This action will change the
                                order status to{" "}
                                <strong>
                                    CANCELLED
                                </strong>
                                .
                            </p>

                            {cancellationError && (
                                <div
                                    className="order-cancellation-error"
                                    role="alert"
                                >
                                    {cancellationError}
                                </div>
                            )}

                        </div>

                        <div className="order-cancellation-modal-actions">

                            <button
                                type="button"
                                onClick={
                                    closeCancelConfirmation
                                }
                                disabled={
                                    cancellationSubmitting
                                }
                            >
                                Keep Order
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDirectCancellation
                                }
                                disabled={
                                    cancellationSubmitting
                                }
                            >
                                {cancellationSubmitting
                                    ? "Cancelling..."
                                    : "Yes, Cancel Order"}
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =====================================================
                Cancellation Request Modal
            ===================================================== */}

            {showCancellationRequest && (
                <div
                    className="order-cancellation-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !cancellationSubmitting
                        ) {
                            closeCancellationRequest();
                        }
                    }}
                >

                    <div
                        className="order-cancellation-modal"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="order-cancellation-modal-header">

                            <div>
                                <h2>
                                    Request Cancellation
                                </h2>

                                <p>
                                    Order ID:{" "}
                                    {order.orderId}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeCancellationRequest
                                }
                                disabled={
                                    cancellationSubmitting
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {cancellationSuccess ? (
                            <div className="order-cancellation-success">
                                {cancellationSuccess}
                            </div>
                        ) : (
                            <form
                                className="order-cancellation-form"
                                onSubmit={
                                    handleCancellationRequestSubmit
                                }
                            >

                                <div className="order-cancellation-form-group">

                                    <label htmlFor="cancellation-reason">
                                        Reason for Cancellation
                                    </label>

                                    <textarea
                                        id="cancellation-reason"
                                        value={
                                            cancellationReason
                                        }
                                        onChange={(event) => {
                                            setCancellationReason(
                                                event.target.value
                                            );
                                            setCancellationError(
                                                ""
                                            );
                                        }}
                                        placeholder="Please explain why you want to cancel this order"
                                        rows="5"
                                        maxLength="500"
                                        disabled={
                                            cancellationSubmitting
                                        }
                                    />

                                    <span>
                                        {
                                            cancellationReason.length
                                        }
                                        /500
                                    </span>

                                </div>

                                {cancellationError && (
                                    <div
                                        className="order-cancellation-error"
                                        role="alert"
                                    >
                                        {cancellationError}
                                    </div>
                                )}

                                <div className="order-cancellation-modal-actions">

                                    <button
                                        type="button"
                                        onClick={
                                            closeCancellationRequest
                                        }
                                        disabled={
                                            cancellationSubmitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            cancellationSubmitting
                                        }
                                    >
                                        {cancellationSubmitting
                                            ? "Submitting..."
                                            : "Submit Request"}
                                    </button>

                                </div>

                            </form>
                        )}

                    </div>

                </div>
            )}

            {/* =====================================================
                Existing Return Modal
            ===================================================== */}

            {selectedReturnItem && (
                <div
                    className="return-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !returnSubmitting
                        ) {
                            closeReturnModal();
                        }
                    }}
                >

                    <div
                        className="return-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="return-modal-title"
                    >

                        <div className="return-modal-header">

                            <div>

                                <h2 id="return-modal-title">
                                    Return Item
                                </h2>

                                <p>
                                    {
                                        selectedReturnItem.name ||
                                        selectedReturnItem.productName
                                    }
                                </p>

                            </div>

                            <button
                                type="button"
                                className="return-modal-close"
                                onClick={
                                    closeReturnModal
                                }
                                disabled={
                                    returnSubmitting
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {returnSuccess ? (
                            <div className="return-success-message">
                                {returnSuccess}
                            </div>
                        ) : (
                            <form
                                className="return-form"
                                onSubmit={
                                    handleReturnSubmit
                                }
                            >

                                <div className="return-form-product">

                                    <img
                                        src={
                                            selectedReturnItem.imageUrl
                                        }
                                        alt={
                                            selectedReturnItem.name ||
                                            selectedReturnItem.productName
                                        }
                                        className="return-form-product-image"
                                    />

                                    <div>

                                        <strong>
                                            {
                                                selectedReturnItem.name ||
                                                selectedReturnItem.productName
                                            }
                                        </strong>

                                        <p>
                                            Ordered quantity:{" "}
                                            {
                                                selectedReturnItem.quantity
                                            }
                                        </p>

                                    </div>

                                </div>

                                <div className="return-form-group">

                                    <label htmlFor="return-quantity">
                                        Return Quantity
                                    </label>

                                    <input
                                        id="return-quantity"
                                        type="number"
                                        min="1"
                                        max={
                                            selectedReturnItem.quantity
                                        }
                                        value={
                                            returnQuantity
                                        }
                                        onChange={
                                            handleReturnQuantityChange
                                        }
                                        disabled={
                                            returnSubmitting
                                        }
                                    />

                                </div>

                                <div className="return-form-group">

                                    <label htmlFor="return-reason">
                                        Reason for Return
                                    </label>

                                    <select
                                        id="return-reason"
                                        value={
                                            returnReason
                                        }
                                        onChange={(event) => {
                                            setReturnReason(
                                                event.target.value
                                            );
                                            setReturnError("");
                                        }}
                                        disabled={
                                            returnSubmitting
                                        }
                                    >

                                        <option value="">
                                            Select a reason
                                        </option>

                                        {RETURN_REASONS.map(
                                            (reason) => (
                                                <option
                                                    key={
                                                        reason.value
                                                    }
                                                    value={
                                                        reason.value
                                                    }
                                                >
                                                    {
                                                        reason.label
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {returnReason ===
                                    "OTHER" && (
                                    <div className="return-form-group">

                                        <label htmlFor="other-return-reason">
                                            Please specify the
                                            reason
                                        </label>

                                        <textarea
                                            id="other-return-reason"
                                            value={
                                                otherReturnReason
                                            }
                                            onChange={(event) => {
                                                setOtherReturnReason(
                                                    event.target.value
                                                );
                                                setReturnError("");
                                            }}
                                            placeholder="Enter the reason for returning this item"
                                            rows="4"
                                            maxLength="500"
                                            disabled={
                                                returnSubmitting
                                            }
                                        />

                                        <span className="return-character-count">
                                            {
                                                otherReturnReason.length
                                            }
                                            /500
                                        </span>

                                    </div>
                                )}

                                {returnError && (
                                    <div className="return-error-message">
                                        {returnError}
                                    </div>
                                )}

                                <div className="return-form-actions">

                                    <button
                                        type="button"
                                        className="return-cancel-button"
                                        onClick={
                                            closeReturnModal
                                        }
                                        disabled={
                                            returnSubmitting
                                        }
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="return-submit-button"
                                        disabled={
                                            returnSubmitting
                                        }
                                    >
                                        {returnSubmitting
                                            ? "Submitting..."
                                            : "Submit Return"}
                                    </button>

                                </div>

                            </form>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default OrderDetails;