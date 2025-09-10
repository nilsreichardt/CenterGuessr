'use client'

import { useState, useEffect, Suspense } from "react";
import { supabase } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Class, Student } from "@/cms/schema";
import ConfettiEffect from "@/components/ConfettiEffect";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Filter, ArrowLeft, Trophy, Zap, Target } from "lucide-react";
import CMSImage from "@/components/CmsImage";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import Header from "@/components/Header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GameSession, GameAnswer } from "@/lib/types/database";
import PointsAnimation from "@/components/PointsAnimation";

interface AlumniData {
  student: Student;
  class: Class;
}

interface ClassFilter {
  [key: string]: boolean;
}

function LoadingState() {
  return (
    <div className="max-w-xl w-full space-y-8">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="w-full aspect-square bg-gray-800 animate-pulse" />
        <div className="p-6 text-center">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mx-auto mb-2" />
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mx-auto" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-full h-10 bg-gray-800 rounded animate-pulse" />
        <div className="w-full h-10 bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

function RankedGameContent() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [currentAlumni, setCurrentAlumni] = useState<AlumniData | null>(null);
  const [nextAlumni, setNextAlumni] = useState<AlumniData | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    pointsAwarded: number;
    streakBonus: boolean;
  }>({ show: false, correct: false, pointsAwarded: 0, streakBonus: false });
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [classFilters, setClassFilters] = useState<ClassFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [sessionPoints, setSessionPoints] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();

  const selectedClassCount = Object.values(classFilters).filter(Boolean).length;
  const canPlayRanked = selectedClassCount >= 6;

  const preloadImage = async (url: string): Promise<void> => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch image");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(undefined);
        };
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to load image"));
        };
        img.src = objectUrl;
      });
    } catch (error) {
      throw new Error("Failed to preload image: " + error);
    }
  };

  const startGameSession = async () => {
    try {
      // Get current session and access token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No active session. Please sign in again.')
      }

      const response = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          mode: 'ranked',
          classFilters
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start game session');
      }

      setGameSession(data.session);
    } catch (error) {
      console.error('Error starting game session:', error);
      alert('Failed to start ranked game. Please try again.');
    }
  };

  const submitAnswer = async (answer: string, responseTime: number) => {
    if (!gameSession || !currentAlumni) return;

    setIsSubmitting(true);

    try {
      // Get current session and access token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No active session. Please sign in again.')
      }

      console.log('Submitting answer with data:', {
        sessionId: gameSession.id,
        studentId: currentAlumni.student.id,
        studentName: currentAlumni.student.person.name,
        correctClass: `${currentAlumni.class.season} ${currentAlumni.class.year}`,
        userAnswer: answer,
        responseTime
      });

      const response = await fetch('/api/game/answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          sessionId: gameSession.id,
          studentId: currentAlumni.student.id,
          studentName: currentAlumni.student.person.name,
          correctClass: `${currentAlumni.class.season} ${currentAlumni.class.year}`,
          userAnswer: answer,
          responseTime
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      // Update local state with server response
      setFeedback({
        show: true,
        correct: data.isCorrect,
        pointsAwarded: data.pointsAwarded,
        streakBonus: data.streakBonus
      });

      setSessionPoints(data.totalPoints);
      setCurrentStreak(data.streakCount);
      setQuestionsAnswered(prev => prev + 1);
      if (data.isCorrect) {
        setCorrectAnswers(prev => prev + 1);
        setShowConfetti(true);
      }

      // Show points animation if points were awarded
      if (data.pointsAwarded > 0) {
        setShowPointsAnimation(true);
      }

      setCountdown(3);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeGameSession = async () => {
    if (!gameSession) return;

    try {
      // Get current session and access token
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No active session. Please sign in again.')
      }

      const response = await fetch('/api/game/complete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        credentials: 'same-origin',
        body: JSON.stringify({ sessionId: gameSession.id })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete game session');
      }

      // Show completion screen or redirect
      router.push('/game?completed=true');
    } catch (error) {
      console.error('Error completing game session:', error);
      alert('Failed to complete game session. Please try again.');
    }
  };

  const fetchNextStudent = async () => {
    try {
      const nextResponse = await fetch(
        `/api/random-student?filters=${JSON.stringify(classFilters)}`,
      );
      const nextData = await nextResponse.json();
      if (nextResponse.ok) {
        setNextAlumni(nextData);
        setNextImageLoaded(false);

        if (nextData.student.image && nextData.student.image.url) {
          try {
            await preloadImage(nextData.student.image.url);
            setNextImageLoaded(true);
          } catch (error) {
            console.error("Failed to preload next image:", error);
            setNextImageLoaded(true);
          }
        } else {
          setNextImageLoaded(true);
        }
      }
    } catch (error) {
      console.error("Error fetching next student:", error);
      setNextAlumni(null);
    }
  };

  const fetchRandomStudent = async () => {
    try {
      const response = await fetch(
        `/api/random-student?filters=${JSON.stringify(classFilters)}`,
      );
      const data = await response.json();
      if (response.ok) {
        setCurrentAlumni(data);
        setImageError(false);
        setStartTime(new Date());
        await fetchNextStudent();
      } else {
        console.error("Error fetching student:", data.error);
        setCurrentAlumni(null);
        setNextAlumni(null);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setCurrentAlumni(null);
      setNextAlumni(null);
    }
  };

  const getLastFiveYearsFilter = (classes: Class[]): ClassFilter => {
    const currentYear = new Date().getFullYear();
    const newFilters: ClassFilter = {};
    console.log('getLastFiveYearsFilter called with classes:', classes);
    classes.forEach((cls) => {
      const key = `${cls.season} ${cls.year}`;
      const isRecent = cls.year >= currentYear - 5;
      const isMunich = cls.location?.city === "Munich";
      newFilters[key] = isRecent && isMunich;
      console.log(`Class ${key}: year=${cls.year}, recent=${isRecent}, location=${cls.location?.city}, selected=${newFilters[key]}`);
    });
    console.log('Final filters:', newFilters);
    return newFilters;
  };

  const parseFilterQueryParams = (classes: Class[]): ClassFilter => {
    const filterParam = searchParams?.get("filters");
    const lastFiveYears = searchParams?.get("lastFiveYears") === "true";

    if (lastFiveYears) {
      return getLastFiveYearsFilter(classes);
    }

    if (!filterParam) {
      return getLastFiveYearsFilter(classes);
    }

    try {
      const parsedFilters = JSON.parse(decodeURIComponent(filterParam));
      const validFilters: ClassFilter = {};
      classes.forEach((cls) => {
        const key = `${cls.season} ${cls.year}`;
        validFilters[key] =
          typeof parsedFilters[key] === "boolean" ? parsedFilters[key] : false;
      });
      return validFilters;
    } catch (error) {
      console.error("Error parsing filter query parameters:", error);
      return getLastFiveYearsFilter(classes);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/classes");
        const data = await response.json();
        const sortedClasses = data.sort((a: Class, b: Class) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          const seasons = ["Spring", "Summer", "Fall", "Winter"];
          return (
            seasons.indexOf(b.season || "") - seasons.indexOf(b.season || "")
          );
        });
        setClasses(sortedClasses);

        const initialFilters = parseFilterQueryParams(sortedClasses);
        console.log('Setting initial classFilters:', initialFilters);
        setClassFilters(initialFilters);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  useEffect(() => {
    const hasAnySelected = Object.values(classFilters).some(Boolean);
    if (hasAnySelected && canPlayRanked && !gameSession) {
      startGameSession();
    }
  }, [JSON.stringify(classFilters), canPlayRanked]);

  useEffect(() => {
    if (gameSession && !currentAlumni && canPlayRanked) {
      fetchRandomStudent();
    }
  }, [gameSession, canPlayRanked]);

  // Debug effect to monitor selectedClass changes
  useEffect(() => {
    console.log('selectedClass changed:', selectedClass);
    console.log('selectedClass type:', typeof selectedClass);
    console.log('selectedClass length:', selectedClass?.length);
  }, [selectedClass]);

  const handleSubmit = () => {
    if (!currentAlumni || !startTime || isSubmitting) return;

    console.log('Submitting answer:', { selectedClass, currentAlumni: currentAlumni?.student.person.name });
    const responseTime = new Date().getTime() - startTime.getTime();
    submitAnswer(selectedClass, responseTime);
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      handleNext();
      setCountdown(null);
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const handleNext = () => {
    if (!nextImageLoaded || !nextAlumni) {
      return;
    }

    console.log('Moving to next student, resetting selectedClass');
    console.log('Before reset - selectedClass:', selectedClass);
    setCurrentAlumni(nextAlumni);
    setNextAlumni(null);
    setSelectedClass("");
    console.log('After reset - selectedClass should be empty');
    setFeedback({ show: false, correct: false, pointsAwarded: 0, streakBonus: false });
    setShowConfetti(false);
    setImageError(false);
    setCountdown(null);
    setShowPointsAnimation(false);
    setStartTime(new Date());

    fetchNextStudent();
  };

  const handleEndGame = () => {
    completeGameSession();
  };

  const handleFilterChange = async (classStr: string, checked: boolean) => {
    const newFilters = {
      ...classFilters,
      [classStr]: checked,
    };
    setClassFilters(newFilters);

    if (!checked && selectedClass === classStr) {
      setSelectedClass("");
    }
  };

  const filteredClasses = classes.filter(
    (cls) => classFilters[`${cls.season} ${cls.year}`],
  );

  // Debug logging
  console.log('Debug state:', {
    classes: classes.length,
    classFilters,
    filteredClasses: filteredClasses.length,
    selectedClass,
    canPlayRanked,
    gameSession: !!gameSession,
    gameSessionDetails: gameSession ? {
      id: gameSession.id,
      mode: gameSession.mode,
      status: gameSession.status,
      userId: gameSession.user_id
    } : null
  });
  
  // Log available classes for selection
  if (filteredClasses.length > 0) {
    console.log('Available classes for selection:', filteredClasses.map(cls => `${cls.season} ${cls.year}`));
  } else {
    console.log('No filtered classes available');
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <LoadingState />
      </main>
    );
  }

  if (!canPlayRanked) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header showPoints={true} points={profile?.total_points || 0} />
        <div className="flex flex-col items-center justify-center p-8">
          <div className="max-w-xl w-full space-y-8">
            <div className="flex items-center space-x-4 mb-6">
              <Button
                variant="ghost"
                onClick={() => router.push('/game')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Game Selection
              </Button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Ranked Mode</h1>
              <Alert className="border-orange-500 bg-orange-500/10 mb-6">
                <AlertDescription className="text-orange-200">
                  You need to select at least 6 classes to play ranked mode. Currently selected: {selectedClassCount}
                </AlertDescription>
              </Alert>
            </div>

            {/* Class Filters */}
            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-4">
              <h2 className="text-xl font-semibold">Select Classes</h2>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`class-${cls.id}`}
                      checked={classFilters[`${cls.season} ${cls.year}`]}
                      onCheckedChange={(checked) =>
                        handleFilterChange(
                          `${cls.season} ${cls.year}`,
                          checked as boolean,
                        )
                      }
                    />
                    <Label
                      htmlFor={`class-${cls.id}`}
                      className="flex items-center space-x-2"
                    >
                      <span className="inline-block w-16 text-left">
                        {cls.season}
                      </span>
                      <span className="font-mono">{cls.year}</span>
                      <span className="text-gray-400">
                        ({cls.location.city})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!currentAlumni || !gameSession) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <LoadingState />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header 
        showPoints={true} 
        points={(profile?.total_points || 0) + sessionPoints}
        onLeaderboardClick={() => router.push('/leaderboard')}
      />
      <ConfettiEffect active={showConfetti} />
      <PointsAnimation
        points={feedback.pointsAwarded}
        streakBonus={feedback.streakBonus}
        show={showPointsAnimation}
        onComplete={() => setShowPointsAnimation(false)}
      />
      
      <div className="flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full space-y-6">
          {/* Header with back button and game info */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/game')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEndGame}
                className="bg-red-600 hover:bg-red-700 border-red-500"
              >
                End Game
              </Button>
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-600/20 rounded-lg p-4 text-center border border-yellow-600/50">
              <div className="flex items-center justify-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-400" />
                <span className="text-2xl font-bold text-yellow-400">
                  {sessionPoints}
                </span>
              </div>
              <p className="text-xs text-yellow-300 mt-1">Session Points</p>
            </div>
            
            <div className="bg-blue-600/20 rounded-lg p-4 text-center border border-blue-600/50">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="h-5 w-5 text-blue-400" />
                <span className="text-2xl font-bold text-blue-400">
                  {currentStreak}
                </span>
              </div>
              <p className="text-xs text-blue-300 mt-1">Current Streak</p>
            </div>
            
            <div className="bg-green-600/20 rounded-lg p-4 text-center border border-green-600/50">
              <div className="flex items-center justify-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-2xl font-bold text-green-400">
                  {questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-green-300 mt-1">Accuracy</p>
            </div>
          </div>

          {/* Alumni Card */}
          <div className="bg-gray-900 rounded-lg overflow-hidden relative">
            {currentAlumni?.student.image && !imageError ? (
              <CMSImage
                image={currentAlumni?.student.image}
                alt={currentAlumni?.student.person.name}
                className="w-full aspect-square object-cover relative z-10 max-h-[60vh]"
              />
            ) : (
              <div className="w-full aspect-square bg-gradient-to-r from-[#f9a8d4] to-[#c4b5fd] flex items-center justify-center relative z-10 max-h-[60vh]">
                <span className="text-gray-700 font-semibold">
                  No image available
                </span>
              </div>
            )}

            {nextAlumni?.student.image && (
              <CMSImage
                image={nextAlumni.student.image}
                alt={nextAlumni.student.person.name}
                className="w-full aspect-square object-cover absolute top-0 left-0 opacity-0"
              />
            )}

            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold mb-2">
                {currentAlumni?.student.person.name}
              </h2>
              <p className="text-gray-400">{currentAlumni?.student.major}</p>
            </div>
          </div>

          {/* Class Selection */}
          <div className="space-y-4">
            {/* Debug info */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 p-2 bg-gray-800 rounded space-y-2">
                <div>Debug: selectedClass = "{selectedClass}" | isSubmitting = {isSubmitting.toString()}</div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setSelectedClass("Spring 2024")}
                    className="px-2 py-1 bg-blue-600 rounded text-xs"
                  >
                    Set Spring 2024
                  </button>
                  <button 
                    onClick={() => setSelectedClass("")}
                    className="px-2 py-1 bg-red-600 rounded text-xs"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            
            <Select
              key={`select-${currentAlumni?.student.id}-${feedback.show}`}
              value={selectedClass}
              onValueChange={(value) => {
                console.log('Class selected:', value);
                console.log('Previous selectedClass:', selectedClass);
                setSelectedClass(value);
                console.log('Setting selectedClass to:', value);
              }}
              disabled={feedback.show || isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class">
                  {selectedClass || "Select class"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredClasses.length === 0 ? (
                  <SelectItem value="" disabled>
                    No classes available
                  </SelectItem>
                ) : (
                  filteredClasses.map((cls) => {
                    const classValue = `${cls.season} ${cls.year}`;
                    console.log('Rendering SelectItem:', { id: cls.id, value: classValue });
                    return (
                      <SelectItem key={cls.id} value={classValue}>
                        <span className="inline-block w-16 text-left">
                          {cls.season}
                        </span>
                        <span className="font-mono">{cls.year}</span>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>

            {feedback.show ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg text-center ${
                    feedback.correct
                      ? "bg-green-500/20 text-green-400 border border-green-500"
                      : "bg-red-600/30 text-red-400 border border-red-500"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {feedback.correct ? (
                      <>
                        <Trophy className="h-5 w-5" />
                        <span className="font-bold">
                          +{feedback.pointsAwarded} point{feedback.pointsAwarded !== 1 ? 's' : ''}!
                        </span>
                      </>
                    ) : (
                      <span className="font-bold">No points</span>
                    )}
                    {feedback.streakBonus && (
                      <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
                        STREAK BONUS!
                      </span>
                    )}
                  </div>
                  
                  {feedback.correct ? "Correct!" : "Incorrect!"}
                  <div className="text-sm mt-1">
                    {currentAlumni?.student.person.name} was in{" "}
                    <strong>
                      {currentAlumni?.class.season} {currentAlumni?.class.year}
                    </strong>
                  </div>
                </div>
                <Button
                  onClick={handleNext}
                  className="w-full bg-blue-600 hover:bg-blue-700 relative"
                  disabled={!nextImageLoaded}
                >
                  {nextImageLoaded ? "Next Student" : "Loading next image..."}
                  {countdown !== null && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm">
                      {countdown}s
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSubmit}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={!selectedClass || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
                {!selectedClass && <span className="ml-2 text-xs">(No class selected)</span>}
                {selectedClass && <span className="ml-2 text-xs">(Class: {selectedClass})</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function RankedModePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingState />}>
        <RankedGameContent />
      </Suspense>
    </ProtectedRoute>
  );
}