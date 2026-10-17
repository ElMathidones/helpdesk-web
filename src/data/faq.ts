// Stable FAQ identifiers and category groups. Display content lives in i18n/locales/*.json.
export interface FaqItem {
    id: string
    category: string
}

export const faqItems: FaqItem[] = [
    { id: "create-ticket", category: "tickets" },
    { id: "track-ticket", category: "tickets" },
    { id: "ticket-number", category: "tickets" },
    { id: "ticket-edit", category: "tickets" },
    { id: "ticket-delete", category: "tickets" },
    { id: "priority", category: "priorities" },
    { id: "change-priority", category: "priorities" },
    { id: "status-open", category: "status" },
    { id: "status-review", category: "status" },
    { id: "status-progress", category: "status" },
    { id: "status-resolved-closed", category: "status" },
    { id: "status-canceled", category: "status" },
    { id: "comments", category: "support" },
    { id: "assignee", category: "support" },
    { id: "no-assignee", category: "support" },
    { id: "release-ticket", category: "support" },
    { id: "ticket-flow", category: "support" },
    { id: "email-copy", category: "notifications" },
    { id: "assignment-email", category: "notifications" },
    { id: "roles", category: "accounts" },
    { id: "customer-permissions", category: "accounts" },
    { id: "technician-permissions", category: "accounts" },
    { id: "admin-permissions", category: "accounts" },
    { id: "dark-mode", category: "accounts" },
]
