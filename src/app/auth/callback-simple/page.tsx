'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SimpleCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Completing sign in...')
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    let hasProcessed = false
    
    const processAuth = async () => {
      if (hasProcessed) return
      hasProcessed = true
      
      try {
        setStatus('Checking authentication...')
        console.log('Starting auth processing...')
        
        // First, check if we already have a session
        console.log('About to call getSession()...')
        const sessionPromise = supabase.auth.getSession()
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('getSession timeout')), 10000)
        )
        
        let session = null
        
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any
          session = result.data?.session
          const error = result.error
          
          console.log('getSession completed:', { 
            user: session?.user?.email, 
            error: error?.message,
            hasSession: !!session
          })
          
          if (error) {
            console.error('Session error:', error)
            throw error
          }
        } catch (sessionError) {
          console.error('Session check failed:', sessionError)
          setStatus('Session check failed, trying direct auth...')
          session = null
        }
        
        if (session?.user) {
          setStatus('User already authenticated, redirecting...')
          await handleAuthenticatedUser(session.user)
          return
        }
        
        setStatus('Waiting for authentication...')
        
        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log('Auth state change:', event, { 
            user: newSession?.user?.email,
            hasUser: !!newSession?.user 
          })
          
          setDebugInfo({ event, userEmail: newSession?.user?.email })
          
          if (event === 'SIGNED_IN' && newSession?.user) {
            setStatus('Authentication successful!')
            await handleAuthenticatedUser(newSession.user)
            subscription.unsubscribe()
          } else if (event === 'SIGNED_OUT') {
            setStatus('Sign out detected, redirecting...')
            router.push('/auth/login')
            subscription.unsubscribe()
          }
        })
        
        // Cleanup subscription after 30 seconds to prevent hanging
        setTimeout(() => {
          subscription.unsubscribe()
          if (status.includes('Waiting')) {
            console.log('Timeout waiting for auth, redirecting to login')
            router.push('/auth/login?error=auth_timeout')
          }
        }, 30000)
        
      } catch (error) {
        console.error('Error in auth processing:', error)
        setStatus('Error processing authentication')
        router.push('/auth/login?error=processing_failed')
      }
    }
    
    const handleAuthenticatedUser = async (user: any) => {
      try {
        // Check domain
        if (!user.email?.endsWith('@cdtm.com')) {
          console.log('User email not from cdtm.com domain:', user.email)
          setStatus('Invalid domain, signing out...')
          await supabase.auth.signOut()
          router.push('/auth/unauthorized')
          return
        }

        setStatus('Creating your profile...')
        
        // Create profile
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          updated_at: new Date().toISOString()
        })
        
        if (profileError) {
          console.error('Profile creation error:', profileError)
          setStatus('Profile creation failed, continuing anyway...')
        } else {
          console.log('Profile created/updated successfully')
          setStatus('Profile created successfully!')
        }

        setStatus('Redirecting to game...')
        console.log('About to redirect to /game')
        
        // Use setTimeout to ensure the state update renders first
        setTimeout(() => {
          console.log('Executing redirect to /game')
          router.push('/game')
        }, 1000)
        
      } catch (error) {
        console.error('Error handling authenticated user:', error)
        setStatus('Error setting up user profile')
        router.push('/auth/login?error=profile_setup_failed')
      }
    }

    processAuth()
  }, [router, status])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-lg mb-2">{status}</p>
        
        {debugInfo && (
          <div className="mt-6 p-4 bg-gray-800 rounded text-left text-sm">
            <div><strong>Event:</strong> {debugInfo.event}</div>
            <div><strong>Email:</strong> {debugInfo.userEmail || 'None'}</div>
          </div>
        )}
        
        <div className="mt-4">
          <button
            onClick={() => router.push('/auth/login')}
            className="text-gray-400 hover:text-white underline text-sm"
          >
            Having trouble? Go back to login
          </button>
        </div>
      </div>
    </div>
  )
}