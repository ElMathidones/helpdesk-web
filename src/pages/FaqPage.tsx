import { useMemo, useState } from "react"

import { faqItems } from "../data/faq"

function FaqPage() {
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

    const filteredItems = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase()

        if (!normalizedSearch) {
            return faqItems
        }

        return faqItems.filter((item) =>
            [
                item.question,
                item.answer,
                item.category,
            ].some((value) =>
                value.toLowerCase().includes(normalizedSearch),
            ),
        )
    }, [search])

    const groupedItems = useMemo(() => {
        return filteredItems.reduce<Record<string, typeof faqItems>>(
            (groups, item) => {
                if (!groups[item.category]) {
                    groups[item.category] = []
                }

                groups[item.category].push(item)

                return groups
            },
            {},
        )
    }, [filteredItems])

    return (
        <div className="faq-page">
            <div className="page-header">
                <div>
                    <h1>Central de ajuda</h1>
                    <p>
                        Encontre respostas rápidas para as dúvidas mais
                        frequentes sobre o Help Desk.
                    </p>
                </div>
            </div>

            <section className="faq-search-section">
                <div className="faq-search-content">
                    <span className="faq-search-icon" aria-hidden="true">
                        ⌕
                    </span>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Busque uma dúvida..."
                        aria-label="Buscar no FAQ"
                    />

                    {search && (
                        <button
                            type="button"
                            className="faq-clear-search"
                            onClick={() => setSearch("")}
                        >
                            Limpar
                        </button>
                    )}
                </div>

                <span className="faq-result-count">
                    {filteredItems.length === 1
                        ? "1 resposta encontrada"
                        : `${filteredItems.length} respostas encontradas`}
                </span>
            </section>

            {filteredItems.length === 0 ? (
                <div className="faq-empty-state">
                    <strong>Nenhuma resposta encontrada</strong>
                    <p>
                        Tente pesquisar utilizando outras palavras.
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
                                    <h2>{category}</h2>
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
                                                                Resposta
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
