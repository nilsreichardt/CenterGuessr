import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";

interface NextButtonProps {
  onClick: () => void;
  isAnswerSubmitted: boolean;
  disabled?: boolean;
}

const NextButton = ({ onClick, isAnswerSubmitted, disabled }: NextButtonProps) => {
  if (!isAnswerSubmitted) return null;
  
  return (
    <Button 
      onClick={onClick}
      className="bg-cdtm-blue hover:bg-cdtm-light mt-4" 
      size="lg"
      disabled={disabled}
    >
      {disabled ? (
        <>
          Loading next image... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </>
      ) : (
        <>
          Next Alumnus <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};

export default NextButton;
