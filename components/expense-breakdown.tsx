'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface ExpenseBreakdownProps {
  vehicleId: string
}

const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899']

export default function ExpenseBreakdown({ vehicleId }: ExpenseBreakdownProps) {
  const [data, setData] = useState<any[]>([])
  const [totalExpense, setTotalExpense] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchExpenseData = async () => {
      try {
        const { data: expenses } = await supabase
          .from('expenses')
          .select('category, amount')
          .eq('vehicle_id', vehicleId)

        if (!expenses || expenses.length === 0) {
          setData([])
          setTotalExpense(0)
          return
        }

        // Group by category
        const grouped: { [key: string]: number } = {}
        let total = 0

        expenses.forEach(expense => {
          if (expense.category) {
            grouped[expense.category] = (grouped[expense.category] || 0) + (parseFloat(expense.amount) || 0)
            total += parseFloat(expense.amount) || 0
          }
        })

        const chartData = Object.entries(grouped)
          .map(([category, amount]) => ({
            name: category,
            value: parseFloat(amount.toFixed(2)),
          }))
          .sort((a, b) => b.value - a.value)

        setData(chartData)
        setTotalExpense(parseFloat(total.toFixed(2)))
      } catch (error) {
        console.error('Error fetching expense data:', error)
      }
    }

    fetchExpenseData()
  }, [vehicleId, supabase])

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-foreground">Expense Breakdown</h3>
        <p className="text-center text-muted-foreground">No expense data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Expense Breakdown</h3>
        <p className="text-sm font-semibold text-primary">₱{totalExpense.toFixed(2)}</p>
      </div>

      {/* Stats Grid */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-medium text-foreground">₱{item.value.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#f1f5f9' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
