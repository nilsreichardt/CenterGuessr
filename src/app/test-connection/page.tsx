'use client'

import { supabase } from '@/lib/supabase/client'
import { useState } from 'react'

export default function TestConnectionPage() {
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const testConnection = async () => {
    try {
      setStatus('Testing connection...')
      setError('')
      
      // Test basic connection
      const { data, error: connError } = await supabase.from('profiles').select('count').limit(1)
      
      if (connError) {
        throw new Error(`Connection failed: ${connError.message}`)
      }
      
      setStatus('Connection successful! Database accessible.')
      
      // Test OAuth configuration
      const { data: oauthData, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            hd: 'cdtm.com'
          }
        }
      })
      
      if (oauthError) {
        throw new Error(`OAuth configuration failed: ${oauthError.message}`)
      }
      
      setStatus('OAuth configuration successful! Redirecting...')
      
    } catch (err: any) {
      setError(err.message)
      setStatus('')
    }
  }

  const checkCurrentSession = async () => {
    try {
      setStatus('Checking current session...')
      setError('')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        throw new Error(`Session check failed: ${error.message}`)
      }
      
      if (session) {
        setStatus(`Session found: ${session.user.email} (${session.user.id})`)
      } else {
        setStatus('No active session found')
      }
      
    } catch (err: any) {
      setError(err.message)
      setStatus('')
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={testConnection}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Test Connection & OAuth
          </button>
          
          <button 
            onClick={checkCurrentSession}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Check Current Session
          </button>
        </div>
        
        {status && (
          <div className="bg-gray-100 p-4 rounded">
            <strong>Status:</strong> {status}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 p-4 rounded text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p><strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'}</p>
          <p><strong>GOOGLE_CLIENT_ID:</strong> {process.env.GOOGLE_CLIENT_ID || 'Not set'}</p>
        </div>
      </div>
    </div>
  )
}
