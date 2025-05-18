import { Alumnus } from "../data/types";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface AlumnusCardProps {
  alumnus: Alumnus;
  isLoading: boolean;
}

const AlumnusCard = ({ alumnus, isLoading }: AlumnusCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset image loaded state when alumnus changes
  useEffect(() => {
    setImageLoaded(false);
  }, [alumnus.id]);

  return (
    <Card className="overflow-hidden shadow-lg w-full max-w-md animate-scale-in">
      <div className="relative aspect-square w-full bg-gray-100">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse bg-gray-200 w-full h-full" />
              </div>
            )}
            <img
              src={alumnus.imageUrl}
              alt={alumnus.name}
              className={`object-cover w-full h-full ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          </>
        )}
      </div>
      {!isLoading && imageLoaded && (
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-cdtm-blue">{alumnus.name}</h2>
          <p className="text-gray-600">{alumnus.major}</p>
        </CardContent>
      )}
    </Card>
  );
};

export default AlumnusCard;
