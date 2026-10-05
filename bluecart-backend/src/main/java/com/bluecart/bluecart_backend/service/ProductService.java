package com.bluecart.bluecart_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bluecart.bluecart_backend.model.Product;
import com.bluecart.bluecart_backend.repository.ProductRepository;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(String id) {
        return productRepository.findById(id);
    }

    public List<Product> searchProducts(String query) {
        return productRepository.search(query);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(String id) {
        productRepository.deleteById(id);
    }

    // Creates multiple products in DynamoDB
    public int createProducts(List<Product> products) {

        if (products == null || products.isEmpty()) {
            throw new IllegalArgumentException(
                    "Product list cannot be empty"
            );
        }

        for (Product product : products) {

            if (product.getId() == null || product.getId().isBlank()) {
                throw new IllegalArgumentException(
                        "Every product must have an id"
                );
            }

            if (product.getName() == null || product.getName().isBlank()) {
                throw new IllegalArgumentException(
                        "Product name is required for: "
                                + product.getId()
                );
            }

            if (product.getCategory() == null
                    || product.getCategory().isBlank()) {

                throw new IllegalArgumentException(
                        "Product category is required for: "
                                + product.getId()
                );
            }

            if (product.getPrice() == null) {
                throw new IllegalArgumentException(
                        "Product price is required for: "
                                + product.getId()
                );
            }

            if (product.getStock() == null) {
                throw new IllegalArgumentException(
                        "Product stock is required for: "
                                + product.getId()
                );
            }
        }

        productRepository.saveAll(products);

        return products.size();
    }
}