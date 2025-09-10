'use client'

import { useAuth } from '@/lib/auth/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { user, profile, isLoading } = useAuth()
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [cookies, setCookies] = useState<string[]>([])

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSessionInfo(session)
    }

    checkSession()
    setCookies(document.cookie.split(';').map(c => c.trim()))
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Auth Context State</h2>
          <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
          <p><strong>User:</strong> {user ? `${user.email} (${user.id})` : 'None'}</p>
          <p><strong>Profile:</strong> {profile ? `${profile.display_name}` : 'None'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Supabase Session</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Cookies</h2>
          <ul className="text-sm">
            {cookies.map((cookie, index) => (
              <li key={index} className="break-all">{cookie}</li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Actions</h2>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Refresh Page
          </button>
          <button 
            onClick={async () => {
              const { data: { session } } = await supabase.auth.getSession()
              setSessionInfo(session)
            }}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Check Session
          </button>
        </div>
      </div>
    </div>
  )
}
