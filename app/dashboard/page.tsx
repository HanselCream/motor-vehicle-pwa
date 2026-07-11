'use client'

import { useEffect, useState } from 'react'
import { useVehicles, type Vehicle } from '@/lib/hooks/use-vehicles'
import VehicleSelector from '@/components/vehicle-selector'
import VehicleCard from '@/components/vehicle-card'
import QuickStats from '@/components/quick-stats'
import RemindersWidget from '@/components/reminders-widget'
import { Plus, Gauge } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { vehicles, loading, fetchVehicles } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0])
    }
  }, [vehicles, selectedVehicle])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading vehicles...</div>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <Gauge className="h-12 w-12 text-muted-foreground" />
        <div>
          <h2 className="mb-1 text-lg font-semibold text-foreground">No Vehicles Yet</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Add your first vehicle to start tracking maintenance
          </p>
        </div>
        <Link
          href="/dashboard/settings?tab=vehicles"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Motor</h1>
      </div>

      <VehicleSelector
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={setSelectedVehicle}
      />

      {selectedVehicle && (
        <>
          <VehicleCard vehicle={selectedVehicle} />
          <QuickStats vehicleId={selectedVehicle.id} />
          <RemindersWidget vehicleId={selectedVehicle.id} />
        </>
      )}
    </div>
  )
}