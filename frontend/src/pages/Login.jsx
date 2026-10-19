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
    // ADMIN LOGIN CHOICE
    // =====================================================

    const [showAdminChoice, setShowAdminChoice] =
        useState(false);

    const [pendingLogin, setPendingLogin] =
        useState(null);


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


          

            const responseText =
                await response.text();

            let data = null;

            if (responseText.trim()) {

                try {

                    data = JSON.parse(
                        responseText
                    );

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


           

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    `Login failed. Server returned ${response.status}.`
                );
            }


            // =====================================================
            // VALIDATE LOGIN RESPONSE
            // =====================================================

            if (
                !data?.user ||
                !data?.token ||
                !data?.role
            ) {

                console.error(
                    "Unexpected login response:",
                    data
                );

                throw new Error(
                    "Login response did not contain the user, authentication token and role."
                );
            }


            

            if (
                data.role !== "CUSTOMER" &&
                data.role !== "ADMIN"
            ) {

                throw new Error(
                    "Login response contained an invalid user role."
                );
            }


            console.log(
                "Login successful:",
                data
            );


            console.log(
                "TOKEN RECEIVED:",
                !!data.token
            );


            console.log(
                "USER RECEIVED:",
                !!data.user
            );


            console.log(
                "ROLE RECEIVED:",
                data.role
            );


            

            if (data.role === "CUSTOMER") {

                login(
                    data.user,
                    data.token,
                    data.role
                );

                navigate("/");

                return;
            }


            

            setPendingLogin({
                user: data.user,
                token: data.token,
                role: data.role,
            });

            setShowAdminChoice(true);

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


    

    const continueAsAdministrator = () => {

        if (!pendingLogin) {
            return;
        }

        login(
            pendingLogin.user,
            pendingLogin.token,
            "ADMIN"
        );

        setShowAdminChoice(false);

        setPendingLogin(null);

        navigate("/management");
    };


    

    const continueAsCustomer = () => {

        if (!pendingLogin) {
            return;
        }

        /*
         * IMPORTANT:
         *
         * The backend issued an ADMIN JWT.
         * We must not change the actual JWT role
         * to CUSTOMER on the frontend.
         *
         * Therefore the ADMIN authentication remains ADMIN.
         *
         * This currently takes the administrator to the
         * customer storefront, but the token still has
         * ADMIN privileges at the backend.
         */

        login(
            pendingLogin.user,
            pendingLogin.token,
            "ADMIN"
        );

        setShowAdminChoice(false);

        setPendingLogin(null);

        navigate("/");
    };


    

    const cancelAdminChoice = () => {

        setShowAdminChoice(false);

        setPendingLogin(null);
    };


   

    return (

        <main className="login-page">

           

            {showAdminChoice && (

                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background:
                            "rgba(15, 23, 42, 0.45)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >

                    <div
                        style={{
                            width: "100%",
                            maxWidth: "460px",
                            background: "#ffffff",
                            border:
                                "1px solid #e2e8f0",
                            borderRadius: "14px",
                            padding: "30px",
                            boxShadow:
                                "0 20px 50px rgba(15, 23, 42, 0.18)",
                        }}
                    >

                        <div
                            style={{
                                marginBottom: "24px",
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: "700",
                                    letterSpacing:
                                        "0.08em",
                                    textTransform:
                                        "uppercase",
                                    color: "#64748b",
                                    marginBottom: "8px",
                                }}
                            >
                                Administrator account
                            </div>


                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "24px",
                                    color: "#1e293b",
                                }}
                            >
                                Choose how to continue
                            </h2>


                            <p
                                style={{
                                    margin:
                                        "10px 0 0",
                                    color: "#64748b",
                                    fontSize: "14px",
                                    lineHeight: "1.6",
                                }}
                            >
                                This account has
                                administrator access.
                                Select the area you
                                want to open.
                            </p>

                        </div>


                        <div
                            style={{
                                display: "grid",
                                gap: "12px",
                            }}
                        >

                            {/* ADMINISTRATOR */}

                            <button
                                type="button"
                                onClick={
                                    continueAsAdministrator
                                }
                                style={{
                                    width: "100%",
                                    padding:
                                        "13px 16px",
                                    border:
                                        "1px solid #2563eb",
                                    borderRadius: "8px",
                                    background:
                                        "#2563eb",
                                    color: "#ffffff",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Continue as Administrator
                            </button>


                            {/* CUSTOMER STOREFRONT */}

                            <button
                                type="button"
                                onClick={
                                    continueAsCustomer
                                }
                                style={{
                                    width: "100%",
                                    padding:
                                        "13px 16px",
                                    border:
                                        "1px solid #cbd5e1",
                                    borderRadius: "8px",
                                    background:
                                        "#ffffff",
                                    color: "#334155",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Continue as Customer
                            </button>


                            {/* CANCEL */}

                            <button
                                type="button"
                                onClick={
                                    cancelAdminChoice
                                }
                                style={{
                                    border: "none",
                                    background:
                                        "transparent",
                                    color: "#64748b",
                                    padding: "8px",
                                    cursor: "pointer",
                                    fontSize: "13px",
                                }}
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>
            )}


            

            <div
                className="login-container"
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gridTemplateColumns: "1fr",
                }}
            >

               

                <div
                    className="login-card"
                    style={{
                        width: "100%",
                        maxWidth: "580px",
                    }}
                >

                    

                    <div className="login-card-header">

                        <h2>
                            Welcome back
                        </h2>

                        <p>
                            Sign in to your Bluecart account
                        </p>

                    </div>


                    <form onSubmit={handleSubmit}>

                        

                        {error && (

                            <div
                                style={{
                                    marginBottom: "20px",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    background: "#fff1f2",
                                    border:
                                        "1px solid #fecdd3",
                                    color: "#be123c",
                                    fontSize: "13px",
                                    lineHeight: "1.5",
                                }}
                                role="alert"
                            >
                                {error}
                            </div>
                        )}


                        

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
                                    value={
                                        formData.password
                                    }
                                    onChange={
                                        handleChange
                                    }
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
                                opacity:
                                    loading
                                        ? 0.7
                                        : 1,

                                cursor:
                                    loading
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >

                            {loading
                                ? "Signing in..."
                                : "Sign in"}

                        </button>

                    </form>


                    

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