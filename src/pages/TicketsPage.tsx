import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import CreateTicketForm from "../components/CreateTicketForm"
import { useAuth } from "../hooks/useAuth"
import { getCategories } from "../services/categories"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"
import type { Category } from "../types/category"

function TicketsPage() {
    const { token } = useAuth()

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [priorityFilter, setPriorityFilter] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")

    useEffect(() => {
        if (!token) {
            return
        }

        const currentToken = token
            let isCancelled = false

            async function loadTickets() {
            try {
                const [ticketsData, categoriesData] = await Promise.all([
                    getTickets(currentToken),
                    getCategories(currentToken),
                ])

                if (!isCancelled) {
                    setTickets(ticketsData)
                    setCategories(categoriesData)
                }
                } catch {
                    if (!isCancelled) {
                        setError("Não foi possível carregar os chamados.")
                    }
                } finally {
                    if (!isCancelled) {
                        setIsLoading(false)
                    }
                }
            }

            void loadTickets()

            return () => {
            isCancelled = true
            }
    }, [token])

    if (isLoading) {
        return <p>Carregando chamados...</p>
    }

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch = ticket.title
            .toLowerCase()
            .includes(search.toLowerCase())

        const matchesStatus =
            statusFilter === "" || ticket.status === statusFilter

        const matchesPriority =
            priorityFilter === "" || ticket.priority === priorityFilter

        const matchesCategory =
            categoryFilter === "" || ticket.category.id === Number(categoryFilter)

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority &&
            matchesCategory
        )
    })

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>Chamados</h1>
                    <p>Crie, acompanhe e gerencie os chamados do sistema.</p>
                </div>
            </div>

            <div className="tickets-toolbar">
                <span className="ticket-count">
                    {filteredTickets.length === 0
                        ? "Nenhum chamado"
                        : `${filteredTickets.length} ${
                            filteredTickets.length === 1 ? "chamado" : "chamados"
                        }`}
                </span>

                <div className="tickets-search">
                    <input
                        type="search"
                        placeholder="Buscar por título..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div className="tickets-filter">
                    <label htmlFor="status-filter">Status</label>

                    <select
                        id="status-filter"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="open">Aberto</option>
                        <option value="under_review">Em análise</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="resolved">Resolvido</option>
                        <option value="closed">Fechado</option>
                        <option value="canceled">Cancelado</option>
                    </select>
                </div>

                <div className="tickets-filter">
                    <label htmlFor="priority-filter">Prioridade</label>

                    <select
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(event) => setPriorityFilter(event.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="critical">Crítica</option>
                    </select>
                </div>

                <div className="tickets-filter">
                    <label htmlFor="category-filter">Categoria</label>

                    <select
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(event) => setCategoryFilter(event.target.value)}
                    >
                        <option value="">Todas</option>

                        {categories
                            .sort((a, b) => {
                                const order = [
                                    "Hardware",
                                    "Software",
                                    "Rede",
                                    "Acesso e Contas",
                                    "E-mail",
                                    "Impressoras",
                                    "Outros",
                                ]

                                return order.indexOf(a.name) - order.indexOf(b.name)
                            })
                            .map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                        ))}
                    </select>
            </div>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="tickets-layout">
            <section className="create-ticket-section">
            <div className="section-title">
                <h2>Novo chamado</h2>
                <p>Preencha os dados para registrar uma nova solicitação.</p>
            </div>

            <CreateTicketForm
                onCreated={(ticket) => {
                    setTickets((currentTickets) => [ticket, ...currentTickets])
                }}
            />
            </section>

            <section className="tickets-list-section">
                <div className="section-title">
                    <h2>Lista de chamados</h2>
                    <p>Chamados disponíveis para o seu usuário.</p>
                </div>

                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <strong>Nenhum chamado encontrado</strong>
                        <p>Crie um novo chamado utilizando o formulário ao lado.</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="empty-state">
                        <strong>Nenhum chamado corresponde aos filtros</strong>
                        <p>Tente alterar ou remover algum filtro.</p>
                    </div>
                ) : (
                    <div className="tickets-list">
                    {filteredTickets.map((ticket) => (
                        <Link
                            className="ticket-card"
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                        >
                        <div className="ticket-card-header">
                            <span className="ticket-number">#{ticket.id}</span>

                            <div className="ticket-badges">
                            <span
                                className={`priority-badge priority-${ticket.priority}`}
                            >
                                {formatPriority(ticket.priority)}
                            </span>

                            <span
                                className={`status-badge status-${ticket.status}`}
                            >
                                {formatStatus(ticket.status)}
                            </span>
                            </div>
                        </div>

                        <h3>{ticket.title}</h3>

                        <p className="ticket-description">{ticket.description}</p>

                        <div className="ticket-card-footer">
                            <span>
                                Criado em{" "}
                                {new Date(ticket.created_at).toLocaleDateString("pt-BR")}
                            </span>

                            <span>Ver detalhes →</span>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
            </section>
        </div>
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

export default TicketsPage
