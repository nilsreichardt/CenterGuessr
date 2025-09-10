'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function TestSimple() {
  const router = useRouter()
  const [logs, setLogs] = useState<string[]>([])
  const [user, setUser] = useState<any>(null)

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addLog('Page loaded')
    
    // Just listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      addLog(`Auth state change: ${event}`)
      if (session?.user) {
        addLog(`User authenticated: ${session.user.email}`)
        setUser(session.user)
      } else {
        addLog('No user in session')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleGoToGame = async () => {
    addLog('Go to Game button clicked!')
    
    if (!user) {
      addLog('No user found, cannot proceed')
      return
    }
    
    addLog(`Creating profile for user: ${user.email}`)
    
    // Create profile quickly
    try {
      const result = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
        avatar_url: user.user_metadata?.avatar_url,
        updated_at: new Date().toISOString()
      })
      
      if (result.error) {
        addLog(`Profile error: ${result.error.message}`)
      } else {
        addLog('Profile created/updated successfully')
      }
    } catch (error) {
      addLog(`Profile exception: ${error}`)
    }
    
    addLog('Attempting to navigate to /game...')
    
    try {
      router.push('/game')
      addLog('Navigation called successfully')
    } catch (error) {
      addLog(`Navigation error: ${error}`)
    }
  }

  const checkSession = async () => {
    addLog('Check Session button clicked!')
    
    try {
      addLog('Calling supabase.auth.getSession()...')
      const { data, error } = await supabase.auth.getSession()
      addLog(`Session result: user=${data.session?.user?.email}, error=${error?.message}`)
      
      if (data.session?.user) {
        setUser(data.session.user)
        addLog('User state updated')
      } else {
        addLog('No session found')
      }
    } catch (error) {
      addLog(`Session check failed: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        
        {user && (
          <div className="mb-4 p-4 bg-green-900 rounded">
            <p><strong>✅ Authenticated as:</strong> {user.email}</p>
            <div className="mt-2 space-x-2">
              <Button onClick={handleGoToGame} className="bg-blue-600">
                Go to Game
              </Button>
              <button 
                onClick={handleGoToGame}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Go to Game (HTML Button)
              </button>
            </div>
          </div>
        )}
        
        <div className="mb-4 space-x-2">
          <Button onClick={checkSession} variant="outline">
            Check Session
          </Button>
          <button 
            onClick={checkSession}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Check Session (HTML)
          </button>
          <Button onClick={() => {addLog('Clear button clicked'); setLogs([])}} variant="outline">
            Clear Logs
          </Button>
          <button 
            onClick={() => addLog('Test button clicked!')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Test Button
          </button>
          <a 
            href="/game"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 inline-block"
          >
            Direct Link to Game
          </a>
        </div>
        
        <div className="bg-gray-900 rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Logs:</h2>
          <div className="space-y-1 text-sm font-mono max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-400">No logs yet...</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="text-green-400">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}