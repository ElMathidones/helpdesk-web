import LoadingSpinner from "./LoadingSpinner"
import { Navigate, Outlet } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"

function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth()
    const { t } = useTranslation()

    if (isLoading) {
        return <LoadingSpinner>{t("route.loading")}</LoadingSpinner>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}

export default ProtectedRoute
