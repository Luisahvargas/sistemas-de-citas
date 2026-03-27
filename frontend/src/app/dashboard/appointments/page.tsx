'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import { Appointment, PaginatedResponse } from '@/lib/types'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [count, setCount] = useState(0)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    product_line: '',
    date_from: '',
    date_to: '',
  })

  useEffect(() => {
  setPage(1)
}, [])

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.append('page', String(page))
        if (filters.status)       params.append('status', filters.status)
        if (filters.supplier)     params.append('supplier', filters.supplier)
        if (filters.product_line) params.append('product_line', filters.product_line)
        if (filters.date_from)    params.append('date_from', filters.date_from)
        if (filters.date_to)      params.append('date_to', filters.date_to)

        const response = await api.get<PaginatedResponse<Appointment>>(
          `/appointments/?${params.toString()}`)
        setAppointments(response.data.results)
        setCount(response.data.count)
      } catch {
        setError('Error al cargar las citas')
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [page, filters])

  const statusColors: Record<string, string> = {
    'Programada': 'bg-blue-100 text-blue-700',
    'En proceso': 'bg-yellow-100 text-yellow-700',
    'Entregada':  'bg-green-100 text-green-700',
    'Cancelada':  'bg-red-100 text-red-700',
  }

  const totalPages = Math.ceil(count / 10)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Citas</h1>
          <p className="text-sm text-gray-500">{count} citas en total</p>
        </div>
        <Link
          href="/dashboard/appointments/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
          + Nueva cita
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-300 p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <select
          value={filters.status}
          onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option>Programada</option>
          <option>En proceso</option>
          <option>Entregada</option>
          <option>Cancelada</option>
        </select>

        <select
          value={filters.supplier}
          onChange={e => { setFilters(f => ({ ...f, supplier: e.target.value })); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Todos los proveedores</option>
          <option>A</option>
          <option>B</option>
          <option>C</option>
        </select>

        <select
          value={filters.product_line}
          onChange={e => { setFilters(f => ({ ...f, product_line: e.target.value })); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500">
          <option value="">Todas las sublíneas</option>
          <option>Camisetas</option>
          <option>Pantalones</option>
          <option>Zapatos</option>
          <option>Accesorios</option>
        </select>

        <input
          type="date"
          value={filters.date_from}
          onChange={e => { setFilters(f => ({ ...f, date_from: e.target.value })); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        <input
          type="date"
          value={filters.date_to}
          onChange={e => { setFilters(f => ({ ...f, date_to: e.target.value })); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-300 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Cargando...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No hay citas que mostrar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-300">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Fecha</th>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Sublínea</th>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Estado</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-gray-700 font-semibold">Proveedor</th>
                  <th className="hidden md:table-cell text-left px-4 py-3 text-gray-700 font-semibold">Creado por</th>
                  <th className="text-left px-4 py-3 text-gray-700 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">
                      <span className="hidden md:block">
                        {new Date(a.scheduled_at).toLocaleString('es-CO')}
                      </span>
                      <span className="md:hidden">
                        {new Date(a.scheduled_at).toLocaleDateString('es-CO')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{a.product_line}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-700">
                      Proveedor {a.supplier}
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-gray-700">
                      {a.created_by_username}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/appointments/${a.id}`}
                        className="text-blue-600 hover:underline text-xs font-medium"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="flex items-center justify-between border border-gray-300 rounded-xl bg-white px-4 py-3">
          <p className="text-sm text-gray-500">
            Página {page} de {totalPages} — {count} citas
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40">
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  )
}