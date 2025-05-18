import { useState, useEffect } from "react";
import { alumni, classOptions } from "../data/alumni";
import { Alumnus } from "../data/types";
import AlumnusCard from "../components/AlumnusCard";
import ClassSelector from "../components/ClassSelector";
import FeedbackMessage from "../components/FeedbackMessage";
import ConfettiEffect from "../components/ConfettiEffect";
import NextButton from "../components/NextButton";
import { findClassLabel } from "../utils/helpers";

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

const Index = () => {
  const [gameAlumni, setGameAlumni] = useState<Alumnus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nextImageLoaded, setNextImageLoaded] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  // Preload next image
  useEffect(() => {
    if (currentIndex < gameAlumni.length - 1) {
      const nextAlumnus = gameAlumni[currentIndex + 1];
      console.log("Starting to preload next image:", nextAlumnus.imageUrl);
      setNextImageLoaded(false);
      preloadImage(nextAlumnus.imageUrl)
        .then(() => {
          console.log("Next image loaded successfully");
          setNextImageLoaded(true);
        })
        .catch((error) => {
          console.error("Failed to preload next image:", error);
          setNextImageLoaded(true); // Continue even if preload fails
        });
    }
  }, [currentIndex, gameAlumni]);

  const startNewGame = () => {
    setGameAlumni(shuffleArray(alumni));
    setCurrentIndex(0);
    setCorrect(0);
    setTotal(0);
    setIsCorrect(null);
    setShowConfetti(false);
    setIsAnswerSubmitted(false);
    setNextImageLoaded(false);
  };

  const handleSubmitGuess = (selectedClass: string) => {
    const currentAlumnus = gameAlumni[currentIndex];
    const isGuessCorrect = selectedClass === currentAlumnus.classId;

    setIsCorrect(isGuessCorrect);
    setTotal((prev) => prev + 1);

    if (isGuessCorrect) {
      setCorrect((prev) => prev + 1);
      setShowConfetti(true);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextAlumnus = () => {
    if (currentIndex < gameAlumni.length - 1) {
      console.log("Next button clicked, nextImageLoaded:", nextImageLoaded);
      setIsLoading(true);
      // Only proceed if the next image is loaded
      if (nextImageLoaded) {
        console.log("Proceeding to next alumnus");
        setCurrentIndex((prev) => prev + 1);
        setIsCorrect(null);
        setShowConfetti(false);
        setIsAnswerSubmitted(false);
        setIsLoading(false);
      } else {
        console.log("Next image not loaded yet, waiting...");
      }
    } else {
      // End of game
      startNewGame();
    }
  };

  const currentAlumnus = gameAlumni[currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <ConfettiEffect active={showConfetti} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-cdtm-blue text-center mb-8">
          CenterlingGuessr
        </h1>

        <div className="flex flex-col items-center">
          {currentAlumnus && (
            <div className="max-w-md w-full mb-8">
              <AlumnusCard alumnus={currentAlumnus} isLoading={isLoading} />
            </div>
          )}

          <div className="w-full max-w-md space-y-6">
            <FeedbackMessage
              isCorrect={isCorrect}
              correctClass={
                currentAlumnus
                  ? findClassLabel(currentAlumnus.classId, classOptions)
                  : null
              }
            />

            {!isAnswerSubmitted ? (
              <ClassSelector
                classOptions={classOptions}
                onSubmit={handleSubmitGuess}
              />
            ) : (
              <NextButton
                onClick={handleNextAlumnus}
                isAnswerSubmitted={isAnswerSubmitted}
                disabled={!nextImageLoaded}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
