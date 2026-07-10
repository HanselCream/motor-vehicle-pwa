'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wrench, Fuel, AlertCircle } from 'lucide-react'

interface QuickStatsProps {
  vehicleId: string
}

export default function QuickStats({ vehicleId }: QuickStatsProps) {
  const [stats, setStats] = useState({
    lastService: null,
    lastFuelup: null,
    activeReminders: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Last service
        const { data: serviceData } = await supabase
          .from('maintenance_logs')
          .select('service_date')
          .eq('vehicle_id', vehicleId)
          .order('service_date', { ascending: false })
          .limit(1)

        // Last fuel-up
        const { data: fuelData } = await supabase
          .from('fuel_logs')
          .select('fuel_date')
          .eq('vehicle_id', vehicleId)
          .order('fuel_date', { ascending: false })
          .limit(1)

        // Active reminders
        const { data: reminderData } = await supabase
          .from('reminders')
          .select('id')
          .eq('vehicle_id', vehicleId)
          .eq('is_completed', false)

        setStats({
          lastService: serviceData?.[0]?.service_date || null,
          lastFuelup: fuelData?.[0]?.fuel_date || null,
          activeReminders: reminderData?.length || 0,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
  }, [vehicleId, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Last Service */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Wrench className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Last Service</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {stats.lastService ? formatDate(stats.lastService) : 'No record'}
        </p>
      </div>

      {/* Last Fuel-up */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <Fuel className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Last Fuel</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {stats.lastFuelup ? formatDate(stats.lastFuelup) : 'No record'}
        </p>
      </div>

      {/* Active Reminders */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-primary" />
          <p className="text-xs text-muted-foreground">Reminders</p>
        </div>
        <p className="text-sm font-semibold text-foreground">
          {stats.activeReminders}
        </p>
      </div>
    </div>
  )
}
