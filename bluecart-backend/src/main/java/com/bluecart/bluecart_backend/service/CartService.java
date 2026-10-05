package com.bluecart.bluecart_backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.model.CartItem;
import com.bluecart.bluecart_backend.model.CartProductResponse;
import com.bluecart.bluecart_backend.model.Product;
import com.bluecart.bluecart_backend.repository.CartRepository;
import com.bluecart.bluecart_backend.repository.ProductRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository) {

        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    // Add a product to the cart
    public CartItem addToCart(CartItem cartItem) {

        CartItem existingItem = cartRepository.findByUserIdAndProductId(
                cartItem.getUserId(),
                cartItem.getProductId()
        );

        if (existingItem != null) {

            existingItem.setQuantity(
                    existingItem.getQuantity() + cartItem.getQuantity()
            );

            return cartRepository.save(existingItem);
        }

        return cartRepository.save(cartItem);
    }

    // Get all items in a user's cart
    public List<CartProductResponse> getCart(String userId) {

        List<CartItem> cartItems =
                cartRepository.findByUserId(userId);

        List<CartProductResponse> cartProducts =
                new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            Product product =
                    productRepository.findById(
                            cartItem.getProductId()
                    );

            if (product == null) {
                continue;
            }

            CartProductResponse response =
                    new CartProductResponse();

            response.setUserId(cartItem.getUserId());
            response.setProductId(cartItem.getProductId());
            response.setName(product.getName());
            response.setCategory(product.getCategory());
            response.setPrice(product.getPrice());
            response.setImageUrl(product.getImageUrl());
            response.setQuantity(cartItem.getQuantity());

            cartProducts.add(response);
        }

        return cartProducts;
    }

    // Update quantity of a cart item
    public CartItem updateQuantity(
            String userId,
            String productId,
            Integer quantity) {

        CartItem existingItem =
                cartRepository.findByUserIdAndProductId(
                        userId,
                        productId
                );

        if (existingItem == null) {
            return null;
        }

        existingItem.setQuantity(quantity);

        return cartRepository.save(existingItem);
    }

    // Remove a product from the cart
    public void removeFromCart(
            String userId,
            String productId) {

        cartRepository.delete(userId, productId);
    }
}