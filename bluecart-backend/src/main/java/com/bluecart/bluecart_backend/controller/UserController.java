package com.bluecart.bluecart_backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bluecart.bluecart_backend.dto.AuthResponse;
import com.bluecart.bluecart_backend.dto.ProfileUpdateRequest;
import com.bluecart.bluecart_backend.model.User;
import com.bluecart.bluecart_backend.service.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * Get the currently logged-in user's profile.
     *
     * The user ID is taken from the JWT authentication,
     * so the frontend does not need to send a user ID.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(
            Authentication authentication) {

        try {

            String userId = authentication.getName();

            User user = userService.getMyProfile(userId);

            AuthResponse response = new AuthResponse(
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
                    .status(404)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }

    /*
     * Update the currently logged-in user's profile.
     *
     * Normal fields:
     * - name
     * - gender
     * - date of birth
     * - address
     *
     * Email and mobile number require the current password.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(
            Authentication authentication,
            @RequestBody ProfileUpdateRequest request) {

        try {

            String userId = authentication.getName();

            User updatedUser =
                    userService.updateMyProfile(
                            userId,
                            request
                    );

            /*
             * Return only safe user information.
             * Password hash is never sent to the frontend.
             */
            AuthResponse response = new AuthResponse(
                    updatedUser.getId(),
                    updatedUser.getName(),
                    updatedUser.getEmail(),
                    updatedUser.getMobile(),
                    updatedUser.getGender(),
                    updatedUser.getDob(),
                    updatedUser.getAddress()
            );

            return ResponseEntity.ok(response);

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