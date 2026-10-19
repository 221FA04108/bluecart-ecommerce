package com.bluecart.bluecart_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluecart.bluecart_backend.dto.ReturnRequest;
import com.bluecart.bluecart_backend.model.Return;
import com.bluecart.bluecart_backend.service.ReturnService;

@RestController
@RequestMapping("/api/returns")
public class ReturnController {

    private final ReturnService returnService;


    public ReturnController(
            ReturnService returnService) {

        this.returnService = returnService;
    }


    // =====================================================
    // CREATE RETURN REQUEST
    // =====================================================

    @PostMapping
    public ResponseEntity<?> createReturn(
            Authentication authentication,
            @RequestBody ReturnRequest request) {

        try {

            String userId =
                    authentication.getName();


            Return returnItem =
                    returnService.createReturn(
                            userId,
                            request
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(returnItem);


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
    // GET MY RETURNS FOR AN ORDER
    // =====================================================

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getMyReturnsForOrder(
            Authentication authentication,
            @PathVariable String orderId) {

        try {

            String userId =
                    authentication.getName();


            List<Return> returns =
                    returnService.getMyReturnsForOrder(
                            userId,
                            orderId
                    );


            return ResponseEntity.ok(
                    returns
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