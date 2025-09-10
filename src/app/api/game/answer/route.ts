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

    const { sessionId, studentId, studentName, correctClass, userAnswer, responseTime } = await request.json()
    
    console.log('API: Received request data:', {
      sessionId,
      studentId,
      studentName,
      correctClass,
      userAnswer,
      responseTime,
      userId: user.id
    })

    // Validate required fields
    if (!sessionId || !studentId || !studentName || !correctClass) {
      console.log('API: Missing required fields')
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get the current session to validate it belongs to the user
    console.log('API: Looking for session with ID:', sessionId)
    
    // First, let's check if the session exists at all (without user_id filter)
    const { data: allSessions, error: allSessionsError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
    
    console.log('API: All sessions with this ID:', { allSessions, error: allSessionsError })
    
    const { data: session, error: sessionError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    console.log('API: Session query result:', { session, error: sessionError })

    if (sessionError || !session) {
      console.log('API: Session validation failed:', { sessionError, session })
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    // Calculate if answer is correct and points
    const isCorrect = userAnswer === correctClass
    let pointsAwarded = 0
    
    if (session.mode === 'ranked' && isCorrect) {
      pointsAwarded = 1
      
      // Check for streak bonus (3 in a row)
      const newStreakCount = isCorrect ? session.streak_count + 1 : 0
      if (newStreakCount > 0 && newStreakCount % 3 === 0) {
        pointsAwarded += 1 // Bonus point for 3 in a row
      }
    }

    // Record the answer
    const { data: answer, error: answerError } = await supabase
      .from('game_answers')
      .insert({
        session_id: sessionId,
        user_id: user.id,
        student_id: studentId,
        student_name: studentName,
        correct_class: correctClass,
        user_answer: userAnswer,
        is_correct: isCorrect,
        points_awarded: pointsAwarded,
        response_time_ms: responseTime || null
      })
      .select()
      .single()

    if (answerError) {
      console.error('Error recording answer:', answerError)
      return NextResponse.json(
        { error: 'Failed to record answer' },
        { status: 500 }
      )
    }

    // Update session stats
    const newCorrectAnswers = isCorrect ? session.correct_answers + 1 : session.correct_answers
    const newTotalQuestions = session.total_questions + 1
    const newStreakCount = isCorrect ? session.streak_count + 1 : 0
    const newMaxStreak = Math.max(session.max_streak, newStreakCount)
    const newPointsEarned = session.points_earned + pointsAwarded

    const { error: updateError } = await supabase
      .from('game_sessions')
      .update({
        total_questions: newTotalQuestions,
        correct_answers: newCorrectAnswers,
        points_earned: newPointsEarned,
        streak_count: newStreakCount,
        max_streak: newMaxStreak
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Error updating session:', updateError)
      return NextResponse.json(
        { error: 'Failed to update session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      answer,
      isCorrect,
      pointsAwarded,
      streakCount: newStreakCount,
      streakBonus: newStreakCount > 0 && newStreakCount % 3 === 0,
      totalPoints: newPointsEarned
    })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}