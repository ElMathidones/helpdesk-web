export interface ReportSummary {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    canceled: number;
}

export interface ReportTimelineItem {
    date: string;
    created: number;
}

export interface ReportPriorityItem {
    priority: string;
    count: number;
}

export interface ReportCategoryItem {
    category_id: number;
    category_name: string;
    count: number;
}

export interface ReportStatusItem {
    status: string;
    count: number;
}
