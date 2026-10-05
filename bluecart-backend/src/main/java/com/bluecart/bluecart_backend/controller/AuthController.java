package com.bluecart.bluecart_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluecart.bluecart_backend.dto.AuthResponse;
import com.bluecart.bluecart_backend.dto.RegisterRequest;
import com.bluecart.bluecart_backend.model.User;
import com.bluecart.bluecart_backend.service.AuthService;
import com.bluecart.bluecart_backend.service.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService) {

        this.authService = authService;
        this.jwtService = jwtService;
    }


    // =====================================================
    // REGISTER
    // =====================================================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        try {

            User user =
                    authService.registerUser(request);

            AuthResponse response =
                    new AuthResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getMobile(),
                            user.getGender(),
                            user.getDob(),
                            user.getAddress()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(409)
                    .body(
                        Map.of(
                            "message",
                            e.getMessage()
                        )
                    );
        }
    }


    // =====================================================
    // LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        try {

            String email =
                    request.get("email");

            String password =
                    request.get("password");


            // Verify email and password
            User user =
                    authService.loginUser(
                            email,
                            password
                    );


            // Generate JWT for authenticated user
            String token =
                    jwtService.generateToken(user);


            AuthResponse response =
                    new AuthResponse(
                            user.getId(),
                            user.getName(),
                            user.getEmail(),
                            user.getMobile(),
                            user.getGender(),
                            user.getDob(),
                            user.getAddress()
                    );


            return ResponseEntity.ok(
                    Map.of(
                        "user", response,
                        "token", token
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(401)
                    .body(
                        Map.of(
                            "message",
                            e.getMessage()
                        )
                    );
        }
    }
}