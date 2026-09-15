import { Navigate, Route, Routes } from "react-router-dom"

import AppLayout from "./components/AppLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardPage from "./pages/DashboardPage"
import LoginPage from "./pages/LoginPage"
import TicketsPage from "./pages/TicketsPage"
import TicketDetailsPage from "./pages/TicketDetailsPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
