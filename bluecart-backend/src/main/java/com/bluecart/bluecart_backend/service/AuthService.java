package com.bluecart.bluecart_backend.service;

import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.dto.RegisterRequest;
import com.bluecart.bluecart_backend.model.User;
import com.bluecart.bluecart_backend.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User registerUser(RegisterRequest request) {

        // Check whether email already exists
        User existingUser =
                userRepository.findByEmail(request.getEmail());

        if (existingUser != null) {
            throw new IllegalArgumentException(
                    "An account with this email or mobile number already exists."
            );
        }

        // Check whether mobile number already exists
        User existingMobileUser =
                userRepository.findByMobile(request.getMobile());

        if (existingMobileUser != null) {
            throw new IllegalArgumentException(
                    "An account with this email or mobile number already exists."
            );
        }

        // Create new user
        User user = new User();

        user.setId(UUID.randomUUID().toString());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());

        // Store hashed password, never the plain password
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );

        user.setGender(request.getGender());
        user.setDob(request.getDob());
        user.setAddress(request.getAddress());
        

        return userRepository.save(user);
    }
    public User loginUser(String email, String password) {

    String normalizedEmail = email == null
            ? ""
            : email.trim();

    System.out.println("========== LOGIN DEBUG ==========");
    System.out.println("LOGIN EMAIL RECEIVED: [" + email + "]");
    System.out.println("NORMALIZED EMAIL: [" + normalizedEmail + "]");

    User user = userRepository.findByEmail(normalizedEmail);

    System.out.println("USER FOUND: " + (user != null));

    if (user == null) {
        System.out.println("RESULT: USER NOT FOUND");
        System.out.println("=================================");
        throw new IllegalArgumentException("Invalid email or password");
    }

    String storedHash = user.getPasswordHash();

    System.out.println("USER ID: " + user.getId());
    System.out.println("PASSWORD HASH PRESENT: " + (storedHash != null));
    System.out.println(
        "PASSWORD HASH LENGTH: " +
        (storedHash == null ? 0 : storedHash.length())
    );

    if (storedHash == null || storedHash.isBlank()) {
        System.out.println("RESULT: PASSWORD HASH IS EMPTY");
        System.out.println("=================================");
        throw new IllegalArgumentException("Stored password is invalid");
    }

    boolean passwordMatches;

    try {
        passwordMatches = passwordEncoder.matches(password, storedHash);
    } catch (Exception e) {
        System.out.println("BCrypt ERROR: " + e.getClass().getName());
        System.out.println("BCrypt MESSAGE: " + e.getMessage());
        System.out.println("=================================");
        throw new IllegalArgumentException("Stored password format is invalid");
    }

    System.out.println("PASSWORD MATCHES: " + passwordMatches);

    if (!passwordMatches) {
        System.out.println("RESULT: PASSWORD DOES NOT MATCH");
        System.out.println("=================================");
        throw new IllegalArgumentException("Invalid email or password");
    }

    System.out.println("RESULT: LOGIN CREDENTIALS VALID");
    System.out.println("=================================");

    return user;
}
}