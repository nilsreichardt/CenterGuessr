'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { GraduationCap, Trophy, Target, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/Header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/lib/auth/useAuth'

export default function GameModePage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const [selectedClasses, setSelectedClasses] = useState<number>(0)

  useEffect(() => {
    // This would typically come from checking the current class filters
    // For now, we'll assume they have some classes selected
    setSelectedClasses(8) // Mock value
  }, [])

  if (!user || !profile) {
    return null
  }

  const handleModeSelect = (mode: 'training' | 'ranked') => {
    router.push(`/game/${mode}`)
  }

  const canPlayRanked = selectedClasses >= 6

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black text-white">
        <Header showPoints={true} points={profile.total_points} />
        
        <main className="container mx-auto p-6 max-w-4xl">
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Welcome back, {profile.display_name}!</h1>
              <p className="text-xl text-gray-400">
                Choose your game mode and start guessing CDTM alumni
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-blue-400">{profile.total_points}</div>
                  <div className="text-sm text-gray-400">Total Points</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-400">{profile.current_streak}</div>
                  <div className="text-sm text-gray-400">Current Streak</div>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800 text-center">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-400">{profile.games_played}</div>
                  <div className="text-sm text-gray-400">Games Played</div>
                </CardContent>
              </Card>
            </div>

            {/* Game Modes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Training Mode */}
              <Card className="bg-gray-900 border-gray-800 hover:border-blue-500 transition-colors cursor-pointer"
                    onClick={() => handleModeSelect('training')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <GraduationCap className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Training Mode</CardTitle>
                      <CardDescription>Practice without pressure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>No points earned</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Unlimited practice</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Perfect for beginners</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ranked Mode */}
              <Card className={`bg-gray-900 border-gray-800 transition-colors ${
                canPlayRanked 
                  ? 'hover:border-yellow-500 cursor-pointer' 
                  : 'opacity-50 cursor-not-allowed'
              }`}
                    onClick={() => canPlayRanked && handleModeSelect('ranked')}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-600/20 rounded-lg">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Ranked Mode</CardTitle>
                      <CardDescription>Compete for points</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>+1 point per correct answer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>+1 bonus for 3 in a row</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span>Contributes to leaderboard</span>
                    </div>
                  </div>
                  
                  {!canPlayRanked && (
                    <Alert className="mt-4 bg-yellow-900/20 border-yellow-700/50">
                      <AlertCircle className="h-4 w-4 text-yellow-400" />
                      <AlertDescription className="text-yellow-200">
                        You need at least 6 classes selected to play ranked mode
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Class Selection Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Class Selection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300">
                      You currently have <span className="text-blue-400 font-semibold">{selectedClasses}</span> classes selected
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Select more classes to unlock ranked mode and increase variety
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/profile')}
                    className="border-gray-600 text-white hover:bg-gray-800"
                  >
                    Manage Classes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}