
import { Alumnus } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";

interface AlumnusCardProps {
  alumnus: Alumnus;
}

const AlumnusCard = ({ alumnus }: AlumnusCardProps) => {
  return (
    <Card className="overflow-hidden shadow-lg w-full max-w-md animate-scale-in">
      <div className="relative aspect-square w-full">
        <img
          src={alumnus.imageUrl}
          alt={alumnus.name}
          className="object-cover w-full h-full"
        />
      </div>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold text-cdtm-blue">{alumnus.name}</h2>
        <p className="text-gray-600">{alumnus.major}</p>
      </CardContent>
    </Card>
  );
};

export default AlumnusCard;
