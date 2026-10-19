import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function ManagementSidebar() {
    const navigate = useNavigate();
    const { currentUser, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const getNavClass = ({ isActive }) =>
        `management-nav-item ${isActive ? "active" : ""}`;

    return (
        <aside className="management-sidebar">

            {/* Brand */}

            <div className="management-brand">

                <div className="management-brand-mark">
                    b
                </div>

                <div className="management-brand-text">

                    <span className="management-brand-name">
                        bluecart
                    </span>

                    <span className="management-brand-label">
                        Management
                    </span>

                </div>

            </div>

            {/* Navigation */}

            <nav className="management-navigation">

                {/* Overview */}

                <div className="management-nav-section">

                    <span className="management-nav-heading">
                        OVERVIEW
                    </span>

                    <NavLink
                        to="/management"
                        end
                        className={getNavClass}
                    >

                        <span className="management-nav-icon">
                            ▦
                        </span>

                        <span className="management-nav-label">
                            Dashboard
                        </span>

                    </NavLink>

                </div>

                {/* Management */}

                <div className="management-nav-section">

                    <span className="management-nav-heading">
                        MANAGEMENT
                    </span>

                    <NavLink
                        to="/management/products"
                        className={getNavClass}
                    >

                        <span className="management-nav-icon">
                            ▤
                        </span>

                        <span className="management-nav-label">
                            Products
                        </span>

                    </NavLink>

                    <NavLink
                        to="/management/orders"
                        className={getNavClass}
                    >

                        <span className="management-nav-icon">
                            ≡
                        </span>

                        <span className="management-nav-label">
                            Orders
                        </span>

                    </NavLink>

                    <NavLink
                        to="/management/returns"
                        className={getNavClass}
                    >

                        <span className="management-nav-icon">
                            ↩
                        </span>

                        <span className="management-nav-label">
                            Returns
                        </span>

                    </NavLink>

                    <NavLink
                        to="/management/cancellations"
                        className={getNavClass}
                    >

                        <span className="management-nav-icon">
                            ×
                        </span>

                        <span className="management-nav-label">
                            Cancellations
                        </span>

                    </NavLink>

                </div>

            </nav>

            {/* Administrator section */}

            <div className="management-sidebar-footer">

                <div className="management-admin-profile">

                    <div className="management-admin-avatar">

                        {currentUser?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "A"}

                    </div>

                    <div className="management-admin-info">

                        <span className="management-admin-name">
                            {currentUser?.name ||
                                "Administrator"}
                        </span>

                        <span className="management-admin-role">
                            Administrator
                        </span>

                    </div>

                </div>

                <button
                    type="button"
                    className="management-logout-button"
                    onClick={handleLogout}
                >

                    <span className="management-logout-icon">
                        ↪
                    </span>

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default ManagementSidebar;