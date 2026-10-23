
import type { KeyboardEvent, RefObject } from "react"
import { useTranslation } from "react-i18next"

import FilterSelect from "./FilterSelect"

type PageSize = 5 | 10

interface TicketsPaginationProps {
    totalItems: number
    currentPage: number
    pageSize: PageSize
    onPageChange: (page: number) => void
    onPageSizeChange: (size: PageSize) => void
    paginationRef?: RefObject<HTMLElement | null>
}

function TicketsPagination({
    totalItems,
    currentPage,
    pageSize,
    onPageChange,
    onPageSizeChange,
    paginationRef,
}: TicketsPaginationProps) {
    const { t } = useTranslation()

    const totalPages = Math.max(
        1,
        Math.ceil(totalItems / pageSize),
    )

    const safePage = Math.min(
        Math.max(currentPage, 1),
        totalPages,
    )

    const start = totalItems === 0
        ? 0
        : (safePage - 1) * pageSize + 1

    const end = Math.min(
        safePage * pageSize,
        totalItems,
    )

    function commitPageValue(input: HTMLInputElement) {
        const rawValue = input.value.trim()

        if (!rawValue) {
            input.value = String(safePage)
            return
        }

        const parsedValue = Number(rawValue)

        if (!Number.isFinite(parsedValue)) {
            input.value = String(safePage)
            return
        }

        const nextPage = Math.min(
            Math.max(1, Math.trunc(parsedValue)),
            totalPages,
        )

        input.value = String(nextPage)

        if (nextPage !== safePage) {
            onPageChange(nextPage)
        }
    }

    function handlePageKeyDown(
        event: KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Enter") {
            event.currentTarget.blur()
        }
    }

    return (
        <nav
            ref={paginationRef}
            className="tickets-pagination"
            aria-label={t("tickets.pagination.navigation")}
        >
            <span className="tickets-pagination-summary">
                {t("tickets.pagination.range", {
                    start,
                    end,
                    total: totalItems,
                })}
            </span>

            <div className="tickets-pagination-controls">
                <div className="tickets-pagination-nav">
                    <button
                        type="button"
                        className="tickets-pagination-icon-button"
                        disabled={safePage === 1}
                        onClick={() => onPageChange(safePage - 1)}
                        aria-label={t("tickets.pagination.previous")}
                        title={t("tickets.pagination.previous")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>

                    <input
                        key={safePage}
                        className="tickets-pagination-page-input"
                        type="number"
                        min={1}
                        max={totalPages}
                        defaultValue={safePage}
                        inputMode="numeric"
                        aria-label={t("tickets.pagination.page")}
                        onBlur={(event) =>
                            commitPageValue(event.currentTarget)
                        }
                        onKeyDown={handlePageKeyDown}
                    />

                    <button
                        type="button"
                        className="tickets-pagination-icon-button"
                        disabled={safePage === totalPages}
                        onClick={() => onPageChange(safePage + 1)}
                        aria-label={t("tickets.pagination.next")}
                        title={t("tickets.pagination.next")}
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="m9 18 6-6-6-6" />
                        </svg>
                    </button>
                </div>

                <div className="tickets-pagination-meta">
                    <span className="tickets-pagination-total-pages">
                        {t("tickets.pagination.totalPages", {
                            count: totalPages,
                        })}
                    </span>

                    <div className="tickets-pagination-page-size-group">
                        <label htmlFor="tickets-page-size">
                            {t("tickets.pagination.perPage")}
                        </label>

                        <div className="tickets-pagination-page-size-control">
                            <FilterSelect
                                id="tickets-page-size"
                                value={String(pageSize)}
                                onChange={(value) =>
                                    onPageSizeChange(
                                        Number(value) as PageSize,
                                    )
                                }
                                options={[
                                    { value: "5", label: "5" },
                                    { value: "10", label: "10" },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default TicketsPagination
