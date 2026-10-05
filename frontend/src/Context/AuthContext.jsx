import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

const AuthContext = createContext();

const USER_STORAGE_KEY = "bluecart_user";
const TOKEN_STORAGE_KEY = "bluecart_token";

export function AuthProvider({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [token, setToken] = useState(null);
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

            if (storedUser && storedToken) {

                const parsedUser = JSON.parse(storedUser);

                setCurrentUser(parsedUser);
                setToken(storedToken);

            } else {

                sessionStorage.removeItem(USER_STORAGE_KEY);
                sessionStorage.removeItem(TOKEN_STORAGE_KEY);

                setCurrentUser(null);
                setToken(null);
            }

        } catch (error) {

            console.error(
                "Error restoring user session:",
                error
            );

            sessionStorage.removeItem(USER_STORAGE_KEY);
            sessionStorage.removeItem(TOKEN_STORAGE_KEY);

            setCurrentUser(null);
            setToken(null);

        } finally {

            setLoading(false);
        }

    }, []);

    // =====================================================
    // LOGIN
    // =====================================================

    const login = (user, authToken) => {

        if (!user || !authToken) {
            console.error("Login failed: user or token missing");
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

        setCurrentUser(user);
        setToken(authToken);
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {

        sessionStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);

        setCurrentUser(null);
        setToken(null);
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

            if (storedUser && storedToken) {

                const parsedUser = JSON.parse(storedUser);

                setCurrentUser(parsedUser);
                setToken(storedToken);

            } else {

                setCurrentUser(null);
                setToken(null);
            }

        } catch (error) {

            console.error(
                "Error refreshing user:",
                error
            );

            setCurrentUser(null);
            setToken(null);
        }
    };

    // =====================================================
    // AUTHENTICATION STATE
    // =====================================================

    const isAuthenticated =
        currentUser !== null &&
        token !== null;

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                token,
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