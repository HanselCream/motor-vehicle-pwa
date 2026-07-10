'use client'

import { useEffect, useState } from 'react'
import { useVehicles } from '@/lib/hooks/use-vehicles'
import { createClient } from '@/lib/supabase/client'
import { Plus, FileText, AlertTriangle, X } from 'lucide-react'
import AddDocumentForm from '@/components/add-document-form'

export default function DocumentsPage() {
  const { vehicles } = useVehicles()
 const [selectedVehicle, setSelectedVehicle] = useState<
  ReturnType<typeof useVehicles>['vehicles'][number] | null
>(null)
  const [documents, setDocuments] = useState<any[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0])
    }
  }, [vehicles, selectedVehicle])

  useEffect(() => {
    if (!selectedVehicle) return

    const fetchDocuments = async () => {
      try {
        const { data } = await supabase
          .from('documents')
          .select('*')
          .eq('vehicle_id', selectedVehicle.id)
          .order('created_at', { ascending: false })

        setDocuments(data || [])
      } catch (error) {
        console.error('Error fetching documents:', error)
      }
    }

    fetchDocuments()
  }, [selectedVehicle, supabase])

  const deleteDocument = async (id: string) => {
    try {
      await supabase.from('documents').delete().eq('id', id)
      setDocuments(prev => prev.filter(d => d.id !== id))
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const isExpiring = (expiryDate: string) => {
    if (!expiryDate) return false
    const date = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0
  }

  const isExpired = (expiryDate: string) => {
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
        <h1 className="text-2xl font-bold text-foreground">Documents</h1>
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

      {/* Documents List */}
      <div className="space-y-3">
        {documents.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No documents added yet</p>
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className="flex items-start justify-between rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start gap-3">
                <FileText className="mt-1 h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{doc.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-2 py-1">
                      {doc.document_type}
                    </span>
                    {doc.expiry_date && (
                      <span className={`rounded px-2 py-1 ${
                        isExpired(doc.expiry_date)
                          ? 'bg-destructive/20 text-destructive'
                          : isExpiring(doc.expiry_date)
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground'
                      }`}>
                        Expires {formatDate(doc.expiry_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isExpired(doc.expiry_date) && (
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Document Modal */}
      {showAddForm && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm sm:items-center sm:justify-center">
          <div className="w-full max-w-md rounded-t-2xl border border-border bg-card sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Add Document</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-auto p-6">
              <AddDocumentForm
                vehicleId={selectedVehicle.id}
                onSuccess={() => {
                  setShowAddForm(false)
                  // Refresh documents
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
