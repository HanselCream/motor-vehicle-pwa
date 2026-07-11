'use client'

import Link from 'next/link'
import { Car, ScanLine, FileText } from 'lucide-react'
import HealthRing from './health-ring'
import { useVehicleHealth } from '@/lib/hooks/use-vehicle-health'

interface VehicleCardProps {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    license_plate?: string
    odometer_km: number
    fuel_type: string
  }
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const health = useVehicleHealth(vehicle.id)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex h-40 items-center justify-center bg-gradient-to-b from-primary/15 to-transparent">
        <Car className="h-20 w-20 text-primary/70" strokeWidth={1.25} />
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {vehicle.license_plate || 'No plate on file'} ·{' '}
              {vehicle.odometer_km.toLocaleString()} km
            </p>
          </div>
          {!health.loading && (
            <HealthRing score={health.score} size={72} strokeWidth={6} />
          )}
        </div>

        <div className="flex gap-2">
          <Link
            href="/dashboard/logs"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <ScanLine className="h-4 w-4" />
            Add Log
          </Link>
          <Link
            href="/dashboard/passport"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary"
          >
            <FileText className="h-4 w-4" />
            View Passport
          </Link>
        </div>

        {!health.loading &&
          (health.overdueReminders > 0 || health.expiredDocuments > 0) && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {health.expiredDocuments > 0 &&
                `${health.expiredDocuments} document${health.expiredDocuments > 1 ? 's' : ''} expired. `}
              {health.overdueReminders > 0 &&
                `${health.overdueReminders} reminder${health.overdueReminders > 1 ? 's' : ''} pending.`}
            </div>
          )}
      </div>
    </div>
  )
}