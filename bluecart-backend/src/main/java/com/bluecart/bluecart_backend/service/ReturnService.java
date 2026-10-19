package com.bluecart.bluecart_backend.service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.dto.ReturnRequest;
import com.bluecart.bluecart_backend.model.Order;
import com.bluecart.bluecart_backend.model.OrderItem;
import com.bluecart.bluecart_backend.model.Return;
import com.bluecart.bluecart_backend.repository.OrderRepository;
import com.bluecart.bluecart_backend.repository.ReturnRepository;

@Service
public class ReturnService {

    private final ReturnRepository returnRepository;
    private final OrderRepository orderRepository;


    public ReturnService(
            ReturnRepository returnRepository,
            OrderRepository orderRepository) {

        this.returnRepository = returnRepository;
        this.orderRepository = orderRepository;
    }


    // =====================================================
    // VALID RETURN REASONS
    // =====================================================

    private static final Set<String> VALID_RETURN_REASONS =
            Set.of(
                    "DAMAGED_PRODUCT",
                    "DEFECTIVE_PRODUCT",
                    "WRONG_PRODUCT",
                    "MISSING_PARTS",
                    "NOT_AS_DESCRIBED",
                    "OTHER"
            );


    // =====================================================
    // ACTIVE RETURN STATUSES
    // =====================================================

    private static final Set<String> ACTIVE_RETURN_STATUSES =
            Set.of(
                    "REQUESTED",
                    "APPROVED",
                    "PICKUP_SCHEDULED",
                    "PICKED_UP",
                    "RECEIVED",
                    "INSPECTED",
                    "REFUND_INITIATED"
            );


    // =====================================================
    // ALLOWED RETURN STATUS TRANSITIONS
    // =====================================================

    private static final Map<String, Set<String>>
            ALLOWED_STATUS_TRANSITIONS =
            Map.of(
                    "REQUESTED",
                    Set.of(
                            "APPROVED",
                            "REJECTED"
                    ),

                    "APPROVED",
                    Set.of(
                            "PICKUP_SCHEDULED",
                            "REJECTED"
                    ),

                    "PICKUP_SCHEDULED",
                    Set.of(
                            "PICKED_UP"
                    ),

                    "PICKED_UP",
                    Set.of(
                            "RECEIVED"
                    ),

                    "RECEIVED",
                    Set.of(
                            "INSPECTED"
                    ),

                    "INSPECTED",
                    Set.of(
                            "REFUND_INITIATED",
                            "REJECTED"
                    ),

                    "REFUND_INITIATED",
                    Set.of(
                            "REFUNDED"
                    )
            );


    // =====================================================
    // GET MY RETURNS FOR AN ORDER
    // =====================================================

    public List<Return> getMyReturnsForOrder(
            String userId,
            String orderId) {

        // -------------------------------------------------
        // Validate authenticated user
        // -------------------------------------------------

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User is not authenticated."
            );
        }


        // -------------------------------------------------
        // Validate order ID
        // -------------------------------------------------

        if (orderId == null || orderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }


        // -------------------------------------------------
        // Verify that the order belongs to this user
        // -------------------------------------------------

        Order order =
                orderRepository.findById(
                        orderId
                );


        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }


        // -------------------------------------------------
        // Get this user's returns using the existing
        // userId-index and then filter by order ID.
        //
        // This avoids scanning the entire Returns table.
        // -------------------------------------------------

        return returnRepository
                .findByUserId(userId)
                .stream()
                .filter(returnItem ->
                        orderId.equals(
                                returnItem.getOrderId()
                        )
                )
                .toList();
    }


    // =====================================================
    // CREATE RETURN REQUEST
    // =====================================================

    public Return createReturn(
            String userId,
            ReturnRequest request) {

        // -------------------------------------------------
        // Validate authenticated user
        // -------------------------------------------------

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User is not authenticated."
            );
        }


        // -------------------------------------------------
        // Validate request
        // -------------------------------------------------

        if (request == null) {

            throw new IllegalArgumentException(
                    "Return request is required."
            );
        }


        if (request.getOrderId() == null
                || request.getOrderId().isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }


        if (request.getProductId() == null
                || request.getProductId().isBlank()) {

            throw new IllegalArgumentException(
                    "Product ID is required."
            );
        }


        if (request.getQuantity() == null
                || request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Return quantity must be greater than zero."
            );
        }


        if (request.getReturnReason() == null
                || request.getReturnReason().isBlank()) {

            throw new IllegalArgumentException(
                    "Return reason is required."
            );
        }


        String returnReason =
                request.getReturnReason()
                        .trim()
                        .toUpperCase();


        if (!VALID_RETURN_REASONS.contains(returnReason)) {

            throw new IllegalArgumentException(
                    "Invalid return reason."
            );
        }


        // -------------------------------------------------
        // OTHER reason requires explanation
        // -------------------------------------------------

        if ("OTHER".equals(returnReason)
                && (request.getOtherReturnReason() == null
                || request.getOtherReturnReason().isBlank())) {

            throw new IllegalArgumentException(
                    "Please provide a reason for selecting Other."
            );
        }


        // -------------------------------------------------
        // Find order
        // -------------------------------------------------

        Order order =
                orderRepository.findById(
                        request.getOrderId()
                );


        // -------------------------------------------------
        // Verify order ownership
        // -------------------------------------------------

        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }


        // -------------------------------------------------
        // Return allowed only for delivered orders
        // -------------------------------------------------

        if (!"DELIVERED".equals(order.getStatus())) {

            throw new IllegalArgumentException(
                    "Only delivered orders can be returned."
            );
        }


        // -------------------------------------------------
        // Find requested product inside order
        // -------------------------------------------------

        if (order.getItems() == null
                || order.getItems().isEmpty()) {

            throw new IllegalArgumentException(
                    "No items were found in this order."
            );
        }


        OrderItem requestedItem = null;


        for (OrderItem item : order.getItems()) {

            if (request.getProductId()
                    .equals(item.getProductId())) {

                requestedItem = item;

                break;
            }
        }


        // -------------------------------------------------
        // Product must belong to the order
        // -------------------------------------------------

        if (requestedItem == null) {

            throw new IllegalArgumentException(
                    "The product does not belong to this order."
            );
        }


        // -------------------------------------------------
        // Validate requested quantity
        // -------------------------------------------------

        if (requestedItem.getQuantity() == null
                || request.getQuantity()
                > requestedItem.getQuantity()) {

            throw new IllegalArgumentException(
                    "Return quantity cannot exceed purchased quantity."
            );
        }


        // -------------------------------------------------
        // Check duplicate active return
        // -------------------------------------------------

        List<Return> existingReturns =
                returnRepository.findByUserId(userId);


        for (Return existingReturn : existingReturns) {

            if (!request.getOrderId()
                    .equals(existingReturn.getOrderId())) {

                continue;
            }


            if (!request.getProductId()
                    .equals(existingReturn.getProductId())) {

                continue;
            }


            if (existingReturn.getReturnStatus() == null) {

                continue;
            }


            if (ACTIVE_RETURN_STATUSES.contains(
                    existingReturn.getReturnStatus())) {

                throw new IllegalArgumentException(
                        "A return request already exists for this product."
                );
            }
        }


        // -------------------------------------------------
        // Create return record
        // -------------------------------------------------

        Return returnItem = new Return();


        String returnId =
                "RT-"
                + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();


        String now =
                Instant.now().toString();


        returnItem.setReturnId(
                returnId
        );

        returnItem.setOrderId(
                order.getOrderId()
        );

        returnItem.setUserId(
                userId
        );

        returnItem.setProductId(
                requestedItem.getProductId()
        );

        returnItem.setProductName(
                requestedItem.getName()
        );

        returnItem.setProductImage(
                requestedItem.getImageUrl()
        );

        returnItem.setQuantity(
                request.getQuantity()
        );

        returnItem.setPrice(
                requestedItem.getPrice()
                        .doubleValue()
        );


        // -------------------------------------------------
        // Calculate returned item total
        // -------------------------------------------------

        double itemTotal =
                requestedItem.getPrice()
                        .doubleValue()
                * request.getQuantity();


        returnItem.setItemTotal(
                itemTotal
        );


        returnItem.setReturnReason(
                returnReason
        );

        returnItem.setOtherReturnReason(
                request.getOtherReturnReason()
        );

        returnItem.setReturnStatus(
                "REQUESTED"
        );

        returnItem.setRequestedAt(
                now
        );


        // -------------------------------------------------
        // Save ONLY to Returns table
        // -------------------------------------------------

        return returnRepository.save(
                returnItem
        );
    }


    // =====================================================
    // GET ALL RETURN REQUESTS
    // =====================================================

    public List<Return> getAllReturns() {

        return returnRepository.findAll();
    }


    // =====================================================
    // GET RETURN REQUEST BY ID
    // =====================================================

    public Return getReturnById(
            String returnId) {

        // -------------------------------------------------
        // Validate return ID
        // -------------------------------------------------

        if (returnId == null
                || returnId.isBlank()) {

            throw new IllegalArgumentException(
                    "Return ID is required."
            );
        }


        // -------------------------------------------------
        // Find return request
        // -------------------------------------------------

        Return returnItem =
                returnRepository.findById(
                        returnId
                );


        if (returnItem == null) {

            throw new IllegalArgumentException(
                    "Return request was not found."
            );
        }


        return returnItem;
    }


    // =====================================================
    // UPDATE RETURN STATUS
    // =====================================================

    public Return updateReturnStatus(
            String returnId,
            String requestedStatus,
            String adminRemarks) {

        // -------------------------------------------------
        // Validate return ID
        // -------------------------------------------------

        if (returnId == null
                || returnId.isBlank()) {

            throw new IllegalArgumentException(
                    "Return ID is required."
            );
        }


        // -------------------------------------------------
        // Validate requested status
        // -------------------------------------------------

        if (requestedStatus == null
                || requestedStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Return status is required."
            );
        }


        String newStatus =
                requestedStatus
                        .trim()
                        .toUpperCase();


        // -------------------------------------------------
        // Find return request
        // -------------------------------------------------

        Return returnItem =
                returnRepository.findById(
                        returnId
                );


        if (returnItem == null) {

            throw new IllegalArgumentException(
                    "Return request was not found."
            );
        }


        // -------------------------------------------------
        // Validate current status
        // -------------------------------------------------

        String currentStatus =
                returnItem.getReturnStatus();


        if (currentStatus == null
                || currentStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "The existing return status is invalid."
            );
        }


        // -------------------------------------------------
        // Validate status transition
        // -------------------------------------------------

        Set<String> allowedNextStatuses =
                ALLOWED_STATUS_TRANSITIONS.get(
                        currentStatus
                );


        if (allowedNextStatuses == null
                || !allowedNextStatuses.contains(newStatus)) {

            throw new IllegalArgumentException(
                    "Cannot change return status from "
                            + currentStatus
                            + " to "
                            + newStatus
                            + "."
            );
        }


        // -------------------------------------------------
        // Generate update timestamp
        // -------------------------------------------------

        String now =
                Instant.now().toString();


        // -------------------------------------------------
        // Update status
        // -------------------------------------------------

        returnItem.setReturnStatus(
                newStatus
        );


        // -------------------------------------------------
        // Update status-specific timestamps
        // -------------------------------------------------

        if ("APPROVED".equals(newStatus)) {

            returnItem.setApprovedAt(
                    now
            );
        }


        if ("REJECTED".equals(newStatus)) {

            returnItem.setRejectedAt(
                    now
            );

            returnItem.setCompletedAt(
                    now
            );
        }


        if ("REFUNDED".equals(newStatus)) {

            returnItem.setCompletedAt(
                    now
            );
        }


        // -------------------------------------------------
        // Update admin remarks
        // -------------------------------------------------

        if (adminRemarks != null) {

            returnItem.setAdminRemarks(
                    adminRemarks.trim()
            );
        }


        // -------------------------------------------------
        // Save updated return
        // -------------------------------------------------

        return returnRepository.save(
                returnItem
        );
    }
}