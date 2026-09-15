export type TicketPriority = "low" | "medium" | "high" | "critical"

export type TicketStatus =
    | "open"
    | "under_review"
    | "in_progress"
    | "resolved"
    | "closed"
    | "canceled"

export interface Ticket {
    id: number
    title: string
    description: string
    priority: TicketPriority
    status: TicketStatus
    category_id: number
    creator_id: number
    assignee_id: number | null
    created_at: string
    updated_at: string
    closed_at: string | null
}
