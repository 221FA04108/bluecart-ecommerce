package com.bluecart.bluecart_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluecart.bluecart_backend.model.Order;
import com.bluecart.bluecart_backend.service.OrderService;

@RestController
@RequestMapping("/api/management/orders")
public class ManagementOrderController {

    private final OrderService orderService;


    public ManagementOrderController(
            OrderService orderService) {

        this.orderService = orderService;
    }


    // =====================================================
    // GET ALL ORDERS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllOrders() {

        try {

            List<Order> orders =
                    orderService.getAllOrders();

            return ResponseEntity.ok(
                    orders
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


    // =====================================================
    // GET ORDER BY ID
    // =====================================================

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrderById(
            @PathVariable String orderId) {

        try {

            Order order =
                    orderService.getManagementOrderById(
                            orderId
                    );

            return ResponseEntity.ok(
                    order
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .notFound()
                    .build();
        }
    }


    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    @PutMapping("/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> request) {

        try {

            String status =
                    request.get("status");

            Order order =
                    orderService.updateOrderStatus(
                            orderId,
                            status
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Order status updated successfully",

                            "orderId",
                            order.getOrderId(),

                            "status",
                            order.getStatus()
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
}