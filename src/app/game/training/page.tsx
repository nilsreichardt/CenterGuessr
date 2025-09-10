'use client'

import { useState, useEffect, Suspense } from "react";
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
import { Filter, ArrowLeft } from "lucide-react";
import CMSImage from "@/components/CmsImage";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import Header from "@/components/Header";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
      {/* Alumni Card Skeleton */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="w-full aspect-square bg-gray-800 animate-pulse" />
        <div className="p-6 text-center">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mx-auto mb-2" />
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mx-auto" />
        </div>
      </div>

      {/* Class Selection Skeleton */}
      <div className="space-y-4">
        <div className="w-full h-10 bg-gray-800 rounded animate-pulse" />
        <div className="w-full h-10 bg-gray-800 rounded animate-pulse" />
      </div>
    </div>
  );
}

function TrainingGameContent() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [currentAlumni, setCurrentAlumni] = useState<AlumniData | null>(null);
  const [nextAlumni, setNextAlumni] = useState<AlumniData | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
  }>({ show: false, correct: false });
  const [showConfetti, setShowConfetti] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [classFilters, setClassFilters] = useState<ClassFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, profile } = useAuth();

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
    classes.forEach((cls) => {
      newFilters[`${cls.season} ${cls.year}`] =
        cls.year >= currentYear - 5 && cls.location.city === "Munich";
    });
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
            seasons.indexOf(b.season || "") - seasons.indexOf(a.season || "")
          );
        });
        setClasses(sortedClasses);

        const initialFilters = parseFilterQueryParams(sortedClasses);
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
    if (hasAnySelected) {
      fetchRandomStudent();
    } else {
      setCurrentAlumni(null);
    }
  }, [JSON.stringify(classFilters)]);

  const handleSubmit = () => {
    if (!currentAlumni) return;

    const selectedClassStr = selectedClass;
    const actualClassStr = `${currentAlumni.class.season} ${currentAlumni.class.year}`;

    const isCorrect = selectedClassStr === actualClassStr;
    setFeedback({ show: true, correct: isCorrect });

    // Update stats
    setQuestionsAnswered(prev => prev + 1);
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowConfetti(true);
    }

    setCountdown(3);
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

    setCurrentAlumni(nextAlumni);
    setNextAlumni(null);
    setSelectedClass("");
    setFeedback({ show: false, correct: false });
    setShowConfetti(false);
    setImageError(false);
    setCountdown(null);

    fetchNextStudent();
  };

  const handleFilterChange = async (classStr: string, checked: boolean) => {
    const newFilters = {
      ...classFilters,
      [classStr]: checked,
    };
    setClassFilters(newFilters);
    setFilterLoading(true);

    if (!checked && selectedClass === classStr) {
      setSelectedClass("");
    }

    await fetchRandomStudent();
    setFilterLoading(false);
  };

  const handleSelectAll = async () => {
    const newFilters: ClassFilter = {};
    classes.forEach((cls) => {
      newFilters[`${cls.season} ${cls.year}`] = true;
    });
    setClassFilters(newFilters);
    setFilterLoading(true);
    await fetchRandomStudent();
    setFilterLoading(false);
  };

  const handleDeselectAll = async () => {
    const newFilters: ClassFilter = {};
    classes.forEach((cls) => {
      newFilters[`${cls.season} ${cls.year}`] = false;
    });
    setClassFilters(newFilters);
    setSelectedClass("");
    setFilterLoading(true);
    setFilterLoading(false);
  };

  const handleLastFiveYears = async () => {
    const newFilters = getLastFiveYearsFilter(classes);
    setClassFilters(newFilters);
    setShowFilters(false);
    setFilterLoading(true);
    await fetchRandomStudent();
    setFilterLoading(false);
  };

  const filteredClasses = classes.filter(
    (cls) => classFilters[`${cls.season} ${cls.year}`],
  );

  if (loading || (!currentAlumni && Object.values(classFilters).some(Boolean))) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
        <LoadingState />
      </main>
    );
  }

  if (!currentAlumni && !filterLoading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <Header />
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

            <div className="flex items-center justify-between mb-4 gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold">Training Mode</h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-900 hover:bg-gray-800 ml-2"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-4 w-full max-w-xs sm:max-w-full mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Class Filters</h2>
                  <div className="flex flex-wrap gap-2 sm:space-x-2 sm:flex-nowrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      Deselect All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLastFiveYears}
                      className="bg-gray-800 hover:bg-gray-700"
                    >
                      Last 5 Years
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
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
            )}

            <div className="bg-gray-900 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No Students Available</h2>
              <p className="text-gray-400 mb-6">
                Please select at least one class from the filter menu to start
                training.
              </p>
              <Button
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="bg-gray-800 hover:bg-gray-700"
              >
                Open Filters
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Header />
      <ConfettiEffect active={showConfetti} />
      
      <div className="flex flex-col items-center justify-center p-4">
        <div className="max-w-xl w-full space-y-8">
          {/* Header with back button and stats */}
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
              <div className="text-sm text-gray-400">
                Training Mode
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-900 hover:bg-gray-800"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Stats Display */}
          {questionsAnswered > 0 && (
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="flex justify-center space-x-6 text-sm">
                <div>
                  <span className="text-gray-400">Correct: </span>
                  <span className="text-green-400 font-bold">{correctAnswers}</span>
                </div>
                <div>
                  <span className="text-gray-400">Total: </span>
                  <span className="text-blue-400 font-bold">{questionsAnswered}</span>
                </div>
                <div>
                  <span className="text-gray-400">Rate: </span>
                  <span className="text-yellow-400 font-bold">
                    {Math.round((correctAnswers / questionsAnswered) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Filters Dropdown */}
          {showFilters && (
            <div className="bg-gray-900 rounded-lg p-4 sm:p-6 space-y-4 w-full max-w-xs sm:max-w-full mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Class Filters</h2>
                <div className="flex flex-wrap gap-2 sm:space-x-2 sm:flex-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    className="bg-gray-800 hover:bg-gray-700"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    className="bg-gray-800 hover:bg-gray-700"
                  >
                    Deselect All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLastFiveYears}
                    className="bg-gray-800 hover:bg-gray-700"
                  >
                    Last 5 Years
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
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
                      <span className="text-gray-400">({cls.location.city})</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            <Select
              value={selectedClass}
              onValueChange={setSelectedClass}
              disabled={feedback.show}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {filteredClasses.map((cls) => (
                  <SelectItem key={cls.id} value={`${cls.season} ${cls.year}`}>
                    <span className="inline-block w-16 text-left">
                      {cls.season}
                    </span>
                    <span className="font-mono">{cls.year}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {feedback.show ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-lg text-center ${
                    feedback.correct
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-600/30 text-red-400 border border-red-500"
                  }`}
                >
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
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedClass}
              >
                Submit
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function TrainingModePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingState />}>
        <TrainingGameContent />
      </Suspense>
    </ProtectedRoute>
  );
}