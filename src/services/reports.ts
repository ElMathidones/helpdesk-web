import { API_URL } from "./api"
import type {
    ReportCategoryItem,
    ReportPriorityItem,
    ReportStatusItem,
    ReportSummary,
    ReportTimelineItem,
} from "../types/report"

export interface ReportFilters {
    start_date?: string
    end_date?: string
}

function buildReportQuery(filters: ReportFilters): string {
    const params = new URLSearchParams()

    if (filters.start_date) {
        params.set("start_date", filters.start_date)
    }

    if (filters.end_date) {
        params.set("end_date", filters.end_date)
    }

    const query = params.toString()

    return query ? `?${query}` : ""
}

export async function getReportSummary(
    token: string,
    filters: ReportFilters = {},
): Promise<ReportSummary> {
    const query = buildReportQuery(filters)
    const url = `${API_URL}/reports/summary${query}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load report summary")
    }

    return response.json() as Promise<ReportSummary>
}

export async function getReportTimeline(
    token: string,
    filters: ReportFilters = {},
): Promise<ReportTimelineItem[]> {
    const query = buildReportQuery(filters)
    const url = `${API_URL}/reports/timeline${query}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load report timeline")
    }

    return response.json() as Promise<ReportTimelineItem[]>
}

export async function getReportPriorityDistribution(
    token: string,
    filters: ReportFilters = {},
): Promise<ReportPriorityItem[]> {
    const query = buildReportQuery(filters)
    const url = `${API_URL}/reports/by-priority${query}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load report priority distribution")
    }

    return response.json() as Promise<ReportPriorityItem[]>
}

export async function getReportCategoryDistribution(
    token: string,
    filters: ReportFilters = {},
): Promise<ReportCategoryItem[]> {
    const query = buildReportQuery(filters)
    const url = `${API_URL}/reports/by-category${query}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load report category distribution")
    }

    return response.json() as Promise<ReportCategoryItem[]>
}

export async function getReportStatusDistribution(
    token: string,
    filters: ReportFilters = {},
): Promise<ReportStatusItem[]> {
    const query = buildReportQuery(filters)
    const url = `${API_URL}/reports/by-status${query}`

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        throw new Error("Unable to load report status distribution")
    }

    return response.json() as Promise<ReportStatusItem[]>
}
