import { useLayoutEffect } from "react"
import { useLocation } from "react-router-dom"

import { useAuth } from "../hooks/useAuth"

function PageScrollMemory() {
    const { pathname, search } = useLocation()
    const { user } = useAuth()

    useLayoutEffect(() => {
        if (!user?.id) return

        const storageKey =
            `helpdesk_scroll_${user.id}_${pathname}${search}`

        const savedValue = sessionStorage.getItem(storageKey)
        const savedPosition = Number(savedValue)

        const targetPosition =
            savedValue !== null &&
            Number.isFinite(savedPosition) &&
            savedPosition > 0
                ? savedPosition
                : 0

        let restoring = targetPosition > 0
        let timeoutId: number | undefined

        const mainContent =
            document.querySelector<HTMLElement>(".main-content")

        const maxScroll = () =>
            Math.max(
                0,
                document.documentElement.scrollHeight -
                    window.innerHeight,
            )

        function savePosition() {
            if (restoring) return

            sessionStorage.setItem(
                storageKey,
                String(Math.round(window.scrollY)),
            )
        }

        const resizeObserver = new ResizeObserver(() => {
            attemptRestore()
        })

        const mutationObserver = new MutationObserver(() => {
            attemptRestore()
        })

        function stopObservers() {
            resizeObserver.disconnect()
            mutationObserver.disconnect()
            window.clearTimeout(timeoutId)
        }

        function finishRestore(position: number) {
            window.scrollTo(0, position)
            restoring = false
            stopObservers()
            savePosition()
        }

        function attemptRestore() {
            if (!restoring) return

            const stillLoading = mainContent?.querySelector(
                ".hd-loading:not(.hd-loading--compact)",
            )

            if (stillLoading) return

            if (maxScroll() >= targetPosition) {
                finishRestore(targetPosition)
            }
        }

        function cancelRestore() {
            if (!restoring) return

            restoring = false
            stopObservers()
        }

        window.scrollTo(0, 0)

        window.addEventListener("scroll", savePosition, {
            passive: true,
        })

        window.addEventListener("wheel", cancelRestore, {
            passive: true,
        })

        window.addEventListener("touchstart", cancelRestore, {
            passive: true,
        })

        if (restoring) {
            if (mainContent) {
                resizeObserver.observe(mainContent)

                mutationObserver.observe(mainContent, {
                    childList: true,
                    subtree: true,
                })
            }

            timeoutId = window.setTimeout(() => {
                if (restoring) {
                    finishRestore(
                        Math.min(targetPosition, maxScroll()),
                    )
                }
            }, 6000)

            attemptRestore()
        }

        return () => {
            stopObservers()

            window.removeEventListener(
                "scroll",
                savePosition,
            )

            window.removeEventListener(
                "wheel",
                cancelRestore,
            )

            window.removeEventListener(
                "touchstart",
                cancelRestore,
            )
        }

    }, [pathname, search, user?.id])

    return null
}

export default PageScrollMemory
