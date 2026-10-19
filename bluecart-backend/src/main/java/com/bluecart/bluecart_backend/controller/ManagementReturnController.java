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

import com.bluecart.bluecart_backend.model.Return;
import com.bluecart.bluecart_backend.service.ReturnService;

@RestController
@RequestMapping("/api/management/returns")
public class ManagementReturnController {

    private final ReturnService returnService;

    public ManagementReturnController(
            ReturnService returnService) {

        this.returnService = returnService;
    }


    // =====================================================
    // GET ALL RETURN REQUESTS
    // =====================================================

    @GetMapping
    public ResponseEntity<?> getAllReturns() {

        List<Return> returns =
                returnService.getAllReturns();

        return ResponseEntity.ok(returns);
    }


    // =====================================================
    // GET RETURN REQUEST BY ID
    // =====================================================

    @GetMapping("/{returnId}")
    public ResponseEntity<?> getReturnById(
            @PathVariable String returnId) {

        try {

            Return returnItem =
                    returnService.getReturnById(returnId);

            return ResponseEntity.ok(returnItem);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(404)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // =====================================================
    // UPDATE RETURN STATUS
    // =====================================================

    @PutMapping("/{returnId}/status")
    public ResponseEntity<?> updateReturnStatus(
            @PathVariable String returnId,
            @RequestBody Map<String, String> request) {

        try {

            if (request == null) {

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
                    request.get("status");

            String adminRemarks =
                    request.get("adminRemarks");

            Return returnItem =
                    returnService.updateReturnStatus(
                            returnId,
                            status,
                            adminRemarks
                    );

            return ResponseEntity.ok(
                    Map.of(
                            "message",
                            "Return status updated successfully.",
                            "returnId",
                            returnItem.getReturnId(),
                            "status",
                            returnItem.getReturnStatus()
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