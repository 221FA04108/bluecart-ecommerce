import { useAuth } from "../../Context/AuthContext";

function ManagementHeader() {
    const { currentUser } = useAuth();

    const userName =
        currentUser?.name || "Administrator";

    return (
        <header className="management-header">

            <div className="management-header-left">
                <div>
                    <h1 className="management-header-title">
                        Management
                    </h1>

                    <p className="management-header-subtitle">
                        Manage your Bluecart store
                    </p>
                </div>
            </div>


            <div className="management-header-right">

                <div className="management-header-user">

                    <div className="management-header-avatar">
                        {userName
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="management-header-user-info">
                        <span className="management-header-user-name">
                            {userName}
                        </span>

                        <span className="management-header-user-role">
                            Administrator
                        </span>
                    </div>

                </div>

            </div>

        </header>
    );
}

export default ManagementHeader;