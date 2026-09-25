export interface CommentAuthor {
    id: number
    name: string
}

export interface Comment {
    id: number
    ticket_id: number
    author_id: number
    author: CommentAuthor
    content: string
    created_at: string
}
