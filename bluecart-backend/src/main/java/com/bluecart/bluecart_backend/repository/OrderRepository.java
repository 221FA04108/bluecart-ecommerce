package com.bluecart.bluecart_backend.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bluecart.bluecart_backend.model.Order;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;
import software.amazon.awssdk.enhanced.dynamodb.model.Page;

@Repository
public class OrderRepository {

    private static final String TABLE_NAME = "Orders";
    private static final String USER_INDEX_NAME = "userId-index";

    private final DynamoDbTable<Order> orderTable;

    public OrderRepository(
            DynamoDbEnhancedClient enhancedClient) {

        this.orderTable = enhancedClient.table(
                TABLE_NAME,
                TableSchema.fromBean(Order.class)
        );
    }

    public Order save(Order order) {

        orderTable.putItem(order);

        return order;
    }

    public Order findById(String orderId) {

        return orderTable.getItem(
                request -> request.key(
                        key -> key.partitionValue(orderId)
                )
        );
    }

    public List<Order> findByUserId(String userId) {

        List<Order> orders = new ArrayList<>();

        orderTable.index(USER_INDEX_NAME)
                .query(
                        QueryConditional.keyEqualTo(
                                key -> key.partitionValue(userId)
                        )
                )
                .stream()
                .forEach(page -> orders.addAll(page.items()));

        return orders;
    }

    public void deleteById(String orderId) {

        orderTable.deleteItem(
                request -> request.key(
                        key -> key.partitionValue(orderId)
                )
        );
    }
}