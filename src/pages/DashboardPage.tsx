import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"

import FilterSelect from "../components/FilterSelect"

function DashboardPage() {
    const { token, user } = useAuth()
    const { t, i18n } = useTranslation()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [period, setPeriod] = useState(() => {
        if (!user?.id) {
            return "this_week"
        }

        const savedPeriod = sessionStorage.getItem(
            `helpdesk_dashboard_period_${user.id}`,
        )

        const allowedPeriods = [
            "today",
            "this_week",
            "last_week",
            "this_month",
            "last_month",
            "last_30_days",
            "all",
        ]

        return savedPeriod && allowedPeriods.includes(savedPeriod)
            ? savedPeriod
            : "this_week"
    })


    useEffect(() => {
        if (!user?.id) {
            return
        }

        sessionStorage.setItem(
            `helpdesk_dashboard_period_${user.id}`,
            period,
        )
    }, [period, user?.id])

    useEffect(() => {
        if (!token) return

        const currentToken = token

        async function loadTickets() {
        try {
            const data = await getTickets(currentToken)
            setTickets(data)
        } catch {
            setError("dashboard.error.load")
        } finally {
            setIsLoading(false)
        }
        }

        void loadTickets()
    }, [token])

    const filteredTickets = useMemo(() => {
        if (period === "all") {
            return tickets
        }

        const now = new Date()
        const start = new Date(now)
        const end = new Date(now)

        if (period === "today") {
            start.setHours(0, 0, 0, 0)
            end.setDate(end.getDate() + 1)
            end.setHours(0, 0, 0, 0)
        }

        if (period === "this_week") {
            const dayOfWeek = start.getDay()

            start.setDate(
                start.getDate() -
                    (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
            )
            start.setHours(0, 0, 0, 0)

            end.setDate(start.getDate() + 7)
            end.setHours(0, 0, 0, 0)
        }

        if (period === "last_week") {
            const dayOfWeek = start.getDay()

            start.setDate(
                start.getDate() -
                    (dayOfWeek === 0 ? 6 : dayOfWeek - 1) -
                    7,
            )
            start.setHours(0, 0, 0, 0)

            end.setTime(start.getTime())
            end.setDate(end.getDate() + 7)
        }

        if (period === "this_month") {
            start.setDate(1)
            start.setHours(0, 0, 0, 0)

            end.setMonth(end.getMonth() + 1, 1)
            end.setHours(0, 0, 0, 0)
        }

        if (period === "last_month") {
            start.setDate(1)
            start.setMonth(start.getMonth() - 1)
            start.setHours(0, 0, 0, 0)

            end.setDate(1)
            end.setHours(0, 0, 0, 0)
        }

        if (period === "last_30_days") {
            start.setDate(start.getDate() - 30)
        }

        return tickets.filter((ticket) => {
            const createdAt = new Date(ticket.created_at)

            return createdAt >= start && createdAt < end
        })
    }, [tickets, period])

    const statistics = useMemo(() => {
        const open = filteredTickets.filter(
        (ticket) =>
            ticket.status === "open" || ticket.status === "under_review",
        ).length

        const inProgress = filteredTickets.filter(
        (ticket) => ticket.status === "in_progress",
        ).length

        const resolved = filteredTickets.filter(
        (ticket) =>
            ticket.status === "resolved" || ticket.status === "closed",
        ).length

        return {
        total: filteredTickets.length,
        open,
        inProgress,
        resolved,
        }
    }, [filteredTickets])

    const recentTickets = useMemo(
        () =>
        [...tickets]
            .sort(
            (first, second) =>
                new Date(second.created_at).getTime() -
                new Date(first.created_at).getTime(),
            )
            .slice(0, 5),
        [tickets],
    )

    const statusStatistics = useMemo(() => {
        const statuses: Ticket["status"][] = [
            "open",
            "under_review",
            "in_progress",
            "resolved",
            "closed",
            "canceled",
        ]

        return statuses.map((status) => ({
            status,
            label: t(`dashboard.status.${status}`),
            total: filteredTickets.filter((ticket) => ticket.status === status).length,
        }))
    }, [filteredTickets, t])

    const priorityStatistics = useMemo(() => {
        const priorities: Ticket["priority"][] = [
            "low",
            "medium",
            "high",
            "critical",
        ]

        return priorities.map((priority) => ({
            priority,
            label: t(`dashboard.priority.${priority}`),
            total: filteredTickets.filter((ticket) => ticket.priority === priority).length,
        }))
    }, [filteredTickets, t])

    if (isLoading) {
        return <p>{t("dashboard.loading")}</p>
    }

    return (
        <div className="dashboard-page">
        <div className="dashboard-header">
            <div>
                <h1>{t("dashboard.page.title")}</h1>
                <p>{t("dashboard.page.description")}</p>
            </div>

            <div className="dashboard-period-filter">
                <label htmlFor="dashboard-period">
                    {t("dashboard.period.label")}
                </label>

                <FilterSelect
                    id="dashboard-period"
                    value={period}
                    onChange={setPeriod}
                    options={[
                        { value: "today", label: t("dashboard.period.today") },
                        { value: "this_week", label: t("dashboard.period.thisWeek") },
                        { value: "last_week", label: t("dashboard.period.lastWeek") },
                        { value: "this_month", label: t("dashboard.period.thisMonth") },
                        { value: "last_month", label: t("dashboard.period.lastMonth") },
                        { value: "last_30_days", label: t("dashboard.period.last30Days") },
                        { value: "all", label: t("dashboard.period.all") },
                    ]}
                />
            </div>
        </div>

        {error && <p className="error-message">{t(error)}</p>}

        <section className="stats-grid" aria-label={t("dashboard.stats.ariaLabel")}>
            <article className="stat-card">
            <span className="stat-label">{t("dashboard.stats.total.title")}</span>
            <strong className="stat-value">{statistics.total}</strong>
            <span className="stat-description">{t("dashboard.stats.total.description")}</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">{t("dashboard.stats.open.title")}</span>
            <strong className="stat-value">{statistics.open}</strong>
            <span className="stat-description">{t("dashboard.stats.open.description")}</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">{t("dashboard.stats.inProgress.title")}</span>
            <strong className="stat-value">{statistics.inProgress}</strong>
            <span className="stat-description">{t("dashboard.stats.inProgress.description")}</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">{t("dashboard.stats.resolved.title")}</span>
            <strong className="stat-value">{statistics.resolved}</strong>
            <span className="stat-description">{t("dashboard.stats.resolved.description")}</span>
            </article>
        </section>

        <section className="recent-section">
            <div className="section-header">
            <div>
                <h2>{t("dashboard.recent.title")}</h2>
                <p>{t("dashboard.recent.description")}</p>
            </div>

            <Link to="/tickets">{t("dashboard.recent.viewAll")}</Link>
            </div>

            {recentTickets.length === 0 ? (
            <div className="empty-state">
                <strong>{t("dashboard.recent.emptyTitle")}</strong>
                <p>{t("dashboard.recent.emptyDescription")}</p>
            </div>
            ) : (
            <div className="ticket-list">
                {recentTickets.map((ticket) => (
                <Link
                    className="recent-ticket"
                    key={ticket.id}
                    to={
                        user?.role === "customer"
                            ? `/tickets/my/${ticket.creator_ticket_number}`
                            : `/tickets/${ticket.id}`
                    }
                >
                    <div className="ticket-main-info">
                    <span className="ticket-id">
                        #
                        {user?.role === "customer"
                            ? ticket.creator_ticket_number
                            : ticket.id}
                    </span>

                    <div>
                        <strong>{ticket.title}</strong>
                        <span>
                        {t("dashboard.recent.createdAt", {
                            date: new Date(ticket.created_at).toLocaleDateString(
                                i18n.resolvedLanguage ?? "pt-BR",
                            ),
                        })}
                        </span>
                    </div>
                    </div>

                    <div className="ticket-meta">
                    <span
                        className={`priority-badge priority-${ticket.priority}`}
                    >
                        {t(`dashboard.priority.${ticket.priority}`)}
                    </span>

                    <span className={`status-badge status-${ticket.status}`}>
                        {t(`dashboard.status.${ticket.status}`)}
                    </span>
                    </div>
                </Link>
                ))}
            </div>
            )}
        </section>

        <section
            className="dashboard-charts-wrapper"
            aria-label={t("dashboard.charts.ariaLabel")}
        >
            <div className="dashboard-charts-grid">
                <section className="dashboard-chart-section">
                    <div className="section-header">
                        <div>
                            <h2>{t("dashboard.charts.status.title")}</h2>
                            <p>{t("dashboard.charts.status.description")}</p>
                        </div>
                    </div>

                    <div className="status-chart">
                        {statusStatistics.map((item) => (
                            <div className="status-chart-row" key={item.status}>
                                <div className="status-chart-label">
                                    <div>
                                        <span>{item.label}</span>
                                        <small>{item.total}</small>
                                    </div>

                                    <strong>{formatPercentage(item.total, statistics.total)}</strong>
                                </div>

                                <div className="status-chart-bar">
                                    <div
                                        className={`status-chart-fill status-${item.status}`}
                                        style={{
                                            width:
                                                statistics.total > 0
                                                    ? `${(item.total / statistics.total) * 100}%`
                                                    : "0%",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="dashboard-chart-section">
                    <div className="section-header">
                        <div>
                            <h2>{t("dashboard.charts.priority.title")}</h2>
                            <p>{t("dashboard.charts.priority.description")}</p>
                        </div>
                    </div>

                    <div className="status-chart">
                        {priorityStatistics.map((item) => (
                            <div className="status-chart-row" key={item.priority}>
                                <div className="status-chart-label">
                                    <div>
                                        <span>{item.label}</span>
                                        <small>{item.total}</small>
                                    </div>

                                    <strong>{formatPercentage(item.total, statistics.total)}</strong>
                                </div>

                                <div className="status-chart-bar">
                                    <div
                                        className={`status-chart-fill priority-${item.priority}`}
                                        style={{
                                            width:
                                                statistics.total > 0
                                                    ? `${(item.total / statistics.total) * 100}%`
                                                    : "0%",
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </section>
        </div>
    )
}

function formatPercentage(value: number, total: number) {
    if (total === 0) {
        return "0%"
    }

    return `${Math.round((value / total) * 100)}%`
}

export default DashboardPage
