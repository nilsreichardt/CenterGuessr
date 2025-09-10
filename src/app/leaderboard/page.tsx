'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Header from '@/components/Header'
import { useRouter } from 'next/navigation'
import { Trophy, Medal, Award, Crown, TrendingUp, Target, Zap, ArrowLeft, RefreshCw } from 'lucide-react'
import { LeaderboardEntry } from '@/lib/types/database'

interface LeaderboardData {
  leaderboard: LeaderboardEntry[]
  currentUserRank: {
    rank: number
    total_points: number
    display_name: string | null
  } | null
  totalCount: number
  hasMore: boolean
}

export default function LeaderboardPage() {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      
      if (response.ok) {
        setLeaderboardData(data)
      } else {
        console.error('Failed to fetch leaderboard:', data.error)
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshLeaderboard = async () => {
    setRefreshing(true)
    try {
      // Call refresh endpoint
      await fetch('/api/leaderboard', { method: 'POST' })
      // Fetch updated data
      await fetchLeaderboard()
    } catch (error) {
      console.error('Error refreshing leaderboard:', error)
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  useEffect(() => {
    if (!isLoading && !user) {
      // Allow public viewing of leaderboard, but with limited functionality
    }
  }, [user, isLoading])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />
      default:
        return <span className="font-bold text-gray-400 text-lg">#{rank}</span>
    }
  }

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 border-yellow-500/50"
      case 2:
        return "bg-gradient-to-r from-gray-600/20 to-gray-500/20 border-gray-500/50"
      case 3:
        return "bg-gradient-to-r from-orange-600/20 to-orange-500/20 border-orange-500/50"
      default:
        return "bg-gray-900 border-gray-800"
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">Loading leaderboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {user && <Header showPoints={true} points={profile?.total_points || 0} />}
      
      <main className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {user && (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/game')}
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Game
                </Button>
              )}
              <div>
                <h1 className="text-4xl font-bold">Leaderboard</h1>
                <p className="text-gray-400">See how you rank against other CDTM alumni</p>
              </div>
            </div>
            
            {user && (
              <Button
                onClick={refreshLeaderboard}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 hover:bg-gray-700"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            )}
          </div>

          {/* Current User Rank (if logged in) */}
          {user && leaderboardData?.currentUserRank && (
            <Card className="bg-blue-900/20 border-blue-500/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(leaderboardData.currentUserRank.rank)}
                      <span className="text-2xl font-bold text-blue-400">
                        Your Rank
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {leaderboardData.currentUserRank.total_points} points
                      </div>
                      <div className="text-sm text-gray-400">
                        {leaderboardData.currentUserRank.display_name}
                      </div>
                    </div>
                  </div>
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.display_name || ''} />
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {getInitials(profile?.display_name || null)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Players */}
          {leaderboardData && leaderboardData.leaderboard.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center space-x-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span>Top Players</span>
              </h2>
              
              <div className="space-y-3">
                {leaderboardData.leaderboard.map((entry, index) => (
                  <Card key={entry.id} className={getRankBg(entry.rank)}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            {getRankIcon(entry.rank)}
                          </div>
                          
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={entry.avatar_url || ''} alt={entry.display_name || ''} />
                            <AvatarFallback className="bg-blue-600 text-white">
                              {getInitials(entry.display_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-grow">
                            <h3 className="text-lg font-semibold">
                              {entry.display_name || 'Anonymous'}
                            </h3>
                            <p className="text-sm text-gray-400">{entry.email}</p>
                          </div>
                        </div>
                        
                        <div className="text-right space-y-2">
                          <div className="text-2xl font-bold text-yellow-400">
                            {entry.total_points} pts
                          </div>
                          
                          <div className="flex space-x-4 text-sm">
                            <div className="flex items-center space-x-1 text-green-400">
                              <TrendingUp className="h-3 w-3" />
                              <span>{entry.win_percentage}%</span>
                            </div>
                            <div className="flex items-center space-x-1 text-purple-400">
                              <Zap className="h-3 w-3" />
                              <span>{entry.best_streak}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-blue-400">
                              <Target className="h-3 w-3" />
                              <span>{entry.games_played}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {leaderboardData && leaderboardData.leaderboard.length === 0 && (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-12 text-center">
                <Trophy className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
                <p className="text-gray-400 mb-6">
                  Be the first to play ranked games and establish the leaderboard!
                </p>
                {user && (
                  <Button
                    onClick={() => router.push('/game/ranked')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Play Ranked Game
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats Legend */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Stats Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300">Win Rate - Percentage of games won</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <span className="text-gray-300">Best Streak - Highest consecutive correct answers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-gray-300">Games - Total ranked games played</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In CTA for non-authenticated users */}
          {!user && (
            <Card className="bg-blue-900/20 border-blue-500/50">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">Want to compete?</h3>
                <p className="text-gray-400 mb-6">
                  Sign in with your CDTM Google account to start playing and join the leaderboard
                </p>
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Sign In & Play
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}