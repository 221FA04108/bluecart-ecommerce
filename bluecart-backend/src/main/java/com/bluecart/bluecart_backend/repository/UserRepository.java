package com.bluecart.bluecart_backend.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.bluecart.bluecart_backend.model.User;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class UserRepository {

    private final DynamoDbTable<User> userTable;

    public UserRepository(DynamoDbEnhancedClient enhancedClient) {

        this.userTable = enhancedClient.table(
                "Users",
                TableSchema.fromBean(User.class)
        );
    }

    public List<User> findAll() {

        return userTable.scan()
                .items()
                .stream()
                .toList();
    }

    public User findById(String id) {

        return userTable.getItem(
                request -> request.key(
                        key -> key.partitionValue(id)
                )
        );
    }

    public User findByEmail(String email) {

        return userTable.scan()
                .items()
                .stream()
                .filter(user ->
                        user.getEmail() != null
                                && user.getEmail().equalsIgnoreCase(email)
                )
                .findFirst()
                .orElse(null);
    }
    public User findByMobile(String mobile) {

    return userTable.scan()
            .items()
            .stream()
            .filter(user ->
                    user.getMobile() != null
                            && user.getMobile().equals(mobile)
            )
            .findFirst()
            .orElse(null);
}
    public User save(User user) {

        userTable.putItem(user);

        return user;
    }

    public void deleteById(String id) {

        userTable.deleteItem(
                request -> request.key(
                        key -> key.partitionValue(id)
                )
        );
    }
}