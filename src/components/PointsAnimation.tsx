'use client'

import { useEffect, useState } from 'react'
import { Trophy, Zap } from 'lucide-react'

interface PointsAnimationProps {
  points: number
  streakBonus?: boolean
  show: boolean
  onComplete?: () => void
}

export default function PointsAnimation({ points, streakBonus = false, show, onComplete }: PointsAnimationProps) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (show && points > 0) {
      setAnimate(true)
      const timer = setTimeout(() => {
        setAnimate(false)
        if (onComplete) {
          onComplete()
        }
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [show, points, onComplete])

  if (!show || points <= 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div
        className={`transform transition-all duration-1000 ${
          animate
            ? 'scale-125 opacity-100 translate-y-0'
            : 'scale-100 opacity-0 translate-y-8'
        }`}
      >
        <div className="bg-yellow-600 text-white px-6 py-4 rounded-full shadow-2xl border-2 border-yellow-400">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6" />
            <span className="text-2xl font-bold">+{points}</span>
            {streakBonus && (
              <div className="flex items-center space-x-1 bg-yellow-800 px-2 py-1 rounded-full">
                <Zap className="h-4 w-4" />
                <span className="text-sm font-bold">STREAK!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}