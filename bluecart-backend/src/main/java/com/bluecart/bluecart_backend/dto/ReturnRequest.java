package com.bluecart.bluecart_backend.dto;

public class ReturnRequest {

    private String orderId;
    private String productId;

    private Integer quantity;

    private String returnReason;
    private String otherReturnReason;


    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }


    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
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
}