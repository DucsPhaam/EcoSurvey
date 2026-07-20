import { createContext, useContext, useState, useEffect } from 'react'
import { userService } from '../services/userService'

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('ecosurvey_theme') || 'light')

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('ecosurvey_theme', theme)
  }, [theme])

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    try {
      await userService.updateTheme(next)
    } catch { /* ignore */ }
  }

  const applyTheme = (t) => {
    if (t && ['light', 'dark'].includes(t)) setTheme(t)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
