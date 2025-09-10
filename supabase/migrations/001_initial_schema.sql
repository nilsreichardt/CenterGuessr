-- Initial schema for CenterGuessr leaderboard and game tracking

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  games_won INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Game sessions table to track individual games
CREATE TABLE public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('training', 'ranked')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  streak_count INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  class_filters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Game answers table to track individual questions within sessions
CREATE TABLE public.game_answers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id INTEGER NOT NULL, -- Reference to Directus student ID
  student_name TEXT NOT NULL,
  correct_class TEXT NOT NULL, -- Format: "Season Year"
  user_answer TEXT, -- Format: "Season Year" or null if not answered
  is_correct BOOLEAN,
  points_awarded INTEGER DEFAULT 0,
  response_time_ms INTEGER, -- Time taken to answer in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW public.leaderboard AS
SELECT 
  p.id,
  p.display_name,
  p.avatar_url,
  p.email,
  p.total_points,
  p.current_streak,
  p.best_streak,
  p.games_played,
  p.games_won,
  CASE 
    WHEN p.games_played > 0 THEN ROUND((p.games_won::DECIMAL / p.games_played) * 100, 1)
    ELSE 0 
  END as win_percentage,
  p.updated_at,
  ROW_NUMBER() OVER (ORDER BY p.total_points DESC, p.best_streak DESC, p.updated_at ASC) as rank
FROM public.profiles p
WHERE p.total_points > 0
ORDER BY p.total_points DESC, p.best_streak DESC, p.updated_at ASC;

-- Create indexes for performance
CREATE INDEX idx_profiles_total_points ON public.profiles(total_points DESC);
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_mode ON public.game_sessions(mode);
CREATE INDEX idx_game_sessions_created_at ON public.game_sessions(created_at DESC);
CREATE INDEX idx_game_answers_session_id ON public.game_answers(session_id);
CREATE INDEX idx_game_answers_user_id ON public.game_answers(user_id);

-- Function to refresh leaderboard materialized view
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.leaderboard;
END;
$$;

-- Function to update user stats after a game session completes
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_points INTEGER;
  session_streak INTEGER;
  session_correct INTEGER;
  session_total INTEGER;
  user_best_streak INTEGER;
BEGIN
  -- Only process when session is completed and in ranked mode
  IF NEW.status = 'completed' AND NEW.mode = 'ranked' AND OLD.status != 'completed' THEN
    -- Get session stats
    session_points := COALESCE(NEW.points_earned, 0);
    session_streak := COALESCE(NEW.max_streak, 0);
    session_correct := COALESCE(NEW.correct_answers, 0);
    session_total := COALESCE(NEW.total_questions, 0);
    
    -- Get user's current best streak
    SELECT best_streak INTO user_best_streak 
    FROM public.profiles 
    WHERE id = NEW.user_id;
    
    -- Update user profile stats
    UPDATE public.profiles 
    SET 
      total_points = total_points + session_points,
      current_streak = CASE 
        WHEN session_correct = session_total THEN current_streak + session_correct
        ELSE 0
      END,
      best_streak = GREATEST(best_streak, session_streak),
      games_played = games_played + 1,
      games_won = CASE 
        WHEN session_correct = session_total THEN games_won + 1
        ELSE games_won
      END,
      updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Refresh leaderboard if points were earned
    IF session_points > 0 THEN
      PERFORM refresh_leaderboard();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating user stats
CREATE TRIGGER update_user_stats_trigger
  AFTER UPDATE ON public.game_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_game();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_answers ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Game sessions policies  
CREATE POLICY "Users can view their own game sessions" 
  ON public.game_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game sessions" 
  ON public.game_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game sessions" 
  ON public.game_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Game answers policies
CREATE POLICY "Users can view their own game answers" 
  ON public.game_answers FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own game answers" 
  ON public.game_answers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.game_sessions TO authenticated;
GRANT ALL ON public.game_answers TO authenticated;
GRANT SELECT ON public.leaderboard TO anon, authenticated;
GRANT EXECUTE ON FUNCTION refresh_leaderboard() TO authenticated;