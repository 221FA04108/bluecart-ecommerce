package com.bluecart.bluecart_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluecart.bluecart_backend.dto.OrderRequest;
import com.bluecart.bluecart_backend.model.Order;
import com.bluecart.bluecart_backend.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(
            OrderService orderService) {

        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<?> placeOrder(
            @RequestBody OrderRequest request,
            Authentication authentication) {

        try {

            // JWT subject = logged-in user's ID
            String userId =
                    authentication.getName();

            Order order =
                    orderService.placeOrder(
                            userId,
                            request
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Order placed successfully",

                            "orderId",
                            order.getOrderId()
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(
            Authentication authentication) {

        try {

            // JWT subject = logged-in user's ID
            String userId =
                    authentication.getName();

            List<Order> orders =
                    orderService.getMyOrders(userId);

            return ResponseEntity.ok(orders);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }
}