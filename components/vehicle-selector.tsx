'use client'

import { ChevronRight } from 'lucide-react'

interface VehicleSelectorProps {
  vehicles: Array<{
    id: string
    make: string
    model: string
    year: number
    license_plate?: string
  }>
  selectedVehicle: any
  onSelectVehicle: (vehicle: any) => void
}

export default function VehicleSelector({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
}: VehicleSelectorProps) {
  return (
    <div className="relative">
      <div
        className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-card px-4 py-3 transition-all hover:border-primary hover:bg-card/80"
        onClick={() => {
          // Simple rotation through vehicles
          const currentIndex = vehicles.findIndex(v => v.id === selectedVehicle?.id)
          const nextIndex = (currentIndex + 1) % vehicles.length
          onSelectVehicle(vehicles[nextIndex])
        }}
      >
        <div>
          <p className="text-xs text-muted-foreground">Current Vehicle</p>
          <p className="mt-0.5 text-sm font-medium text-foreground">
            {selectedVehicle?.year} {selectedVehicle?.make} {selectedVehicle?.model}
          </p>
          {selectedVehicle?.license_plate && (
            <p className="mt-1 text-xs text-muted-foreground">
              {selectedVehicle.license_plate}
            </p>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>

      {vehicles.length > 1 && (
        <div className="absolute top-full right-0 z-10 mt-2 hidden space-y-1 rounded-lg border border-border bg-card p-2">
          {vehicles.map(vehicle => (
            <button
              key={vehicle.id}
              onClick={() => onSelectVehicle(vehicle)}
              className={`block w-full whitespace-nowrap rounded px-3 py-2 text-left text-sm transition-colors ${
                vehicle.id === selectedVehicle?.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`}
            >
              {vehicle.year} {vehicle.make} {vehicle.model}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
