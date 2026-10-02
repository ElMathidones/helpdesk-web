import { useEffect, useRef, useState, type FormEvent } from "react"

import { useAuth } from "../hooks/useAuth"
import { getCategories } from "../services/categories"
import { createTicket } from "../services/tickets"
import type { Category } from "../types/category"
import type { Ticket, TicketPriority } from "../types/ticket"

interface CreateTicketFormProps {
    onCreated: (ticket: Ticket) => void
}

function CreateTicketForm({ onCreated }: CreateTicketFormProps) {
    const { token } = useAuth()

    const [categories, setCategories] = useState<Category[]>([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const descriptionRef = useRef<HTMLTextAreaElement>(null)
    const [priority, setPriority] = useState<TicketPriority>("medium")
    const [categoryId, setCategoryId] = useState("")
    const [error, setError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (!token) {
            return
        }

        const currentToken = token

        async function loadCategories() {
            try {
                const data = await getCategories(currentToken)

                const activeCategories = data.filter(
                    (category) => category.is_active,
                )

                setCategories(activeCategories)
            } catch {
                setError("Não foi possível carregar as categorias.")
            }
        }

        void loadCategories()
    }, [token])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!token || !categoryId) {
            return
        }

        setError("")
        setIsSubmitting(true)

        try {
            const ticket = await createTicket(token, {
                title,
                description,
                priority,
                category_id: Number(categoryId),
        })

        onCreated(ticket)

        setTitle("")
        setDescription("")
        setPriority("medium")
        setCategoryId("")
        } catch {
            setError("Não foi possível criar o chamado.")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        const textarea = descriptionRef.current

        if (!textarea) return

        const minimumHeight = 140
        const maximumHeight = 260

        textarea.style.height = "auto"

        const nextHeight = Math.min(
            Math.max(textarea.scrollHeight, minimumHeight),
            maximumHeight,
        )

        textarea.style.height = `${nextHeight}px`
        textarea.style.overflowY =
            textarea.scrollHeight > maximumHeight
                ? "auto"
                : "hidden"
    }, [description])

    return (
        <form className="ticket-form" onSubmit={handleSubmit}>
            <div className="form-field">
                <label htmlFor="title">Título</label>
                <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={3}
                maxLength={150}
                placeholder="Ex: Computador não liga"
                required
                />
            </div>

            <div className="form-field">
                <label htmlFor="description">Descrição</label>
                <textarea
                    ref={descriptionRef}
                    className="ticket-description-input"
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    minLength={10}
                    placeholder="Descreva o problema com detalhes..."
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="priority">Prioridade</label>
                <select
                id="priority"
                value={priority}
                onChange={(event) =>
                    setPriority(event.target.value as TicketPriority)
                }
                >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
                </select>
            </div>

            <div className="form-field">
                <label htmlFor="category">Categoria</label>
                <select
                id="category"
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                required
                >
                <option value="">Selecione uma categoria</option>

                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                    {category.name}
                    </option>
                ))}
                </select>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? "Criando..." : "Criar chamado"}
            </button>
        </form>
    )
}

export default CreateTicketForm
