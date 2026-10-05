package com.bluecart.bluecart_backend.model;

import java.math.BigDecimal;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;

@DynamoDbBean
public class OrderItem {

    private String productId;
    private String name;
    private String category;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal itemTotal;

    // Product configuration
    private String variant;
    private String colour;

    // Return information
    private String returnStatus;
    private String returnReason;
    private String otherReturnReason;
    private String returnRequestedAt;
    private String returnApprovedAt;
    private String returnedAt;

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getItemTotal() {
        return itemTotal;
    }

    public void setItemTotal(BigDecimal itemTotal) {
        this.itemTotal = itemTotal;
    }

    public String getVariant() {
        return variant;
    }

    public void setVariant(String variant) {
        this.variant = variant;
    }

    public String getColour() {
        return colour;
    }

    public void setColour(String colour) {
        this.colour = colour;
    }

    public String getReturnStatus() {
        return returnStatus;
    }

    public void setReturnStatus(String returnStatus) {
        this.returnStatus = returnStatus;
    }

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

    public String getReturnRequestedAt() {
        return returnRequestedAt;
    }

    public void setReturnRequestedAt(String returnRequestedAt) {
        this.returnRequestedAt = returnRequestedAt;
    }

    public String getReturnApprovedAt() {
        return returnApprovedAt;
    }

    public void setReturnApprovedAt(String returnApprovedAt) {
        this.returnApprovedAt = returnApprovedAt;
    }

    public String getReturnedAt() {
        return returnedAt;
    }

    public void setReturnedAt(String returnedAt) {
        this.returnedAt = returnedAt;
    }
}