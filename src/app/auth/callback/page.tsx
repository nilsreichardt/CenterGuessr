'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('Processing authentication...')
        
        console.log('Full URL:', window.location.href)
        console.log('Hash:', window.location.hash)
        console.log('Search:', window.location.search)
        
        // Wait a moment for the URL to be fully loaded
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Check if we have tokens in the URL fragment
        const hashParams = new URLSearchParams(window.location.hash.slice(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const errorParam = hashParams.get('error')
        
        console.log('Parsed hash params:', {
          accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
          refreshToken: refreshToken ? refreshToken.substring(0, 20) + '...' : null,
          error: errorParam,
          allParams: Object.fromEntries(hashParams.entries())
        })

        // Check for errors in hash
        if (errorParam) {
          console.error('OAuth error in hash:', errorParam)
          router.push('/auth/login?error=auth_failed')
          return
        }

        if (accessToken && refreshToken) {
          setStatus('Setting up your session...')
          
          // Set the session using the tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/auth/login?error=session_failed')
            return
          }

          if (!data.user) {
            console.error('No user data after setting session')
            router.push('/auth/login?error=no_user_data')
            return
          }

          console.log('Session set successfully:', { id: data.user.id, email: data.user.email })

          // Check domain restriction
          if (!data.user.email?.endsWith('@cdtm.com')) {
            console.log('User email not from cdtm.com domain:', data.user.email)
            await supabase.auth.signOut()
            router.push('/auth/unauthorized')
            return
          }

          setStatus('Creating your profile...')

          // Create or update profile
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              email: data.user.email,
              display_name: data.user.user_metadata?.full_name || 
                           data.user.user_metadata?.name || 
                           data.user.email?.split('@')[0],
              avatar_url: data.user.user_metadata?.avatar_url,
              updated_at: new Date().toISOString()
            })

          if (profileError) {
            console.error('Error creating/updating profile:', profileError)
            // Continue anyway, profile might already exist
          }

          setStatus('Success! Redirecting to game...')
          
          // Clear the URL hash before redirecting
          window.history.replaceState({}, document.title, '/auth/callback')
          
          // Wait a moment then redirect
          setTimeout(() => {
            router.push('/game')
          }, 1000)
          return
        }

        // Check for query params (PKCE flow)
        const searchParams = new URLSearchParams(window.location.search)
        const code = searchParams.get('code')
        
        if (code) {
          console.log('Found authorization code, letting server handle it')
          // Let the server route handle this
          window.location.href = `/auth/callback${window.location.search}`
          return
        }

        // If no tokens in fragment and no code, check existing session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          router.push('/auth/login?error=session_failed')
          return
        }

        if (data.session?.user) {
          // User is already authenticated
          console.log('User already authenticated')
          router.push('/game')
        } else {
          // No session found
          console.log('No session found, redirecting to login')
          router.push('/auth/login')
        }

      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg">{status}</p>
        <p className="text-sm text-gray-400 mt-2">Please wait while we set up your account...</p>
      </div>
    </div>
  )
}