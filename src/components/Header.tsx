import { Link } from '@tanstack/react-router'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

import { useState } from 'react'
import { Home, Menu, Palette, User, UserStar, X } from 'lucide-react'
import { useCurrentUser } from '@/db/users.tsx'
import TennisBall from './TennisBall.tsx'
import { THEMES, useTheme } from '@/lib/theme-context'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [showThemePicker, setShowThemePicker] = useState(false)
  const { isSignedIn, isAdmin } = useCurrentUser()
  const { theme, setTheme } = useTheme()

  return (
    <>
      <header className="p-4 flex items-center bg-(--color-header-bg) text-(--color-primary-contrast) shadow-lg relative">
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="ml-4 text-xl font-semibold flex-1">
          <Link to="/">UniTY Tennis</Link>
        </h1>
        <button
          onClick={() => setShowThemePicker((v) => !v)}
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-2"
          aria-label="Change theme"
          title="Change theme"
        >
          <Palette size={20} />
        </button>
        {showThemePicker && (
          <div className="absolute top-14 right-24 z-50 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-3 flex flex-col gap-2 min-w-40">
            <span className="text-xs text-gray-400 uppercase tracking-widest mb-1 px-1">
              Theme
            </span>
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setTheme(t.name)
                  setShowThemePicker(false)
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  theme === t.name
                    ? 'bg-cyan-600 text-white'
                    : 'hover:bg-gray-700 text-gray-200'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-500 shrink-0"
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div className="p-4 border-t border-gray-700 bg-gray-600 flex flex-row gap-2 border rounded-lg">
          <ClerkHeader />
        </div>
      </header>

      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-(--color-sidebar-bg) text-(--color-primary-contrast) shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Navigation</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <Home size={20} />
            <span className="font-medium">Home</span>
          </Link>

          <Link
            to="/tournaments"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
            activeProps={{
              className:
                'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
            }}
          >
            <TennisBall size={20} />
            <span className="font-medium">Tournaments</span>
          </Link>

          {isSignedIn && isAdmin && (
            <Link
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <UserStar size={20} />
              <span className="font-medium">Admin Panel</span>
            </Link>
          )}

          {isSignedIn && (
            <Link
              to="/account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2',
              }}
            >
              <User size={20} />
              <span className="font-medium">My Account</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700 bg-gray-800 flex flex-col gap-2 content-center">
          <div className="flex flex-wrap gap-2 mb-2">
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => setTheme(t.name)}
                title={t.label}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                  theme === t.name
                    ? 'bg-cyan-600 text-white'
                    : 'hover:bg-gray-700 text-gray-300'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-gray-500"
                  style={{ backgroundColor: t.swatch }}
                />
                {t.label}
              </button>
            ))}
          </div>
          <ClerkHeader />
        </div>
      </aside>
    </>
  )
}
