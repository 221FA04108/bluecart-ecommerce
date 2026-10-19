import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import OrderTable from "../components/OrderTable";

import { apiRequest } from "../../Services/api";

import "../styles/Management.css";


function ManageOrders() {

    const [orders, setOrders] =
        useState([]);

    const [selectedStatus, setSelectedStatus] =
        useState("All");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // =====================================================
    // Fetch Management Orders
    // =====================================================

    const fetchOrders = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                const data = await apiRequest(
                    "/api/management/orders"
                );


                setOrders(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (requestError) {

                console.error(
                    "Management order load error:",
                    requestError
                );


                setOrders([]);

                setError(
                    requestError.message ||
                    "Unable to load orders."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    // =====================================================
    // Initial Order Load
    // =====================================================

    useEffect(() => {

        fetchOrders();

    }, [fetchOrders]);


    // =====================================================
    // Status Filter
    // =====================================================

    const filteredOrders = useMemo(() => {

        if (selectedStatus === "All") {

            return orders;

        }


        return orders.filter(
            (order) => {

                const status =
                    (
                        order.status ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                return (
                    status ===
                    selectedStatus
                );

            }
        );

    }, [
        orders,
        selectedStatus
    ]);


    // =====================================================
    // Status Counts
    // =====================================================

    const statusCounts = useMemo(() => {

        const counts = {

            All: orders.length,

            CONFIRMED: 0,

            SHIPPED: 0,

            IN_TRANSIT: 0,

            DELIVERED: 0

        };


        orders.forEach(
            (order) => {

                const status =
                    (
                        order.status ||
                        ""
                    )
                        .trim()
                        .toUpperCase();


                if (
                    Object.prototype.hasOwnProperty.call(
                        counts,
                        status
                    )
                ) {

                    counts[status] += 1;

                }

            }
        );


        return counts;

    }, [orders]);


    // =====================================================
    // Filter Tabs
    // =====================================================

    const statusFilters = [

        {
            label: "All",
            value: "All",
            count: statusCounts.All
        },

        {
            label: "Confirmed",
            value: "CONFIRMED",
            count: statusCounts.CONFIRMED
        },

        {
            label: "Shipped",
            value: "SHIPPED",
            count: statusCounts.SHIPPED
        },

        {
            label: "In Transit",
            value: "IN_TRANSIT",
            count: statusCounts.IN_TRANSIT
        },

        {
            label: "Delivered",
            value: "DELIVERED",
            count: statusCounts.DELIVERED
        }

    ];


    // =====================================================
    // Render
    // =====================================================

    return (

        <div className="management-orders-page">

            {/* =================================================
               PAGE HEADING
            ================================================= */}

            <div className="management-page-heading">

                <div>

                    <h1>
                        Manage Orders
                    </h1>

                    <p>
                        Review customer orders and manage
                        their delivery status.
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
                        onClick={fetchOrders}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================================
               STATUS FILTERS
            ================================================= */}

            <div className="management-orders-filters">

                {statusFilters.map(
                    (filter) => (

                        <button
                            key={filter.value}
                            type="button"
                            className={
                                `management-orders-filter ${
                                    selectedStatus ===
                                    filter.value
                                        ? "active"
                                        : ""
                                }`
                                
                            }
                            onClick={() =>
                                setSelectedStatus(
                                    filter.value
                                )
                            }
                        >

                            <span>
                                {filter.label}
                            </span>

                            <span className="management-orders-filter-count">
                                {filter.count}
                            </span>

                        </button>

                    )
                )}

            </div>


            {/* =================================================
               ORDER COUNT
            ================================================= */}

            <div className="management-orders-summary">

                <span>
                    Showing
                </span>

                <strong>
                    {filteredOrders.length}
                </strong>

                <span>
                    {filteredOrders.length === 1
                        ? "order"
                        : "orders"}
                </span>

            </div>


            {/* =================================================
               ORDER TABLE
            ================================================= */}

            <OrderTable
                orders={filteredOrders}
                loading={loading}
                onOrderUpdated={fetchOrders}
            />

        </div>

    );

}


export default ManageOrders;