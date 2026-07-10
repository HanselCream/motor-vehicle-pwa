'use client'

import { useState, useEffect } from 'react'
import { useVehicles } from '@/lib/hooks/use-vehicles'
import { createClient } from '@/lib/supabase/client'
import VehicleManager from '@/components/vehicle-manager'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const { vehicles, fetchVehicles } = useVehicles()
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    fetchVehicles()

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [fetchVehicles, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      {/* Profile Section */}
      <div className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">Account</h2>
        <div>
          <p className="text-xs text-muted-foreground">Email</p>
          <p className="mt-1 text-sm font-medium text-foreground">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-destructive hover:opacity-80"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>

      {/* Vehicle Management */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">My Vehicles</h2>
        <VehicleManager vehicles={vehicles} onVehiclesChange={fetchVehicles} />
      </div>
    </div>
  )
}
