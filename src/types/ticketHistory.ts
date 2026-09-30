export type TicketHistoryUser = {
    id: number
    name: string
}

export type TicketHistory = {
    id: number
    ticket_id: number
    event_type: string
    old_value: string | null
    new_value: string | null
    created_at: string
    user: TicketHistoryUser | null
}
