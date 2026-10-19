package com.bluecart.bluecart_backend.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.dto.OrderRequest;
import com.bluecart.bluecart_backend.model.CartItem;
import com.bluecart.bluecart_backend.model.Order;
import com.bluecart.bluecart_backend.model.OrderItem;
import com.bluecart.bluecart_backend.model.Product;
import com.bluecart.bluecart_backend.model.User;
import com.bluecart.bluecart_backend.repository.CartRepository;
import com.bluecart.bluecart_backend.repository.OrderRepository;
import com.bluecart.bluecart_backend.repository.ProductRepository;
import com.bluecart.bluecart_backend.repository.UserRepository;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            CartRepository cartRepository,
            ProductRepository productRepository) {

        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }


    public Order placeOrder(
            String userId,
            OrderRequest request) {

        // =====================================================
        // 1. Validate payment method
        // =====================================================

        if (request.getPaymentMethod() == null
                || !"COD".equalsIgnoreCase(
                        request.getPaymentMethod())) {

            throw new IllegalArgumentException(
                    "Only Cash on Delivery is currently supported."
            );
        }


        // =====================================================
        // 2. Get user from database
        // =====================================================

        User user = userRepository.findById(userId);

        if (user == null) {

            throw new IllegalArgumentException(
                    "User account was not found."
            );
        }


        // =====================================================
        // 3. Get user's cart from database
        // =====================================================

        List<CartItem> cartItems =
                cartRepository.findByUserId(userId);

        if (cartItems == null || cartItems.isEmpty()) {

            throw new IllegalArgumentException(
                    "Your cart is empty."
            );
        }


        // =====================================================
        // 4. Build order items from Products table
        // =====================================================

        List<OrderItem> orderItems =
                new ArrayList<>();

        BigDecimal subtotal =
                BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {

            Product product =
                    productRepository.findById(
                            cartItem.getProductId()
                    );

            if (product == null) {

                throw new IllegalArgumentException(
                        "Product not found: "
                                + cartItem.getProductId()
                );
            }

            Integer quantity =
                    cartItem.getQuantity();

            if (quantity == null || quantity < 1) {

                throw new IllegalArgumentException(
                        "Invalid quantity for product: "
                                + cartItem.getProductId()
                );
            }


            // =================================================
            // Check stock
            // =================================================

            if (product.getStock() == null
                    || product.getStock() < quantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }


            BigDecimal itemTotal =
                    product.getPrice()
                            .multiply(
                                    BigDecimal.valueOf(quantity)
                            );


            OrderItem orderItem =
                    new OrderItem();

            orderItem.setProductId(
                    product.getId()
            );

            orderItem.setName(
                    product.getName()
            );

            orderItem.setCategory(
                    product.getCategory()
            );

            orderItem.setImageUrl(
                    product.getImageUrl()
            );

            orderItem.setPrice(
                    product.getPrice()
            );

            orderItem.setQuantity(
                    quantity
            );

            orderItem.setItemTotal(
                    itemTotal
            );

            orderItems.add(orderItem);

            subtotal =
                    subtotal.add(itemTotal);
        }


        // =====================================================
        // 5. Calculate charges
        // =====================================================

        BigDecimal shipping;

        if (subtotal.compareTo(
                BigDecimal.valueOf(75)) >= 0) {

            shipping = BigDecimal.ZERO;

        } else {

            shipping =
                    BigDecimal.TEN;
        }


        BigDecimal tax =
                subtotal.multiply(
                        BigDecimal.valueOf(0.08)
                );


        BigDecimal total =
                subtotal
                        .add(shipping)
                        .add(tax);


        // =====================================================
        // 6. Create Order
        // =====================================================

        Order order =
                new Order();

        order.setOrderId(
                "BC-"
                        + UUID.randomUUID()
                                .toString()
                                .substring(0, 8)
                                .toUpperCase()
        );

        order.setUserId(
                user.getId()
        );


        // =====================================================
        // User details from Users table
        // =====================================================

        order.setCustomerName(
                user.getName()
        );

        order.setEmail(
                user.getEmail()
        );

        order.setMobile(
                user.getMobile()
        );


        // =====================================================
        // Shipping address from Checkout
        // =====================================================

        order.setShippingDoorNo(
                request.getShippingDoorNo()
        );

        order.setShippingStreet(
                request.getShippingStreet()
        );

        order.setShippingCity(
                request.getShippingCity()
        );

        order.setShippingDistrict(
                request.getShippingDistrict()
        );

        order.setShippingState(
                request.getShippingState()
        );

        order.setShippingPostalCode(
                request.getShippingPostalCode()
        );


        // =====================================================
        // Order information
        // =====================================================

        order.setPaymentMethod(
                "COD"
        );

        order.setStatus(
                "PLACED"
        );

        order.setItems(
                orderItems
        );

        order.setSubtotal(
                subtotal
        );

        order.setShipping(
                shipping
        );

        order.setTax(
                tax
        );

        order.setTotal(
                total
        );

        order.setCreatedAt(
                Instant.now().toString()
        );


        // =====================================================
        // 7. SAVE ORDER FIRST
        // =====================================================

        Order savedOrder =
                orderRepository.save(order);


        // =====================================================
        // 8. Clear cart only after order is saved
        // =====================================================

        cartRepository.deleteByUserId(
                userId
        );


        return savedOrder;
    }


    public List<Order> getMyOrders(String userId) {

        if (userId == null || userId.isBlank()) {

            throw new IllegalArgumentException(
                    "User information is missing."
            );
        }

        User user =
                userRepository.findById(userId);

        if (user == null) {

            throw new IllegalArgumentException(
                    "User account was not found."
            );
        }

        return orderRepository.findByUserId(userId);
    }


    public Order getOrderById(
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

        /*
         * Do not reveal whether an order exists
         * if it belongs to another user.
         */
        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }

        return order;
    }


    // =====================================================
    // CANCEL ORDER
    // =====================================================

    public Order cancelOrder(
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
        // Verify order ownership
        // =================================================

        if (order == null
                || !userId.equals(order.getUserId())) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }


        String status =
                order.getStatus();


        // =================================================
        // Already cancelled
        // =================================================

        if ("CANCELLED".equals(status)) {

            throw new IllegalArgumentException(
                    "This order has already been cancelled."
            );
        }


        // =================================================
        // Order has already been shipped
        // =================================================

        if ("SHIPPED".equals(status)
                || "IN_TRANSIT".equals(status)
                || "OUT_FOR_DELIVERY".equals(status)
                || "DELIVERED".equals(status)) {

            throw new IllegalArgumentException(
                    "This order cannot be cancelled because it has already been shipped."
            );
        }


        // =================================================
        // Cancellation is allowed only before shipment
        // =================================================

        if (!"PLACED".equals(status)
                && !"CONFIRMED".equals(status)) {

            throw new IllegalArgumentException(
                    "This order cannot be cancelled at its current status."
            );
        }


        // =================================================
        // Cancel the order
        // =================================================

        order.setStatus(
                "CANCELLED"
        );

        String now =
                Instant.now().toString();

        order.setCancelledAt(
                now
        );

        order.setUpdatedAt(
                now
        );


        // =================================================
        // Save updated order
        // =================================================

        return orderRepository.save(order);
    }


    // =====================================================
    // MANAGEMENT - GET ALL ORDERS
    // =====================================================

    public List<Order> getAllOrders() {

        return orderRepository.findAll();
    }


    // =====================================================
    // MANAGEMENT - GET ORDER BY ID
    // =====================================================

    public Order getManagementOrderById(
            String orderId) {

        if (orderId == null || orderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        Order order =
                orderRepository.findById(orderId);

        if (order == null) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }

        return order;
    }


    // =====================================================
    // MANAGEMENT - UPDATE ORDER STATUS
    // =====================================================

    public Order updateOrderStatus(
            String orderId,
            String newStatus) {

        if (orderId == null || orderId.isBlank()) {

            throw new IllegalArgumentException(
                    "Order ID is required."
            );
        }

        if (newStatus == null || newStatus.isBlank()) {

            throw new IllegalArgumentException(
                    "Order status is required."
            );
        }

        Order order =
                orderRepository.findById(orderId);

        if (order == null) {

            throw new IllegalArgumentException(
                    "Order was not found."
            );
        }

        String currentStatus =
                order.getStatus();

        String requestedStatus =
                newStatus.trim().toUpperCase();


        // =================================================
        // Validate requested status
        // =================================================

        if (!"PLACED".equals(requestedStatus)
                && !"CONFIRMED".equals(requestedStatus)
                && !"SHIPPED".equals(requestedStatus)
                && !"IN_TRANSIT".equals(requestedStatus)
                && !"OUT_FOR_DELIVERY".equals(requestedStatus)
                && !"DELIVERED".equals(requestedStatus)
                && !"CANCELLED".equals(requestedStatus)) {

            throw new IllegalArgumentException(
                    "Invalid order status."
            );
        }


        // =================================================
        // Same status - nothing to update
        // =================================================

        if (requestedStatus.equals(currentStatus)) {

            return order;
        }


        // =================================================
        // CANCELLED is terminal
        // =================================================

        if ("CANCELLED".equals(currentStatus)) {

            throw new IllegalArgumentException(
                    "A cancelled order cannot be moved to another status."
            );
        }


        // =================================================
        // DELIVERED is terminal
        // =================================================

        if ("DELIVERED".equals(currentStatus)) {

            throw new IllegalArgumentException(
                    "A delivered order cannot be moved to another status."
            );
        }


        // =================================================
        // ADMIN CANCELLATION
        //
        // Admin can cancel an order only before shipment.
        // =================================================

        if ("CANCELLED".equals(requestedStatus)) {

            if (!"PLACED".equals(currentStatus)
                    && !"CONFIRMED".equals(currentStatus)) {

                throw new IllegalArgumentException(
                        "An order can only be cancelled before shipment."
                );
            }

            order.setStatus(
                    "CANCELLED"
            );

            String now =
                    Instant.now().toString();

            order.setCancelledAt(
                    now
            );

            order.setUpdatedAt(
                    now
            );

            return orderRepository.save(
                    order
            );
        }


        // =================================================
        // NORMAL FORWARD STATUS TRANSITIONS
        // =================================================

        boolean validTransition =
                ("PLACED".equals(currentStatus)
                        && "CONFIRMED".equals(requestedStatus))

                || ("CONFIRMED".equals(currentStatus)
                        && "SHIPPED".equals(requestedStatus))

                || ("SHIPPED".equals(currentStatus)
                        && "IN_TRANSIT".equals(requestedStatus))

                || ("IN_TRANSIT".equals(currentStatus)
                        && "OUT_FOR_DELIVERY".equals(requestedStatus))

                || ("OUT_FOR_DELIVERY".equals(currentStatus)
                        && "DELIVERED".equals(requestedStatus));


        if (!validTransition) {

            throw new IllegalArgumentException(
                    "Invalid status transition from "
                            + currentStatus
                            + " to "
                            + requestedStatus
            );
        }


        // =================================================
        // Update status
        // =================================================

        order.setStatus(
                requestedStatus
        );

        order.setUpdatedAt(
                Instant.now().toString()
        );


        // =================================================
        // Save updated order to DynamoDB
        // =================================================

        return orderRepository.save(
                order
        );
    }
}