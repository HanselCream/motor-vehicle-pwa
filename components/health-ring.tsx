'use client'

interface HealthRingProps {
  score: number
  size?: number
  strokeWidth?: number
}

function getColor(score: number) {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#fbbf24'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

function getLabel(score: number) {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Needs Attention'
  return 'Critical'
}

export default function HealthRing({ score, size = 96, strokeWidth = 8 }: HealthRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  const color = getColor(score)

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s ease' }}
        />
      </svg>
      <div
        className="absolute flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-2xl font-bold text-foreground">{score}%</span>
      </div>
      <span className="mt-1 text-xs font-medium" style={{ color }}>
        {getLabel(score)}
      </span>
    </div>
  )
}