import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { GameMode } from '@/lib/types/database'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const serviceSupabase = createServiceClient()
    
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

    console.log('API: User authenticated, checking/creating profile...')
    
    // Ensure user profile exists using service client to bypass RLS
    const { data: existingProfile } = await serviceSupabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()
    
    if (!existingProfile) {
      console.log('API: Profile not found, creating new profile...')
      const { error: profileError } = await serviceSupabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url
        })
      
      if (profileError) {
        console.error('API: Profile creation error:', profileError)
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 })
      }
      console.log('API: Profile created successfully')
    } else {
      console.log('API: Profile exists')
    }

    const { mode, classFilters } = await request.json()

    // Validate mode
    if (!mode || !['training', 'ranked'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid game mode' }, { status: 400 })
    }

    // For ranked mode, ensure minimum 6 classes are selected
    if (mode === 'ranked') {
      const selectedClasses = classFilters ? Object.values(classFilters).filter(Boolean).length : 0
      if (selectedClasses < 6) {
        return NextResponse.json(
          { error: 'Minimum 6 classes must be selected for ranked mode' },
          { status: 400 }
        )
      }
    }

    // Create new game session using regular client (RLS should allow this for authenticated user)
    console.log('API: Creating game session with data:', {
      user_id: user.id,
      mode: mode as GameMode,
      class_filters: classFilters || {}
    })
    
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .insert({
        user_id: user.id,
        mode: mode as GameMode,
        class_filters: classFilters || {}
      })
      .select()
      .single()

    console.log('API: Session creation result:', { session, error: sessionError })

    if (sessionError) {
      console.error('Error creating game session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create game session', details: sessionError.message },
        { status: 500 }
      )
    }

    if (!session) {
      console.error('No session returned after creation')
      return NextResponse.json(
        { error: 'Failed to create game session - no session returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('Error starting game:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}