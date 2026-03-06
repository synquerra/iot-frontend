
import { checkAuthAndLogout } from "@/Pages/Auth/authService";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function GuestMiddleware() {
    const isAuthenticated = checkAuthAndLogout();

    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to="/" replace state={{ from: location }} />;
    }

    return <Outlet />;
}
