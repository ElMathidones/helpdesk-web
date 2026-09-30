import { NavLink, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"

function AppLayout() {
    const { user, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">H</div>

                    <div>
                        <strong>Help Desk</strong>
                        <span>Support Center</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "nav-link-active" : ""}`
                        }
                    >
                        <span className="nav-icon">▦</span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/tickets"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "nav-link-active" : ""}`
                        }
                    >
                        <span className="nav-icon">▤</span>
                        Chamados
                    </NavLink>

                    <div className="nav-section-title">Análises</div>

                    <div className="nav-link nav-link-disabled">
                        <span className="nav-icon">◔</span>
                        Relatórios
                    </div>

                    <div className="nav-link nav-link-disabled">
                        <span className="nav-icon">▥</span>
                        Analytics
                    </div>

                    <div className="nav-section-title">Sistema</div>

                    <div className="nav-link nav-link-disabled">
                        <span className="nav-icon">⚙</span>
                        Configurações
                    </div>
                </nav>

                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                    >
                        <span>
                            {theme === "light" ? "🌙" : "☀️"}
                        </span>

                        <span>
                            {theme === "light"
                                ? "Modo escuro"
                                : "Modo claro"}
                        </span>
                    </button>

                    <button
                        className="logout-button"
                        type="button"
                        onClick={logout}
                    >
                        Sair
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    )
}

export default AppLayout
