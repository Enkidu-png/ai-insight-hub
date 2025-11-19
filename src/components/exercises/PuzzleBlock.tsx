import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface PuzzlePair {
  left: string;
  right: string;
}

interface PuzzleBlockProps {
  title: string;
  pairs: PuzzlePair[];
}

export const PuzzleBlock = ({ title, pairs }: PuzzleBlockProps) => {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [matches, setMatches] = useState<number[]>([]);

  const shuffledRight = [...pairs].sort(() => Math.random() - 0.5);

  const handleLeftClick = (index: number) => {
    if (matches.includes(index)) return;
    setSelectedLeft(index);
    if (selectedRight !== null) {
      checkMatch(index, selectedRight);
    }
  };

  const handleRightClick = (index: number) => {
    const originalIndex = pairs.findIndex(p => p.right === shuffledRight[index].right);
    if (matches.includes(originalIndex)) return;
    setSelectedRight(originalIndex);
    if (selectedLeft !== null) {
      checkMatch(selectedLeft, originalIndex);
    }
  };

  const checkMatch = (leftIdx: number, rightIdx: number) => {
    if (leftIdx === rightIdx) {
      setMatches([...matches, leftIdx]);
    }
    setTimeout(() => {
      setSelectedLeft(null);
      setSelectedRight(null);
    }, 500);
  };

  const allMatched = matches.length === pairs.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-3">
          {pairs.map((pair, index) => (
            <Button
              key={index}
              onClick={() => handleLeftClick(index)}
              variant={matches.includes(index) ? "default" : selectedLeft === index ? "secondary" : "outline"}
              className="w-full justify-start text-left h-auto py-4"
              disabled={matches.includes(index)}
            >
              {matches.includes(index) && (
                <CheckCircle2 className="mr-2 h-5 w-5" />
              )}
              {pair.left}
            </Button>
          ))}
        </div>

        {/* Right column */}
        <div className="space-y-3">
          {shuffledRight.map((pair, index) => {
            const originalIndex = pairs.findIndex(p => p.right === pair.right);
            return (
              <Button
                key={index}
                onClick={() => handleRightClick(index)}
                variant={matches.includes(originalIndex) ? "default" : selectedRight === originalIndex ? "secondary" : "outline"}
                className="w-full justify-start text-left h-auto py-4"
                disabled={matches.includes(originalIndex)}
              >
                {matches.includes(originalIndex) && (
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                )}
                {pair.right}
              </Button>
            );
          })}
        </div>
      </div>

      {allMatched && (
        <div className="glass-card p-4 rounded-xl border-2 border-green-500">
          <p className="text-center font-semibold text-foreground">
            Świetnie! Wszystkie pary zostały dopasowane!
          </p>
        </div>
      )}
    </div>
  );
};