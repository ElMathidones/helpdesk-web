import { NavLink, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

function AppLayout() {
    const { user, logout } = useAuth()

    return (
        <div>
        <header>
            <div>
            <strong>Help Desk</strong>
            </div>

            <nav>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/tickets">Tickets</NavLink>
            </nav>

            <div>
            <span>{user?.name}</span>
            <button type="button" onClick={logout}>
                Sair
            </button>
            </div>
        </header>

        <main>
            <Outlet />
        </main>
        </div>
    )
}

export default AppLayout
