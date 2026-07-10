'use client'

import { useEffect, useState } from 'react'
import { useVehicles } from '@/lib/hooks/use-vehicles'
import { createClient } from '@/lib/supabase/client'
import { Plus, AlertCircle, X, Trash2 } from 'lucide-react'
import AddPartForm from '@/components/add-part-form'

interface Part {
  id: string
  part_name: string
  part_number?: string
  category?: string
  installed_date?: string
  warranty_expiry?: string
  cost?: number
  supplier?: string
  notes?: string
}

export default function PartsPage() {
  const { vehicles } = useVehicles()
  const [selectedVehicle, setSelectedVehicle] = useState<
  ReturnType<typeof useVehicles>['vehicles'][number] | null
>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0])
    }
  }, [vehicles, selectedVehicle])

  useEffect(() => {
    if (!selectedVehicle) return

    const fetchParts = async () => {
      try {
        const { data } = await supabase
          .from('parts')
          .select('*')
          .eq('vehicle_id', selectedVehicle.id)
          .order('installed_date', { ascending: false })

        setParts(data || [])
      } catch (error) {
        console.error('Error fetching parts:', error)
      }
    }

    fetchParts()
  }, [selectedVehicle, supabase])

  const deletePart = async (id: string) => {
    try {
      await supabase.from('parts').delete().eq('id', id)
      setParts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting part:', error)
    }
  }

  const isWarrantyExpiring = (expiryDate: string) => {
    if (!expiryDate) return false
    const date = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0
  }

  const isWarrantyExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
        <h1 className="text-2xl font-bold text-foreground">Parts Tracker</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add
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

      {/* Parts List */}
      <div className="space-y-3">
        {parts.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">No parts tracked yet</p>
          </div>
        ) : (
          parts.map(part => (
            <div
              key={part.id}
              className="flex items-start justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">{part.part_name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {part.category && (
                    <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
                      {part.category}
                    </span>
                  )}
                  {part.installed_date && (
                    <span className="text-muted-foreground">
                      Installed {formatDate(part.installed_date)}
                    </span>
                  )}
                  {part.cost && (
                    <span className="text-muted-foreground">₱{part.cost.toFixed(2)}</span>
                  )}
                </div>

                {/* Warranty Status */}
                {part.warranty_expiry && (
                  <div
                    className={`mt-2 flex items-center gap-1 rounded px-2 py-1 text-xs ${
                      isWarrantyExpired(part.warranty_expiry)
                        ? 'bg-destructive/20 text-destructive'
                        : isWarrantyExpiring(part.warranty_expiry)
                          ? 'bg-primary/20 text-primary'
                          : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {isWarrantyExpired(part.warranty_expiry) && (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Warranty Expired
                      </>
                    )}
                    {isWarrantyExpiring(part.warranty_expiry) && !isWarrantyExpired(part.warranty_expiry) && (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Warranty expires {formatDate(part.warranty_expiry)}
                      </>
                    )}
                    {!isWarrantyExpiring(part.warranty_expiry) && !isWarrantyExpired(part.warranty_expiry) && (
                      <>Valid until {formatDate(part.warranty_expiry)}</>
                    )}
                  </div>
                )}

                {part.notes && (
                  <p className="mt-2 text-xs text-muted-foreground">{part.notes}</p>
                )}
              </div>

              <button
                onClick={() => deletePart(part.id)}
                className="ml-2 flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Part Modal */}
      {showAddForm && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-t-2xl border border-border bg-card sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Add Part</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-6">
              <AddPartForm
                vehicleId={selectedVehicle.id}
                onSuccess={() => {
                  setShowAddForm(false)
                  // Parts will refresh via useEffect
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
