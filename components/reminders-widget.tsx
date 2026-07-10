'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface RemindersWidgetProps {
  vehicleId: string
}

interface Reminder {
  id: string
  title: string
  description?: string
  is_completed: boolean
}

export default function RemindersWidget({ vehicleId }: RemindersWidgetProps) {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const { data } = await supabase
          .from('reminders')
          .select('id, title, description, is_completed')
          .eq('vehicle_id', vehicleId)
          .eq('is_completed', false)
          .limit(3)

        setReminders(data || [])
      } catch (error) {
        console.error('Error fetching reminders:', error)
      }
    }

    fetchReminders()
  }, [vehicleId, supabase])

  const toggleReminder = async (reminderId: string) => {
    try {
      await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', reminderId)

      setReminders(prev => prev.filter(r => r.id !== reminderId))
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  if (reminders.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Active Reminders</h3>
        <Link
          href="/dashboard/logs"
          className="text-xs text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="space-y-2">
        {reminders.map(reminder => (
          <div
            key={reminder.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
          >
            <button
              onClick={() => toggleReminder(reminder.id)}
              className="mt-0.5 flex-shrink-0 text-muted-foreground hover:text-primary"
            >
              <AlertCircle className="h-4 w-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{reminder.title}</p>
              {reminder.description && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {reminder.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
