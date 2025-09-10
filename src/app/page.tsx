'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { GraduationCap, Trophy, Users, Zap, ArrowRight } from 'lucide-react'
import { PublicRoute } from '@/components/PublicRoute'

export default function LandingPage() {
  const router = useRouter()

  return (
    <PublicRoute>
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
          
          <div className="relative container mx-auto px-6 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CenterGuessr
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
                Test your knowledge of CDTM alumni! Guess which class your fellow Centerlings were in and climb the leaderboard.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button 
                  size="lg" 
                  onClick={() => router.push('/auth/login')}
                  className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/leaderboard')}
                  className="border-gray-600 text-white hover:bg-gray-800 text-lg px-8 py-6"
                >
                  View Leaderboard
                  <Trophy className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple, fun, and competitive</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-600/20 rounded-full">
                    <GraduationCap className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Study Alumni</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See photos of CDTM alumni and guess which class they belonged to
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-600/20 rounded-full">
                    <Zap className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Earn Points</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get points for correct answers and bonus points for streaks in ranked mode
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-yellow-600/20 rounded-full">
                    <Trophy className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Compete</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Climb the leaderboard and compete with other CDTM community members
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800 text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-600/20 rounded-full">
                    <Users className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <CardTitle className="text-white">Connect</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn about your fellow alumni and strengthen the CDTM community
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Game Modes Section */}
        <div className="bg-gray-900/50 py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Two Ways to Play</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-blue-400">Training Mode</CardTitle>
                  <CardDescription className="text-lg">
                    Practice without pressure and learn at your own pace
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-300">
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
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-yellow-400">Ranked Mode</CardTitle>
                  <CardDescription className="text-lg">
                    Compete for points and climb the leaderboard
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-gray-300">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-6 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Test Your Knowledge?</h2>
          <p className="text-xl text-gray-400 mb-8">
            Sign in with your CDTM Google account to start playing
          </p>
          <Button 
            size="lg" 
            onClick={() => router.push('/auth/login')}
            className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
          >
            Sign In & Play Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Only @cdtm.com email addresses are allowed
          </p>
        </div>
      </div>
    </PublicRoute>
  )
}