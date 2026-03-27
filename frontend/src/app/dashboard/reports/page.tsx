'use client'

import { useState } from 'react'
import api from '@/lib/axios'
import { ReportResult } from '@/lib/types'
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from 'recharts'

export default function ReportsPage() {
  const [results, setResults] = useState<ReportResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [searched, setSearched] = useState(false)

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('date_from', dateFrom)
      if (dateTo)   params.append('date_to', dateTo)

      const response = await api.get(`/reports/delivery/?${params.toString()}`)
      setResults(response.data.results)
      setSearched(true)
    } catch {
      setError('Error al cargar el reporte')
    } finally {
      setLoading(false)
    }
  }

  const productLineColors: Record<string, string> = {
    'Camisetas':  'bg-blue-100 text-blue-700',
    'Pantalones': 'bg-purple-100 text-purple-700',
    'Zapatos':    'bg-yellow-100 text-yellow-700',
    'Accesorios': 'bg-green-100 text-green-700',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Reporte de Entregas</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium text-gray-600 mb-3">Filtrar por rango de fechas</p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="text-black w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="text-black w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Actualizar reporte'}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {!searched && !loading && (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          <p className="text-gray-600">Selecciona un rango de fechas y presiona <strong className="text-black">Actualizar reporte</strong></p>
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-800">
          No hay entregas en el rango de fechas seleccionado.
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Tabla */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-600">
                Tiempo promedio de entrega por sublínea
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600">Sublínea</th>
                    <th className="text-left px-4 py-3 text-gray-600">Total entregas</th>
                    <th className="text-left px-4 py-3 text-gray-600">Promedio (horas)</th>
                    <th className="text-left px-4 py-3 text-gray-600">Promedio (minutos)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((r) => (
                    <tr key={r.product_line} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${productLineColors[r.product_line] || 'bg-gray-100 text-gray-700'}`}>
                          {r.product_line}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{r.total_deliveries}</td>
                      <td className="px-4 py-3 text-gray-800">{r.avg_hours} hrs</td>
                      <td className="px-4 py-3 text-gray-800">{r.avg_minutes} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="bg-white rounded-xl border p-4">
            <p className="text-sm font-medium text-gray-600 mb-4">
              Promedio de horas por sublínea
            </p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product_line" />
                <YAxis unit="h" />
                <Tooltip
                  formatter={(value: unknown) => [`${value} hrs`, 'Promedio']}
                />
                <Legend />
                <Bar
                  dataKey="avg_hours"
                  name="Promedio horas"
                  radius={[4, 4, 0, 0]}
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((r) => (
              <div key={r.product_line} className="bg-white rounded-xl border p-4">
                <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mb-2 ${productLineColors[r.product_line] || 'bg-gray-100 text-gray-700'}`}>
                  {r.product_line}
                </p>
                <p className="text-2xl font-bold text-gray-800">{r.avg_hours}h</p>
                <p className="text-xs text-gray-400">{r.total_deliveries} entregas</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}