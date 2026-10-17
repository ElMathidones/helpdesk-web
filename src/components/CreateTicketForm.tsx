import { useEffect, useRef, useState, type FormEvent } from "react"
import { useTranslation } from "react-i18next"

import { useAuth } from "../hooks/useAuth"
import { getCategories } from "../services/categories"
import { createTicket } from "../services/tickets"
import type { Category } from "../types/category"
import type { Ticket, TicketPriority } from "../types/ticket"

import FilterSelect from "./FilterSelect"
interface CreateTicketFormProps {
    onCreated: (ticket: Ticket) => void
}

function CreateTicketForm({ onCreated }: CreateTicketFormProps) {
    const { token } = useAuth()
    const { t } = useTranslation()

    const [categories, setCategories] = useState<Category[]>([])
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const descriptionRef = useRef<HTMLTextAreaElement>(null)
    const [priority, setPriority] = useState<TicketPriority>("medium")
    const [categoryId, setCategoryId] = useState("")
    const [sendEmailCopy, setSendEmailCopy] = useState(false)
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
                setError("tickets.form.errors.loadCategories")
            }
        }

        void loadCategories()
    }, [token])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!token) return

        if (!categoryId) {
            setError("tickets.form.selectCategory")
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
                send_email_copy: sendEmailCopy,
            })

            onCreated(ticket)

            setTitle("")
            setDescription("")
            setPriority("medium")
            setCategoryId("")
            setSendEmailCopy(false)
        } catch {
            setError("tickets.form.errors.create")
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
                <label htmlFor="title">{t("tickets.form.title")}</label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    minLength={3}
                    maxLength={150}
                    placeholder={t("tickets.form.titlePlaceholder")}
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="description">{t("tickets.form.description")}</label>
                <textarea
                    ref={descriptionRef}
                    className="ticket-description-input"
                    id="description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    minLength={10}
                    placeholder={t("tickets.form.descriptionPlaceholder")}
                    required
                />
            </div>

            <div className="form-field">
                <label htmlFor="priority">{t("tickets.form.priority")}</label>
                <FilterSelect
                    id="priority"
                    value={priority}
                    onChange={(value) =>
                        setPriority(value as TicketPriority)
                    }
                    options={[
                        { value: "low", label: t("tickets.priority.low") },
                        { value: "medium", label: t("tickets.priority.medium") },
                        { value: "high", label: t("tickets.priority.high") },
                        { value: "critical", label: t("tickets.priority.critical") },
                    ]}
                />
            </div>

            <div className="form-field">
                <label htmlFor="category">{t("tickets.form.category")}</label>
                <FilterSelect
                    id="category"
                    value={categoryId}
                    onChange={setCategoryId}
                    options={[
                        {
                            value: "",
                            label: t("tickets.form.selectCategory"),
                        },
                        ...categories.map((category) => ({
                            value: String(category.id),
                            label: category.name,
                        })),
                    ]}
                />
            </div>

            <div className="ticket-email-option">
                <label>
                    <input
                        type="checkbox"
                        checked={sendEmailCopy}
                        onChange={(event) => setSendEmailCopy(event.target.checked)}
                    />

                    <span>{t("tickets.form.emailCopy")}</span>
                </label>
            </div>

            {error && <p className="form-error">{t(error)}</p>}

            <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
            >
                {isSubmitting ? t("tickets.form.creating") : t("tickets.form.submit")}
            </button>
        </form>
    )
}

export default CreateTicketForm
