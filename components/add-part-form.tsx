'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddPartFormProps {
  vehicleId: string
  onSuccess: () => void
}

export default function AddPartForm({ vehicleId, onSuccess }: AddPartFormProps) {
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
        vehicle_id: vehicleId,
        part_name: formData.get('part_name'),
        part_number: formData.get('part_number'),
        category: formData.get('category'),
        installed_date: formData.get('installed_date'),
        warranty_expiry: formData.get('warranty_expiry'),
        cost: formData.get('cost') ? parseFloat(formData.get('cost') as string) : null,
        supplier: formData.get('supplier'),
        notes: formData.get('notes'),
      }

      await supabase.from('parts').insert([data])

      e.currentTarget.reset()
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-foreground">Part Name</label>
        <input
          type="text"
          name="part_name"
          placeholder="e.g., Brake Pads"
          required
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Part Number</label>
        <input
          type="text"
          name="part_number"
          placeholder="e.g., BP-12345"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Category</label>
        <select
          name="category"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        >
          <option value="">Select category</option>
          <option value="Brake System">Brake System</option>
          <option value="Engine">Engine</option>
          <option value="Suspension">Suspension</option>
          <option value="Electrical">Electrical</option>
          <option value="Tires">Tires</option>
          <option value="Filters">Filters</option>
          <option value="Accessories">Accessories</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Installation Date</label>
        <input
          type="date"
          name="installed_date"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Warranty Expiry</label>
        <input
          type="date"
          name="warranty_expiry"
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
        <label className="text-sm font-medium text-foreground">Supplier</label>
        <input
          type="text"
          name="supplier"
          placeholder="e.g., Bosch"
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

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Part'}
      </button>
    </form>
  )
}
