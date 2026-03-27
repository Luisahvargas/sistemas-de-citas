'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@/lib/axios'
import { PaginatedResponse, Appointment } from '@/lib/types'

interface StatusCount {
  status: string
  count: number
  color: string
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get<PaginatedResponse<Appointment>>('/appointments/?page_size=100')
        setAppointments(response.data.results)
      } catch {
        setError('Error al cargar las citas')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const statusCounts: StatusCount[] = [
    { status: 'Programada',  count: appointments.filter(a => a.status === 'Programada').length,  color: 'bg-blue-100 text-blue-700' },
    { status: 'En proceso',  count: appointments.filter(a => a.status === 'En proceso').length,  color: 'bg-yellow-100 text-yellow-700' },
    { status: 'Entregada',   count: appointments.filter(a => a.status === 'Entregada').length,   color: 'bg-green-100 text-green-700' },
    { status: 'Cancelada',   count: appointments.filter(a => a.status === 'Cancelada').length,   color: 'bg-red-100 text-red-700' },
  ]

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = appointments.filter(a =>
    a.scheduled_at.startsWith(today)
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-500">Cargando...</p>
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
      {error}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Tarjetas de estado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statusCounts.map(({ status, count, color }) => (
          <div key={status} className="bg-white rounded-xl shadow-sm p-4 border">
            <p className="text-sm text-gray-500 mb-1">{status}</p>
            <p className={`text-3xl font-bold rounded-lg px-2 py-1 inline-block ${color}`}>
              {count}
            </p>
          </div>
        ))}
      </div>

      {/* Citas del día */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Citas de hoy</h2>
          <Link
            href="/dashboard/appointments/new"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition">
            Nueva cita
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay citas programadas para hoy.</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="text-black font-medium text-sm">{appointment.product_line}</p>
                  <p className="text-xs text-gray-500">Proveedor {appointment.supplier}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/appointments"
          className="bg-white border rounded-xl p-4 hover:shadow-md transition text-center">
          <p className="font-medium text-gray-700">Ver todas las citas</p>
        </Link>
        <Link href="/dashboard/appointments/new"
          className="bg-white border rounded-xl p-4 hover:shadow-md transition text-center">
          <p className="font-medium text-gray-700">Crear nueva cita</p>
        </Link>
        <Link href="/dashboard/reports"
          className="bg-white border rounded-xl p-4 hover:shadow-md transition text-center">
          <p className="font-medium text-gray-700">Ver reporte</p>
        </Link>
      </div>
    </div>
  )
}