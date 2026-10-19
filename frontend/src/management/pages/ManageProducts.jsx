import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import ProductTable from "../components/ProductTable";

import { apiRequest } from "../../Services/api";


function ManageProducts() {

    const navigate = useNavigate();


    const [products, setProducts] = useState([]);

    const [searchQuery, setSearchQuery] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("All");

    // Sorting is applied after search and category filtering.
    const [sortBy, setSortBy] = useState("price-asc");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    /* =========================
       Fetch Management Products
    ========================= */

    const fetchProducts = useCallback(
        async () => {

            try {

                setLoading(true);

                setError("");


                const data = await apiRequest(
                    "/api/management/products"
                );
            


                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (requestError) {

                console.error(
                    "Management product load error:",
                    requestError
                );


                setProducts([]);


                setError(
                    requestError.message ||
                    "Unable to load products."
                );

            } finally {

                setLoading(false);

            }

        },
        []
    );


    /* =========================
       Initial Product Load
    ========================= */

    useEffect(() => {

        fetchProducts();

    }, [fetchProducts]);


    

    const categories = useMemo(() => {

        const uniqueCategories = [
            ...new Set(
                products
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ];


        return [
            "All",
            ...uniqueCategories
        ];

    }, [products]);


    

    const filteredProducts = useMemo(() => {

        const normalizedSearch =
            searchQuery
                .trim()
                .toLowerCase();


        const filtered = products.filter(
            (product) => {

                const matchesSearch =
                    !normalizedSearch ||
                    product.id
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        ) ||
                    product.name
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        ) ||
                    product.brand
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        ) ||
                    product.category
                        ?.toLowerCase()
                        .includes(
                            normalizedSearch
                        );


                const matchesCategory =
                    selectedCategory ===
                        "All" ||
                    product.category
                        ?.toLowerCase() ===
                        selectedCategory
                            .toLowerCase();


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );

        const getProductDate = (product) => {
            const value = product.createdAt ||
                product.createdDate ||
                product.updatedAt ||
                product.updatedDate;
            const timestamp = value ? new Date(value).getTime() : NaN;
            return Number.isNaN(timestamp) ? null : timestamp;
        };

        return [...filtered].sort((a, b) => {
            if (sortBy === "price-asc" || sortBy === "price-desc") {
                const priceA = Number(a.price);
                const priceB = Number(b.price);
                const safeA = Number.isFinite(priceA) ? priceA : 0;
                const safeB = Number.isFinite(priceB) ? priceB : 0;
                return sortBy === "price-asc" ? safeA - safeB : safeB - safeA;
            }

            const dateA = getProductDate(a);
            const dateB = getProductDate(b);
            // Items without a date stay after items with a valid date.
            if (dateA === null && dateB === null) return 0;
            if (dateA === null) return 1;
            if (dateB === null) return -1;
            return sortBy === "date-asc" ? dateA - dateB : dateB - dateA;
        });

    }, [
        products,
        searchQuery,
        selectedCategory,
        sortBy
    ]);


    

    return (

        <section className="management-products-page">


            {/* =========================
                PAGE HEADING
            ========================= */}

            <div className="management-page-heading">

                <div>

                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage the products
                        available in the
                        Bluecart catalogue.
                    </p>

                </div>


                <button
                    type="button"
                    className="management-primary-button"
                    onClick={() =>
                        navigate(
                            "/management/products/add"
                        )
                    }
                >
                    + Add Product
                </button>

            </div>


            

            <div className="management-products-toolbar">


                {/* SEARCH */}

                <div className="management-products-search">

                    <label
                        htmlFor="management-product-search"
                    >
                        Search products
                    </label>


                    <input
                        id="management-product-search"
                        type="search"
                        value={searchQuery}
                        onChange={(event) =>
                            setSearchQuery(
                                event.target.value
                            )
                        }
                        placeholder="Search by ID, name, brand or category"
                    />

                </div>


                {/* CATEGORY */}

                <div className="management-products-filter">

                    <label
                        htmlFor="management-product-category"
                    >
                        Category
                    </label>


                    <select
                        id="management-product-category"
                        value={selectedCategory}
                        onChange={(event) =>
                            setSelectedCategory(
                                event.target.value
                            )
                        }
                    >

                        {categories.map(
                            (category) => (

                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>

                            )
                        )}

                    </select>

                </div>


                {/* SORTING */}

                <div className="management-products-filter">
                    <label htmlFor="management-product-sort">Sort by</label>
                    <select
                        id="management-product-sort"
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                    >
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="date-desc">Date: Newest to Oldest</option>
                        <option value="date-asc">Date: Oldest to Newest</option>
                    </select>
                </div>

                {/* PRODUCT COUNT */}

                <div className="management-products-count">

                    <span>
                        Showing
                    </span>

                    <strong>
                        {filteredProducts.length}
                    </strong>

                    <span>
                        of {products.length}
                    </span>

                </div>

            </div>


            

            {(sortBy === "date-asc" || sortBy === "date-desc") &&
                products.length > 0 &&
                !products.some((product) =>
                    product.createdAt || product.createdDate ||
                    product.updatedAt || product.updatedDate
                ) && (
                    <p className="management-products-count" role="status">
                        Product date sorting needs a createdAt/updatedAt date from the backend. The current product data does not provide one.
                    </p>
                )}

            {error && (

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
                        onClick={fetchProducts}
                    >
                        Retry
                    </button>

                </div>

            )}


            

            <ProductTable
                products={filteredProducts}
                loading={loading}
            />

        </section>
    );
}


export default ManageProducts;