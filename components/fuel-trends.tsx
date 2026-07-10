'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface FuelTrendsProps {
  vehicleId: string
}

export default function FuelTrends({ vehicleId }: FuelTrendsProps) {
  const [data, setData] = useState<any[]>([])
  const [stats, setStats] = useState({
    avgEfficiency: 0,
    totalLiters: 0,
    totalCost: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    const fetchFuelData = async () => {
      try {
        const { data: fuelLogs } = await supabase
          .from('fuel_logs')
          .select('fuel_date, liters, cost, odometer_km')
          .eq('vehicle_id', vehicleId)
          .order('fuel_date', { ascending: true })
          .limit(30)

        if (!fuelLogs || fuelLogs.length === 0) {
          setData([])
          return
        }

        // Calculate efficiency and prepare chart data
        let previousOdometer = fuelLogs[0].odometer_km
        const chartData = fuelLogs.map((log, index) => {
          const distance = index === 0 ? 0 : log.odometer_km - previousOdometer
          const efficiency = log.liters > 0 ? distance / log.liters : 0
          previousOdometer = log.odometer_km

          return {
            date: new Date(log.fuel_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            liters: parseFloat(log.liters),
            cost: parseFloat(log.cost),
            efficiency: parseFloat(efficiency.toFixed(2)),
          }
        })

        setData(chartData)

        // Calculate stats
        const totalLiters = fuelLogs.reduce((sum, log) => sum + parseFloat(log.liters), 0)
        const totalCost = fuelLogs.reduce((sum, log) => sum + parseFloat(log.cost), 0)
        const avgEfficiency =
          fuelLogs.length > 0
            ? chartData.reduce((sum, d) => sum + d.efficiency, 0) / chartData.length
            : 0

        setStats({
          totalLiters: parseFloat(totalLiters.toFixed(2)),
          totalCost: parseFloat(totalCost.toFixed(2)),
          avgEfficiency: parseFloat(avgEfficiency.toFixed(2)),
        })
      } catch (error) {
        console.error('Error fetching fuel data:', error)
      }
    }

    fetchFuelData()
  }, [vehicleId, supabase])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Fuel Trends</h3>
        <p className="text-center text-muted-foreground">No fuel data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">Fuel Trends</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Total Liters</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{stats.totalLiters}L</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Total Cost</p>
          <p className="mt-1 text-sm font-semibold text-foreground">₱{stats.totalCost.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Avg Efficiency</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{stats.avgEfficiency} km/L</p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ fontSize: '12px' }}
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
          <Line
            type="monotone"
            dataKey="efficiency"
            stroke="#fbbf24"
            strokeWidth={2}
            dot={{ fill: '#fbbf24', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
