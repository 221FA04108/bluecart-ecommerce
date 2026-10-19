package com.bluecart.bluecart_backend.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/management")
public class ManagementTestController {

    @GetMapping("/test")
    public Map<String, String> test() {

        return Map.of(
            "message", "Management API access granted",
            "role", "ADMIN"
        );
    }
}