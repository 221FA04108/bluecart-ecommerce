package com.bluecart.bluecart_backend.service;

import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {

    private static final String ADMIN_EMAIL =
            "nikhilkamepally108@gmail.com";

    private static final String ADMIN_PASSWORD =
            "PaLLy@2207";

    public boolean authenticate(
            String email,
            String password) {

        if (email == null || password == null) {
            return false;
        }

        return ADMIN_EMAIL.equalsIgnoreCase(email.trim())
                && ADMIN_PASSWORD.equals(password);
    }

    public String getAdminEmail() {
        return ADMIN_EMAIL;
    }

    public String getAdminId() {
        return "admin";
    }

    public String getAdminName() {
        return "Administrator";
    }
}