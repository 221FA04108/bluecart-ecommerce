package com.bluecart.bluecart_backend.model;

import java.math.BigDecimal;
import java.util.List;

import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbBean;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondaryPartitionKey;
import software.amazon.awssdk.enhanced.dynamodb.mapper.annotations.DynamoDbSecondarySortKey;

@DynamoDbBean
public class Order {

    private String orderId;
    private String userId;

    private String customerName;
    private String email;
    private String mobile;

    private String shippingDoorNo;
    private String shippingStreet;
    private String shippingCity;
    private String shippingDistrict;
    private String shippingState;
    private String shippingPostalCode;

    private String paymentMethod;
    private String status;

    private List<OrderItem> items;

    private BigDecimal subtotal;
    private BigDecimal shipping;
    private BigDecimal tax;
    private BigDecimal total;

    // Order timestamps
    private String createdAt;
    private String updatedAt;

    // Shipment information
    private String trackingNumber;
    private String carrier;
    private String estimatedDelivery;

    // Delivery information
    private String deliveredAt;

    // Cancellation information
    private String cancelledAt;
    private String cancellationReason;


    @DynamoDbPartitionKey
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    @DynamoDbSecondaryPartitionKey(indexNames = "userId-index")
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }


    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }


    public String getShippingDoorNo() {
        return shippingDoorNo;
    }

    public void setShippingDoorNo(String shippingDoorNo) {
        this.shippingDoorNo = shippingDoorNo;
    }


    public String getShippingStreet() {
        return shippingStreet;
    }

    public void setShippingStreet(String shippingStreet) {
        this.shippingStreet = shippingStreet;
    }


    public String getShippingCity() {
        return shippingCity;
    }

    public void setShippingCity(String shippingCity) {
        this.shippingCity = shippingCity;
    }


    public String getShippingDistrict() {
        return shippingDistrict;
    }

    public void setShippingDistrict(String shippingDistrict) {
        this.shippingDistrict = shippingDistrict;
    }


    public String getShippingState() {
        return shippingState;
    }

    public void setShippingState(String shippingState) {
        this.shippingState = shippingState;
    }


    public String getShippingPostalCode() {
        return shippingPostalCode;
    }

    public void setShippingPostalCode(String shippingPostalCode) {
        this.shippingPostalCode = shippingPostalCode;
    }


    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public List<OrderItem> getItems() {
        return items;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }


    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }


    public BigDecimal getShipping() {
        return shipping;
    }

    public void setShipping(BigDecimal shipping) {
        this.shipping = shipping;
    }


    public BigDecimal getTax() {
        return tax;
    }

    public void setTax(BigDecimal tax) {
        this.tax = tax;
    }


    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }


    @DynamoDbSecondarySortKey(indexNames = "userId-index")
    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }


    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }


    public String getTrackingNumber() {
        return trackingNumber;
    }

    public void setTrackingNumber(String trackingNumber) {
        this.trackingNumber = trackingNumber;
    }


    public String getCarrier() {
        return carrier;
    }

    public void setCarrier(String carrier) {
        this.carrier = carrier;
    }


    public String getEstimatedDelivery() {
        return estimatedDelivery;
    }

    public void setEstimatedDelivery(String estimatedDelivery) {
        this.estimatedDelivery = estimatedDelivery;
    }


    public String getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(String deliveredAt) {
        this.deliveredAt = deliveredAt;
    }


    public String getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(String cancelledAt) {
        this.cancelledAt = cancelledAt;
    }


    public String getCancellationReason() {
        return cancellationReason;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }
}