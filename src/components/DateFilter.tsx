
import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { enUS, es, ptBR } from "react-day-picker/locale"
import { useTranslation } from "react-i18next"
import "react-day-picker/style.css"

interface DateFilterProps {
    id: string
    value: string
    onChange: (value: string) => void
    placeholder: string
    openLabel: string
}

function parseDate(value: string): Date | undefined {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
    if (!match) return undefined

    const day = Number(match[1])
    const month = Number(match[2])
    const year = Number(match[3])
    const date = new Date(year, month - 1, day)

    if (
        date.getDate() !== day ||
        date.getMonth() !== month - 1 ||
        date.getFullYear() !== year
    ) {
        return undefined
    }

    return date
}

function formatInput(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8)

    if (digits.length <= 2) return digits
    if (digits.length <= 4) {
        return `${digits.slice(0, 2)}/${digits.slice(2)}`
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function formatDate(date: Date) {
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    return `${day}/${month}/${date.getFullYear()}`
}

export default function DateFilter({
    id,
    value,
    onChange,
    placeholder,
    openLabel,
}: DateFilterProps) {
    const { i18n } = useTranslation()
    const [open, setOpen] = useState(false)
    const [month, setMonth] = useState(new Date())

    const selected = parseDate(value)
    const language = i18n.resolvedLanguage ?? "pt-BR"
    const locale =
        language.startsWith("en") ? enUS :
        language.startsWith("es") ? es :
        ptBR

    return (
        <Popover.Root
            open={open}
            onOpenChange={(nextOpen) => {
                if (nextOpen) {
                    setMonth(selected ?? new Date())
                }
                setOpen(nextOpen)
            }}
        >
            <Popover.Anchor asChild>
                <div className="reports-date-input">
                    <input
                        id={id}
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) =>
                            onChange(formatInput(event.target.value))
                        }
                    />

                    <Popover.Trigger asChild>
                        <button
                            type="button"
                            className="reports-date-button hd-date-trigger"
                            aria-label={openLabel}
                        >
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>
                    </Popover.Trigger>
                </div>
            </Popover.Anchor>

            <Popover.Portal>
                <Popover.Content
                    className="hd-date-popover"
                    align="start"
                    sideOffset={8}
                    collisionPadding={12}
                >
                    <DayPicker
                        mode="single"
                        locale={locale}
                        selected={selected}
                        month={month}
                        onMonthChange={setMonth}
                        showOutsideDays
                        onSelect={(date) => {
                            if (!date) return

                            onChange(formatDate(date))
                            setOpen(false)
                        }}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
