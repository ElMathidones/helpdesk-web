import { useState } from "react"
import { NavLink, Outlet } from "react-router-dom"

import AssistantWidget from "./AssistantWidget"

import { useAuth } from "../hooks/useAuth"
import { getAvatarUrl } from "../services/users"

function AppLayout() {
    const { user, logout } = useAuth()

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false)

    function closeMobileMenu() {
        setIsMobileMenuOpen(false)
    }

    function handleLogout() {
        closeMobileMenu()
        logout()
    }

    return (
        <div className="app-layout">
            <header className="mobile-header">
                <div className="mobile-brand">
                    <div className="brand-icon">H</div>

                    <div>
                        <strong>Help Desk</strong>
                        <span>Support Center</span>
                    </div>
                </div>

                <button
                    type="button"
                    className={
                        `mobile-menu-button ${
                            isMobileMenuOpen
                                ? "mobile-menu-button-hidden"
                                : ""
                        }`
                    }
                    onClick={() =>
                        setIsMobileMenuOpen(
                            (current) => !current,
                        )
                    }
                    aria-label={
                        isMobileMenuOpen
                            ? "Fechar menu"
                            : "Abrir menu"
                    }
                    aria-controls="app-sidebar"
                    aria-expanded={isMobileMenuOpen}
                >
                    <span aria-hidden="true">
                        {isMobileMenuOpen ? "×" : "☰"}
                    </span>
                </button>
            </header>

            {isMobileMenuOpen && (
                <button
                    type="button"
                    className="sidebar-backdrop"
                    onClick={closeMobileMenu}
                    aria-label="Fechar menu"
                />
            )}

            <aside
                id="app-sidebar"
                className={
                    `sidebar ${
                        isMobileMenuOpen
                            ? "sidebar-open"
                            : ""
                    }`
                }
            >
                <div className="sidebar-brand">
                    <div className="brand-icon">H</div>

                    <div>
                        <strong>Help Desk</strong>
                        <span>Support Center</span>
                    </div>

                    <button
                        type="button"
                        className="mobile-sidebar-close"
                        onClick={closeMobileMenu}
                        aria-label="Fechar menu"
                    >
                        ×
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <NavLink
                        to="/dashboard"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive
                                    ? "nav-link-active"
                                    : ""
                            }`
                        }
                    >
                        <span className="nav-icon">
                            ▦
                        </span>
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/tickets"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive
                                    ? "nav-link-active"
                                    : ""
                            }`
                        }
                    >
                        <span className="nav-icon">
                            ▤
                        </span>
                        Chamados
                    </NavLink>

                    {(user?.role === "admin" ||
                        user?.role === "technician") && (
                        <>
                            <div className="nav-section-title">
                                ANÁLISES
                            </div>

                            <NavLink
                                to="/reports"
                                onClick={closeMobileMenu}
                                className={({
                                    isActive,
                                }) =>
                                    `nav-link ${
                                        isActive
                                            ? "nav-link-active"
                                            : ""
                                    }`
                                }
                            >
                                <span className="nav-icon">
                                    ◔
                                </span>
                                Relatórios
                            </NavLink>
                        </>
                    )}

                    <div className="nav-section-title">
                        AJUDA
                    </div>

                    <NavLink
                        to="/faq"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive
                                    ? "nav-link-active"
                                    : ""
                            }`
                        }
                    >
                        <span className="nav-icon">
                            ?
                        </span>
                        FAQ
                    </NavLink>

                    <div className="nav-section-title">
                        Sistema
                    </div>

                    <NavLink
                        to="/settings"
                        onClick={closeMobileMenu}
                        className={({ isActive }) =>
                            `nav-link ${
                                isActive
                                    ? "nav-link-active"
                                    : ""
                            }`
                        }
                    >
                        <span className="nav-icon">
                            ⚙
                        </span>
                        Configurações
                    </NavLink>
                </nav>

                <div className="sidebar-user">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.avatar_filename ? (
                                <img
                                    src={getAvatarUrl(
                                        user.avatar_filename,
                                    )}
                                    alt=""
                                />
                            ) : (
                                user?.name
                                    ?.trim()
                                    .charAt(0)
                                    .toUpperCase()
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
                        onClick={handleLogout}
                    >
                        Sair
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            <AssistantWidget />
        </div>
    )
}

export default AppLayout
