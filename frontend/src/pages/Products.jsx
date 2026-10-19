import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCardtemp";
import { apiRequest } from "../Services/api";
import "./Products.css";

function Products() {

    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get("search")?.trim() || "";


    const [products, setProducts] = useState(() => {

        try {

            const cachedProducts =
                sessionStorage.getItem("bluecart_products");

            return cachedProducts
                ? JSON.parse(cachedProducts)
                : [];

        } catch (error) {

            console.error(
                "Unable to read cached products:",
                error
            );

            return [];
        }
    });


    

    const [loading, setLoading] = useState(() => {

        try {

            const cachedProducts =
                sessionStorage.getItem("bluecart_products");

            return !cachedProducts;

        } catch (error) {

            return true;
        }
    });


    

    const [searching, setSearching] = useState(false);


    const [error, setError] = useState("");


    const [selectedCategory, setSelectedCategory] =
        useState("All");


    const [sortOption, setSortOption] =
        useState("default");


    const [minPrice, setMinPrice] =
        useState(0);


    const [maxPrice, setMaxPrice] =
        useState(100000);


    /* =========================
       Fetch Products / Search
    ========================= */

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                setError("");


                /*
                 * SEARCH
                 *
                 * Keep the existing product grid visible.
                 * Do not trigger the full-page loading screen.
                 */

                if (searchQuery) {

                    setSearching(true);

                    const data = await apiRequest(
                        `/api/products/search?query=${encodeURIComponent(searchQuery)}`
                    );

                    setProducts(data);

                    return;
                }


                /*
                 * NORMAL CATALOGUE
                 *
                 * Full loading is appropriate here because
                 * we are loading the complete catalogue.
                 */

                setSearching(false);

                setLoading(true);


                const data = await apiRequest(
                    "/api/products"
                );


                setProducts(data);


                

                sessionStorage.setItem(
                    "bluecart_products",
                    JSON.stringify(data)
                );

            } catch (error) {

                console.error(error);


                if (searchQuery) {

                    

                    setError(
                        "Unable to search products."
                    );

                } else {

                    setProducts([]);

                    setError(
                        "Unable to load products."
                    );
                }

            } finally {

                setLoading(false);

                setSearching(false);
            }
        };


        fetchProducts();

    }, [searchQuery]);


    /* =========================
       Dynamic Categories
    ========================= */

    const categories = useMemo(() => {

        const uniqueCategories = [
            ...new Set(
                products
                    .map((product) => product.category)
                    .filter(Boolean)
            )
        ];

        return ["All", ...uniqueCategories];

    }, [products]);


    /* =========================
       Product Price Range
    ========================= */

    const productMaxPrice = useMemo(() => {

        if (products.length === 0) {
            return 100000;
        }


        const highestPrice = Math.max(
            ...products.map(
                (product) =>
                    Number(product.price) || 0
            )
        );


        return Math.ceil(
            highestPrice / 500
        ) * 500;

    }, [products]);


    /* =========================
       Filter + Sort Products
    ========================= */

    const filteredProducts = useMemo(() => {

        let result = [...products];


        /* Category */

        if (selectedCategory !== "All") {

            result = result.filter(
                (product) =>
                    product.category?.toLowerCase() ===
                    selectedCategory.toLowerCase()
            );
        }


        /* Price */

        result = result.filter(
            (product) =>
                Number(product.price) >= minPrice &&
                Number(product.price) <= maxPrice
        );


        /* Sorting */

        if (sortOption === "price-low") {

            result.sort(
                (a, b) =>
                    Number(a.price) -
                    Number(b.price)
            );
        }


        if (sortOption === "price-high") {

            result.sort(
                (a, b) =>
                    Number(b.price) -
                    Number(a.price)
            );
        }


        if (sortOption === "name") {

            result.sort((a, b) =>
                a.name.localeCompare(b.name)
            );
        }


        return result;

    }, [
        products,
        selectedCategory,
        minPrice,
        maxPrice,
        sortOption
    ]);


    

    if (loading) {

        return (

            <div className="products-status">

                <h2>
                    Loading products...
                </h2>

            </div>
        );
    }


    

    if (error && !searchQuery) {

        return (

            <div className="products-status">

                <h2>
                    {error}
                </h2>

            </div>
        );
    }


    

    return (

        <div className="products-page">


            {/* Header */}

            <section className="products-header">

                <h1>
                    {searchQuery
                        ? `Search results for "${searchQuery}"`
                        : "Explore Products"}
                </h1>

                <p>
                    {searchQuery
                        ? "Showing products matching your search."
                        : ""}
                </p>

            </section>


            {/* Categories */}

            <div className="category-list">

                {categories.map((category) => (

                    <button
                        key={category}
                        className={
                            selectedCategory === category
                                ? "category-button active"
                                : "category-button"
                        }
                        onClick={() =>
                            setSelectedCategory(category)
                        }
                    >

                        {category}

                    </button>

                ))}

            </div>


            {/* Main Content */}

            <div className="products-content">


                {/* Price Sidebar */}

                <aside className="filter-sidebar">

                    <h3>
                        Price Range
                    </h3>


                    <div className="price-values">

                        <span>
                            ₹{minPrice.toLocaleString("en-IN")}
                        </span>

                        <span>
                            ₹{maxPrice.toLocaleString("en-IN")}
                        </span>

                    </div>


                    {/* Minimum Price */}

                    <label>
                        Minimum Price
                    </label>

                    <input
                        type="range"
                        min="0"
                        max={productMaxPrice}
                        step="500"
                        value={minPrice}
                        onChange={(e) => {

                            const value =
                                Number(e.target.value);

                            if (value <= maxPrice) {

                                setMinPrice(value);
                            }

                        }}
                    />


                    {/* Maximum Price */}

                    <label>
                        Maximum Price
                    </label>

                    <input
                        type="range"
                        min="0"
                        max={productMaxPrice}
                        step="500"
                        value={maxPrice}
                        onChange={(e) => {

                            const value =
                                Number(e.target.value);

                            if (value >= minPrice) {

                                setMaxPrice(value);
                            }

                        }}
                    />

                </aside>


                {/* Products Section */}

                <section className="products-section">


                    {/* Toolbar */}

                    <div className="products-toolbar">

                        <p>
                            {filteredProducts.length} Products
                        </p>


                        <div className="products-toolbar-right">

                            {searching && (

                                <span className="searching-indicator">
                                    Searching...
                                </span>

                            )}


                            <select
                                value={sortOption}
                                onChange={(e) =>
                                    setSortOption(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="default">
                                    Sort: Recommended
                                </option>

                                <option value="price-low">
                                    Price: Low to High
                                </option>

                                <option value="price-high">
                                    Price: High to Low
                                </option>

                                <option value="name">
                                    Name: A-Z
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* Search Error */}

                    {error && searchQuery && (

                        <div className="search-error">

                            {error}

                        </div>

                    )}


                    {/* Empty State */}

                    {filteredProducts.length === 0 ? (

                        <div className="no-products">

                            <h2>
                                {searchQuery
                                    ? "No results found"
                                    : "No products found"}
                            </h2>

                            <p>
                                {searchQuery
                                    ? `We couldn't find any products matching "${searchQuery}".`
                                    : "Try changing your category or price range."}
                            </p>

                        </div>

                    ) : (

                        /* Product Grid */

                        <div className="product-grid">

                            {filteredProducts.map(
                                (product) => (

                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />

                                )
                            )}

                        </div>

                    )}

                </section>

            </div>

        </div>
    );
}

export default Products;