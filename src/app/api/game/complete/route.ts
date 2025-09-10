import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Check authentication
    console.log('API: Checking authentication...')
    
    let user = null
    let authError = null
    
    // Try to get user from Authorization header if available
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('API: Using Bearer token for auth')
      const result = await supabase.auth.getUser(token)
      user = result.data.user
      authError = result.error
      console.log('API: Auth result with token:', { user: user?.email, error: authError?.message })
    } else {
      // Fallback to session-based auth
      console.log('API: Using session-based auth')
      const result = await supabase.auth.getUser()
      user = result.data.user
      authError = result.error
      console.log('API: Auth result with session:', { user: user?.email, error: authError?.message })
    }
    
    if (authError || !user) {
      console.log('API: Authentication failed, returning 401')
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Get the current session to validate it belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Mark session as completed
    const { data: updatedSession, error: updateError } = await supabase
      .from('game_sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (updateError) {
      console.error('Error completing session:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete session' },
        { status: 500 }
      )
    }

    // Get updated user profile (stats will be updated by the trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching updated profile:', profileError)
    }

    return NextResponse.json({
      session: updatedSession,
      profile: profile || null
    })
  } catch (error) {
    console.error('Error completing game:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}