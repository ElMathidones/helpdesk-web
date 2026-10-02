import { NavLink, Outlet } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { getAvatarUrl } from "../services/users"

function AppLayout() {
    const { user, logout } = useAuth()

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

                    {(user?.role === "admin" || user?.role === "technician") && (
                        <>
                            <div className="nav-section-title">ANÁLISES</div>

                            <NavLink
                                to="/reports"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "nav-link-active" : ""}`
                                }
                            >
                                <span className="nav-icon">◔</span>
                                Relatórios
                            </NavLink>
                        </>
                    )}

                    <div className="nav-section-title">Sistema</div>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `nav-link ${isActive ? "nav-link-active" : ""}`
                        }
                    >
                        <span className="nav-icon">⚙</span>
                        Configurações
                    </NavLink>
                </nav>

                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.avatar_filename ? (
                                <img
                                    src={getAvatarUrl(user.avatar_filename)}
                                    alt=""
                                />
                            ) : (
                                user?.name?.trim().charAt(0).toUpperCase()
                            )}
                        </div>

                        <div className="user-details">
                            <strong>{user?.name}</strong>
                            <span>{user?.role}</span>
                        </div>
                    </div>

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
