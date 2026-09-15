import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"

function DashboardPage() {
    const { token, user } = useAuth()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

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

    const statistics = useMemo(() => {
        const open = tickets.filter(
        (ticket) =>
            ticket.status === "open" || ticket.status === "under_review",
        ).length

        const inProgress = tickets.filter(
        (ticket) => ticket.status === "in_progress",
        ).length

        const resolved = tickets.filter(
        (ticket) =>
            ticket.status === "resolved" || ticket.status === "closed",
        ).length

        return {
        total: tickets.length,
        open,
        inProgress,
        resolved,
        }
    }, [tickets])

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

    if (isLoading) {
        return <p>Carregando dashboard...</p>
    }

    return (
        <div className="dashboard-page">
        <div className="page-header">
            <div>
            <h1>Dashboard</h1>
            <p>
                Olá, {user?.name}. Acompanhe uma visão geral dos seus chamados.
            </p>
            </div>

            <Link className="primary-button" to="/tickets">
            Ver chamados
            </Link>
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

export default DashboardPage
