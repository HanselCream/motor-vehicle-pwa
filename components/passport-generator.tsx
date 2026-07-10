'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Share2, Check } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface PassportGeneratorProps {
  vehicle: any
}

interface PassportData {
  maintenanceLogs: any[]
  fuelLogs: any[]
  expenses: any[]
  parts: any[]
  documents: any[]
}

export default function PassportGenerator({ vehicle }: PassportGeneratorProps) {
  const [data, setData] = useState<PassportData>({
    maintenanceLogs: [],
    fuelLogs: [],
    expenses: [],
    parts: [],
    documents: [],
  })
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const passportRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [maintenanceRes, fuelRes, expenseRes, partsRes, docsRes] = await Promise.all([
          supabase.from('maintenance_logs').select('*').eq('vehicle_id', vehicle.id).order('service_date', { ascending: false }),
          supabase.from('fuel_logs').select('*').eq('vehicle_id', vehicle.id).order('fuel_date', { ascending: false }),
          supabase.from('expenses').select('*').eq('vehicle_id', vehicle.id).order('expense_date', { ascending: false }),
          supabase.from('parts').select('*').eq('vehicle_id', vehicle.id).order('installed_date', { ascending: false }),
          supabase.from('documents').select('*').eq('vehicle_id', vehicle.id).order('created_at', { ascending: false }),
        ])

        setData({
          maintenanceLogs: maintenanceRes.data || [],
          fuelLogs: fuelRes.data || [],
          expenses: expenseRes.data || [],
          parts: partsRes.data || [],
          documents: docsRes.data || [],
        })
      } catch (error) {
        console.error('Error fetching passport data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [vehicle.id, supabase])

  const generatePDF = async () => {
    if (!passportRef.current) return

    setGenerating(true)
    try {
      const canvas = await html2canvas(passportRef.current, {
        backgroundColor: '#0f0f0f',
        scale: 2,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 297
      let heightLeft = canvas.height * imgWidth / canvas.width
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, heightLeft)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position = heightLeft - canvas.height * imgWidth / canvas.width
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, heightLeft)
        heightLeft -= pageHeight
      }

      pdf.save(`${vehicle.year}_${vehicle.make}_${vehicle.model}_Passport.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    const text = `Vehicle Passport - ${vehicle.year} ${vehicle.make} ${vehicle.model}
License Plate: ${vehicle.license_plate || 'N/A'}
Fuel Type: ${vehicle.fuel_type}
Current Odometer: ${vehicle.odometer_km} km

Maintenance Log Entries: ${data.maintenanceLogs.length}
Fuel Log Entries: ${data.fuelLogs.length}
Expense Records: ${data.expenses.length}
Parts Tracked: ${data.parts.length}
Documents: ${data.documents.length}`

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Loading vehicle data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={generatePDF}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {generating ? 'Generating...' : 'Download PDF'}
        </button>
        <button
          onClick={copyToClipboard}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 font-medium text-foreground hover:border-primary"
        >
          {copySuccess ? <Check className="h-4 w-4 text-accent" /> : <Share2 className="h-4 w-4" />}
          {copySuccess ? 'Copied' : 'Share Summary'}
        </button>
      </div>

      {/* Passport Preview */}
      <div ref={passportRef} className="space-y-6 rounded-xl border border-border bg-card p-8">
        {/* Header */}
        <div className="border-b border-border pb-6">
          <h2 className="text-3xl font-bold text-primary">Vehicle Passport</h2>
          <p className="mt-1 text-muted-foreground">Complete Maintenance & Service History</p>
        </div>

        {/* Vehicle Info */}
        <div className="space-y-3 rounded-lg bg-muted p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Make & Model</p>
              <p className="text-lg font-semibold text-foreground">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">License Plate</p>
              <p className="text-lg font-semibold text-foreground">{vehicle.license_plate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Type</p>
              <p className="text-lg font-semibold text-foreground">{vehicle.fuel_type}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Current Odometer</p>
              <p className="text-lg font-semibold text-foreground">{vehicle.odometer_km.toLocaleString()} km</p>
            </div>
            {vehicle.vin && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">VIN</p>
                <p className="text-sm font-mono text-foreground">{vehicle.vin}</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-5 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Maintenance</p>
            <p className="text-xl font-bold text-foreground">{data.maintenanceLogs.length}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Fuel Logs</p>
            <p className="text-xl font-bold text-foreground">{data.fuelLogs.length}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-xl font-bold text-foreground">{data.expenses.length}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Parts</p>
            <p className="text-xl font-bold text-foreground">{data.parts.length}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="text-xl font-bold text-foreground">{data.documents.length}</p>
          </div>
        </div>

        {/* Latest Maintenance */}
        {data.maintenanceLogs.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Recent Maintenance</h3>
            <div className="space-y-2">
              {data.maintenanceLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex justify-between border-b border-border pb-2 text-sm">
                  <span className="text-foreground">{log.service_type}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.service_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Latest Fuel Logs */}
        {data.fuelLogs.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-foreground">Fuel History</h3>
            <div className="space-y-2">
              {data.fuelLogs.slice(0, 5).map(log => (
                <div key={log.id} className="flex justify-between border-b border-border pb-2 text-sm">
                  <span className="text-foreground">{log.liters}L @ {log.fuel_type || 'Fuel'}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.fuel_date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
          <p>Generated on {new Date().toLocaleDateString()}</p>
          <p>Motor - Vehicle Maintenance Tracker</p>
        </div>
      </div>
    </div>
  )
}
