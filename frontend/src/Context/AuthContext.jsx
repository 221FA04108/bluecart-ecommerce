import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

const USER_STORAGE_KEY = "bluecart_user";
const TOKEN_STORAGE_KEY = "bluecart_token";
const ROLE_STORAGE_KEY = "bluecart_role";

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // =====================================================
    // RESTORE LOGIN SESSION
    // =====================================================

    useEffect(() => {

        try {

            const storedUser = sessionStorage.getItem(
                USER_STORAGE_KEY
            );

            const storedToken = sessionStorage.getItem(
                TOKEN_STORAGE_KEY
            );

            const storedRole = sessionStorage.getItem(
                ROLE_STORAGE_KEY
            );

            if (
                storedUser &&
                storedToken &&
                storedRole
            ) {

                const parsedUser = JSON.parse(storedUser);

                setCurrentUser(parsedUser);
                setToken(storedToken);
                setRole(storedRole);

            } else {

                sessionStorage.removeItem(
                    USER_STORAGE_KEY
                );

                sessionStorage.removeItem(
                    TOKEN_STORAGE_KEY
                );

                sessionStorage.removeItem(
                    ROLE_STORAGE_KEY
                );

                setCurrentUser(null);
                setToken(null);
                setRole(null);
            }

        } catch (error) {

            console.error(
                "Error restoring user session:",
                error
            );

            sessionStorage.removeItem(
                USER_STORAGE_KEY
            );

            sessionStorage.removeItem(
                TOKEN_STORAGE_KEY
            );

            sessionStorage.removeItem(
                ROLE_STORAGE_KEY
            );

            setCurrentUser(null);
            setToken(null);
            setRole(null);

        } finally {

            setLoading(false);
        }

    }, []);

    // =====================================================
    // LOGIN
    // =====================================================

    const login = (
        user,
        authToken,
        authRole
    ) => {

        if (
            !user ||
            !authToken ||
            !authRole
        ) {

            console.error(
                "Login failed: user, token or role missing"
            );

            return;
        }

        sessionStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(user)
        );

        sessionStorage.setItem(
            TOKEN_STORAGE_KEY,
            authToken
        );

        sessionStorage.setItem(
            ROLE_STORAGE_KEY,
            authRole
        );

        setCurrentUser(user);
        setToken(authToken);
        setRole(authRole);
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        sessionStorage.removeItem(
            USER_STORAGE_KEY
        );

        sessionStorage.removeItem(
            TOKEN_STORAGE_KEY
        );

        sessionStorage.removeItem(
            ROLE_STORAGE_KEY
        );

        setCurrentUser(null);
        setToken(null);
        setRole(null);
    };

    // =====================================================
    // REFRESH USER SESSION
    // =====================================================

    const refreshUser = () => {

        try {

            const storedUser = sessionStorage.getItem(
                USER_STORAGE_KEY
            );

            const storedToken = sessionStorage.getItem(
                TOKEN_STORAGE_KEY
            );

            const storedRole = sessionStorage.getItem(
                ROLE_STORAGE_KEY
            );

            if (
                storedUser &&
                storedToken &&
                storedRole
            ) {

                const parsedUser = JSON.parse(storedUser);

                setCurrentUser(parsedUser);
                setToken(storedToken);
                setRole(storedRole);

            } else {

                setCurrentUser(null);
                setToken(null);
                setRole(null);
            }

        } catch (error) {

            console.error(
                "Error refreshing user:",
                error
            );

            setCurrentUser(null);
            setToken(null);
            setRole(null);
        }
    };

    // =====================================================
    // AUTHENTICATION STATE
    // =====================================================

    const isAuthenticated =
        currentUser !== null &&
        token !== null &&
        role !== null;

    const isAdmin =
        role === "ADMIN";

    const isCustomer =
        role === "CUSTOMER";

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                token,
                role,
                isAdmin,
                isCustomer,
                isAuthenticated,
                loading,
                login,
                logout,
                refreshUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}