import { Button } from "@/components/ui/button";

interface GameHeaderProps {
  onReset: () => void;
}

const GameHeader = ({ onReset }: GameHeaderProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-cdtm-blue">
          CenterlingGuessr
        </h1>
        <Button variant="outline" onClick={onReset}>
          New Game
        </Button>
      </div>
      <p className="text-lg text-gray-600 mt-2">
        Guess which class each alumnus belongs to!
      </p>
    </div>
  );
};

export default GameHeader;
