package com.bluecart.bluecart_backend.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.bluecart.bluecart_backend.model.CartItem;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class CartRepository {

    private final DynamoDbTable<CartItem> cartTable;

    public CartRepository(DynamoDbEnhancedClient enhancedClient) {

        this.cartTable = enhancedClient.table(
                "CartItems",
                TableSchema.fromBean(CartItem.class)
        );
    }

    // Add or update a cart item
    public CartItem save(CartItem cartItem) {

        cartTable.putItem(cartItem);

        return cartItem;
    }

    // Get all cart items for a user
    public List<CartItem> findByUserId(String userId) {

        return cartTable.query(
                request -> request.queryConditional(
                        software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
                                .keyEqualTo(
                                        key -> key.partitionValue(userId)
                                )
                )
        )
        .items()
        .stream()
        .toList();
    }

    // Get one specific cart item
    public CartItem findByUserIdAndProductId(
            String userId,
            String productId) {

        return cartTable.getItem(
                request -> request.key(
                        key -> key
                                .partitionValue(userId)
                                .sortValue(productId)
                )
        );
    }

    // Remove a specific product from cart
    public void delete(
            String userId,
            String productId) {

        cartTable.deleteItem(
                request -> request.key(
                        key -> key
                                .partitionValue(userId)
                                .sortValue(productId)
                )
        );
    }

    // Remove all products from a user's cart
    // Used after an order is successfully placed.
    public void deleteByUserId(String userId) {

        List<CartItem> items =
                findByUserId(userId);

        for (CartItem item : items) {

            cartTable.deleteItem(
                    request -> request.key(
                            key -> key
                                    .partitionValue(
                                            item.getUserId()
                                    )
                                    .sortValue(
                                            item.getProductId()
                                    )
                    )
            );
        }
    }
}