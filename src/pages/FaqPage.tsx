import { useState } from "react"
import { useTranslation } from "react-i18next"

import { faqItems } from "../data/faq"

function FaqPage() {
    const { t } = useTranslation()
    const [search, setSearch] = useState("")

    const [openItems, setOpenItems] = useState<Set<string>>(
        new Set(),
    )

    function toggleItem(id: string) {
        setOpenItems((current) => {
            const next = new Set(current)

            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }

            return next
        })
    }

    const localizedItems = faqItems.map((item) => ({
        ...item,
        categoryLabel: t(`faq.categories.${item.category}`),
        question: t(`faq.items.${item.id}.question`),
        answer: t(`faq.items.${item.id}.answer`),
    }))

    const normalizedSearch = search.trim().toLocaleLowerCase()
    const filteredItems = normalizedSearch
        ? localizedItems.filter((item) =>
            [item.question, item.answer, item.categoryLabel].some((value) =>
                value.toLocaleLowerCase().includes(normalizedSearch),
            ),
        )
        : localizedItems

    const groupedItems = filteredItems.reduce<Record<string, typeof filteredItems>>(
        (groups, item) => {
            if (!groups[item.category]) groups[item.category] = []
            groups[item.category].push(item)
            return groups
        },
        {},
    )

    return (
        <div className="faq-page">
            <div className="page-header">
                <div>
                    <h1>{t("faq.page.title")}</h1>
                    <p>
                        {t("faq.page.description")}
                    </p>
                </div>
            </div>

            <section className="faq-search-section">
                <div className="faq-search-content">
                    <span className="faq-search-icon" aria-hidden="true">
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="7" />
                            <path d="m20 20-4-4" />
                        </svg>
                    </span>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder={t("faq.page.searchPlaceholder")}
                        aria-label={t("faq.page.searchLabel")}
                    />
                </div>

            </section>

            {filteredItems.length === 0 ? (
                <div className="faq-empty-state">
                    <strong>{t("faq.page.emptyTitle")}</strong>
                    <p>
                        {t("faq.page.emptyDescription")}
                    </p>
                </div>
            ) : (
                <div className="faq-groups">
                    {Object.entries(groupedItems).map(
                        ([category, items]) => (
                            <section
                                className="faq-group"
                                key={category}
                            >
                                <div className="faq-group-header">
                                    <h2>{items[0].categoryLabel}</h2>
                                </div>

                                <div className="faq-list">
                                    {items.map((item) => {
                                        const isOpen = openItems.has(item.id)

                                        return (
                                            <article
                                                className={`faq-item ${
                                                    isOpen ? "faq-item-open" : ""
                                                }`}
                                                key={item.id}
                                            >
                                                <button
                                                    type="button"
                                                    className="faq-question"
                                                    aria-expanded={isOpen}
                                                    aria-controls={`faq-answer-${item.id}`}
                                                    onClick={() => toggleItem(item.id)}
                                                >
                                                    <span className="faq-question-content">
                                                        <span
                                                            className="faq-question-icon"
                                                            aria-hidden="true"
                                                        >
                                                            ?
                                                        </span>

                                                        <span>{item.question}</span>
                                                    </span>

                                                    <span
                                                        className="faq-chevron"
                                                        aria-hidden="true"
                                                    />
                                                </button>

                                                <div
                                                    id={`faq-answer-${item.id}`}
                                                    className="faq-answer-wrapper"
                                                    aria-hidden={!isOpen}
                                                >
                                                    <div className="faq-answer-inner">
                                                        <div className="faq-answer">
                                                            <span className="faq-answer-label">
                                                                {t("faq.page.answer")}
                                                            </span>

                                                            <p>{item.answer}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        )
                                    })}
                                </div>
                            </section>
                        ),
                    )}
                </div>
            )}
        </div>
    )
}

export default FaqPage
