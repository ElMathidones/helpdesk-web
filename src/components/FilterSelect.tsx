
import * as Select from "@radix-ui/react-select"

interface FilterOption {
    value: string
    label: string
}

interface FilterSelectProps {
    id: string
    value: string
    onChange: (value: string) => void
    options: FilterOption[]
}

const EMPTY_VALUE = "__helpdesk_empty__"

export default function FilterSelect({
    id,
    value,
    onChange,
    options,
}: FilterSelectProps) {
    return (
        <Select.Root
            value={value === "" ? EMPTY_VALUE : value}
            onValueChange={(next) =>
                onChange(next === EMPTY_VALUE ? "" : next)
            }
        >
            <Select.Trigger
                id={id}
                className="hd-select-trigger"
            >
                <Select.Value />

                <Select.Icon className="hd-select-chevron">
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
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content
                    className="hd-select-menu"
                    position="popper"
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    collisionPadding={12}
                >
                    <Select.Viewport className="hd-select-viewport">
                        {options.map((option) => (
                            <Select.Item
                                key={option.value}
                                value={
                                    option.value === ""
                                        ? EMPTY_VALUE
                                        : option.value
                                }
                                className="hd-select-item"
                            >
                                <Select.ItemText>
                                    {option.label}
                                </Select.ItemText>

                                <Select.ItemIndicator className="hd-select-check">
                                    ✓
                                </Select.ItemIndicator>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}
