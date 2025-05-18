
import { useState, useEffect } from "react";
import { alumni, classOptions } from "../data/alumni";
import { Alumnus } from "../data/types";
import AlumnusCard from "../components/AlumnusCard";
import ClassSelector from "../components/ClassSelector";
import ScoreCard from "../components/ScoreCard";
import FeedbackMessage from "../components/FeedbackMessage";
import ConfettiEffect from "../components/ConfettiEffect";
import GameHeader from "../components/GameHeader";
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

const Index = () => {
  const [gameAlumni, setGameAlumni] = useState<Alumnus[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);

  // Initialize game
  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    setGameAlumni(shuffleArray(alumni));
    setCurrentIndex(0);
    setCorrect(0);
    setTotal(0);
    setIsCorrect(null);
    setShowConfetti(false);
    setIsAnswerSubmitted(false);
  };

  const handleSubmitGuess = (selectedClass: string) => {
    const currentAlumnus = gameAlumni[currentIndex];
    const isGuessCorrect = selectedClass === currentAlumnus.classId;
    
    setIsCorrect(isGuessCorrect);
    setTotal(prev => prev + 1);
    
    if (isGuessCorrect) {
      setCorrect(prev => prev + 1);
      setShowConfetti(true);
    }
    
    setIsAnswerSubmitted(true);
  };

  const handleNextAlumnus = () => {
    if (currentIndex < gameAlumni.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsCorrect(null);
      setShowConfetti(false);
      setIsAnswerSubmitted(false);
    } else {
      // End of game
      startNewGame();
    }
  };

  const currentAlumnus = gameAlumni[currentIndex];
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <ConfettiEffect active={showConfetti} />
      
      <GameHeader onReset={startNewGame} />
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            {currentAlumnus && <AlumnusCard alumnus={currentAlumnus} />}
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
              <ScoreCard correct={correct} total={total} />
              
              <FeedbackMessage 
                isCorrect={isCorrect} 
                correctClass={currentAlumnus ? findClassLabel(currentAlumnus.classId, classOptions) : null} 
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
