'use client'

import { useEffect, useState } from 'react'
import { useVehicles } from '@/lib/hooks/use-vehicles'
import PassportGenerator from '@/components/passport-generator'
import { Download, Share2 } from 'lucide-react'

export default function PassportPage() {
  const { vehicles } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState(null)

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
        <h1 className="text-2xl font-bold text-foreground">Vehicle Passport</h1>
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

      {selectedVehicle && (
        <PassportGenerator vehicle={selectedVehicle} />
      )}
    </div>
  )
}
