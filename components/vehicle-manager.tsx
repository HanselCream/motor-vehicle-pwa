'use client'

import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import AddVehicleForm from './add-vehicle-form'
import { createClient } from '@/lib/supabase/client'

interface VehicleManagerProps {
  vehicles: any[]
  onVehiclesChange: () => void
}

export default function VehicleManager({ vehicles, onVehiclesChange }: VehicleManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClient()

  const deleteVehicle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      await supabase.from('vehicles').delete().eq('id', id)
      onVehiclesChange()
    } catch (error) {
      console.error('Error deleting vehicle:', error)
      alert('Failed to delete vehicle')
    }
  }

  return (
    <div className="space-y-4">
      {vehicles.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="mb-4 text-muted-foreground">No vehicles added yet</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Your First Vehicle
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {vehicles.map(vehicle => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {vehicle.vin && <span>{vehicle.vin}</span>}
                    {vehicle.license_plate && <span>• {vehicle.license_plate}</span>}
                  </div>
                </div>
                <button
                  onClick={() => deleteVehicle(vehicle.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
          >
            <Plus className="mb-0.5 inline-block h-4 w-4" /> Add Another Vehicle
          </button>
        </>
      )}

      {/* Add Vehicle Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-t-2xl border border-border bg-card sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Add Vehicle</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-6">
              <AddVehicleForm
                onSuccess={() => {
                  setShowAddForm(false)
                  onVehiclesChange()
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
