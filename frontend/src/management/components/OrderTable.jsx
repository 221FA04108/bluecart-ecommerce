import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    apiRequest
} from "../../Services/api";

import "../styles/Management.css";


function OrderTable({
    orders,
    loading,
    onOrderUpdated
}) {

    const navigate = useNavigate();

    const [updatingOrderId, setUpdatingOrderId] =
        useState("");

    const [updateError, setUpdateError] =
        useState("");

    const [sortBy, setSortBy] = useState("date-desc");

    const sortedOrders = [...(Array.isArray(orders) ? orders : [])].sort((a, b) => {
        if (sortBy === "price-asc" || sortBy === "price-desc") {
            const priceA = Number(a.total);
            const priceB = Number(b.total);
            const safeA = Number.isFinite(priceA) ? priceA : 0;
            const safeB = Number.isFinite(priceB) ? priceB : 0;
            return sortBy === "price-asc" ? safeA - safeB : safeB - safeA;
        }

        const valueA = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
        const valueB = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
        const dateA = Number.isNaN(valueA) ? null : valueA;
        const dateB = Number.isNaN(valueB) ? null : valueB;
        if (dateA === null && dateB === null) return 0;
        if (dateA === null) return 1;
        if (dateB === null) return -1;
        return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
    });


    // =====================================================
    // Loading State
    // =====================================================

    if (loading) {

        return (

            <div className="management-products-table-panel">

                <div className="management-products-table-state">

                    <div className="management-table-spinner" />

                    <p>
                        Loading orders...
                    </p>

                </div>

            </div>

        );

    }


    // =====================================================
    // Empty State
    // =====================================================

    if (!orders || orders.length === 0) {

        return (

            <div className="management-products-table-panel">

                <div className="management-products-table-state">

                    <div className="management-table-empty-icon">
                        —
                    </div>

                    <h3>
                        No orders found
                    </h3>

                    <p>
                        There are no orders matching
                        the current filter.
                    </p>

                </div>

            </div>

        );

    }


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
            amount === undefined ||
            Number.isNaN(Number(amount))
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
    // Available Order Statuses
    // =====================================================

    const ORDER_STATUSES = [
        "PLACED",
        "CONFIRMED",
        "SHIPPED",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED"
    ];


    // =====================================================
    // Update Order Status
    // =====================================================

    const handleStatusChange = async (
        orderId,
        newStatus
    ) => {

        if (!orderId || !newStatus) {
            return;
        }

        try {

            setUpdatingOrderId(orderId);

            setUpdateError("");


            await apiRequest(
                `/api/management/orders/${encodeURIComponent(
                    orderId
                )}/status`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );


            if (onOrderUpdated) {

                await onOrderUpdated();

            }

        } catch (requestError) {

            console.error(
                "Management order status update error:",
                requestError
            );


            setUpdateError(
                requestError.message ||
                "Unable to update order status."
            );

        } finally {

            setUpdatingOrderId("");

        }

    };


    // =====================================================
    // Order Table
    // =====================================================

    return (

        <>

            {updateError && (

                <div
                    className="management-orders-update-error"
                    role="alert"
                >

                    <span>
                        {updateError}
                    </span>

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={() =>
                            setUpdateError("")
                        }
                    >
                        Dismiss
                    </button>

                </div>

            )}


            <div className="management-products-table-panel">

                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", padding: "14px 16px 0", flexWrap: "wrap" }}>
                    <label htmlFor="management-orders-sort" style={{ fontSize: "13px", fontWeight: 600 }}>Sort by</label>
                    <select
                        id="management-orders-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        style={{ minHeight: "36px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff" }}
                    >
                        <option value="date-desc">Date: Newest to Oldest</option>
                        <option value="date-asc">Date: Oldest to Newest</option>
                        <option value="price-desc">Total: High to Low</option>
                        <option value="price-asc">Total: Low to High</option>
                    </select>
                </div>

                <div className="management-products-table-wrapper">

                    <table className="management-products-table">

                        <thead>

                            <tr>

                                <th>
                                    Order
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Items
                                </th>

                                <th>
                                    Payment
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {sortedOrders.map(
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


                                    const currentStatus =
                                        (
                                            order.status ||
                                            ""
                                        )
                                            .trim()
                                            .toUpperCase();


                                    const isUpdating =
                                        updatingOrderId ===
                                        order.orderId;


                                    return (

                                        <tr
                                            key={
                                                order.orderId
                                            }
                                        >

                                            {/* ORDER */}

                                            <td>

                                                <div className="management-order-info">

                                                    <strong>
                                                        {order.orderId ||
                                                            "—"}
                                                    </strong>

                                                    <span>
                                                        {order.paymentMethod ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* CUSTOMER */}

                                            <td>

                                                <div className="management-order-info">

                                                    <strong>
                                                        {order.customerName ||
                                                            "Unknown customer"}
                                                    </strong>

                                                    <span>
                                                        {order.email ||
                                                            "—"}
                                                    </span>

                                                </div>

                                            </td>


                                            {/* DATE */}

                                            <td>

                                                {formatDate(
                                                    order.createdAt
                                                )}

                                            </td>


                                            {/* ITEMS */}

                                            <td>

                                                {itemCount}

                                            </td>


                                            {/* PAYMENT */}

                                            <td>

                                                {order.paymentMethod ||
                                                    "—"}

                                            </td>


                                            {/* TOTAL */}

                                            <td>

                                                <strong className="management-order-total">

                                                    {formatAmount(
                                                        order.total
                                                    )}

                                                </strong>

                                            </td>


                                            {/* STATUS */}

                                            <td>

                                                <div className="management-order-status-control">

                                                    <span
                                                        className={
                                                            `management-order-status ${getStatusClass(
                                                                currentStatus
                                                            )}`
                                                        }
                                                    >

                                                        {(
                                                            currentStatus ||
                                                            "UNKNOWN"
                                                        ).replaceAll(
                                                            "_",
                                                            " "
                                                        )}

                                                    </span>


                                                    <select
                                                        className="management-order-status-select"
                                                        value=""
                                                        disabled={
                                                            isUpdating
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            handleStatusChange(
                                                                order.orderId,
                                                                event.target.value
                                                            )
                                                        }
                                                    >

                                                        <option
                                                            value=""
                                                            disabled
                                                        >
                                                            {isUpdating
                                                                ? "Updating..."
                                                                : "Update"}
                                                        </option>


                                                        {ORDER_STATUSES.map(
                                                            (
                                                                status
                                                            ) => (

                                                                <option
                                                                    key={
                                                                        status
                                                                    }
                                                                    value={
                                                                        status
                                                                    }
                                                                >
                                                                    {status.replaceAll(
                                                                        "_",
                                                                        " "
                                                                    )}
                                                                </option>

                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    type="button"
                                                    className="management-order-details-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/management/orders/${encodeURIComponent(
                                                                order.orderId
                                                            )}`
                                                        )
                                                    }
                                                >
                                                    View Details
                                                </button>

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </>

    );

}


export default OrderTable;