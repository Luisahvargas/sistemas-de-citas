'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'
import api from '@/lib/axios'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const handleLogout = async () => {
  try {
    const refreshToken = Cookies.get('refresh_token')
    if (refreshToken) {
      await api.post('/auth/logout/', { refresh: refreshToken })
    }
  } catch {
    // Si falla el logout en el servidor igual limpiamos las cookies
  } finally {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
    router.push('/login')
  }
}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="font-bold text-blue-600 text-lg">Sistema de Citas</span>
              {/* Links escritorio */}
              <div className="hidden md:flex gap-4">
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/dashboard/appointments" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Citas
                </Link>
                <Link href="/dashboard/reports" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                  Reporte
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleLogout}
                className="hidden md:block text-sm text-red-500 hover:text-red-700 font-medium">
                Cerrar sesión
              </button>
              {/* Botón hamburguesa móvil */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-black md:hidden p-2 rounded-lg hover:bg-gray-100">
                {menuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          {menuOpen && (
            <div className="md:hidden mt-3 pb-3 border-t pt-3 space-y-2">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                Dashboard
              </Link>
              <Link
                href="/dashboard/appointments"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                Citas
              </Link>
              <Link
                href="/dashboard/reports"
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium">
                Reporte
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 text-sm font-medium">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}