import { useEffect, useRef, useState, type ReactNode } from "react"

interface ChartRevealProps {
    children: ReactNode
}

function shouldRevealImmediately() {
    if (typeof window === "undefined") {
        return false
    }

    return (
        !("IntersectionObserver" in window) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
}

function ChartReveal({ children }: ChartRevealProps) {
    const elementRef = useRef<HTMLDivElement>(null)

    const [isVisible, setIsVisible] = useState(
        shouldRevealImmediately,
    )

    useEffect(() => {
        if (isVisible) return

        const element = elementRef.current

        if (!element) return

        const observer = new IntersectionObserver(
            (entries) => {
                const isIntersecting = entries.some(
                    (entry) => entry.isIntersecting,
                )

                if (!isIntersecting) return

                setIsVisible(true)
                observer.disconnect()
            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -10% 0px",
            },
        )

        observer.observe(element)

        return () => {
            observer.disconnect()
        }
    }, [isVisible])

    return (
        <div
            ref={elementRef}
            className={`hd-chart-reveal${
                isVisible ? " hd-chart-revealed" : ""
            }`}
        >
            {children}
        </div>
    )
}

export default ChartReveal
