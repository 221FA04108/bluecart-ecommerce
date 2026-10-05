import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =====================================================
    // HANDLE INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    // =====================================================
    // LOGIN
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: formData.email.trim(),
                        password: formData.password,
                    }),
                }
            );

            // =====================================================
            // READ RESPONSE
            // =====================================================

            const responseText = await response.text();

            let data = null;

            if (responseText.trim()) {
                try {
                    data = JSON.parse(responseText);
                } catch (parseError) {
                    console.error(
                        "Invalid JSON received from backend:",
                        responseText
                    );

                    throw new Error(
                        "The server returned an invalid response."
                    );
                }
            }

            // =====================================================
            // HANDLE UNSUCCESSFUL LOGIN
            // =====================================================

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    `Login failed. Server returned ${response.status}.`
                );
            }

            // =====================================================
            // VALIDATE LOGIN RESPONSE
            // =====================================================

            if (!data?.user || !data?.token) {
                console.error(
                    "Unexpected login response:",
                    data
                );

                throw new Error(
                    "Login response did not contain the user and authentication token."
                );
            }

            // =====================================================
            // LOGIN SUCCESS
            // =====================================================

            console.log("Login successful:", data);

            console.log(
                "TOKEN RECEIVED:",
                !!data.token
            );

            console.log(
                "USER RECEIVED:",
                !!data.user
            );

            // =====================================================
            // STORE USER + JWT
            // =====================================================

            login(
                data.user,
                data.token
            );

            // =====================================================
            // VERIFY SESSION STORAGE
            // =====================================================

            console.log(
                "TOKEN STORED:",
                !!sessionStorage.getItem(
                    "bluecart_token"
                )
            );

            console.log(
                "USER STORED:",
                !!sessionStorage.getItem(
                    "bluecart_user"
                )
            );

            // =====================================================
            // REDIRECT
            // =====================================================

            navigate("/");

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Unable to login. Please try again."
            );

        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // UI
    // =====================================================

    return (
        <main className="login-page">

            {/* =================================================
                LOGIN CONTAINER
                ================================================= */}

            <div
                className="login-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gridTemplateColumns: "1fr",
                }}
            >

                {/* =================================================
                    ONLY LOGIN CARD
                    ================================================= */}

                <div
                    className="login-card"
                    style={{
                        width: "100%",
                        maxWidth: "580px",
                    }}
                >

                    {/* =================================================
                        HEADER
                        ================================================= */}

                    <div className="login-card-header">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to your Bluecart account
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        {/* =================================================
                            ERROR MESSAGE
                            ================================================= */}

                        {error && (
                            <div
                                style={{
                                    marginBottom: "20px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    background: "#fff1f2",
                                    border: "1px solid #fecdd3",
                                    color: "#be123c",
                                    fontSize: "13px",
                                    lineHeight: "1.5",
                                }}
                                role="alert"
                            >
                                {error}
                            </div>
                        )}


                        {/* =================================================
                            EMAIL
                            ================================================= */}

                        <div className="form-group">

                            <label htmlFor="email">
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* =================================================
                            PASSWORD
                            ================================================= */}

                        <div className="form-group">

                            <div className="password-label">

                                <label htmlFor="password">
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="forgot-password"
                                    onClick={() =>
                                        console.log(
                                            "Forgot password clicked"
                                        )
                                    }
                                >
                                    Forgot password?
                                </button>

                            </div>


                            <div className="password-input">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="show-password"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            REMEMBER ME
                            ================================================= */}

                        <div className="login-options">

                            <label className="remember-me">

                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                />

                                <span>
                                    Remember me
                                </span>

                            </label>

                        </div>


                        {/* =================================================
                            LOGIN BUTTON
                            ================================================= */}

                        <button
                            type="submit"
                            className="login-submit"
                            disabled={loading}
                            style={{
                                opacity: loading ? 0.7 : 1,
                                cursor: loading
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign in"}

                            

                        </button>

                    </form>


                    {/* =================================================
                        REGISTER
                        ================================================= */}

                    <div className="signup-section">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create an account
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}

export default Login;