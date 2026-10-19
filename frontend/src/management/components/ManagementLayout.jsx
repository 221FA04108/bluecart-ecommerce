import { Outlet } from "react-router-dom";

import ManagementSidebar from "./ManagementSidebar";
import ManagementHeader from "./ManagementHeader";

import "../styles/management.css";

function ManagementLayout() {
    return (
        <div className="management-app">

            <ManagementSidebar />

            <main className="management-main">

                <ManagementHeader />

                <div className="management-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}

export default ManagementLayout;