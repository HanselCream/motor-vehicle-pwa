'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddLogFormProps {
  vehicleId: string
  logType: 'maintenance' | 'fuel' | 'expense'
  onSuccess: () => void
}

export default function AddLogForm({ vehicleId, logType, onSuccess }: AddLogFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const formData = new FormData(e.currentTarget)
      const data = Object.fromEntries(formData)

      if (logType === 'maintenance') {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase.from('maintenance_logs').insert({
          vehicle_id: vehicleId,
          user_id: user.id,
          service_type: data.service_type,
          description: data.description,
          cost: data.cost ? parseFloat(data.cost as string) : null,
          service_date: data.service_date,
          odometer_km: data.odometer_km ? parseInt(data.odometer_km as string) : null,
          provider: data.provider,
          location: data.location,
        })

        if (error) throw error
      } else if (logType === 'fuel') {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase.from('fuel_logs').insert({
          vehicle_id: vehicleId,
          user_id: user.id,
          liters: parseFloat(data.liters as string),
          cost: parseFloat(data.cost as string),
          odometer_km: parseInt(data.odometer_km as string),
          fuel_date: data.fuel_date,
          fuel_type: data.fuel_type,
          location: data.location,
        })

        if (error) throw error
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error('User not authenticated')

        const { error } = await supabase.from('expenses').insert({
          vehicle_id: vehicleId,
          user_id: user.id,
          category: data.category,
          description: data.description,
          amount: parseFloat(data.amount as string),
          expense_date: data.expense_date,
          payment_method: data.payment_method,
          notes: data.notes,
        })

        if (error) throw error
      }

      if (e.currentTarget) {
        e.currentTarget.reset()
      }
      onSuccess()
    } catch (err) {
      console.error('[v0] Error adding log:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {logType === 'maintenance' && (
        <>
          <div>
            <label className="text-sm font-medium text-foreground">Service Type</label>
            <select
              name="service_type"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="">Select service type</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Tire Rotation">Tire Rotation</option>
              <option value="Filter Replacement">Filter Replacement</option>
              <option value="Maintenance">General Maintenance</option>
              <option value="Inspection">Inspection</option>
              <option value="Repair">Repair</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Service Date</label>
            <input
              type="date"
              name="service_date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Odometer (km)</label>
            <input
              type="number"
              name="odometer_km"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Cost</label>
            <input
              type="number"
              name="cost"
              step="0.01"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Provider</label>
            <input
              type="text"
              name="provider"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <input
              type="text"
              name="location"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <textarea
              name="description"
              rows={3}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>
        </>
      )}

      {logType === 'fuel' && (
        <>
          <div>
            <label className="text-sm font-medium text-foreground">Liters</label>
            <input
              type="number"
              name="liters"
              step="0.01"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Cost</label>
            <input
              type="number"
              name="cost"
              step="0.01"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Odometer (km)</label>
            <input
              type="number"
              name="odometer_km"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fuel Date</label>
            <input
              type="date"
              name="fuel_date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Fuel Type</label>
            <select
              name="fuel_type"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="LPG">LPG</option>
              <option value="Electric">Electric</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Location</label>
            <input
              type="text"
              name="location"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>
        </>
      )}

      {logType === 'expense' && (
        <>
          <div>
            <label className="text-sm font-medium text-foreground">Category</label>
            <select
              name="category"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            >
              <option value="">Select category</option>
              <option value="Insurance">Insurance</option>
              <option value="Parking">Parking</option>
              <option value="Tolls">Tolls</option>
              <option value="Washing">Washing</option>
              <option value="Accessories">Accessories</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Amount</label>
            <input
              type="number"
              name="amount"
              step="0.01"
              required
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Expense Date</label>
            <input
              type="date"
              name="expense_date"
              required
              defaultValue={today}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Payment Method</label>
            <input
              type="text"
              name="payment_method"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Description</label>
            <input
              type="text"
              name="description"
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Log'}
      </button>
    </form>
  )
}
