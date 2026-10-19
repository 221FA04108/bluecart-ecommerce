import {
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    apiRequest
} from "../../Services/api";
import "../styles/Management.css";


function AddProduct() {

    const navigate = useNavigate();

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

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");


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


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        const id = formData.id.trim();
        const name = formData.name.trim();
        const category = formData.category.trim();
        const price = Number(formData.price);
        const stock = Number(formData.stock);


        if (!id) {
            setError("Product ID is required.");
            return;
        }

        if (!name) {
            setError("Product name is required.");
            return;
        }

        if (!category) {
            setError("Category is required.");
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


        const images = formData.images
            .split("\n")
            .map((image) => image.trim())
            .filter(Boolean);


        let specifications = undefined;

        if (formData.specifications.trim()) {

            try {

                specifications =
                    JSON.parse(
                        formData.specifications
                    );

                if (
                    typeof specifications !==
                        "object" ||
                    Array.isArray(specifications) ||
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
            id,
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


        if (formData.imageUrl.trim()) {
            product.imageUrl =
                formData.imageUrl.trim();
        }

        if (images.length > 0) {
            product.images = images;
        }

        if (specifications) {
            product.specifications =
                specifications;
        }


        try {

            setSaving(true);

            await apiRequest(
                "/api/management/products",
                {
                    method: "POST",
                    body: JSON.stringify(product)
                }
            );

            navigate(
                "/management/products"
            );

        } catch (requestError) {

            console.error(
                "Add product error:",
                requestError
            );

            setError(
                requestError.message ||
                "Unable to create product."
            );

        } finally {

            setSaving(false);

        }
    };


    return (
        <section className="management-add-product-page">

            <div className="management-page-heading">

                <div>

                    <h1>
                        Add Product
                    </h1>

                    <p>
                        Add a new product to the
                        Bluecart catalogue.
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


                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Basic Information
                        </h2>

                        <p>
                            Enter the core details
                            of the product.
                        </p>

                    </div>


                    <div className="management-product-form-grid">

                        <div className="management-product-form-field">

                            <label htmlFor="product-id">
                                Product ID *
                            </label>

                            <input
                                id="product-id"
                                name="id"
                                type="text"
                                value={formData.id}
                                onChange={handleChange}
                                placeholder="e.g. MOB001"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-family">
                                Product Family
                            </label>

                            <input
                                id="product-family"
                                name="productFamily"
                                type="text"
                                value={
                                    formData.productFamily
                                }
                                onChange={handleChange}
                                placeholder="e.g. Smartphones"
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="product-name">
                                Product Name *
                            </label>

                            <input
                                id="product-name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter product name"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-category">
                                Category *
                            </label>

                            <input
                                id="product-category"
                                name="category"
                                type="text"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="e.g. Mobiles"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-brand">
                                Brand
                            </label>

                            <input
                                id="product-brand"
                                name="brand"
                                type="text"
                                value={formData.brand}
                                onChange={handleChange}
                                placeholder="e.g. Samsung"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-variant">
                                Variant
                            </label>

                            <input
                                id="product-variant"
                                name="variant"
                                type="text"
                                value={formData.variant}
                                onChange={handleChange}
                                placeholder="e.g. 256GB"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-colour">
                                Colour
                            </label>

                            <input
                                id="product-colour"
                                name="colour"
                                type="text"
                                value={formData.colour}
                                onChange={handleChange}
                                placeholder="e.g. Black"
                            />

                        </div>

                    </div>

                </div>


                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Pricing & Inventory
                        </h2>

                        <p>
                            Set the selling price and
                            available stock.
                        </p>

                    </div>


                    <div className="management-product-form-grid">

                        <div className="management-product-form-field">

                            <label htmlFor="product-price">
                                Price *
                            </label>

                            <input
                                id="product-price"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                            />

                        </div>


                        <div className="management-product-form-field">

                            <label htmlFor="product-stock">
                                Stock *
                            </label>

                            <input
                                id="product-stock"
                                name="stock"
                                type="number"
                                min="0"
                                step="1"
                                value={formData.stock}
                                onChange={handleChange}
                                placeholder="0"
                            />

                        </div>

                    </div>

                </div>


                <div className="management-product-form-section">

                    <div className="management-product-form-section-heading">

                        <h2>
                            Product Details
                        </h2>

                        <p>
                            Add the description and
                            product images.
                        </p>

                    </div>


                    <div className="management-product-form-grid">

                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="product-description">
                                Description
                            </label>

                            <textarea
                                id="product-description"
                                name="description"
                                rows="5"
                                value={
                                    formData.description
                                }
                                onChange={handleChange}
                                placeholder="Enter product description"
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="product-image-url">
                                Primary Image URL
                            </label>

                            <input
                                id="product-image-url"
                                name="imageUrl"
                                type="url"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="https://example.com/image.jpg"
                            />

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="product-images">
                                Additional Image URLs
                            </label>

                            <textarea
                                id="product-images"
                                name="images"
                                rows="4"
                                value={formData.images}
                                onChange={handleChange}
                                placeholder={
                                    "Enter one image URL per line"
                                }
                            />

                            <small>
                                Enter one URL per line.
                            </small>

                        </div>


                        <div className="management-product-form-field management-product-form-field-full">

                            <label htmlFor="product-specifications">
                                Specifications
                            </label>

                            <textarea
                                id="product-specifications"
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
                                Enter specifications as
                                a JSON object.
                            </small>

                        </div>

                    </div>

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
                            ? "Adding Product..."
                            : "Add Product"}
                    </button>

                </div>

            </form>

        </section>
    );
}


export default AddProduct;