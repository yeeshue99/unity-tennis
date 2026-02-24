import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export type ThemeName = 'default' | 'dark' | 'light' | 'clay' | 'grass' | 'hard'

interface ThemeContextValue {
  theme: ThemeName
  setTheme: (t: ThemeName) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'default',
  setTheme: () => {},
})

export const STORAGE_KEY = 'unity-tennis-theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'default'
    return (localStorage.getItem(STORAGE_KEY) as ThemeName) ?? 'default'
  })

  const setTheme = (t: ThemeName) => {
    setThemeState(t)
    localStorage.setItem(STORAGE_KEY, t)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Apply on first mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export const THEMES: { name: ThemeName; label: string; swatch: string }[] = [
  { name: 'default', label: 'Default', swatch: '#c6ed2c' },
  { name: 'hard', label: 'Hard', swatch: '#336699' },
  { name: 'clay', label: 'Clay', swatch: '#993300' },
  { name: 'grass', label: 'Grass', swatch: '#339966' },
  { name: 'dark', label: 'Dark', swatch: '#1f2937' },
]
