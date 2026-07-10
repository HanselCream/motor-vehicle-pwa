'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MaintenanceChartProps {
  vehicleId: string
}

export default function MaintenanceChart({ vehicleId }: MaintenanceChartProps) {
  const [data, setData] = useState<any[]>([])
  const [totalCost, setTotalCost] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        const { data: maintenanceLogs } = await supabase
          .from('maintenance_logs')
          .select('service_type, cost, service_date')
          .eq('vehicle_id', vehicleId)
          .order('service_date', { ascending: true })
          .limit(50)

        if (!maintenanceLogs || maintenanceLogs.length === 0) {
          setData([])
          setTotalCost(0)
          return
        }

        // Group by service type
        const grouped: { [key: string]: number } = {}
        let total = 0

        maintenanceLogs.forEach(log => {
          if (log.service_type) {
            grouped[log.service_type] = (grouped[log.service_type] || 0) + (parseFloat(log.cost) || 0)
            total += parseFloat(log.cost) || 0
          }
        })

        const chartData = Object.entries(grouped).map(([type, cost]) => ({
          name: type,
          cost: parseFloat(cost.toFixed(2)),
        }))

        setData(chartData)
        setTotalCost(parseFloat(total.toFixed(2)))
      } catch (error) {
        console.error('Error fetching maintenance data:', error)
      }
    }

    fetchMaintenanceData()
  }, [vehicleId, supabase])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Maintenance Costs</h3>
        <p className="text-center text-muted-foreground">No maintenance data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Maintenance Costs</h3>
        <p className="text-sm font-semibold text-primary">₱{totalCost.toFixed(2)}</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke="rgba(255, 255, 255, 0.5)" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
          <Bar dataKey="cost" fill="#3b82f6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
