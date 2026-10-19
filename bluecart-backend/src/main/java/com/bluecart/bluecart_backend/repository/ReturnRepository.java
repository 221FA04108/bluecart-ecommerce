package com.bluecart.bluecart_backend.repository;

import com.bluecart.bluecart_backend.model.Return;

import org.springframework.stereotype.Repository;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

import java.util.List;
import java.util.stream.Collectors;

@Repository
public class ReturnRepository {

    private static final String TABLE_NAME = "Returns";

    private static final String USER_INDEX_NAME =
            "userId-index";

    private final DynamoDbTable<Return> table;


    public ReturnRepository(
            DynamoDbEnhancedClient enhancedClient) {

        this.table =
                enhancedClient.table(
                        TABLE_NAME,
                        TableSchema.fromBean(Return.class)
                );
    }


    // =====================================================
    // SAVE
    // =====================================================

    public Return save(Return returnItem) {

        table.putItem(returnItem);

        return returnItem;
    }


    // =====================================================
    // FIND BY RETURN ID
    // =====================================================

    public Return findById(String returnId) {

        return table.getItem(
                r -> r.key(
                        k -> k.partitionValue(returnId)
                )
        );
    }


    // =====================================================
    // FIND RETURNS BY USER
    // =====================================================

    public List<Return> findByUserId(String userId) {

        return table.index(USER_INDEX_NAME)
                .query(
                        r -> r.queryConditional(
                                software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional
                                        .keyEqualTo(
                                                k -> k.partitionValue(userId)
                                        )
                        )
                )
                .stream()
                .flatMap(page -> page.items().stream())
                .collect(Collectors.toList());
    }


    // =====================================================
    // FIND ALL RETURNS
    // =====================================================

    public List<Return> findAll() {

        return table.scan()
                .items()
                .stream()
                .collect(Collectors.toList());
    }
}