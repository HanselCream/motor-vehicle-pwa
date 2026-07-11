import { useCallback, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  color?: string
  vin?: string
  license_plate?: string
  odometer_km: number
  fuel_type: string
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setVehicles([])
        return
      }

      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const addVehicle = useCallback(
    async (vehicleData: Omit<Vehicle, 'id'>) => {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .insert([vehicleData])
          .select()

        if (error) throw error
        if (data) {
          setVehicles((prev) => [data[0], ...prev])
          return data[0]
        }
      } catch (error) {
        console.error('Error adding vehicle:', error)
        throw error
      }
    },
    [supabase]
  )

  const updateVehicle = useCallback(
    async (id: string, updates: Partial<Vehicle>) => {
      try {
        const { error } = await supabase
          .from('vehicles')
          .update(updates)
          .eq('id', id)

        if (error) throw error
        setVehicles((prev) =>
          prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
        )
      } catch (error) {
        console.error('Error updating vehicle:', error)
        throw error
      }
    },
    [supabase]
  )

  const deleteVehicle = useCallback(
    async (id: string) => {
      try {
        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', id)

        if (error) throw error
        setVehicles((prev) => prev.filter((v) => v.id !== id))
      } catch (error) {
        console.error('Error deleting vehicle:', error)
        throw error
      }
    },
    [supabase]
  )

  return {
    vehicles,
    loading,
    fetchVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  }
}