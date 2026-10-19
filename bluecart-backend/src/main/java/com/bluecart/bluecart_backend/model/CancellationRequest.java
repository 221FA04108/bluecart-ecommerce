package com.bluecart.bluecart_backend.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class CancellationRequest {

    private String requestId;
    private String orderId;
    private String userId;

    private String reason;
    private String requestStatus;

    private String requestedAt;
    private String processedAt;

    private String adminRemarks;


    // =====================================================
    // REQUEST ID
    // =====================================================

    @DynamoDbPartitionKey
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }


    // =====================================================
    // ORDER ID
    // =====================================================

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    // =====================================================
    // USER ID
    // =====================================================

    @DynamoDbSecondaryPartitionKey(indexNames = "userId-index")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }


    // =====================================================
    // CANCELLATION REASON
    // =====================================================

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }


    // =====================================================
    // REQUEST STATUS
    // =====================================================

    public String getRequestStatus() {
        return requestStatus;
    }

    public void setRequestStatus(String requestStatus) {
        this.requestStatus = requestStatus;
    }


    // =====================================================
    // REQUESTED AT
    // =====================================================

    public String getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(String requestedAt) {
        this.requestedAt = requestedAt;
    }


    // =====================================================
    // PROCESSED AT
    // =====================================================

    public String getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(String processedAt) {
        this.processedAt = processedAt;
    }


    // =====================================================
    // ADMIN REMARKS
    // =====================================================

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public void setAdminRemarks(String adminRemarks) {
        this.adminRemarks = adminRemarks;
    }
}