
import { checkAuthAndLogout } from "@/Pages/Auth/authService";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function RequireAuth() {
    const isAuthenticated = checkAuthAndLogout();

    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }
    if (isAuthenticated && location.pathname == "/auth/login") {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
