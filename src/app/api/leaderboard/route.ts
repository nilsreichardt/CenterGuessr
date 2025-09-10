import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get leaderboard data from materialized view
    const { data: leaderboard, error: leaderboardError } = await supabase
      .from('leaderboard')
      .select('*')
      .range(offset, offset + limit - 1)

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError)
      return NextResponse.json(
        { error: 'Failed to fetch leaderboard' },
        { status: 500 }
      )
    }

    // Get current user's ranking if authenticated
    let currentUserRank = null
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: userRanking, error: rankError } = await supabase
        .from('leaderboard')
        .select('rank, total_points, display_name')
        .eq('id', user.id)
        .single()

      if (!rankError && userRanking) {
        currentUserRank = userRanking
      }
    }

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('leaderboard')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      leaderboard: leaderboard || [],
      currentUserRank,
      totalCount: count || 0,
      hasMore: (offset + limit) < (count || 0)
    })
  } catch (error) {
    console.error('Error in leaderboard API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Refresh leaderboard (admin function)
export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Call the refresh function
    const { error: refreshError } = await supabase.rpc('refresh_leaderboard')

    if (refreshError) {
      console.error('Error refreshing leaderboard:', refreshError)
      return NextResponse.json(
        { error: 'Failed to refresh leaderboard' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error refreshing leaderboard:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}