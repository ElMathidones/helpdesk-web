import {
    useEffect,
    useState,
    type ReactNode,
} from "react"

import {
    ThemeContext,
    type Theme,
} from "./ThemeContext"

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem("helpdesk_theme")

        return savedTheme === "dark" ? "dark" : "light"
    })

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("helpdesk_theme", theme)
    }, [theme])

    function toggleTheme() {
        setTheme((currentTheme) =>
            currentTheme === "light" ? "dark" : "light",
        )
    }

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}
