
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface NextButtonProps {
  onClick: () => void;
  isAnswerSubmitted: boolean;
}

const NextButton = ({ onClick, isAnswerSubmitted }: NextButtonProps) => {
  if (!isAnswerSubmitted) return null;
  
  return (
    <Button 
      onClick={onClick}
      className="bg-cdtm-blue hover:bg-cdtm-light mt-4" 
      size="lg"
    >
      Next Alumnus <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
};

export default NextButton;
