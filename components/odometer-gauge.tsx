'use client'

import { useEffect, useRef } from 'react'

interface OdometerGaugeProps {
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    odometer_km: number
  }
}

export default function OdometerGauge({ vehicle }: OdometerGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    // Clear canvas
    ctx.fillStyle = '#0f0f0f'
    ctx.fillRect(0, 0, width, height)

    // Draw outer ring
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()

    // Draw inner shadow ring
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 5, 0, Math.PI * 2)
    ctx.stroke()

    // Draw progress arc (0-300km range example, scales to 360)
    const maxKm = 300000
    const percentage = Math.min(vehicle.odometer_km / maxKm, 1)
    const endAngle = (Math.PI * 2 * percentage) - Math.PI / 2

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 8, -Math.PI / 2, endAngle)
    ctx.stroke()

    // Draw center circle
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
    ctx.fill()

    // Draw center border
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, 50, 0, Math.PI * 2)
    ctx.stroke()

    // Draw text
    ctx.fillStyle = '#f1f5f9'
    ctx.font = 'bold 24px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${Math.round(vehicle.odometer_km).toLocaleString()}`, centerX, centerY - 5)

    ctx.fillStyle = '#a1a1aa'
    ctx.font = '12px system-ui'
    ctx.fillText('km', centerX, centerY + 15)

    // Draw tick marks
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 1
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
      const x1 = centerX + Math.cos(angle) * (radius - 10)
      const y1 = centerY + Math.sin(angle) * (radius - 10)
      const x2 = centerX + Math.cos(angle) * (radius - 20)
      const y2 = centerY + Math.sin(angle) * (radius - 20)

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }, [vehicle.odometer_km])

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h2>
        <p className="text-sm text-muted-foreground">Odometer</p>
      </div>
      <canvas
        ref={canvasRef}
        width={240}
        height={240}
        className="mx-auto"
      />
    </div>
  )
}
