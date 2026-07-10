'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface AddDocumentFormProps {
  vehicleId: string
  onSuccess: () => void
}

export default function AddDocumentForm({ vehicleId, onSuccess }: AddDocumentFormProps) {
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
        document_type: formData.get('document_type'),
        title: formData.get('title'),
        file_name: formData.get('file_name'),
        expiry_date: formData.get('expiry_date') || null,
      }

      await supabase.from('documents').insert([data])

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
        <label className="text-sm font-medium text-foreground">Document Type</label>
        <select
          name="document_type"
          required
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        >
          <option value="">Select type</option>
          <option value="Registration">Registration</option>
          <option value="Insurance">Insurance</option>
          <option value="Inspection">Inspection</option>
          <option value="Title Deed">Title Deed</option>
          <option value="Service Records">Service Records</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Title</label>
        <input
          type="text"
          name="title"
          placeholder="e.g., Annual Insurance 2024"
          required
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">File Name</label>
        <input
          type="text"
          name="file_name"
          placeholder="e.g., insurance_2024.pdf"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground">Expiry Date</label>
        <input
          type="date"
          name="expiry_date"
          className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Add Document'}
      </button>
    </form>
  )
}
