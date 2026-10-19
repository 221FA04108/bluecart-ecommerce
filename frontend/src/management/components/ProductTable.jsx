import {
    useState
} from "react";

import { useNavigate } from "react-router-dom";

import { apiRequest } from "../../Services/api";
import "../styles/Management.css";
function ProductTable({ products, loading }) {

    const navigate = useNavigate();

    const [deletingId, setDeletingId] = useState("");

    const [deleteError, setDeleteError] = useState("");

    const [deleteProduct, setDeleteProduct] = useState(null);

    /* =========================
       Loading State
    ========================= */

    if (loading) {
        return (
            <div className="management-products-table-panel">

                <div className="management-products-table-state">

                    <div className="management-table-spinner" />

                    <p>
                        Loading products...
                    </p>

                </div>

            </div>
        );
    }


    /* =========================
       Empty State
    ========================= */

    if (!products.length) {
        return (
            <div className="management-products-table-panel">

                <div className="management-products-table-state">

                    <div className="management-table-empty-icon">
                        —
                    </div>

                    <h3>
                        No products found
                    </h3>

                    <p>
                        There are no products matching the
                        current search or category filter.
                    </p>

                </div>

            </div>
        );
    }


    /* =========================
       Delete Product
    ========================= */

    const openDeleteModal = (product) => {

        setDeleteError("");

        setDeleteProduct(product);

    };


    const closeDeleteModal = () => {

        if (deletingId) {
            return;
        }

        setDeleteError("");

        setDeleteProduct(null);

    };


    const handleDelete = async () => {

        if (!deleteProduct) {
            return;
        }

        try {

            setDeletingId(deleteProduct.id);

            setDeleteError("");

            await apiRequest(
                `/api/management/products/${encodeURIComponent(deleteProduct.id)}`,
                {
                    method: "DELETE"
                }
            );

            /*
             * The parent currently owns the product list.
             * Reload the management page after a successful
             * delete so the table and product count are
             * refreshed directly from DynamoDB.
             */
            window.location.reload();

        } catch (requestError) {

            console.error(
                "Management product delete error:",
                requestError
            );

            setDeleteError(
                requestError.message ||
                "Unable to delete product."
            );

            setDeletingId("");

        }

    };


    /* =========================
       Product Table
    ========================= */

    return (
        <>
            {deleteError && (
                <div
                    className="management-products-error"
                    role="alert"
                >
                    {deleteError}
                </div>
            )}

            <div className="management-products-table-panel">

                <div className="management-products-table-wrapper">

                <table className="management-products-table">

                    <thead>

                        <tr>

                            <th>
                                Product
                            </th>

                            <th>
                                Category
                            </th>

                            <th>
                                Brand
                            </th>

                            <th>
                                Price
                            </th>

                            <th>
                                Stock
                            </th>

                            <th>
                                Variant
                            </th>

                            <th>
                                Colour
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {products.map((product) => {

                            /*
                             * Product.java currently supports
                             * both images and the older imageUrl.
                             */

                            const image =
                                product.images?.[0] ||
                                product.imageUrl;


                            /*
                             * Convert stock to a number
                             * for stock-status handling.
                             */

                            const stock =
                                Number(product.stock);


                            let stockClass =
                                "management-stock-normal";


                            if (Number.isFinite(stock)) {

                                if (stock === 0) {

                                    stockClass =
                                        "management-stock-out";

                                } else if (stock <= 5) {

                                    stockClass =
                                        "management-stock-low";

                                }

                            }


                            return (
                                <tr key={product.id}>

                                    {/* PRODUCT */}

                                    <td>

                                        <div className="management-product-cell">

                                            <div className="management-product-image">

                                                {image ? (
                                                    <img
                                                        src={image}
                                                        alt={
                                                            product.name ||
                                                            "Product"
                                                        }
                                                    />
                                                ) : (
                                                    <span>
                                                        —
                                                    </span>
                                                )}

                                            </div>


                                            <div className="management-product-info">

                                                <strong>
                                                    {product.name ||
                                                        "Unnamed product"}
                                                </strong>

                                                <span>
                                                    ID: {product.id || "—"}
                                                </span>

                                            </div>

                                        </div>

                                    </td>


                                    {/* CATEGORY */}

                                    <td>
                                        {product.category || "—"}
                                    </td>


                                    {/* BRAND */}

                                    <td>
                                        {product.brand || "—"}
                                    </td>


                                    {/* PRICE */}

                                    <td className="management-product-price">

                                        {product.price !== null &&
                                        product.price !== undefined
                                            ? `₹${Number(
                                                  product.price
                                              ).toLocaleString("en-IN")}`
                                            : "—"}

                                    </td>


                                    {/* STOCK */}

                                    <td>

                                        <span
                                            className={`management-stock-badge ${stockClass}`}
                                        >
                                            {Number.isFinite(stock)
                                                ? stock
                                                : "—"}
                                        </span>

                                    </td>


                                    {/* VARIANT */}

                                    <td>
                                        {product.variant || "—"}
                                    </td>


                                    {/* COLOUR */}

                                    <td>
                                        {product.colour || "—"}
                                    </td>


                                    {/* ACTIONS */}

                                    <td>

                                        <div className="management-product-actions">

                                            <button
                                                type="button"
                                                className="management-table-action"
                                                onClick={() =>
                                                    navigate(
                                                        `/management/products/edit/${encodeURIComponent(product.id)}`
                                                    )
                                                }
                                            >
                                                Edit
                                            </button>


                                            <button
                                                type="button"
                                                className="management-table-action management-table-action-danger"
                                                onClick={() =>
                                                    openDeleteModal(product)
                                                }
                                                disabled={
                                                    deletingId === product.id
                                                }
                                                title="Delete product"
                                            >
                                                {deletingId === product.id
                                                    ? "Deleting..."
                                                    : "Delete"}
                                            </button>

                                        </div>

                                    </td>

                                </tr>
                            );

                        })}

                    </tbody>

                </table>

                </div>

            </div>


            {/* =========================
               Delete Confirmation Modal
            ========================= */}

            {deleteProduct && (
                <div
                    className="management-delete-modal-overlay"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            !deletingId
                        ) {
                            closeDeleteModal();
                        }
                    }}
                >

                    <div
                        className="management-delete-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="management-delete-modal-title"
                        aria-describedby="management-delete-modal-description"
                        onMouseDown={(event) =>
                            event.stopPropagation()
                        }
                    >

                       


                        <div className="management-delete-modal-content">

                            <h2 id="management-delete-modal-title">
                                Delete Product
                            </h2>

                            <p id="management-delete-modal-description">
                                Are you sure you want to delete{" "}
                                <strong>
                                    "{deleteProduct.name || deleteProduct.id}"
                                </strong>
                                ?
                            </p>

                            


                            {deleteError && (
                                <div
                                    className="management-delete-modal-error"
                                    role="alert"
                                >
                                    {deleteError}
                                </div>
                            )}


                            <div className="management-delete-modal-actions">

                                <button
                                    type="button"
                                    className="management-secondary-button"
                                    onClick={closeDeleteModal}
                                    disabled={Boolean(deletingId)}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="button"
                                    className="management-delete-confirm-button"
                                    onClick={handleDelete}
                                    disabled={Boolean(deletingId)}
                                >
                                    {deletingId
                                        ? "Deleting..."
                                        : "Delete Product"}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            )}

        </>
    );
}


export default ProductTable;