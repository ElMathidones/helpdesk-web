import { lazy, Suspense } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { useTranslation } from "react-i18next"

import AppLayout from "./components/AppLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import RoleProtectedRoute from "./components/RoleProtectedRoute"
import LoadingSpinner from "./components/LoadingSpinner"

const DashboardPage = lazy(() => import("./pages/DashboardPage"))
const TicketsPage = lazy(() => import("./pages/TicketsPage"))
const TicketDetailsPage = lazy(() => import("./pages/TicketDetailsPage"))
const FaqPage = lazy(() => import("./pages/FaqPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))
const ReportsPage = lazy(() => import("./pages/ReportsPage"))
const LoginPage = lazy(() => import("./pages/LoginPage"))
const ConfirmEmailPage = lazy(
    () => import("./pages/ConfirmEmailPage"),
)

function App() {
    const { t } = useTranslation()

    return (
        <Suspense
            fallback={
                <LoadingSpinner>
                    {t("route.loading")}
                </LoadingSpinner>
            }
        >
            <Routes>
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/confirm-email"
                    element={<ConfirmEmailPage />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                        <Route
                            path="/dashboard"
                            element={<DashboardPage />}
                        />

                        <Route
                            path="/tickets"
                            element={<TicketsPage />}
                        />

                        <Route
                            path="/tickets/my/:number"
                            element={<TicketDetailsPage />}
                        />

                        <Route
                            path="/tickets/:id"
                            element={<TicketDetailsPage />}
                        />

                        <Route
                            path="/faq"
                            element={<FaqPage />}
                        />

                        <Route
                            path="/settings"
                            element={<SettingsPage />}
                        />

                        <Route
                            element={
                                <RoleProtectedRoute
                                    allowedRoles={[
                                        "admin",
                                        "technician",
                                    ]}
                                />
                            }
                        >
                            <Route
                                path="/reports"
                                element={<ReportsPage />}
                            />
                        </Route>
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    )
}

export default App
