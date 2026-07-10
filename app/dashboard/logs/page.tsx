'use client'

import { useState, useEffect } from 'react'
import { useVehicles } from '@/lib/hooks/use-vehicles'
import LogsList from '@/components/logs-list'
import AddLogForm from '@/components/add-log-form'
import { Plus, X } from 'lucide-react'
import type { Vehicle } from '@/lib/hooks/use-vehicles'

type LogType = 'maintenance' | 'fuel' | 'expense'

export default function LogsPage() {
  const { vehicles } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [logType, setLogType] = useState<LogType>('maintenance')

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0])
    }
  }, [vehicles, selectedVehicle])

  if (vehicles.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No vehicles available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Maintenance Logs</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Log
        </button>
      </div>

      {/* Vehicle Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {vehicles.map(vehicle => (
          <button
            key={vehicle.id}
            onClick={() => setSelectedVehicle(vehicle)}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              vehicle.id === selectedVehicle?.id
                ? 'bg-primary text-primary-foreground'
                : 'border border-border bg-card text-foreground hover:border-primary'
            }`}
          >
            {vehicle.year} {vehicle.make}
          </button>
        ))}
      </div>

      {/* Log Type Tabs */}
      <div className="flex gap-2">
        {[
          { id: 'maintenance', label: 'Maintenance' },
          { id: 'fuel', label: 'Fuel' },
          { id: 'expense', label: 'Expense' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setLogType(tab.id as LogType)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              logType === tab.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Logs List */}
      {selectedVehicle && (
        <LogsList vehicleId={selectedVehicle.id} logType={logType} />
      )}

      {/* Add Log Modal */}
      {showAddForm && selectedVehicle && (
<div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
  <div className="flex max-h-[85vh] w-full max-w-md flex-col rounded-t-2xl border border-border bg-card sm:rounded-2xl">
    <div className="flex items-center justify-between border-b border-border px-6 py-4 flex-shrink-0">
      <h2 className="text-lg font-semibold text-foreground">Add {logType}</h2>
      <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
        <X className="h-5 w-5" />
      </button>
    </div>
    <div className="overflow-y-auto p-6">
<AddLogForm
  vehicleId={selectedVehicle.id}
  logType={logType}
  currentOdometer={selectedVehicle.odometer_km}
  onSuccess={() => setShowAddForm(false)}
/>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
