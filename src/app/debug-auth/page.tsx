'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function DebugAuth() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)
  const [urlInfo, setUrlInfo] = useState<any>(null)

  useEffect(() => {
    // Get current URL info
    setUrlInfo({
      href: window.location.href,
      hash: window.location.hash,
      search: window.location.search,
      pathname: window.location.pathname
    })

    // Parse hash parameters
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const hashParamsObj = Object.fromEntries(hashParams.entries())
    
    // Parse search parameters  
    const searchParams = new URLSearchParams(window.location.search)
    const searchParamsObj = Object.fromEntries(searchParams.entries())

    console.log('URL Debug:', {
      hash: hashParamsObj,
      search: searchParamsObj
    })

    // Get session
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      setSessionInfo({ data, error })
      console.log('Session info:', { data, error })
    }

    getSession()
  }, [])

  const handleSetSession = async () => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')

    if (accessToken && refreshToken) {
      console.log('Setting session with tokens...')
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })
      
      console.log('Set session result:', { data, error })
      setSessionInfo({ data, error })
    } else {
      alert('No tokens found in URL')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Page</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">URL Info:</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(urlInfo, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Hash Parameters:</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {window.location.hash ? 
              JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.hash.slice(1)).entries()), null, 2) :
              'No hash parameters'
            }
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Search Parameters:</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {window.location.search ? 
              JSON.stringify(Object.fromEntries(new URLSearchParams(window.location.search).entries()), null, 2) :
              'No search parameters'
            }
          </pre>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Session Info:</h2>
          <pre className="bg-gray-800 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(sessionInfo, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-4">
          <Button onClick={handleSetSession} className="bg-blue-600 hover:bg-blue-700">
            Set Session from Hash
          </Button>
          
          <Button onClick={() => window.location.reload()} variant="outline">
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  )
}