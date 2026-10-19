import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../Services/api";
import "../styles/Management.css";

const STATUS_FILTERS = [
    {
        value: "ALL",
        label: "All",
    },
    {
        value: "REQUESTED",
        label: "Pending",
    },
    {
        value: "APPROVED",
        label: "Approved / Cancelled",
    },
    {
        value: "REJECTED",
        label: "Rejected",
    },
];

const STATUS_LABELS = {
    REQUESTED: "Pending",
    APPROVED: "Approved / Cancelled",
    REJECTED: "Rejected",
};

function ManageCancellationRequests() {
    const [requests, setRequests] = useState([]);
    const [orderTotals, setOrderTotals] = useState({});
    const [sortBy, setSortBy] = useState("date-desc");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeFilter, setActiveFilter] =
        useState("ALL");

    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [adminRemarks, setAdminRemarks] =
        useState("");

    const [updatingRequestId, setUpdatingRequestId] =
        useState("");

    const [updateError, setUpdateError] =
        useState("");

    const [detailsLoading, setDetailsLoading] =
        useState(false);

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiRequest(
                "/api/management/cancellation-requests"
            );

            const cancellationRequests = Array.isArray(data) ? data : [];
            setRequests(cancellationRequests);

            // Cancellation requests do not contain order totals. Load the
            // existing management orders endpoint to enable price sorting.
            try {
                const orderData = await apiRequest("/api/management/orders");
                const totals = {};
                (Array.isArray(orderData) ? orderData : []).forEach((order) => {
                    if (order?.orderId) totals[order.orderId] = Number(order.total) || 0;
                });
                setOrderTotals(totals);
            } catch (orderError) {
                // Keep cancellation requests usable if order totals cannot load.
                console.warn("Unable to load order totals for cancellation sorting:", orderError);
                setOrderTotals({});
            }

        } catch (err) {
            console.error(
                "Failed to fetch cancellation requests:",
                err
            );

            setError(
                err.message ||
                "Unable to load cancellation requests."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const filteredRequests = useMemo(() => {
        if (activeFilter === "ALL") {
            return requests;
        }

        return requests.filter(
            (request) =>
                (
                    request.requestStatus ||
                    ""
                )
                    .trim()
                    .toUpperCase() ===
                activeFilter
        );
    }, [requests, activeFilter]);

    const sortedRequests = useMemo(() => {
        return [...filteredRequests].sort((a, b) => {
            if (sortBy === "price-asc" || sortBy === "price-desc") {
                const amountA = Number(a.orderTotal ?? a.total ?? a.price ?? orderTotals[a.orderId]);
                const amountB = Number(b.orderTotal ?? b.total ?? b.price ?? orderTotals[b.orderId]);
                const safeA = Number.isFinite(amountA) ? amountA : 0;
                const safeB = Number.isFinite(amountB) ? amountB : 0;
                return sortBy === "price-asc" ? safeA - safeB : safeB - safeA;
            }

            const valueA = a.requestedAt ? new Date(a.requestedAt).getTime() : NaN;
            const valueB = b.requestedAt ? new Date(b.requestedAt).getTime() : NaN;
            const dateA = Number.isNaN(valueA) ? null : valueA;
            const dateB = Number.isNaN(valueB) ? null : valueB;
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1;
            if (dateB === null) return -1;
            return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
        });
    }, [filteredRequests, sortBy, orderTotals]);

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "—";
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
            (status || "")
                .trim()
                .toUpperCase();

        switch (normalizedStatus) {
            case "REQUESTED":
                return "management-order-status-placed";

            case "APPROVED":
                return "management-order-status-cancelled";

            case "REJECTED":
                return "management-order-status-default";

            default:
                return "management-order-status-default";
        }
    };

    const openRequestDetails = async (requestId) => {
        if (!requestId) {
            return;
        }

        try {
            setDetailsLoading(true);
            setUpdateError("");

            const data = await apiRequest(
                `/api/management/cancellation-requests/${encodeURIComponent(
                    requestId
                )}`
            );

            setSelectedRequest(data);

            setSelectedStatus(
                data?.requestStatus || ""
            );

            setAdminRemarks(
                data?.adminRemarks || ""
            );

        } catch (err) {
            setUpdateError(
                err.message ||
                "Unable to load cancellation request details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => {
        if (updatingRequestId) {
            return;
        }

        setSelectedRequest(null);
        setSelectedStatus("");
        setAdminRemarks("");
        setUpdateError("");
    };

    const handleStatusUpdate = async (status) => {
        if (!selectedRequest?.requestId) {
            return;
        }

        if (
            status !== "APPROVED" &&
            status !== "REJECTED"
        ) {
            return;
        }

        try {
            setUpdatingRequestId(
                selectedRequest.requestId
            );

            setUpdateError("");

            await apiRequest(
                `/api/management/cancellation-requests/${encodeURIComponent(
                    selectedRequest.requestId
                )}/status`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        status,
                        adminRemarks:
                            adminRemarks.trim(),
                    }),
                }
            );

            const updatedRequest =
                await apiRequest(
                    `/api/management/cancellation-requests/${encodeURIComponent(
                        selectedRequest.requestId
                    )}`
                );

            setSelectedRequest(
                updatedRequest
            );

            setSelectedStatus(
                updatedRequest?.requestStatus ||
                status
            );

            setAdminRemarks(
                updatedRequest?.adminRemarks ||
                adminRemarks
            );

            await fetchRequests();

        } catch (err) {
            console.error(
                "Cancellation request update error:",
                err
            );

            setUpdateError(
                err.message ||
                "Unable to update cancellation request."
            );
        } finally {
            setUpdatingRequestId("");
        }
    };

    const getRequestStatus = (request) => {
        const status =
            (
                request?.requestStatus ||
                ""
            )
                .trim()
                .toUpperCase();

        return STATUS_LABELS[status] || status || "Unknown";
    };

    if (loading) {
        return (
            <div className="management-products-table-state">
                <div className="management-table-spinner" />

                <p>
                    Loading cancellation requests...
                </p>
            </div>
        );
    }

    return (
        <div className="management-page">

            <div className="management-page-header">

                <div>
                    <span className="management-page-eyebrow">
                        MANAGEMENT
                    </span>

                    <h1>
                        Cancellation Requests
                    </h1>

                    <p>
                        Review and manage customer
                        cancellation requests.
                    </p>
                </div>

            </div>

            {error && (
                <div
                    className="management-orders-update-error"
                    role="alert"
                >
                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={() => {
                            fetchRequests();
                        }}
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Filters */}

            <div className="management-filter-bar">

                {STATUS_FILTERS.map((filter) => (

                    <button
                        type="button"
                        key={filter.value}
                        className={
                            `management-filter-button ${
                                activeFilter ===
                                filter.value
                                    ? "active"
                                    : ""
                            }`
                        }
                        onClick={() =>
                            setActiveFilter(
                                filter.value
                            )
                        }
                    >
                        {filter.label}
                    </button>

                ))}

            </div>

            {/* Sorting */}
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", margin: "14px 0", flexWrap: "wrap" }}>
                <label htmlFor="management-cancellations-sort" style={{ fontSize: "13px", fontWeight: 600 }}>Sort by</label>
                <select
                    id="management-cancellations-sort"
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    style={{ minHeight: "36px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff" }}
                >
                    <option value="date-desc">Date: Newest to Oldest</option>
                    <option value="date-asc">Date: Oldest to Newest</option>
                    <option value="price-desc">Order Total: High to Low</option>
                    <option value="price-asc">Order Total: Low to High</option>
                </select>
            </div>

            {/* Table */}

            {filteredRequests.length === 0 ? (
                <div className="management-products-table-panel">

                    <div className="management-products-table-state">

                        <div className="management-table-empty-icon">
                            —
                        </div>

                        <h3>
                            No cancellation requests
                        </h3>

                        <p>
                            There are no cancellation
                            requests matching the
                            current filter.
                        </p>

                    </div>

                </div>
            ) : (
                <div className="management-products-table-panel">

                    <div className="management-products-table-wrapper">

                        <table className="management-products-table">

                            <thead>

                                <tr>
                                    <th>
                                        Request
                                    </th>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Reason
                                    </th>

                                    <th>
                                        Requested
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

                                {sortedRequests.map(
                                    (request) => {

                                        const status =
                                            (
                                                request.requestStatus ||
                                                ""
                                            )
                                                .trim()
                                                .toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    request.requestId
                                                }
                                            >

                                                <td>
                                                    <div className="management-order-info">

                                                        <strong>
                                                            {
                                                                request.requestId ||
                                                                "—"
                                                            }
                                                        </strong>

                                                        <span>
                                                            Cancellation
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {
                                                            request.orderId ||
                                                            "—"
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="management-order-info">

                                                        <strong>
                                                            {
                                                                request.customerName ||
                                                                request.userId ||
                                                                "Customer"
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                request.email ||
                                                                request.userId ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <div
                                                        style={{
                                                            maxWidth:
                                                                "240px",
                                                            whiteSpace:
                                                                "normal",
                                                        }}
                                                    >
                                                        {
                                                            request.reason ||
                                                            "—"
                                                        }
                                                    </div>
                                                </td>

                                                <td>
                                                    {
                                                        formatDate(
                                                            request.requestedAt
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            `management-order-status ${getStatusClass(
                                                                status
                                                            )}`
                                                        }
                                                    >
                                                        {
                                                            getRequestStatus(
                                                                request
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="management-order-details-button"
                                                        onClick={() =>
                                                            openRequestDetails(
                                                                request.requestId
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
            )}

            {/* Details Modal */}

            {selectedRequest && (
                <div
                    className="management-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                                event.currentTarget &&
                            !updatingRequestId
                        ) {
                            closeDetails();
                        }
                    }}
                >

                    <div className="management-modal">

                        <div className="management-modal-header">

                            <div>

                                <span>
                                    Cancellation Request
                                </span>

                                <h2>
                                    {
                                        selectedRequest.requestId
                                    }
                                </h2>

                            </div>

                            <button
                                type="button"
                                onClick={closeDetails}
                                disabled={
                                    !!updatingRequestId
                                }
                                aria-label="Close"
                            >
                                ×
                            </button>

                        </div>

                        {detailsLoading ? (
                            <div className="management-products-table-state">

                                <div className="management-table-spinner" />

                                <p>
                                    Loading request...
                                </p>

                            </div>
                        ) : (
                            <div className="management-modal-body">

                                <div className="management-detail-grid">

                                    <div>
                                        <span>
                                            Order ID
                                        </span>

                                        <strong>
                                            {
                                                selectedRequest.orderId ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Customer ID
                                        </span>

                                        <strong>
                                            {
                                                selectedRequest.userId ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Requested On
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedRequest.requestedAt
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Processed On
                                        </span>

                                        <strong>
                                            {formatDate(
                                                selectedRequest.processedAt
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Current Status
                                        </span>

                                        <strong>
                                            {
                                                getRequestStatus(
                                                    selectedRequest
                                                )
                                            }
                                        </strong>
                                    </div>

                                </div>

                                <div className="management-detail-section">

                                    <h3>
                                        Customer Reason
                                    </h3>

                                    <p>
                                        {
                                            selectedRequest.reason ||
                                            "No reason provided."
                                        }
                                    </p>

                                </div>

                                <div className="management-detail-section">

                                    <label htmlFor="admin-remarks">
                                        Admin Remarks
                                    </label>

                                    <textarea
                                        id="admin-remarks"
                                        value={
                                            adminRemarks
                                        }
                                        onChange={(event) =>
                                            setAdminRemarks(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter remarks for this cancellation request"
                                        rows="4"
                                        maxLength="500"
                                        disabled={
                                            selectedRequest.requestStatus !==
                                            "REQUESTED" ||
                                            !!updatingRequestId
                                        }
                                    />

                                </div>

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

                                {selectedRequest.requestStatus ===
                                    "REQUESTED" && (
                                    <div className="management-modal-actions">

                                        <button
                                            type="button"
                                            className="management-secondary-button"
                                            onClick={() =>
                                                handleStatusUpdate(
                                                    "REJECTED"
                                                )
                                            }
                                            disabled={
                                                !!updatingRequestId
                                            }
                                        >
                                            {updatingRequestId
                                                ? "Processing..."
                                                : "Reject Request"}
                                        </button>

                                        <button
                                            type="button"
                                            className="management-primary-button"
                                            onClick={() =>
                                                handleStatusUpdate(
                                                    "APPROVED"
                                                )
                                            }
                                            disabled={
                                                !!updatingRequestId
                                            }
                                        >
                                            {updatingRequestId
                                                ? "Processing..."
                                                : "Approve & Cancel Order"}
                                        </button>

                                    </div>
                                )}

                                {selectedRequest.requestStatus ===
                                    "APPROVED" && (
                                    <div className="management-detail-section">

                                        <p>
                                            This cancellation
                                            request was approved
                                            and the associated
                                            order was cancelled.
                                        </p>

                                    </div>
                                )}

                                {selectedRequest.requestStatus ===
                                    "REJECTED" && (
                                    <div className="management-detail-section">

                                        <p>
                                            This cancellation
                                            request was rejected.
                                            The associated order
                                            remains unchanged.
                                        </p>

                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default ManageCancellationRequests;