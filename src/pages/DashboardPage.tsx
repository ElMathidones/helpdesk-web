import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"

function DashboardPage() {
    const { token } = useAuth()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [period, setPeriod] = useState("this_week")

    useEffect(() => {
        if (!token) return

        const currentToken = token

        async function loadTickets() {
        try {
            const data = await getTickets(currentToken)
            setTickets(data)
        } catch {
            setError("Não foi possível carregar os dados do dashboard.")
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
            label: formatStatus(status),
            total: filteredTickets.filter((ticket) => ticket.status === status).length,
        }))
    }, [filteredTickets])

    const priorityStatistics = useMemo(() => {
        const priorities: Ticket["priority"][] = [
            "low",
            "medium",
            "high",
            "critical",
        ]

        return priorities.map((priority) => ({
            priority,
            label: formatPriority(priority),
            total: filteredTickets.filter((ticket) => ticket.priority === priority).length,
        }))
    }, [filteredTickets])

    if (isLoading) {
        return <p>Carregando dashboard...</p>
    }

    return (
        <div className="dashboard-page">
        <div className="dashboard-header">
            <div>
                <h1>Dashboard</h1>
                <p>Visão geral dos chamados.</p>
            </div>

            <label className="dashboard-period-filter">
                <span>Período</span>

                <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                >
                    <option value="today">Hoje</option>
                    <option value="this_week">Esta semana</option>
                    <option value="last_week">Semana passada</option>
                    <option value="this_month">Este mês</option>
                    <option value="last_month">Mês passado</option>
                    <option value="last_30_days">Últimos 30 dias</option>
                    <option value="all">Todos</option>
                </select>
            </label>
        </div>

        {error && <p className="error-message">{error}</p>}

        <section className="stats-grid" aria-label="Resumo dos chamados">
            <article className="stat-card">
            <span className="stat-label">Total de chamados</span>
            <strong className="stat-value">{statistics.total}</strong>
            <span className="stat-description">Chamados disponíveis</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">Abertos</span>
            <strong className="stat-value">{statistics.open}</strong>
            <span className="stat-description">Aguardando atendimento</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">Em andamento</span>
            <strong className="stat-value">{statistics.inProgress}</strong>
            <span className="stat-description">Em atendimento</span>
            </article>

            <article className="stat-card">
            <span className="stat-label">Resolvidos</span>
            <strong className="stat-value">{statistics.resolved}</strong>
            <span className="stat-description">Resolvidos ou fechados</span>
            </article>
        </section>

        <section className="recent-section">
            <div className="section-header">
            <div>
                <h2>Chamados recentes</h2>
                <p>Últimos chamados registrados no sistema.</p>
            </div>

            <Link to="/tickets">Ver todos</Link>
            </div>

            {recentTickets.length === 0 ? (
            <div className="empty-state">
                <strong>Nenhum chamado encontrado</strong>
                <p>Os chamados mais recentes aparecerão aqui.</p>
            </div>
            ) : (
            <div className="ticket-list">
                {recentTickets.map((ticket) => (
                <Link
                    className="recent-ticket"
                    key={ticket.id}
                    to={`/tickets/${ticket.id}`}
                >
                    <div className="ticket-main-info">
                    <span className="ticket-id">#{ticket.id}</span>

                    <div>
                        <strong>{ticket.title}</strong>
                        <span>
                        Criado em{" "}
                        {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                    </div>

                    <div className="ticket-meta">
                    <span
                        className={`priority-badge priority-${ticket.priority}`}
                    >
                        {formatPriority(ticket.priority)}
                    </span>

                    <span className={`status-badge status-${ticket.status}`}>
                        {formatStatus(ticket.status)}
                    </span>
                    </div>
                </Link>
                ))}
            </div>
            )}
        </section>

        <section className="dashboard-chart-section">
            <div className="dashboard-charts-grid">
                <section className="dashboard-chart-section">
                    <div className="section-header">
                        <div>
                            <h2>Chamados por status</h2>
                            <p>Distribuição dos chamados no sistema.</p>
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
                            <h2>Chamados por prioridade</h2>
                            <p>Distribuição por nível de prioridade.</p>
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

function formatPriority(priority: Ticket["priority"]) {
    const labels: Record<Ticket["priority"], string> = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
        critical: "Crítica",
    }

    return labels[priority]
}

function formatStatus(status: Ticket["status"]) {
    const labels: Record<Ticket["status"], string> = {
        open: "Aberto",
        under_review: "Em análise",
        in_progress: "Em andamento",
        resolved: "Resolvido",
        closed: "Fechado",
        canceled: "Cancelado",
    }

    return labels[status]
}

function formatPercentage(value: number, total: number) {
    if (total === 0) {
        return "0%"
    }

    return `${Math.round((value / total) * 100)}%`
}

export default DashboardPage
