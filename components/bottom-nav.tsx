'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Gauge, History, TrendingUp, Award, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Gauge },
  { href: '/dashboard/logs', label: 'Logs', icon: History },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
  { href: '/dashboard/passport', label: 'Passport', icon: Award },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function isNavActive(pathname: string, href: string) {
  // '/dashboard' is a prefix of every other route below it, so it needs
  // an exact match. Every other item can safely use prefix matching.
  if (href === '/dashboard') return pathname === href
  return pathname === href || pathname.startsWith(href + '/')
}

export default function BottomNav() {
  const pathname = usePathname()
  const [taps, setTaps] = useState(() => navItems.map(() => 0))

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-card">
      <div className="flex h-20 items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }, i) => {
          const isActive = isNavActive(pathname, href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setTaps((t) => t.map((n, idx) => (idx === i ? n + 1 : n)))}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                key={taps[i]}
                className={cn('h-5 w-5 animate-nav-tap', isActive && 'animate-nav-idle')}
              />
              <span className="text-xs">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}