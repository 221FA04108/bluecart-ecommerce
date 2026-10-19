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

import com.bluecart.bluecart_backend.model.CancellationRequest;
import com.bluecart.bluecart_backend.service.CancellationRequestService;

@RestController
@RequestMapping("/api/management/cancellation-requests")
public class ManagementCancellationRequestController {

    private final CancellationRequestService cancellationRequestService;

    public ManagementCancellationRequestController(
            CancellationRequestService cancellationRequestService) {

        this.cancellationRequestService =
                cancellationRequestService;
    }

    // =====================================================
    // GET ALL CANCELLATION REQUESTS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllCancellationRequests() {

        try {

            List<CancellationRequest> requests =
                    cancellationRequestService
                            .getAllCancellationRequests();

            return ResponseEntity.ok(requests);

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to fetch cancellation requests."
                            )
                    );
        }
    }

    // =====================================================
    // GET CANCELLATION REQUEST BY ID
    // =====================================================

    @GetMapping("/{requestId}")
    public ResponseEntity<?> getCancellationRequestById(
            @PathVariable String requestId) {

        try {

            CancellationRequest request =
                    cancellationRequestService
                            .getCancellationRequestById(
                                    requestId
                            );

            return ResponseEntity.ok(request);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to fetch cancellation request."
                            )
                    );
        }
    }

    // =====================================================
    // APPROVE / REJECT CANCELLATION REQUEST
    // =====================================================

    @PutMapping("/{requestId}/status")
    public ResponseEntity<?> updateCancellationRequestStatus(
            @PathVariable String requestId,
            @RequestBody Map<String, String> requestBody) {

        try {

            if (requestBody == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                Map.of(
                                        "message",
                                        "Request body is required."
                                )
                        );
            }

            String status =
                    requestBody.get("status");

            String adminRemarks =
                    requestBody.get("adminRemarks");

            CancellationRequest updatedRequest =
                    cancellationRequestService
                            .updateCancellationRequestStatus(
                                    requestId,
                                    status,
                                    adminRemarks
                            );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Cancellation request updated successfully.",
                            "requestId",
                            updatedRequest.getRequestId(),
                            "status",
                            updatedRequest.getRequestStatus()
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

        } catch (Exception e) {

            return ResponseEntity
                    .internalServerError()
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to update cancellation request."
                            )
                    );
        }
    }
}