'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function NewAppointmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    scheduled_at: '',
    supplier: '',
    product_line: '',
    status: 'Programada',
    delivered_at: '',
    observations: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setFieldErrors(fe => ({ ...fe, [e.target.name]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    try {
      const payload: Record<string, string> = {
        scheduled_at: form.scheduled_at,
        supplier:     form.supplier,
        product_line: form.product_line,
        status:       form.status,
        observations: form.observations,
      }
      if (form.delivered_at) payload.delivered_at = form.delivered_at

      await api.post('/appointments/', payload)
      router.push('/dashboard/appointments')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: Record<string, string[]> } }
        const data = axiosErr.response?.data
        if (data) {
          const errors: Record<string, string> = {}
          Object.entries(data).forEach(([key, val]) => {
            errors[key] = Array.isArray(val) ? val[0] : String(val)
          })
          setFieldErrors(errors)
        }
      }
      setError('Error al crear la cita. Revisa los campos.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600">
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Nueva Cita</h1>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha programada *
            </label>
            <input
              type="datetime-local"
              name="scheduled_at"
              value={form.scheduled_at}
              onChange={handleChange}
              required
              className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {fieldErrors.scheduled_at && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.scheduled_at}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor *
              </label>
              <select
                name="supplier"
                value={form.supplier}
                onChange={handleChange}
                required
                className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar...</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
              {fieldErrors.supplier && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.supplier}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sublínea *
              </label>
              <select
                name="product_line"
                value={form.product_line}
                onChange={handleChange}
                required
                className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleccionar</option>
                <option>Camisetas</option>
                <option>Pantalones</option>
                <option>Zapatos</option>
                <option>Accesorios</option>
              </select>
              {fieldErrors.product_line && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.product_line}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Programada</option>
              <option>En proceso</option>
              <option>Entregada</option>
              <option>Cancelada</option>
            </select>
          </div>

          {form.status === 'Entregada' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de entrega * <span className="text-gray-400">(obligatorio si estado es Entregada)</span>
              </label>
              <input
                type="datetime-local"
                name="delivered_at"
                value={form.delivered_at}
                onChange={handleChange}
                className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {fieldErrors.delivered_at && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.delivered_at}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observations"
              value={form.observations}
              onChange={handleChange}
              rows={3}
              className="text-gray-900 w-full border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2 transition disabled:opacity-50">
              {loading ? 'Guardando...' : 'Crear cita'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium rounded-lg py-2 transition">
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}