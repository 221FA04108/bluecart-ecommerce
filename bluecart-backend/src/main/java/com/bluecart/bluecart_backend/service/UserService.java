package com.bluecart.bluecart_backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.dto.ProfileUpdateRequest;
import com.bluecart.bluecart_backend.model.User;
import com.bluecart.bluecart_backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    /*
     * Get the currently logged-in user's profile.
     */
    public User getMyProfile(String userId) {

        User user = userRepository.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User profile not found"
            );
        }

        return user;
    }

    /*
     * Update the currently logged-in user's profile.
     */
    public User updateMyProfile(
            String userId,
            ProfileUpdateRequest request) {

        User user = userRepository.findById(userId);

        if (user == null) {
            throw new IllegalArgumentException(
                    "User profile not found"
            );
        }

        /*
         * Determine whether email or mobile
         * is being changed.
         */
        boolean emailChanged =
                request.getEmail() != null
                && !request.getEmail().equals(user.getEmail());

        boolean mobileChanged =
                request.getMobile() != null
                && !request.getMobile().equals(user.getMobile());

        /*
         * Email/mobile changes require
         * current password verification.
         */
        if (emailChanged || mobileChanged) {

            if (request.getCurrentPassword() == null
                    || request.getCurrentPassword().isBlank()) {

                throw new IllegalArgumentException(
                        "Current password is required to change email or mobile number"
                );
            }

            boolean passwordMatches =
                    passwordEncoder.matches(
                            request.getCurrentPassword(),
                            user.getPasswordHash()
                    );

            if (!passwordMatches) {

                throw new IllegalArgumentException(
                        "Incorrect current password"
                );
            }
        }

        /*
         * Update normal profile fields.
         */
        if (request.getName() != null) {
            user.setName(request.getName().trim());
        }

        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }

        if (request.getDob() != null) {
            user.setDob(request.getDob());
        }

        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        /*
         * Update sensitive fields only after
         * successful password verification.
         */
        if (emailChanged) {
            user.setEmail(request.getEmail().trim());
        }

        if (mobileChanged) {
            user.setMobile(request.getMobile().trim());
        }

        return userRepository.save(user);
    }
}