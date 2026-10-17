import { useState } from "react"
import { useTranslation } from "react-i18next"
import {
    NavLink,
    Outlet,
    useLocation,
} from "react-router-dom"

import AssistantWidget from "./AssistantWidget"

import { useAuth } from "../hooks/useAuth"
import { useTheme } from "../contexts/useTheme"
import { getAvatarUrl } from "../services/users"

function AppLayout() {
    const { user, logout } = useAuth()
    const { theme } = useTheme()
    const { t } = useTranslation()

    const logoSrc =
        theme === "dark"
            ? "/branding/helpdesk-logo-dark.png"
            : "/branding/helpdesk-logo-light.png"

    const [isMobileMenuOpen, setIsMobileMenuOpen] =
        useState(false)

    const location = useLocation()

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
                    <img
                        className="brand-logo"
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                    />

                    <div>
                        <strong>Help Desk</strong>
                        <span>{t("brand.subtitle")}</span>
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
                            ? t("layout.closeMenu")
                            : t("layout.openMenu")
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
                    aria-label={t("layout.closeMenu")}
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
                    <img
                        className="brand-logo"
                        src={logoSrc}
                        alt=""
                        aria-hidden="true"
                    />

                    <div>
                        <strong>Help Desk</strong>
                        <span>{t("brand.subtitle")}</span>
                    </div>

                    <button
                        type="button"
                        className="mobile-sidebar-close"
                        onClick={closeMobileMenu}
                        aria-label={t("layout.closeMenu")}
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
                        {t("navigation.dashboard")}
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
                        {t("navigation.tickets")}
                    </NavLink>

                    {(user?.role === "admin" ||
                        user?.role === "technician") && (
                        <>
                            <div className="nav-section-title">
                                {t("navigation.analytics")}
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
                                {t("navigation.reports")}
                            </NavLink>
                        </>
                    )}

                    <div className="nav-section-title">
                        {t("navigation.help")}
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
                        {t("navigation.faq")}
                    </NavLink>

                    <div className="nav-section-title">
                        {t("navigation.system")}
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
                        {t("navigation.settings")}
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
                            <span>
                                {user?.role
                                    ? t(`roles.${user.role}`, {
                                        defaultValue: user.role,
                                    })
                                : ""}
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout-button"
                        type="button"
                        onClick={handleLogout}
                    >
                        {t("layout.logout")}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div
                    className="page-transition"
                    key={location.pathname}
                >
                    <Outlet />
                </div>
            </main>

            <AssistantWidget />
        </div>
    )
}

export default AppLayout
