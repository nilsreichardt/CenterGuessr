'use client'

import { supabase } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SimpleLogin() {
  const router = useRouter()

  useEffect(() => {
    // Handle auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Redirect to game on successful sign in
        window.location.href = '/game'
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          hd: 'cdtm.com'
        }
      }
    })
    
    if (error) {
      alert('Error signing in: ' + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">CenterGuessr</h1>
        <button 
          onClick={handleSignIn}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  )
}