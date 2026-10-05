package com.bluecart.bluecart_backend.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.bluecart.bluecart_backend.model.Product;

import software.amazon.awssdk.enhanced.dynamodb.DynamoDbEnhancedClient;
import software.amazon.awssdk.enhanced.dynamodb.DynamoDbTable;
import software.amazon.awssdk.enhanced.dynamodb.TableSchema;

@Repository
public class ProductRepository {

    private final DynamoDbEnhancedClient enhancedClient;
    private final DynamoDbTable<Product> productTable;

    public ProductRepository(DynamoDbEnhancedClient enhancedClient) {

        this.enhancedClient = enhancedClient;

        this.productTable = enhancedClient.table(
                "Products",
                TableSchema.fromBean(Product.class)
        );
    }

    public List<Product> findAll() {

        return productTable.scan()
                .items()
                .stream()
                .toList();
    }

    public Product findById(String id) {

        return productTable.getItem(
                request -> request.key(
                        key -> key.partitionValue(id)
                )
        );
    }

    public List<Product> search(String query) {

        String searchText = query.toLowerCase();

        return productTable.scan()
                .items()
                .stream()
                .filter(product ->
                        contains(product.getName(), searchText)
                        || contains(product.getCategory(), searchText)
                        || contains(product.getBrand(), searchText)
                        || contains(product.getDescription(), searchText)
                        || contains(product.getId(), searchText)
                )
                .toList();
    }

    private boolean contains(String value, String searchText) {

        return value != null
                && value.toLowerCase().contains(searchText);
    }

    public Product save(Product product) {

        productTable.putItem(product);

        return product;
    }

    public void deleteById(String id) {

        productTable.deleteItem(
                request -> request.key(
                        key -> key.partitionValue(id)
                )
        );
    }

    // Saves multiple products in DynamoDB batches.
    // DynamoDB supports a maximum of 25 write operations per batch.
    public void saveAll(List<Product> products) {

        final int batchSize = 25;

        for (int i = 0; i < products.size(); i += batchSize) {

            int endIndex = Math.min(i + batchSize, products.size());

            List<Product> batchProducts =
                    products.subList(i, endIndex);

            var writeBatch =
                    software.amazon.awssdk.enhanced.dynamodb.model.WriteBatch
                            .builder(Product.class)
                            .mappedTableResource(productTable);

            for (Product product : batchProducts) {

                writeBatch.addPutItem(product);
            }

            var batchWriteRequest =
                    software.amazon.awssdk.enhanced.dynamodb.model.BatchWriteItemEnhancedRequest
                            .builder()
                            .writeBatches(writeBatch.build())
                            .build();

            enhancedClient.batchWriteItem(batchWriteRequest);
        }
    }
}