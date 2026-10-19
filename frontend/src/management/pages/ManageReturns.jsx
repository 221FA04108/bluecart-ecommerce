import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    apiRequest
} from "../../Services/api";

import "../styles/Management.css";


const RETURN_FILTERS = [
    { value: "ALL", label: "All Returns" },
    { value: "REQUESTED", label: "Requested" },
    { value: "APPROVED", label: "Approved" },
    { value: "PICKUP_SCHEDULED", label: "Pickup Scheduled" },
    { value: "PICKED_UP", label: "Picked Up" },
    { value: "RECEIVED", label: "Received" },
    { value: "INSPECTED", label: "Inspected" },
    { value: "REFUND_INITIATED", label: "Refund Initiated" },
    { value: "REFUNDED", label: "Refunded" },
    { value: "REJECTED", label: "Rejected" },
];


const STATUS_LABELS = {
    REQUESTED: "Requested",
    APPROVED: "Approved",
    PICKUP_SCHEDULED: "Pickup Scheduled",
    PICKED_UP: "Picked Up",
    RECEIVED: "Received",
    INSPECTED: "Inspected",
    REFUND_INITIATED: "Refund Initiated",
    REFUNDED: "Refunded",
    REJECTED: "Rejected",
};


const STATUS_CLASS_NAMES = {
    REQUESTED: "management-return-status-requested",
    APPROVED: "management-return-status-approved",
    PICKUP_SCHEDULED: "management-return-status-pickup",
    PICKED_UP: "management-return-status-pickup",
    RECEIVED: "management-return-status-received",
    INSPECTED: "management-return-status-inspected",
    REFUND_INITIATED: "management-return-status-refund",
    REFUNDED: "management-return-status-refunded",
    REJECTED: "management-return-status-rejected",
};


/*
 * These transitions mirror the backend ReturnService.
 *
 * The frontend uses them only to control the available
 * options in the admin dropdown.
 *
 * The backend remains the final authority for validation.
 */
const ALLOWED_STATUS_TRANSITIONS = {
    REQUESTED: [
        "APPROVED",
        "REJECTED"
    ],

    APPROVED: [
        "PICKUP_SCHEDULED",
        "REJECTED"
    ],

    PICKUP_SCHEDULED: [
        "PICKED_UP"
    ],

    PICKED_UP: [
        "RECEIVED"
    ],

    RECEIVED: [
        "INSPECTED"
    ],

    INSPECTED: [
        "REFUND_INITIATED",
        "REJECTED"
    ],

    REFUND_INITIATED: [
        "REFUNDED"
    ],

    REFUNDED: [],

    REJECTED: []
};


const formatCurrency = (value) => {
    const amount = Number(value || 0);

    return `₹${amount.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
};


const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};


const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};


const getReasonLabel = (reason) => {
    const labels = {
        DAMAGED_PRODUCT: "Damaged Product",
        DEFECTIVE_PRODUCT: "Defective Product",
        WRONG_PRODUCT: "Wrong Product",
        MISSING_PARTS: "Missing Parts",
        NOT_AS_DESCRIBED: "Not as Described",
        OTHER: "Other"
    };

    return labels[reason] || reason || "-";
};


const getAvailableStatuses = (currentStatus) => {
    return [
        currentStatus,
        ...(ALLOWED_STATUS_TRANSITIONS[currentStatus] || [])
    ];
};


function ManageReturns() {

    const [activeFilter, setActiveFilter] =
        useState("ALL");

    const [sortBy, setSortBy] = useState("date-desc");


    const [returns, setReturns] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [selectedReturn, setSelectedReturn] =
        useState(null);


    const [selectedStatus, setSelectedStatus] =
        useState("");


    const [adminRemarks, setAdminRemarks] =
        useState("");


    const [updatingReturnId, setUpdatingReturnId] =
        useState("");


    const [updateError, setUpdateError] =
        useState("");


    /*
     * =====================================================
     * FETCH RETURNS
     * =====================================================
     */

    const fetchReturns = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                const data =
                    await apiRequest(
                        "/api/management/returns"
                    );


                setReturns(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (requestError) {

                console.error(
                    "Management return load error:",
                    requestError
                );


                setReturns([]);


                setError(
                    requestError.message ||
                    "Unable to load return requests."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    /*
     * =====================================================
     * INITIAL LOAD
     * =====================================================
     */

    useEffect(() => {

        fetchReturns();

    }, [fetchReturns]);


    /*
     * =====================================================
     * OPEN RETURN DETAILS
     * =====================================================
     */

    const openReturnDetails = (returnItem) => {

        setSelectedReturn(returnItem);

        setSelectedStatus(
            returnItem.returnStatus || ""
        );

        setAdminRemarks(
            returnItem.adminRemarks || ""
        );

        setUpdateError("");

    };


    /*
     * =====================================================
     * CLOSE RETURN DETAILS
     * =====================================================
     */

    const closeReturnDetails = () => {

        if (updatingReturnId) {
            return;
        }

        setSelectedReturn(null);

        setSelectedStatus("");

        setAdminRemarks("");

        setUpdateError("");

    };


    /*
     * =====================================================
     * UPDATE RETURN STATUS
     * =====================================================
     */

    const handleStatusUpdate = async () => {

        if (!selectedReturn) {
            return;
        }

        if (!selectedStatus) {
            setUpdateError(
                "Please select a return status."
            );
            return;
        }

        if (
            selectedStatus === selectedReturn.returnStatus &&
            adminRemarks === (selectedReturn.adminRemarks || "")
        ) {
            setUpdateError(
                "No changes were made."
            );
            return;
        }

        const currentStatus =
            selectedReturn.returnStatus;

        const allowedStatuses =
            ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

        /*
         * Frontend validation.
         * Backend remains the final authority.
         */
        if (
            selectedStatus !== currentStatus &&
            !allowedStatuses.includes(selectedStatus)
        ) {
            setUpdateError(
                `Invalid status transition from ${
                    STATUS_LABELS[currentStatus] || currentStatus
                } to ${
                    STATUS_LABELS[selectedStatus] || selectedStatus
                }.`
            );
            return;
        }

        try {

            setUpdatingReturnId(
                selectedReturn.returnId
            );

            setUpdateError("");

            /*
             * STEP 1
             * Update the status in the backend.
             *
             * The PUT response contains only:
             * message, returnId and status.
             */
            await apiRequest(
                `/api/management/returns/${encodeURIComponent(
                    selectedReturn.returnId
                )}/status`,
                {
                    method: "PUT",

                    body: JSON.stringify({
                        status: selectedStatus,
                        adminRemarks: adminRemarks.trim()
                    })
                }
            );

            /*
             * STEP 2
             * Refresh the table from the backend so the status badge,
             * filters and statistics reflect the updated database value.
             */
            await fetchReturns();

            /*
             * STEP 3
             * The status update was successful, so close the
             * return-details layout/modal automatically.
             */
            setSelectedReturn(null);
            setSelectedStatus("");
            setAdminRemarks("");
            setUpdateError("");

        } catch (requestError) {

            console.error(
                "Return status update error:",
                requestError
            );

            setUpdateError(
                requestError.message ||
                "Unable to update return status."
            );

        } finally {

            setUpdatingReturnId("");

        }

    };


    /*
     * =====================================================
     * FILTER RETURNS
     * =====================================================
     */

    const filteredReturns =
        activeFilter === "ALL"
            ? returns
            : returns.filter(
                  (item) =>
                      item.returnStatus ===
                      activeFilter
              );

    const sortedReturns = [...filteredReturns].sort((a, b) => {
        if (sortBy === "price-asc" || sortBy === "price-desc") {
            const amountA = Number(a.itemTotal);
            const amountB = Number(b.itemTotal);
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


    /*
     * =====================================================
     * RETURN STATISTICS
     * =====================================================
     */

    const totalReturns =
        returns.length;


    const requestedReturns =
        returns.filter(
            (item) =>
                item.returnStatus ===
                "REQUESTED"
        ).length;


    const inProgressReturns =
        returns.filter(
            (item) =>
                [
                    "APPROVED",
                    "PICKUP_SCHEDULED",
                    "PICKED_UP",
                    "RECEIVED",
                    "INSPECTED",
                    "REFUND_INITIATED"
                ].includes(
                    item.returnStatus
                )
        ).length;


    const completedReturns =
        returns.filter(
            (item) =>
                [
                    "REFUNDED",
                    "REJECTED"
                ].includes(
                    item.returnStatus
                )
        ).length;


    /*
     * =====================================================
     * PAGE
     * =====================================================
     */

    return (

        <div className="management-returns-page">


            {/* =========================================
                PAGE HEADING
            ========================================= */}

            <div className="management-page-heading">

                <div>

                    <h1>
                        Manage Returns
                    </h1>

                    <p>
                        Review and process customer
                        return requests from delivered
                        orders.
                    </p>

                </div>

            </div>


            {/* =========================================
                ERROR
            ========================================= */}

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
                        onClick={fetchReturns}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =========================================
                RETURN STATISTICS
            ========================================= */}

            <div className="management-returns-stats">


                <div className="management-return-stat-card">

                    <div className="management-return-stat-top">

                        <span>
                            Total Returns
                        </span>

                        <span className="management-return-stat-icon">
                            ↩
                        </span>

                    </div>

                    <strong>
                        {totalReturns}
                    </strong>

                    <small>
                        All return requests
                    </small>

                </div>


                <div className="management-return-stat-card">

                    <div className="management-return-stat-top">

                        <span>
                            Requested
                        </span>

                        <span className="management-return-stat-icon warning">
                            !
                        </span>

                    </div>

                    <strong>
                        {requestedReturns}
                    </strong>

                    <small>
                        Awaiting review
                    </small>

                </div>


                <div className="management-return-stat-card">

                    <div className="management-return-stat-top">

                        <span>
                            In Progress
                        </span>

                        <span className="management-return-stat-icon progress">
                            ↻
                        </span>

                    </div>

                    <strong>
                        {inProgressReturns}
                    </strong>

                    <small>
                        Active return requests
                    </small>

                </div>


                <div className="management-return-stat-card">

                    <div className="management-return-stat-top">

                        <span>
                            Completed
                        </span>

                        <span className="management-return-stat-icon success">
                            ✓
                        </span>

                    </div>

                    <strong>
                        {completedReturns}
                    </strong>

                    <small>
                        Closed return requests
                    </small>

                </div>

            </div>


            {/* =========================================
                FILTERS
            ========================================= */}

            <div className="management-returns-filters">

                {RETURN_FILTERS.map(
                    (filter) => {

                        const count =
                            filter.value ===
                            "ALL"
                                ? returns.length
                                : returns.filter(
                                      (item) =>
                                          item.returnStatus ===
                                          filter.value
                                  ).length;


                        return (

                            <button
                                key={
                                    filter.value
                                }
                                type="button"
                                className={`management-return-filter ${
                                    activeFilter ===
                                    filter.value
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveFilter(
                                        filter.value
                                    )
                                }
                            >

                                <span>
                                    {
                                        filter.label
                                    }
                                </span>

                                <span className="management-return-filter-count">
                                    {count}
                                </span>

                            </button>

                        );

                    }
                )}

            </div>


            {/* =========================================
                RETURN TABLE
            ========================================= */}

            <section className="management-returns-table-panel">


                <div className="management-returns-table-header">

                    <div>

                        <h2>
                            Return Requests
                        </h2>

                        <p>
                            {filteredReturns.length}{" "}

                            {
                                filteredReturns.length ===
                                1
                                    ? "return request"
                                    : "return requests"
                            }

                        </p>

                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <label htmlFor="management-returns-sort" style={{ fontSize: "13px", fontWeight: 600 }}>Sort by</label>
                        <select
                            id="management-returns-sort"
                            value={sortBy}
                            onChange={(event) => setSortBy(event.target.value)}
                            style={{ minHeight: "36px", padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", background: "#fff" }}
                        >
                            <option value="date-desc">Date: Newest to Oldest</option>
                            <option value="date-asc">Date: Oldest to Newest</option>
                            <option value="price-desc">Amount: High to Low</option>
                            <option value="price-asc">Amount: Low to High</option>
                        </select>
                    </div>

                </div>


                <div className="management-returns-table-wrapper">

                    <table className="management-returns-table">

                        <thead>

                            <tr>

                                <th>
                                    Return ID
                                </th>

                                <th>
                                    Order
                                </th>

                                <th>
                                    Product
                                </th>

                                <th>
                                    Customer
                                </th>

                                <th>
                                    Reason
                                </th>

                                <th>
                                    Amount
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Requested
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {loading ? (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="management-returns-empty-cell"
                                    >

                                        <div className="management-returns-empty-state">

                                            <div className="management-table-spinner" />

                                            <h3>
                                                Loading return requests
                                            </h3>

                                            <p>
                                                Fetching return data from the database.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            ) : filteredReturns.length >
                              0 ? (

                                sortedReturns.map(
                                    (item) => (

                                        <tr
                                            key={
                                                item.returnId
                                            }
                                        >


                                            <td>

                                                <strong className="management-return-id">

                                                    {
                                                        item.returnId
                                                    }

                                                </strong>

                                            </td>


                                            <td>

                                                <span className="management-return-order-id">

                                                    {
                                                        item.orderId
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <div className="management-return-product">


                                                    <div className="management-return-product-image">

                                                        {item.productImage ? (

                                                            <img
                                                                src={
                                                                    item.productImage
                                                                }
                                                                alt={
                                                                    item.productName ||
                                                                    "Product"
                                                                }
                                                            />

                                                        ) : (

                                                            <span>
                                                                —
                                                            </span>

                                                        )}

                                                    </div>


                                                    <div className="management-return-product-info">

                                                        <strong>

                                                            {
                                                                item.productName ||
                                                                item.productId
                                                            }

                                                        </strong>

                                                        <span>
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>

                                                    </div>


                                                </div>

                                            </td>


                                            <td>

                                                <span className="management-return-customer">

                                                    {
                                                        item.userId
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span className="management-return-reason">

                                                    {
                                                        getReasonLabel(
                                                            item.returnReason
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <strong className="management-return-amount">

                                                    {
                                                        formatCurrency(
                                                            item.itemTotal
                                                        )
                                                    }

                                                </strong>

                                            </td>


                                            <td>

                                                <span
                                                    className={`management-return-status ${
                                                        STATUS_CLASS_NAMES[
                                                            item.returnStatus
                                                        ] ||
                                                        "management-return-status-default"
                                                    }`}
                                                >

                                                    {
                                                        STATUS_LABELS[
                                                            item.returnStatus
                                                        ] ||
                                                        item.returnStatus
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <span className="management-return-date">

                                                    {
                                                        formatDate(
                                                            item.requestedAt
                                                        )
                                                    }

                                                </span>

                                            </td>


                                            <td>

                                                <button
                                                    type="button"
                                                    className="management-return-view-button"
                                                    onClick={() =>
                                                        openReturnDetails(
                                                            item
                                                        )
                                                    }
                                                >
                                                    View
                                                </button>

                                            </td>


                                        </tr>

                                    )
                                )

                            ) : (

                                <tr>

                                    <td
                                        colSpan="9"
                                        className="management-returns-empty-cell"
                                    >

                                        <div className="management-returns-empty-state">

                                            <div className="management-returns-empty-icon">
                                                ↩
                                            </div>

                                            <h3>
                                                No return requests
                                            </h3>

                                            <p>
                                                There are currently no
                                                return requests for
                                                this filter.
                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )}

                        </tbody>

                    </table>

                </div>

            </section>


            {/* =========================================
                RETURN DETAILS MODAL
            ========================================= */}

            {selectedReturn && (

                <div
                    className="management-delete-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeReturnDetails();
                        }

                    }}
                >

                    <div className="management-delete-modal">


                        <div className="management-delete-modal-content">


                            <div className="management-return-product">

                                <div className="management-return-product-image">

                                    {selectedReturn.productImage ? (

                                        <img
                                            src={
                                                selectedReturn.productImage
                                            }
                                            alt={
                                                selectedReturn.productName ||
                                                "Product"
                                            }
                                        />

                                    ) : (

                                        <span>
                                            ↩
                                        </span>

                                    )}

                                </div>


                                <div className="management-return-product-info">

                                    <strong>
                                        {
                                            selectedReturn.productName ||
                                            selectedReturn.productId
                                        }
                                    </strong>

                                    <span>
                                        Return ID:{" "}
                                        {
                                            selectedReturn.returnId
                                        }
                                    </span>

                                </div>

                            </div>


                            <h2>
                                Return Details
                            </h2>


                            <p>
                                <strong>
                                    Order:
                                </strong>{" "}
                                {
                                    selectedReturn.orderId
                                }
                            </p>


                            <p>
                                <strong>
                                    Customer:
                                </strong>{" "}
                                {
                                    selectedReturn.userId
                                }
                            </p>


                            <p>
                                <strong>
                                    Product ID:
                                </strong>{" "}
                                {
                                    selectedReturn.productId
                                }
                            </p>


                            <p>
                                <strong>
                                    Quantity:
                                </strong>{" "}
                                {
                                    selectedReturn.quantity
                                }
                            </p>


                            <p>
                                <strong>
                                    Amount:
                                </strong>{" "}
                                {
                                    formatCurrency(
                                        selectedReturn.itemTotal
                                    )
                                }
                            </p>


                            <p>
                                <strong>
                                    Reason:
                                </strong>{" "}
                                {
                                    getReasonLabel(
                                        selectedReturn.returnReason
                                    )
                                }
                            </p>


                            {selectedReturn.returnReason ===
                                "OTHER" &&
                                selectedReturn.otherReturnReason && (

                                    <p>
                                        <strong>
                                            Customer Explanation:
                                        </strong>{" "}
                                        {
                                            selectedReturn.otherReturnReason
                                        }
                                    </p>

                                )}


                            <p>
                                <strong>
                                    Requested:
                                </strong>{" "}
                                {
                                    formatDateTime(
                                        selectedReturn.requestedAt
                                    )
                                }
                            </p>


                            {selectedReturn.approvedAt && (

                                <p>
                                    <strong>
                                        Approved:
                                    </strong>{" "}
                                    {
                                        formatDateTime(
                                            selectedReturn.approvedAt
                                        )
                                    }
                                </p>

                            )}


                            {selectedReturn.rejectedAt && (

                                <p>
                                    <strong>
                                        Rejected:
                                    </strong>{" "}
                                    {
                                        formatDateTime(
                                            selectedReturn.rejectedAt
                                        )
                                    }
                                </p>

                            )}


                            {selectedReturn.completedAt && (

                                <p>
                                    <strong>
                                        Completed:
                                    </strong>{" "}
                                    {
                                        formatDateTime(
                                            selectedReturn.completedAt
                                        )
                                    }
                                </p>

                            )}


                            <div
                                style={{
                                    marginTop: "20px",
                                    paddingTop: "18px",
                                    borderTop:
                                        "1px solid #edf0f2"
                                }}
                            >

                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "7px",
                                        color: "#374151",
                                        fontSize: "12px",
                                        fontWeight: 600
                                    }}
                                >
                                    Return Status
                                </label>


                                <select
                                    value={
                                        selectedStatus
                                    }
                                    onChange={(event) =>
                                        setSelectedStatus(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        updatingReturnId ===
                                        selectedReturn.returnId ||
                                        (
                                            ALLOWED_STATUS_TRANSITIONS[
                                                selectedReturn.returnStatus
                                            ] || []
                                        ).length === 0
                                    }
                                    style={{
                                        width: "100%",
                                        minHeight: "40px",
                                        padding:
                                            "0 11px",
                                        boxSizing:
                                            "border-box",
                                        border:
                                            "1px solid #d1d5db",
                                        borderRadius:
                                            "6px",
                                        background:
                                            "#ffffff",
                                        color:
                                            "#111827",
                                        fontFamily:
                                            "inherit",
                                        fontSize:
                                            "13px",
                                        outline:
                                            "none"
                                    }}
                                >

                                    {getAvailableStatuses(
                                        selectedReturn.returnStatus
                                    ).map(
                                        (status) => (

                                            <option
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {
                                                    STATUS_LABELS[
                                                        status
                                                    ] ||
                                                    status
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            <div
                                style={{
                                    marginTop: "15px"
                                }}
                            >

                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "7px",
                                        color: "#374151",
                                        fontSize: "12px",
                                        fontWeight: 600
                                    }}
                                >
                                    Admin Remarks
                                </label>


                                <textarea
                                    value={
                                        adminRemarks
                                    }
                                    onChange={(event) =>
                                        setAdminRemarks(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Add remarks about this return..."
                                    disabled={
                                        updatingReturnId ===
                                        selectedReturn.returnId
                                    }
                                    style={{
                                        width: "100%",
                                        minHeight:
                                            "90px",
                                        padding:
                                            "10px 11px",
                                        boxSizing:
                                            "border-box",
                                        border:
                                            "1px solid #d1d5db",
                                        borderRadius:
                                            "6px",
                                        background:
                                            "#ffffff",
                                        color:
                                            "#111827",
                                        fontFamily:
                                            "inherit",
                                        fontSize:
                                            "13px",
                                        resize:
                                            "vertical",
                                        outline:
                                            "none"
                                    }}
                                />

                            </div>


                            {updateError && (

                                <div
                                    className="management-orders-update-error"
                                    role="alert"
                                    style={{
                                        marginTop:
                                            "14px"
                                    }}
                                >
                                    {updateError}
                                </div>

                            )}


                            <div className="management-delete-modal-actions">


                                <button
                                    type="button"
                                    className="management-secondary-button"
                                    onClick={
                                        closeReturnDetails
                                    }
                                    disabled={
                                        updatingReturnId ===
                                        selectedReturn.returnId
                                    }
                                >
                                    Close
                                </button>


                                <button
                                    type="button"
                                    className="management-primary-button"
                                    onClick={
                                        handleStatusUpdate
                                    }
                                    disabled={
                                        updatingReturnId ===
                                        selectedReturn.returnId ||
                                        (
                                            ALLOWED_STATUS_TRANSITIONS[
                                                selectedReturn.returnStatus
                                            ] || []
                                        ).length === 0
                                    }
                                >

                                    {updatingReturnId ===
                                    selectedReturn.returnId
                                        ? "Updating..."
                                        : "Update Return"}

                                </button>

                            </div>


                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}


export default ManageReturns;