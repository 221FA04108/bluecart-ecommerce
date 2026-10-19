package com.bluecart.bluecart_backend.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.model.CancellationRequest;
import com.bluecart.bluecart_backend.model.Order;
import com.bluecart.bluecart_backend.repository.CancellationRequestRepository;
import com.bluecart.bluecart_backend.repository.OrderRepository;

@Service
public class CancellationRequestService {

    private final CancellationRequestRepository cancellationRequestRepository;
    private final OrderRepository orderRepository;


    public CancellationRequestService(
            CancellationRequestRepository cancellationRequestRepository,
            OrderRepository orderRepository) {

        this.cancellationRequestRepository =
                cancellationRequestRepository;

        this.orderRepository =
                orderRepository;
    }


    // =====================================================
    // VALID CANCELLATION REQUEST STATUSES
    // =====================================================

    private static final String REQUESTED =
            "REQUESTED";

    private static final String APPROVED =
            "APPROVED";

    private static final String REJECTED =
            "REJECTED";


    // =====================================================
    // ORDER STATUSES WHERE CUSTOMER CAN RAISE
    // CANCELLATION REQUEST
    // =====================================================

    private static final String SHIPPED =
            "SHIPPED";

    private static final String IN_TRANSIT =
            "IN_TRANSIT";

    private static final String OUT_FOR_DELIVERY =
            "OUT_FOR_DELIVERY";


    // =====================================================
    // CREATE CANCELLATION REQUEST
    // =====================================================

    public CancellationRequest createCancellationRequest(
            String userId,
            String orderId,
            String reason) {

        // =================================================
        // 1. Validate user
        // =================================================

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User is not authenticated."
            );
        }


        // =================================================
        // 2. Validate order ID
        // =================================================

        if (orderId == null || orderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }


        // =================================================
        // 3. Validate cancellation reason
        // =================================================

        if (reason == null || reason.isBlank()) {

            throw new IllegalArgumentException(
                    "Cancellation reason is required."
            );
        }


        String cleanedReason =
                reason.trim();


        // =================================================
        // 4. Find order
        // =================================================

        Order order =
                orderRepository.findById(orderId);


        // =================================================
        // 5. Verify order ownership
        // =================================================

        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }


        // =================================================
        // 6. Get current order status
        // =================================================

        String orderStatus =
                order.getStatus();


        // =================================================
        // 7. Already cancelled
        // =================================================

        if ("CANCELLED".equals(orderStatus)) {

            throw new IllegalArgumentException(
                    "This order has already been cancelled."
            );
        }


        // =================================================
        // 8. PLACED / CONFIRMED
        //
        // These statuses support direct cancellation.
        // A cancellation request should NOT be raised.
        // =================================================

        if ("PLACED".equals(orderStatus)
                || "CONFIRMED".equals(orderStatus)) {

            throw new IllegalArgumentException(
                    "This order can be cancelled directly. "
                    + "A cancellation request is not required."
            );
        }


        // =================================================
        // 9. DELIVERED
        //
        // Delivered orders should use the return workflow.
        // =================================================

        if ("DELIVERED".equals(orderStatus)) {

            throw new IllegalArgumentException(
                    "This order has already been delivered. "
                    + "Please use the return process."
            );
        }


        // =================================================
        // 10. Check whether cancellation request is allowed
        // =================================================

        if (!SHIPPED.equals(orderStatus)
                && !IN_TRANSIT.equals(orderStatus)
                && !OUT_FOR_DELIVERY.equals(orderStatus)) {

            throw new IllegalArgumentException(
                    "A cancellation request cannot be raised "
                    + "for the current order status."
            );
        }


        // =================================================
        // 11. Check for existing active request
        // =================================================

        List<CancellationRequest> existingRequests =
                cancellationRequestRepository
                        .findByUserId(userId);


        for (CancellationRequest existingRequest
                : existingRequests) {

            if (!orderId.equals(
                    existingRequest.getOrderId())) {

                continue;
            }


            String existingStatus =
                    existingRequest.getRequestStatus();


            if (REQUESTED.equals(existingStatus)) {

                throw new IllegalArgumentException(
                        "A cancellation request for this order "
                        + "is already pending."
                );
            }


            if (APPROVED.equals(existingStatus)) {

                throw new IllegalArgumentException(
                        "This order already has an approved "
                        + "cancellation request."
                );
            }
        }


        // =================================================
        // 12. Create cancellation request
        // =================================================

        CancellationRequest request =
                new CancellationRequest();


        request.setRequestId(
                "CR-"
                        + UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
        );


        request.setOrderId(
                orderId
        );


        request.setUserId(
                userId
        );


        request.setReason(
                cleanedReason
        );


        request.setRequestStatus(
                REQUESTED
        );


        request.setRequestedAt(
                Instant.now().toString()
        );


        // processedAt remains null
        // because the admin has not processed it yet.


        // =================================================
        // 13. Save ONLY to CancellationRequests table
        // =================================================

        return cancellationRequestRepository.save(
                request
        );
    }


    // =====================================================
    // GET CUSTOMER'S CANCELLATION REQUESTS
    // =====================================================

    public List<CancellationRequest> getMyCancellationRequests(
            String userId) {

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User is not authenticated."
            );
        }


        return cancellationRequestRepository
                .findByUserId(userId);
    }


    // =====================================================
    // GET CANCELLATION REQUEST FOR A PARTICULAR ORDER
    // =====================================================

    public List<CancellationRequest> getCancellationRequestsForOrder(
            String userId,
            String orderId) {

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User is not authenticated."
            );
        }


        if (orderId == null || orderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }


        Order order =
                orderRepository.findById(orderId);


        // =================================================
        // Verify ownership
        // =================================================

        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }


        return cancellationRequestRepository
                .findByUserId(userId)
                .stream()
                .filter(request ->
                        orderId.equals(
                                request.getOrderId()
                        )
                )
                .toList();
    }


    // =====================================================
    // MANAGEMENT - GET ALL CANCELLATION REQUESTS
    // =====================================================

    public List<CancellationRequest>
    getAllCancellationRequests() {

        return cancellationRequestRepository
                .findAll();
    }


    // =====================================================
    // MANAGEMENT - GET REQUEST BY ID
    // =====================================================

    public CancellationRequest getCancellationRequestById(
            String requestId) {

        if (requestId == null || requestId.isBlank()) {

            throw new IllegalArgumentException(
                    "Cancellation request ID is required."
            );
        }


        CancellationRequest request =
                cancellationRequestRepository
                        .findById(requestId);


        if (request == null) {

            throw new IllegalArgumentException(
                    "Cancellation request was not found."
            );
        }


        return request;
    }


    // =====================================================
    // MANAGEMENT - APPROVE / REJECT REQUEST
    // =====================================================

    public CancellationRequest updateCancellationRequestStatus(
            String requestId,
            String requestedStatus,
            String adminRemarks) {

        // =================================================
        // 1. Validate request ID
        // =================================================

        if (requestId == null || requestId.isBlank()) {

            throw new IllegalArgumentException(
                    "Cancellation request ID is required."
            );
        }


        // =================================================
        // 2. Validate requested status
        // =================================================

        if (requestedStatus == null
                || requestedStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Cancellation request status is required."
            );
        }


        String newStatus =
                requestedStatus
                        .trim()
                        .toUpperCase();


        if (!APPROVED.equals(newStatus)
                && !REJECTED.equals(newStatus)) {

            throw new IllegalArgumentException(
                    "Invalid cancellation request status."
            );
        }


        // =================================================
        // 3. Find cancellation request
        // =================================================

        CancellationRequest request =
                cancellationRequestRepository
                        .findById(requestId);


        if (request == null) {

            throw new IllegalArgumentException(
                    "Cancellation request was not found."
            );
        }


        // =================================================
        // 4. Request must still be REQUESTED
        // =================================================

        if (!REQUESTED.equals(
                request.getRequestStatus())) {

            throw new IllegalArgumentException(
                    "This cancellation request has already been processed."
            );
        }


        // =================================================
        // 5. Find associated order
        // =================================================

        Order order =
                orderRepository.findById(
                        request.getOrderId()
                );


        if (order == null) {

            throw new IllegalArgumentException(
                    "Associated order was not found."
            );
        }


        // =================================================
        // 6. APPROVE CANCELLATION
        // =================================================

        if (APPROVED.equals(newStatus)) {

            String currentOrderStatus =
                    order.getStatus();


            // =============================================
            // Order must still be cancellable through
            // the cancellation-request workflow.
            // =============================================

            if (!SHIPPED.equals(currentOrderStatus)
                    && !IN_TRANSIT.equals(currentOrderStatus)
                    && !OUT_FOR_DELIVERY.equals(
                            currentOrderStatus)) {

                throw new IllegalArgumentException(
                        "This order can no longer be "
                        + "cancelled through this request."
                );
            }


            // =============================================
            // Update order
            // =============================================

            String now =
                    Instant.now().toString();


            order.setStatus(
                    "CANCELLED"
            );


            order.setCancelledAt(
                    now
            );


            order.setCancellationReason(
                    request.getReason()
            );


            order.setUpdatedAt(
                    now
            );


            // =============================================
            // Save order first
            // =============================================

            orderRepository.save(
                    order
            );


            // =============================================
            // Update cancellation request
            // =============================================

            request.setRequestStatus(
                    APPROVED
            );


            request.setProcessedAt(
                    now
            );


            if (adminRemarks != null
                    && !adminRemarks.isBlank()) {

                request.setAdminRemarks(
                        adminRemarks.trim()
                );
            }


            return cancellationRequestRepository.save(
                    request
            );
        }


        // =================================================
        // 7. REJECT CANCELLATION
        // =================================================

        request.setRequestStatus(
                REJECTED
        );


        request.setProcessedAt(
                Instant.now().toString()
        );


        if (adminRemarks != null
                && !adminRemarks.isBlank()) {

            request.setAdminRemarks(
                    adminRemarks.trim()
            );
        }


        // =================================================
        // IMPORTANT:
        //
        // When rejected, the Orders table is NOT changed.
        // =================================================

        return cancellationRequestRepository.save(
                request
        );
    }
}