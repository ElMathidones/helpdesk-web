import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

import CreateTicketForm from "../components/CreateTicketForm"
import { useAuth } from "../hooks/useAuth"
import { getCategories } from "../services/categories"
import { getTickets } from "../services/tickets"
import type { Ticket } from "../types/ticket"
import type { Category } from "../types/category"

import FilterSelect from "../components/FilterSelect"
import LoadingSpinner from "../components/LoadingSpinner"
import TicketsPagination from "../components/TicketsPagination"

interface StoredTicketFilters {
    search: string
    status: string
    priority: string
    category: string
    currentPage: number
    pageSize: 5 | 10
}

function getStoredTicketFilters(
    userId?: number,
): StoredTicketFilters {
    const emptyFilters: StoredTicketFilters = {
        search: "",
        status: "",
        priority: "",
        category: "",
        currentPage: 1,
        pageSize: 10,
    }

    if (!userId) {
        return emptyFilters
    }

    const storageKey = `helpdesk_ticket_filters_${userId}`
    const savedFilters = sessionStorage.getItem(storageKey)

    if (!savedFilters) {
        return emptyFilters
    }

    try {
        const parsed = JSON.parse(savedFilters) as Partial<StoredTicketFilters>

        return {
            search:
                typeof parsed.search === "string"
                    ? parsed.search
                    : "",
            status:
                typeof parsed.status === "string"
                    ? parsed.status
                    : "",
            priority:
                typeof parsed.priority === "string"
                    ? parsed.priority
                    : "",
            category:
                typeof parsed.category === "string"
                    ? parsed.category
                    : "",
            currentPage:
                typeof parsed.currentPage === "number" &&
                Number.isInteger(parsed.currentPage) &&
                parsed.currentPage > 0
                    ? parsed.currentPage
                    : 1,
            pageSize:
                parsed.pageSize === 5 || parsed.pageSize === 10
                    ? parsed.pageSize
                    : 10,
        }
    } catch {
        sessionStorage.removeItem(storageKey)
        return emptyFilters
    }
}

function TicketsPage() {
    const { token, user } = useAuth()
    const { t, i18n } = useTranslation()
    const locale = i18n.resolvedLanguage ?? "pt-BR"

    const [tickets, setTickets] = useState<Ticket[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")
    const storedFilters = getStoredTicketFilters(user?.id)
    const [search, setSearch] = useState(storedFilters.search)
    const [statusFilter, setStatusFilter] = useState(storedFilters.status)
    const [priorityFilter, setPriorityFilter] = useState(storedFilters.priority)
    const [categoryFilter, setCategoryFilter] = useState(
        storedFilters.category,
    )
    const [currentPage, setCurrentPage] = useState(
        storedFilters.currentPage,
    )

    const [pageSize, setPageSize] = useState<5 | 10>(
        storedFilters.pageSize,
    )

    const paginationRef = useRef<HTMLElement | null>(null)

    const previousPaginationTopRef = useRef<number | null>(null)

    function rememberPaginationPosition() {
        previousPaginationTopRef.current =
            paginationRef.current?.getBoundingClientRect().top ?? null
    }

    function handlePageChange(nextPage: number) {
        if (nextPage === currentPage) return

        rememberPaginationPosition()
        setCurrentPage(nextPage)
    }

    function handlePageSizeChange(nextSize: 5 | 10) {
        if (nextSize === pageSize) return

        rememberPaginationPosition()

        setPageSize(nextSize)
        setCurrentPage(1)
    }

    useLayoutEffect(() => {
        const previousTop = previousPaginationTopRef.current

        if (previousTop === null) return

        previousPaginationTopRef.current = null

        const pagination = paginationRef.current

        if (!pagination) return

        const currentTop = pagination.getBoundingClientRect().top

        window.scrollBy(0, currentTop - previousTop)
    }, [currentPage, pageSize])


    useEffect(() => {
        if (!user?.id) {
            return
        }

        sessionStorage.setItem(
            `helpdesk_ticket_filters_${user.id}`,
            JSON.stringify({
                search,
                status: statusFilter,
                priority: priorityFilter,
                category: categoryFilter,
                currentPage,
                pageSize,
            }),
        )
    }, [
        search,
        statusFilter,
        priorityFilter,
        categoryFilter,
        currentPage,
        pageSize,
        user?.id,
    ])

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
                        setError("tickets.errors.load")
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
        return (
                <LoadingSpinner>{t("tickets.loading")}</LoadingSpinner>
        )
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

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTickets.length / pageSize),
    )

    const activePage = Math.min(currentPage, totalPages)

    const paginatedTickets = filteredTickets.slice(
        (activePage - 1) * pageSize,
        activePage * pageSize,
    )

    return (
        <div className="tickets-page">
            <div className="page-header">
                <div>
                    <h1>{t("tickets.page.title")}</h1>
                    <p>{t("tickets.page.description")}</p>
                </div>
            </div>

            <div className="tickets-toolbar">
                <span className="ticket-count">
                    {t("tickets.count", { count: filteredTickets.length })}
                </span>

                <div className="tickets-search">
                    <span className="tickets-search-icon" aria-hidden="true">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>
                    </span>

                    <input
                        type="search"
                        placeholder={t("tickets.search.placeholder")}
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value)
                            setCurrentPage(1)
                        }}
                    />
                </div>

                <div className="tickets-filter">
                    <label htmlFor="status-filter">{t("tickets.filters.status")}</label>

                    <FilterSelect
                        id="status-filter"
                        value={statusFilter}
                        onChange={(value) => {
                            setStatusFilter(value)
                            setCurrentPage(1)
                        }}
                        options={[
                            { value: "", label: t("tickets.filters.allStatuses") },
                            { value: "open", label: t("tickets.status.open") },
                            { value: "under_review", label: t("tickets.status.under_review") },
                            { value: "in_progress", label: t("tickets.status.in_progress") },
                            { value: "resolved", label: t("tickets.status.resolved") },
                            { value: "closed", label: t("tickets.status.closed") },
                            { value: "canceled", label: t("tickets.status.canceled") },
                        ]}
                    />
                </div>

                <div className="tickets-filter">
                    <label htmlFor="priority-filter">{t("tickets.filters.priority")}</label>

                    <FilterSelect
                        id="priority-filter"
                        value={priorityFilter}
                        onChange={(value) => {
                            setPriorityFilter(value)
                            setCurrentPage(1)
                        }}
                        options={[
                            { value: "", label: t("tickets.filters.allPriorities") },
                            { value: "low", label: t("tickets.priority.low") },
                            { value: "medium", label: t("tickets.priority.medium") },
                            { value: "high", label: t("tickets.priority.high") },
                            { value: "critical", label: t("tickets.priority.critical") },
                        ]}
                    />
                </div>

                <div className="tickets-filter">
                    <label htmlFor="category-filter">{t("tickets.filters.category")}</label>

                    <FilterSelect
                        id="category-filter"
                        value={categoryFilter}
                        onChange={(value) => {
                            setCategoryFilter(value)
                            setCurrentPage(1)
                        }}
                        options={[
                            { value: "", label: t("tickets.filters.allCategories") },
                            ...categories.map((category) => ({
                                value: String(category.id),
                                label: category.name,
                            })),
                        ]}
                    />
            </div>
        </div>

        {error && <p className="error-message">{t(error)}</p>}

        <div className="tickets-layout">
            <section className="create-ticket-section">
            <div className="section-title">
                <h2>{t("tickets.create.title")}</h2>
                <p>{t("tickets.create.description")}</p>
            </div>

            <CreateTicketForm
                onCreated={(ticket) => {
                    setTickets((currentTickets) => [ticket, ...currentTickets])
                }}
            />
            </section>

            <section className="tickets-list-section">
                <div className="section-title">
                    <h2>{t("tickets.list.title")}</h2>
                    <p>{t("tickets.list.description")}</p>
                </div>

                {tickets.length === 0 ? (
                    <div className="empty-state">
                        <strong>{t("tickets.list.emptyTitle")}</strong>
                        <p>{t("tickets.list.emptyDescription")}</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="empty-state">
                        <strong>{t("tickets.list.filteredEmptyTitle")}</strong>
                        <p>{t("tickets.list.filteredEmptyDescription")}</p>
                    </div>
                ) : (
                    <div className="tickets-list">
                    {paginatedTickets.map((ticket) => (
                        <Link
                            className="ticket-card"
                            key={ticket.id}
                            to={
                                user?.role === "customer"
                                    ? `/tickets/my/${ticket.creator_ticket_number}`
                                    : `/tickets/${ticket.id}`
                            }
                        >
                        <div className="ticket-card-header">
                            <span className="ticket-number">
                                #
                                {user?.role === "customer"
                                    ? ticket.creator_ticket_number
                                    : ticket.id}
                            </span>

                            <div className="ticket-badges">
                            <span
                                className={`priority-badge priority-${ticket.priority}`}
                            >
                                {t(`tickets.priority.${ticket.priority}`)}
                            </span>

                            <span
                                className={`status-badge status-${ticket.status}`}
                            >
                                {t(`tickets.status.${ticket.status}`)}
                            </span>
                            </div>
                        </div>

                        <h3>{ticket.title}</h3>

                        <p className="ticket-description">{ticket.description}</p>

                        <div className="ticket-card-footer">
                            <span>
                                {t("tickets.list.createdAt", {
                                    date: new Date(ticket.created_at).toLocaleDateString(locale),
                                })}
                            </span>

                            <span>{t("tickets.list.details")} →</span>
                        </div>
                        </Link>
                    ))}
                    </div>
                )}
                {filteredTickets.length > 0 && (
                    <TicketsPagination
                        paginationRef={paginationRef}
                        totalItems={filteredTickets.length}
                        currentPage={activePage}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </section>
        </div>
        </div>
    )
}


export default TicketsPage
