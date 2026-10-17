import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import {
    getReportCategoryDistribution,
    getReportPriorityDistribution,
    getReportStatusDistribution,
    getReportSummary,
    getReportTimeline,
} from "../services/reports"
import ReportTimelineChart from "../components/ReportTimelineChart"
import DateFilter from "../components/DateFilter"

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
    const { t } = useTranslation()

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
                setError(t("reports.loadError"))
            } finally {
                setIsLoading(false)
            }
        }

        void loadReports()
    }, [token, filters, t])

    function handleApplyFilters() {
        setError("")

        const formattedStartDate = parseDateInput(startDate)
        const formattedEndDate = parseDateInput(endDate)

        if (startDate && !formattedStartDate) {
            setError(t("reports.errors.startInvalid"))
            return
        }

        if (endDate && !formattedEndDate) {
            setError(t("reports.errors.endInvalid"))
            return
        }

        if (
            formattedStartDate &&
            formattedEndDate &&
            formattedStartDate > formattedEndDate
        ) {
            setError(t("reports.errors.rangeInvalid"))
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
                    <h1>{t("reports.title")}</h1>
                    <p>{t("reports.description")}</p>
                </div>
            </div>

            <section className="reports-filters">
                <div className="reports-filter-field">
                    <label htmlFor="report-start-date">{t("reports.startDate")}</label>

                    <div className="reports-date-input">
                        <DateFilter
                            id="report-start-date"
                            value={startDate}
                            onChange={setStartDate}
                            placeholder={t("reports.datePlaceholder")}
                            openLabel={t("reports.openStartCalendar")}
                        />
                    </div>
                </div>

                <div className="reports-filter-field">
                    <label htmlFor="report-end-date">{t("reports.endDate")}</label>

                    <div className="reports-date-input">
                        <DateFilter
                            id="report-end-date"
                            value={endDate}
                            onChange={setEndDate}
                            placeholder={t("reports.datePlaceholder")}
                            openLabel={t("reports.openEndCalendar")}
                        />
                    </div>
                </div>

                <div className="reports-filter-actions">
                    <button
                        className="reports-apply-button"
                        type="button"
                        onClick={handleApplyFilters}
                    >
                        {t("reports.apply")}
                    </button>

                    <button
                        className="reports-clear-button"
                        type="button"
                        onClick={handleClearFilters}
                    >
                        {t("reports.clear")}
                    </button>
                </div>
            </section>

            {error && <p className="error-message">{error}</p>}

            {isLoading ? (
                <p>{t("reports.loading")}</p>
            ) : (
                <>
                    {summary && (
                        <section
                            className="stats-grid"
                            aria-label={t("reports.summaryLabel")}
                        >
                            <article className="stat-card">
                                <span className="stat-label">
                                    {t("reports.stats.total")}
                                </span>
                                <strong className="stat-value">
                                    {summary.total}
                                </strong>
                                <span className="stat-description">
                                    {t("reports.stats.totalDescription")}
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">{t("reports.stats.open")}</span>
                                <strong className="stat-value">
                                    {summary.open}
                                </strong>
                                <span className="stat-description">
                                    {t("reports.stats.openDescription")}
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">
                                    {t("reports.stats.inProgress")}
                                </span>
                                <strong className="stat-value">
                                    {summary.in_progress}
                                </strong>
                                <span className="stat-description">
                                    {t("reports.stats.inProgressDescription")}
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">{t("reports.stats.resolved")}</span>
                                <strong className="stat-value">
                                    {summary.resolved}
                                </strong>
                                <span className="stat-description">
                                    {t("reports.stats.resolvedDescription")}
                                </span>
                            </article>

                            <article className="stat-card">
                                <span className="stat-label">{t("reports.stats.canceled")}</span>
                                <strong className="stat-value">
                                    {summary.canceled}
                                </strong>
                                <span className="stat-description">
                                    {t("reports.stats.canceledDescription")}
                                </span>
                            </article>
                        </section>
                    )}

                    <section className="recent-section">
                        <div className="section-header">
                            <div>
                                <h2>{t("reports.timeline.title")}</h2>
                                <p>{t("reports.timeline.description")}</p>
                            </div>
                        </div>

                        <ReportTimelineChart items={timeline} />
                    </section>

                    <section className="dashboard-charts-grid">
                        <ReportDistribution
                            title={t("reports.distribution.byStatus")}
                            items={statuses.map((item) => ({
                                key: item.status,
                                label: t(`tickets.status.${item.status}`, { defaultValue: item.status }),
                                count: item.count,
                                barClassName: `status-${item.status}`,
                            }))}
                            total={summary?.total ?? 0}
                        />

                        <ReportDistribution
                            title={t("reports.distribution.byPriority")}
                            items={priorities.map((item) => ({
                                key: item.priority,
                                label: t(`tickets.priority.${item.priority}`, { defaultValue: item.priority }),
                                count: item.count,
                                barClassName: `priority-${item.priority}`,
                            }))}
                            total={summary?.total ?? 0}
                        />

                        <ReportDistribution
                            title={t("reports.distribution.byCategory")}
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
    const { t } = useTranslation()

    return (
        <section className="dashboard-chart-section">
            <div className="section-header">
                <div>
                    <h2>{title}</h2>
                </div>
            </div>

            {items.length === 0 ? (
                <p className="reports-empty-message">
                    {t("reports.distribution.empty")}
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

function formatPercentage(value: number, total: number) {
    if (total === 0) {
        return "0%"
    }

    return `${Math.round((value / total) * 100)}%`
}

export default ReportsPage
