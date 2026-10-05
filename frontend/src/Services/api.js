const API_BASE_URL = "http://localhost:8080";

export async function apiRequest(endpoint, options = {}) {

    const token = sessionStorage.getItem("bluecart_token");


    // =====================================================
    // TEMPORARY DEBUG LOGS
    // =====================================================

    console.log("=================================");
    console.log("API REQUEST:", endpoint);
    console.log("JWT AVAILABLE:", !!token);


    const headers = {
        ...(options.headers || {}),
    };


    // Attach JWT to protected API requests

    if (token) {

        headers.Authorization = `Bearer ${token}`;

    }


    // =====================================================
    // TEMPORARY DEBUG LOG
    // =====================================================

    console.log(
        "AUTH HEADER ADDED:",
        !!headers.Authorization
    );


    // Automatically set JSON content type when a body exists

    if (
        options.body &&
        !headers["Content-Type"]
    ) {

        headers["Content-Type"] = "application/json";

    }


    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );


    // =====================================================
    // TEMPORARY DEBUG LOG
    // =====================================================

    console.log(
        "API RESPONSE STATUS:",
        response.status
    );

    console.log(
        "API RESPONSE OK:",
        response.ok
    );

    console.log("=================================");


    // Handle expired/invalid JWT

    if (response.status === 401) {

        sessionStorage.removeItem("bluecart_user");

        sessionStorage.removeItem("bluecart_token");


        window.dispatchEvent(
            new Event("bluecart-auth-expired")
        );


        throw new Error(
            "Your session has expired. Please login again."
        );
    }


    // Read response

    let data = null;

    const contentType =
        response.headers.get("content-type");


    if (
        contentType &&
        contentType.includes("application/json")
    ) {

        data = await response.json();

    }


    // Handle other API errors

    if (!response.ok) {

        const message =
            data?.message ||
            `API request failed with status ${response.status}`;


        throw new Error(message);

    }


    return data;
}