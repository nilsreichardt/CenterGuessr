import { Card, CardContent } from "@/components/ui/card";

interface ScoreCardProps {
  correct: number;
  total: number;
}

const ScoreCard = ({ correct, total }: ScoreCardProps) => {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Score</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">
            <span className="text-green-600">{correct}</span> / {total}
          </p>
          <p className="text-sm text-gray-500">
            {total > 0
              ? `${Math.round((correct / total) * 100)}% correct`
              : "Start guessing!"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
