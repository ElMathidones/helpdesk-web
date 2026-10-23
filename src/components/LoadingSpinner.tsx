
import type { ReactNode } from "react"

import "./LoadingSpinner.css"

interface LoadingSpinnerProps {
    children: ReactNode
    compact?: boolean
}

function LoadingSpinner({
    children,
    compact = false,
}: LoadingSpinnerProps) {
    return (
        <div
            className={`hd-loading${compact ? " hd-loading--compact" : ""}`}
            role="status"
            aria-live="polite"
        >
            <span
                className="hd-loading__spinner"
                aria-hidden="true"
            />

            <span className="hd-loading__text">
                {children}
            </span>
        </div>
    )
}

export default LoadingSpinner
