package com.bluecart.bluecart_backend.model;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;

@DynamoDbBean
public class Return {

    private String returnId;
    private String orderId;
    private String userId;

    private String productId;
    private String productName;
    private String productImage;

    private Integer quantity;

    private Double price;
    private Double itemTotal;

    private String returnReason;
    private String otherReturnReason;

    private String returnStatus;

    private String requestedAt;
    private String approvedAt;
    private String rejectedAt;
    private String completedAt;

    private String adminRemarks;


    // =====================================================
    // RETURN ID
    // =====================================================

    @DynamoDbPartitionKey
    public String getReturnId() {
        return returnId;
    }

    public void setReturnId(String returnId) {
        this.returnId = returnId;
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
    // PRODUCT
    // =====================================================

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }


    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }


    public String getProductImage() {
        return productImage;
    }

    public void setProductImage(String productImage) {
        this.productImage = productImage;
    }


    // =====================================================
    // QUANTITY / PRICE
    // =====================================================

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }


    public Double getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(Double itemTotal) {
        this.itemTotal = itemTotal;
    }


    // =====================================================
    // RETURN REASON
    // =====================================================

    public String getReturnReason() {
        return returnReason;
    }

    public void setReturnReason(String returnReason) {
        this.returnReason = returnReason;
    }


    public String getOtherReturnReason() {
        return otherReturnReason;
    }

    public void setOtherReturnReason(String otherReturnReason) {
        this.otherReturnReason = otherReturnReason;
    }


    // =====================================================
    // RETURN STATUS
    // =====================================================

    public String getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(String returnStatus) {
        this.returnStatus = returnStatus;
    }


    // =====================================================
    // TIMESTAMPS
    // =====================================================

    public String getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(String requestedAt) {
        this.requestedAt = requestedAt;
    }


    public String getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(String approvedAt) {
        this.approvedAt = approvedAt;
    }


    public String getRejectedAt() {
        return rejectedAt;
    }

    public void setRejectedAt(String rejectedAt) {
        this.rejectedAt = rejectedAt;
    }
    


    public String getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(String completedAt) {
        this.completedAt = completedAt;
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