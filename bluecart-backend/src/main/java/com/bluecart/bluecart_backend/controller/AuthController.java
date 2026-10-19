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
import com.bluecart.bluecart_backend.service.AdminAuthService;
import com.bluecart.bluecart_backend.service.AuthService;
import com.bluecart.bluecart_backend.service.JwtService;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final AdminAuthService adminAuthService;


    public AuthController(
            AuthService authService,
            JwtService jwtService,
            AdminAuthService adminAuthService) {

        this.authService = authService;
        this.jwtService = jwtService;
        this.adminAuthService = adminAuthService;
    }


    

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


    

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> request) {

        try {

            String email =
                    request.get("email");

            String password =
                    request.get("password");


            

            if (adminAuthService.authenticate(
                    email,
                    password)) {

                String token =
                        jwtService.generateAdminToken(
                                adminAuthService.getAdminId(),
                                adminAuthService.getAdminEmail(),
                                adminAuthService.getAdminName()
                        );


                AuthResponse adminResponse =
                        new AuthResponse(
                                adminAuthService.getAdminId(),
                                adminAuthService.getAdminName(),
                                adminAuthService.getAdminEmail(),
                                "",
                                "",
                                "",
                                ""
                        );


                return ResponseEntity.ok(
                        Map.of(
                                "user",
                                adminResponse,

                                "token",
                                token,

                                "role",
                                "ADMIN"
                        )
                );
            }


            
            User user =
                    authService.loginUser(
                            email,
                            password
                    );


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
                            "user",
                            response,

                            "token",
                            token,

                            "role",
                            "CUSTOMER"
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