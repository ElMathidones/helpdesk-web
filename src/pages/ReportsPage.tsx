import { useEffect, useRef, useState } from "react"

import { useAuth } from "../hooks/useAuth"
import {
    getReportCategoryDistribution,
    getReportPriorityDistribution,
    getReportStatusDistribution,
    getReportSummary,
    getReportTimeline,
} from "../services/reports"
import ReportTimelineChart from "../components/ReportTimelineChart"

import type { ReportFilters } from "../services/reports"
import type {
    ReportCategoryItem,
    ReportPriorityItem,
    ReportStatusItem,
    ReportSummary,
    ReportTimelineItem,
} from "../types/report"

function ReportsPage() {
    const { token } = useAuth()
    const startDatePickerRef = useRef<HTMLInputElement>(null)
    const endDatePickerRef = useRef<HTMLInputElement>(null)

    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [timeline, setTimeline] = useState<ReportTimelineItem[]>([])
    const [priorities, setPriorities] = useState<ReportPriorityItem[]>([])
    const [categories, setCategories] = useState<ReportCategoryItem[]>([])
    const [statuses, setStatuses] = useState<ReportStatusItem[]>([])

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [filters, setFilters] = useState<ReportFilters>({})

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        if (!token) return

        const currentToken = token

        async function loadReports() {
            setIsLoading(true)
            setError("")

            try {
                const [
                    summaryData,
                    timelineData,
                    priorityData,
                    categoryData,
                    statusData,
                ] = await Promise.all([
                    getReportSummary(currentToken, filters),
                    getReportTimeline(currentToken, filters),
                    getReportPriorityDistribution(currentToken, filters),
                    getReportCategoryDistribution(currentToken, filters),
                    getReportStatusDistribution(currentToken, filters),
                ])

                setSummary(summaryData)
                setTimeline(timelineData)
                setPriorities(priorityData)
                setCategories(categoryData)
                setStatuses(statusData)
            } catch {
                setError("Não foi possível carregar os relatórios.")
            } finally {
                setIsLoading(false)
            }
        }

        void loadReports()
    }, [token, filters])

    function handleApplyFilters() {
        setError("")

        const formattedStartDate = parseDateInput(startDate)
        const formattedEndDate = parseDateInput(endDate)

        if (startDate && !formattedStartDate) {
            setError("Informe uma data inicial válida.")
            return
        }

        if (endDate && !formattedEndDate) {
            setError("Informe uma data final válida.")
            return
        }

        if (
            formattedStartDate &&
            formattedEndDate &&
            formattedStartDate > formattedEndDate
        ) {
            setError("A data inicial não pode ser posterior à data final.")
            return
        }

        setFilters({
            start_date: formattedStartDate,
            end_date: formattedEndDate,
        })
    }

    function handleClearFilters() {
        setStartDate("")
        setEndDate("")
        setFilters({})
    }

    return (
        <div className="reports-page">
            <div className="reports-header">
                <div>
                    <h1>Relatórios</h1>
                    <p>Análise dos chamados e indicadores de atendimento.</p>
                </div>
            </div>

            <section className="reports-filters">
                <div className="reports-filter-field">
                    <label htmlFor="report-start-date">Data inicial</label>

                    <div className="reports-date-input">
                        <input
                            id="report-start-date"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="DD/MM/AAAA"
                            value={startDate}
                            onChange={(event) =>
                                setStartDate(formatDateInput(event.target.value))
                            }
                        />

                        <button
                            className="reports-date-button"
                            type="button"
                            aria-label="Abrir calendário da data inicial"
                            onClick={() => startDatePickerRef.current?.showPicker()}
                        >
                            <span className="reports-date-chevron" />
                        </button>

                        <input
                            ref={startDatePickerRef}
                            className="reports-date-picker"
                            type="date"
                            tabIndex={-1}
                            value={parseDateInput(startDate) ?? ""}
                            onChange={(event) =>
                                setStartDate(formatDateFromIso(event.target.value))
                            }
                        />
                    </div>
                </div>

                <div className="reports-filter-field">
                    <label htmlFor="report-end-date">Data final</label>

                    <div className="reports-date-input">
                        <input
                            id="report-end-date"
                            type="text"
                            inputMode="numeric"
                            maxLength={10}
                            placeholder="DD/MM/AAAA"
                            value={endDate}
                            onChange={(event) =>
                                setEndDate(formatDateInput(event.target.value))
                            }
                        />

                        <button
                            className="reports-date-button"
                            type="button"
                            aria-label="Abrir calendário da data final"
                            onClick={() => endDatePickerRef.current?.showPicker()}
                        >
                            <span className="reports-date-chevron" />
                        </button>

                        <input
                            ref={endDatePickerRef}
                            className="reports-date-picker"
                            type="date"
                            tabIndex={-1}
                            value={parseDateInput(endDate) ?? ""}
                            onChange={(event) =>
                                setEndDate(formatDateFromIso(event.target.value))
                            }
                        />
                    </div>
                </div>

                <div className="reports-filter-actions">
                    <button
                        className="reports-apply-button"
                        type="button"
                        onClick={handleApplyFilters}
                    >
                        Aplicar
                    </button>

                    <button
                        className="reports-clear-button"
                        type="button"
                        onClick={handleClearFilters}
                    >
                        Limpar
                    </button>
                </div>
            </section>

            {error && <p className="error-message">{error}</p>}

            {isLoading ? (
                <p>Carregando relatórios...</p>
            ) : (
                <>
                    {summary && (
                        <section
                            className="stats-grid"
                            aria-label="Resumo dos relatórios"
                        >
                            <article className="stat-card">
                                <span className="stat-label">
                                    Total de chamados
                                </span>
                                <strong className="stat-value">
                                    {summary.total}
                                </strong>
                                <span className="stat-description">
                                    Chamados registrados
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">Abertos</span>
                                <strong className="stat-value">
                                    {summary.open}
                                </strong>
                                <span className="stat-description">
                                    Abertos ou em análise
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">
                                    Em andamento
                                </span>
                                <strong className="stat-value">
                                    {summary.in_progress}
                                </strong>
                                <span className="stat-description">
                                    Em atendimento
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">Resolvidos</span>
                                <strong className="stat-value">
                                    {summary.resolved}
                                </strong>
                                <span className="stat-description">
                                    Resolvidos ou fechados
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">Cancelados</span>
                                <strong className="stat-value">
                                    {summary.canceled}
                                </strong>
                                <span className="stat-description">
                                    Chamados cancelados
                                </span>
                            </article>
                        </section>
                    )}

                    <section className="recent-section">
                        <div className="section-header">
                            <div>
                                <h2>Chamados criados por dia</h2>
                                <p>Evolução da criação de chamados no período.</p>
                            </div>
                        </div>

                        <ReportTimelineChart items={timeline} />
                    </section>

                    <section className="dashboard-charts-grid">
                        <ReportDistribution
                            title="Chamados por status"
                            items={statuses.map((item) => ({
                                key: item.status,
                                label: formatStatus(item.status),
                                count: item.count,
                                barClassName: `status-${item.status}`,
                            }))}
                            total={summary?.total ?? 0}
                        />

                        <ReportDistribution
                            title="Chamados por prioridade"
                            items={priorities.map((item) => ({
                                key: item.priority,
                                label: formatPriority(item.priority),
                                count: item.count,
                                barClassName: `priority-${item.priority}`,
                            }))}
                            total={summary?.total ?? 0}
                        />

                        <ReportDistribution
                            title="Chamados por categoria"
                            items={categories.map((item) => ({
                                key: String(item.category_id),
                                label: item.category_name,
                                count: item.count,
                            }))}
                            total={summary?.total ?? 0}
                        />
                    </section>
                </>
            )}
        </div>
    )
}

interface DistributionItem {
    key: string
    label: string
    count: number
    barClassName?: string
}

interface ReportDistributionProps {
    title: string
    items: DistributionItem[]
    total: number
}

function ReportDistribution({
    title,
    items,
    total,
}: ReportDistributionProps) {
    return (
        <section className="dashboard-chart-section">
            <div className="section-header">
                <div>
                    <h2>{title}</h2>
                </div>
            </div>

            {items.length === 0 ? (
                <p className="reports-empty-message">
                    Nenhum dado encontrado.
                </p>
            ) : (
                <div className="status-chart">
                    {items.map((item) => (
                        <div className="status-chart-row" key={item.key}>
                            <div className="status-chart-label">
                                <div>
                                    <span>{item.label}</span>
                                    <small>{item.count}</small>
                                </div>

                                <strong>
                                    {formatPercentage(item.count, total)}
                                </strong>
                            </div>

                            <div className="status-chart-bar">
                                <div
                                    className={`status-chart-fill ${item.barClassName ?? ""}`}
                                    style={{
                                        width:
                                            total > 0
                                                ? `${(item.count / total) * 100}%`
                                                : "0%",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}

function formatDateInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8)

    if (digits.length <= 2) {
        return digits
    }

    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function parseDateInput(value: string) {
    if (!value) {
        return undefined
    }

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

    if (!match) {
        return undefined
    }

    const [, day, month, year] = match
    const date = new Date(Number(year), Number(month) - 1, Number(day))

    if (
        date.getFullYear() !== Number(year) ||
        date.getMonth() !== Number(month) - 1 ||
        date.getDate() !== Number(day)
    ) {
        return undefined
    }

    return `${year}-${month}-${day}`
}

function formatDateFromIso(value: string) {
    if (!value) {
        return ""
    }

    const [year, month, day] = value.split("-")

    return `${day}/${month}/${year}`
}

function formatStatus(status: string) {
    const labels: Record<string, string> = {
        open: "Aberto",
        under_review: "Em análise",
        in_progress: "Em andamento",
        resolved: "Resolvido",
        closed: "Fechado",
        canceled: "Cancelado",
    }

    return labels[status] ?? status
}

function formatPriority(priority: string) {
    const labels: Record<string, string> = {
        low: "Baixa",
        medium: "Média",
        high: "Alta",
        critical: "Crítica",
    }

    return labels[priority] ?? priority
}

function formatPercentage(value: number, total: number) {
    if (total === 0) {
        return "0%"
    }

    return `${Math.round((value / total) * 100)}%`
}

export default ReportsPage
