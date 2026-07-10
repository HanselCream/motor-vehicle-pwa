'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Fuel, CreditCard, Trash2 } from 'lucide-react'

interface LogsListProps {
  vehicleId: string
  logType: 'maintenance' | 'fuel' | 'expense'
}

export default function LogsList({ vehicleId, logType }: LogsListProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const table =
          logType === 'maintenance'
            ? 'maintenance_logs'
            : logType === 'fuel'
              ? 'fuel_logs'
              : 'expenses'

        const dateField =
          logType === 'maintenance'
            ? 'service_date'
            : logType === 'fuel'
              ? 'fuel_date'
              : 'expense_date'

        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('vehicle_id', vehicleId)
          .order(dateField, { ascending: false })

        console.log('[v0] Fetching', table, 'for vehicle', vehicleId, ':', data, error)

        if (error) throw error

        setLogs(data || [])
      } catch (error) {
        console.error('[v0] Error fetching logs:', error)
        setLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [vehicleId, logType, supabase])

  const deleteLog = async (id: string) => {
    try {
      const table =
        logType === 'maintenance'
          ? 'maintenance_logs'
          : logType === 'fuel'
            ? 'fuel_logs'
            : 'expenses'

      await supabase.from(table).delete().eq('id', id)
      setLogs(prev => prev.filter(log => log.id !== id))
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }

  if (loading) {
    return <div className="text-center text-muted-foreground">Loading...</div>
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-muted-foreground">No logs yet</p>
      </div>
    )
  }

  const getIcon = () => {
    switch (logType) {
      case 'maintenance':
        return <Wrench className="h-4 w-4 text-primary" />
      case 'fuel':
        return <Fuel className="h-4 w-4 text-primary" />
      case 'expense':
        return <CreditCard className="h-4 w-4 text-primary" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-2">
      {logs.map(log => (
        <div
          key={log.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">{getIcon()}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">
                {logType === 'maintenance'
                  ? log.service_type
                  : logType === 'fuel'
                    ? `${log.liters}L - ${log.fuel_type || 'Fuel'}`
                    : log.category}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>
                  {formatDate(
                    logType === 'maintenance'
                      ? log.service_date
                      : logType === 'fuel'
                        ? log.fuel_date
                        : log.expense_date
                  )}
                </span>
                {log.odometer_km && <span>• {log.odometer_km.toLocaleString()} km</span>}
                {log.cost && <span>• ₱{log.cost.toFixed(2)}</span>}
                {log.amount && <span>• ₱{log.amount.toFixed(2)}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={() => deleteLog(log.id)}
            className="ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
