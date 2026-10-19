package com.bluecart.bluecart_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bluecart.bluecart_backend.model.CancellationRequest;
import com.bluecart.bluecart_backend.service.CancellationRequestService;

@RestController
@RequestMapping("/api/cancellation-requests")
@CrossOrigin(origins = "http://localhost:5173")
public class CancellationRequestController {

    private final CancellationRequestService cancellationRequestService;

    public CancellationRequestController(
            CancellationRequestService cancellationRequestService) {

        this.cancellationRequestService =
                cancellationRequestService;
    }

    // =========================================================
    // CREATE CANCELLATION REQUEST
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createCancellationRequest(
            @RequestParam String userId,
            @RequestParam String orderId,
            @RequestParam String reason) {

        try {

            CancellationRequest request =
                    cancellationRequestService.createCancellationRequest(
                            userId,
                            orderId,
                            reason
                    );

            return ResponseEntity.ok(request);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to create cancellation request.");
        }
    }

    // =========================================================
    // GET MY CANCELLATION REQUESTS
    // =========================================================

    @GetMapping("/my-requests")
    public ResponseEntity<?> getMyCancellationRequests(
            @RequestParam String userId) {

        try {

            List<CancellationRequest> requests =
                    cancellationRequestService
                            .getMyCancellationRequests(userId);

            return ResponseEntity.ok(requests);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to fetch cancellation requests.");
        }
    }

    // =========================================================
    // GET CANCELLATION REQUESTS FOR AN ORDER
    // =========================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getCancellationRequestsForOrder(
            @PathVariable String orderId,
            @RequestParam String userId) {

        try {

            List<CancellationRequest> requests =
                    cancellationRequestService
                            .getCancellationRequestsForOrder(
                                    userId,
                                    orderId
                            );

            return ResponseEntity.ok(requests);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body("Failed to fetch cancellation requests.");
        }
    }
}