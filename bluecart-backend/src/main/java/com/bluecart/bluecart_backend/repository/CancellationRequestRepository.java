package com.bluecart.bluecart_backend.repository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bluecart.bluecart_backend.model.CancellationRequest;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;
import software.amazon.awssdk.enhanced.dynamodb.model.QueryConditional;

@Repository
public class CancellationRequestRepository {

    private static final String TABLE_NAME =
            "CancellationRequests";

    private static final String USER_INDEX_NAME =
            "userId-index";

    private final DynamoDbTable<CancellationRequest>
            cancellationRequestTable;


    public CancellationRequestRepository(
            DynamoDbEnhancedClient enhancedClient) {

        this.cancellationRequestTable =
                enhancedClient.table(
                        TABLE_NAME,
                        TableSchema.fromBean(
                                CancellationRequest.class
                        )
                );
    }


    // =====================================================
    // SAVE
    // =====================================================

    public CancellationRequest save(
            CancellationRequest request) {

        cancellationRequestTable.putItem(request);

        return request;
    }


    // =====================================================
    // FIND BY REQUEST ID
    // =====================================================

    public CancellationRequest findById(
            String requestId) {

        return cancellationRequestTable.getItem(
                request -> request.key(
                        key -> key.partitionValue(requestId)
                )
        );
    }


    // =====================================================
    // FIND BY USER ID
    // =====================================================

    public List<CancellationRequest> findByUserId(
            String userId) {

        List<CancellationRequest> requests =
                new ArrayList<>();

        cancellationRequestTable
                .index(USER_INDEX_NAME)
                .query(
                        QueryConditional.keyEqualTo(
                                key -> key.partitionValue(userId)
                        )
                )
                .stream()
                .forEach(
                        page -> requests.addAll(page.items())
                );

        return requests;
    }


    // =====================================================
    // FIND ALL
    // =====================================================

    public List<CancellationRequest> findAll() {

        List<CancellationRequest> requests =
                new ArrayList<>();

        cancellationRequestTable
                .scan()
                .stream()
                .forEach(
                        page -> requests.addAll(page.items())
                );

        return requests;
    }
}