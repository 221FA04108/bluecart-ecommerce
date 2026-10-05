package com.bluecart.bluecart_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.bluecart.bluecart_backend.model.CartItem;
import com.bluecart.bluecart_backend.model.CartProductResponse;
import com.bluecart.bluecart_backend.service.CartService;


@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Add product to cart
    @PostMapping
    public ResponseEntity<CartItem> addToCart(
            @RequestBody CartItem cartItem) {

        return ResponseEntity.ok(
                cartService.addToCart(cartItem)
        );
    }

    // Get user's cart
    @GetMapping("/{userId}")
public ResponseEntity<List<CartProductResponse>> getCart(
        @PathVariable String userId) {

    return ResponseEntity.ok(
            cartService.getCart(userId)
    );
}

    // Update product quantity
    @PutMapping("/{userId}/{productId}")
    public ResponseEntity<CartItem> updateQuantity(
            @PathVariable String userId,
            @PathVariable String productId,
            @RequestParam Integer quantity) {

        CartItem updatedItem =
                cartService.updateQuantity(
                        userId,
                        productId,
                        quantity
                );

        if (updatedItem == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedItem);
    }

    // Remove product from cart
    @DeleteMapping("/{userId}/{productId}")
    public ResponseEntity<Void> removeFromCart(
            @PathVariable String userId,
            @PathVariable String productId) {

        cartService.removeFromCart(
                userId,
                productId
        );

        return ResponseEntity.noContent().build();
    }
}