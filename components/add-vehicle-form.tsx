'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddVehicleFormProps {
  onSuccess: () => void
}

export default function AddVehicleForm({ onSuccess }: AddVehicleFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const data = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        color: formData.get('color'),
        vin: formData.get('vin'),
        license_plate: formData.get('license_plate'),
        fuel_type: formData.get('fuel_type'),
        odometer_km: parseInt(formData.get('odometer_km') as string) || 0,
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase.from('vehicles').insert([
        {
          ...data,
          user_id: user.id,
        },
      ])

      if (error) throw error

      if (e.currentTarget) {
        e.currentTarget.reset()
      }
      onSuccess()
    } catch (err) {
      console.error('[v0] Vehicle add error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground">Make (Brand)</label>
        <input
          type="text"
          name="make"
          placeholder="e.g., Toyota"
          required
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Model</label>
        <input
          type="text"
          name="model"
          placeholder="e.g., Corolla"
          required
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-foreground">Year</label>
          <select
            name="year"
            required
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
          >
            <option value="">Select year</option>
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Fuel Type</label>
          <select
            name="fuel_type"
            defaultValue="petrol"
            className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="lpg">LPG</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Color</label>
        <input
          type="text"
          name="color"
          placeholder="e.g., Black"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">License Plate</label>
        <input
          type="text"
          name="license_plate"
          placeholder="e.g., ABC-1234"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">VIN (Optional)</label>
        <input
          type="text"
          name="vin"
          placeholder="Vehicle Identification Number"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Current Odometer (km)</label>
        <input
          type="number"
          name="odometer_km"
          placeholder="0"
          defaultValue="0"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add Vehicle'}
      </button>
    </form>
  )
}
