export type UserRole = "admin" | "technician" | "customer"

export interface User {
    id: number
    name: string
    email: string
    role: UserRole
    is_active: boolean
    avatar_filename: string | null
}
