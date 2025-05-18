
import { useState } from "react";
import { ClassOption } from "../data/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ClassSelectorProps {
  classOptions: ClassOption[];
  onSubmit: (selectedClass: string) => void;
}

const ClassSelector = ({ classOptions, onSubmit }: ClassSelectorProps) => {
  const [selectedClass, setSelectedClass] = useState<string>("");

  const handleSubmit = () => {
    if (selectedClass) {
      onSubmit(selectedClass);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Select value={selectedClass} onValueChange={setSelectedClass}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select class" />
        </SelectTrigger>
        <SelectContent>
          {classOptions.map((option) => (
            <SelectItem key={option.id} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button 
        onClick={handleSubmit}
        disabled={!selectedClass}
        className="bg-cdtm-blue hover:bg-cdtm-light"
      >
        Submit Guess
      </Button>
    </div>
  );
};

export default ClassSelector;
