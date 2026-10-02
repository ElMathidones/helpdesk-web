export interface Category {
    id: number
    name: string
    description: string | null
    is_active: boolean
    sort_order: number
}

export interface CategoryCreate {
    name: string
    description: string | null
}

export interface CategoryUpdate {
    name?: string
    description?: string | null
}
