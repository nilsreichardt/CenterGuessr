import { useEffect, useState } from "react";
import ReactConfetti from "react-confetti";

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
}

const ConfettiEffect = ({ active, duration = 3000 }: ConfettiEffectProps) => {
  const [isActive, setIsActive] = useState(active);
  const [windowDimension, setWindowDimension] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // Set initial dimensions after mount
    setWindowDimension({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setIsActive(active);

    if (active) {
      const timer = setTimeout(() => {
        setIsActive(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isActive || windowDimension.width === 0) return null;

  return (
    <ReactConfetti
      width={windowDimension.width}
      height={windowDimension.height}
      recycle={false}
      numberOfPieces={500}
      gravity={0.2}
      colors={[
        "#1E3A8A",
        "#3B82F6",
        "#60A5FA",
        "#93C5FD",
        "#F472B6",
        "#FB7185",
        "#FCD34D",
      ]}
    />
  );
};

export default ConfettiEffect;
