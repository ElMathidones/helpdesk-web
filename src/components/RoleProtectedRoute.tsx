import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

interface RoleProtectedRouteProps {
    allowedRoles: string[]
}

export default function RoleProtectedRoute({
    allowedRoles,
}: RoleProtectedRouteProps) {
    const { user } = useAuth()

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return <Outlet />
}
