import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    apiRequest
} from "../../Services/api";

import "../styles/Management.css";


function EditProduct() {

    const navigate = useNavigate();

    const { id } = useParams();


    const [formData, setFormData] = useState({
        id: "",
        productFamily: "",
        name: "",
        category: "",
        brand: "",
        description: "",
        variant: "",
        colour: "",
        price: "",
        stock: "",
        imageUrl: "",
        images: "",
        specifications: ""
    });


    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");


    /* =========================
       Load Product
    ========================= */

    const fetchProduct = useCallback(
        async () => {

            try {

                setLoading(true);
                setError("");


                const product =
                    await apiRequest(
                        `/api/management/products/${encodeURIComponent(id)}`
                    );


                if (!product) {

                    throw new Error(
                        "Product was not found."
                    );

                }


                setFormData({
                    id: product.id || "",
                    productFamily:
                        product.productFamily || "",
                    name:
                        product.name || "",
                    category:
                        product.category || "",
                    brand:
                        product.brand || "",
                    description:
                        product.description || "",
                    variant:
                        product.variant || "",
                    colour:
                        product.colour || "",
                    price:
                        product.price ?? "",
                    stock:
                        product.stock ?? "",
                    imageUrl:
                        product.imageUrl || "",
                    images:
                        Array.isArray(product.images)
                            ? product.images.join("\n")
                            : "",
                    specifications:
                        product.specifications
                            ? JSON.stringify(
                                  product.specifications,
                                  null,
                                  2
                              )
                            : ""
                });

            } catch (requestError) {

                console.error(
                    "Edit product load error:",
                    requestError
                );


                setError(
                    requestError.message ||
                    "Unable to load product."
                );

            } finally {

                setLoading(false);

            }

        },
        [id]
    );


    useEffect(() => {

        fetchProduct();

    }, [fetchProduct]);


    /* =========================
       Handle Form Changes
    ========================= */

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setFormData((current) => ({
            ...current,
            [name]: value
        }));

    };


    /* =========================
       Submit Changes
    ========================= */

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const name =
            formData.name.trim();

        const category =
            formData.category.trim();

        const price =
            Number(formData.price);

        const stock =
            Number(formData.stock);


        if (!name) {

            setError(
                "Product name is required."
            );

            return;
        }


        if (!category) {

            setError(
                "Category is required."
            );

            return;
        }


        if (
            formData.price === "" ||
            !Number.isFinite(price) ||
            price <= 0
        ) {

            setError(
                "Price must be greater than 0."
            );

            return;
        }


        if (
            formData.stock === "" ||
            !Number.isInteger(stock) ||
            stock < 0
        ) {

            setError(
                "Stock must be a whole number greater than or equal to 0."
            );

            return;
        }


        const images =
            formData.images
                .split("\n")
                .map(
                    (image) =>
                        image.trim()
                )
                .filter(Boolean);


        let specifications =
            undefined;


        if (
            formData.specifications.trim()
        ) {

            try {

                specifications =
                    JSON.parse(
                        formData.specifications
                    );


                if (
                    typeof specifications !==
                        "object" ||
                    Array.isArray(
                        specifications
                    ) ||
                    specifications === null
                ) {

                    setError(
                        "Specifications must be a JSON object."
                    );

                    return;
                }

            } catch {

                setError(
                    "Specifications must contain valid JSON."
                );

                return;
            }
        }


        const product = {

            id: formData.id,

            productFamily:
                formData.productFamily.trim(),

            name,

            category,

            brand:
                formData.brand.trim(),

            description:
                formData.description.trim(),

            variant:
                formData.variant.trim(),

            colour:
                formData.colour.trim(),

            price,

            stock
        };


        if (
            formData.imageUrl.trim()
        ) {

            product.imageUrl =
                formData.imageUrl.trim();

        }


        if (images.length > 0) {

            product.images =
                images;

        }


        if (specifications) {

            product.specifications =
                specifications;

        }


        try {

            setSaving(true);


            await apiRequest(
                `/api/management/products/${encodeURIComponent(id)}`,
                {
                    method: "PUT",
                    body: JSON.stringify(
                        product
                    )
                }
            );


            navigate(
                "/management/products"
            );

        } catch (requestError) {

            console.error(
                "Edit product error:",
                requestError
            );


            setError(
                requestError.message ||
                "Unable to update product."
            );

        } finally {

            setSaving(false);

        }

    };


    /* =========================
       Loading State
    ========================= */

    if (loading) {

        return (
            <section className="management-add-product-page">

                <div className="management-page-heading">

                    <div>

                        <h1>
                            Edit Product
                        </h1>

                        <p>
                            Loading product details...
                        </p>

                    </div>

                </div>


                <div className="management-products-table-panel">

                    <div className="management-products-table-state">

                        <div className="management-table-spinner" />

                        <p>
                            Loading product...
                        </p>

                    </div>

                </div>

            </section>
        );
    }


    /* =========================
       Error State
    ========================= */

    if (
        error &&
        !formData.id
    ) {

        return (
            <section className="management-add-product-page">

                <div className="management-page-heading">

                    <div>

                        <h1>
                            Edit Product
                        </h1>

                        <p>
                            Unable to load the
                            selected product.
                        </p>

                    </div>

                </div>


                <div
                    className="management-products-error"
                    role="alert"
                >

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={fetchProduct}
                    >
                        Retry
                    </button>

                </div>


                <div className="management-product-form-actions">

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={() =>
                            navigate(
                                "/management/products"
                            )
                        }
                    >
                        Back to Products
                    </button>

                </div>

            </section>
        );
    }


    return (

        <section className="management-add-product-page">


            {/* =========================
                PAGE HEADING
            ========================= */}

            <div className="management-page-heading">

                <div>

                    <h1>
                        Edit Product
                    </h1>

                    <p>
                        Update the product details
                        in the Bluecart catalogue.
                    </p>

                </div>

            </div>


            <form
                className="management-product-form"
                onSubmit={handleSubmit}
            >


                {error && (

                    <div
                        className="management-products-error"
                        role="alert"
                    >
                        {error}
                    </div>

                )}


                {/* =========================
                    BASIC INFORMATION
                ========================= */}

                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Basic Information
                        </h2>

                        <p>
                            Update the core details
                            of the product.
                        </p>

                    </div>


                    <div className="management-product-form-grid">


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-id">
                                Product ID
                            </label>

                            <input
                                id="edit-product-id"
                                name="id"
                                type="text"
                                value={formData.id}
                                readOnly
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-family">
                                Product Family
                            </label>

                            <input
                                id="edit-product-family"
                                name="productFamily"
                                type="text"
                                value={
                                    formData.productFamily
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="edit-product-name">
                                Product Name *
                            </label>

                            <input
                                id="edit-product-name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-category">
                                Category *
                            </label>

                            <input
                                id="edit-product-category"
                                name="category"
                                type="text"
                                value={
                                    formData.category
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-brand">
                                Brand
                            </label>

                            <input
                                id="edit-product-brand"
                                name="brand"
                                type="text"
                                value={
                                    formData.brand
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-variant">
                                Variant
                            </label>

                            <input
                                id="edit-product-variant"
                                name="variant"
                                type="text"
                                value={
                                    formData.variant
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-colour">
                                Colour
                            </label>

                            <input
                                id="edit-product-colour"
                                name="colour"
                                type="text"
                                value={
                                    formData.colour
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>


                {/* =========================
                    PRICING & INVENTORY
                ========================= */}

                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Pricing & Inventory
                        </h2>

                        <p>
                            Update the selling price
                            and available stock.
                        </p>

                    </div>


                    <div className="management-product-form-grid">


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-price">
                                Price *
                            </label>

                            <input
                                id="edit-product-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                    formData.price
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="edit-product-stock">
                                Stock *
                            </label>

                            <input
                                id="edit-product-stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    formData.stock
                                }
                                onChange={handleChange}
                            />

                        </div>

                    </div>

                </div>


                {/* =========================
                    PRODUCT DETAILS
                ========================= */}

                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Product Details
                        </h2>

                        <p>
                            Update the description
                            and product images.
                        </p>

                    </div>


                    <div className="management-product-form-grid">


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="edit-product-description">
                                Description
                            </label>

                            <textarea
                                id="edit-product-description"
                                name="description"
                                rows="5"
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="edit-product-image-url">
                                Primary Image URL
                            </label>

                            <input
                                id="edit-product-image-url"
                                name="imageUrl"
                                type="url"
                                value={
                                    formData.imageUrl
                                }
                                onChange={handleChange}
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="edit-product-images">
                                Additional Image URLs
                            </label>

                            <textarea
                                id="edit-product-images"
                                name="images"
                                rows="4"
                                value={
                                    formData.images
                                }
                                onChange={handleChange}
                                placeholder="Enter one image URL per line"
                            />

                            <small>
                                Enter one URL per line.
                            </small>

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="edit-product-specifications">
                                Specifications
                            </label>

                            <textarea
                                id="edit-product-specifications"
                                name="specifications"
                                rows="6"
                                value={
                                    formData.specifications
                                }
                                onChange={handleChange}
                                placeholder={
                                    '{\n  "RAM": "8GB",\n  "Storage": "256GB"\n}'
                                }
                            />

                            <small>
                                Enter specifications
                                as a JSON object.
                            </small>

                        </div>

                    </div>

                </div>


                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="management-product-form-actions">

                    <button
                        type="button"
                        className="management-secondary-button"
                        onClick={() =>
                            navigate(
                                "/management/products"
                            )
                        }
                        disabled={saving}
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="management-primary-button"
                        disabled={saving}
                    >
                        {saving
                            ? "Saving Changes..."
                            : "Save Changes"}
                    </button>

                </div>

            </form>

        </section>
    );
}


export default EditProduct;