import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface VehicleHealth {
  score: number
  loading: boolean
  overdueReminders: number
  expiredDocuments: number
  expiringDocuments: number
  daysSinceLastService: number | null
}

const INITIAL: VehicleHealth = {
  score: 100,
  loading: true,
  overdueReminders: 0,
  expiredDocuments: 0,
  expiringDocuments: 0,
  daysSinceLastService: null,
}

export function useVehicleHealth(vehicleId: string | undefined) {
  const [health, setHealth] = useState<VehicleHealth>(INITIAL)
  const supabase = createClient()

  useEffect(() => {
    if (!vehicleId) return

    const compute = async () => {
      setHealth((h) => ({ ...h, loading: true }))
      try {
        const [remindersRes, docsRes, lastServiceRes] = await Promise.all([
          supabase
            .from('reminders')
            .select('id')
            .eq('vehicle_id', vehicleId)
            .eq('is_completed', false),
          supabase
            .from('documents')
            .select('expiry_date')
            .eq('vehicle_id', vehicleId)
            .not('expiry_date', 'is', null),
          supabase
            .from('maintenance_logs')
            .select('service_date')
            .eq('vehicle_id', vehicleId)
            .order('service_date', { ascending: false })
            .limit(1),
        ])

        const overdueReminders = remindersRes.data?.length || 0

        const now = new Date()
        let expiredDocuments = 0
        let expiringDocuments = 0
        for (const doc of docsRes.data || []) {
          const daysLeft = Math.floor(
            (new Date(doc.expiry_date).getTime() - now.getTime()) / 86400000
          )
          if (daysLeft < 0) expiredDocuments++
          else if (daysLeft <= 30) expiringDocuments++
        }

        let daysSinceLastService: number | null = null
        const lastServiceDate = lastServiceRes.data?.[0]?.service_date
        if (lastServiceDate) {
          daysSinceLastService = Math.floor(
            (now.getTime() - new Date(lastServiceDate).getTime()) / 86400000
          )
        }

        let score = 100
        score -= Math.min(overdueReminders * 8, 32)
        score -= expiredDocuments * 20
        score -= expiringDocuments * 8
        if (daysSinceLastService === null) score -= 25
        else if (daysSinceLastService > 365) score -= 20
        else if (daysSinceLastService > 180) score -= 10

        score = Math.max(0, Math.min(100, score))

        setHealth({
          score,
          loading: false,
          overdueReminders,
          expiredDocuments,
          expiringDocuments,
          daysSinceLastService,
        })
      } catch (error) {
        console.error('Error computing vehicle health:', error)
        setHealth((h) => ({ ...h, loading: false }))
      }
    }

    compute()
  }, [vehicleId, supabase])

  return health
}