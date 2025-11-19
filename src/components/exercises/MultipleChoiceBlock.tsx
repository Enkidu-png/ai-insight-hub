import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MultipleChoiceBlockProps {
  question: string;
  options: Option[];
}

export const MultipleChoiceBlock = ({ question, options }: MultipleChoiceBlockProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = () => {
    if (selectedAnswer) {
      setShowResult(true);
    }
  };

  const isCorrect = options.find(opt => opt.id === selectedAnswer)?.isCorrect;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">{question}</h2>
      
      <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
        <div className="space-y-4">
          {options.map((option) => (
            <div
              key={option.id}
              className={`glass-card p-4 rounded-xl transition-all ${
                showResult
                  ? option.isCorrect
                    ? "border-2 border-green-500"
                    : selectedAnswer === option.id
                    ? "border-2 border-red-500"
                    : ""
                  : ""
              }`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem value={option.id} id={option.id} disabled={showResult} />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer text-foreground"
                >
                  {option.text}
                </Label>
                {showResult && option.isCorrect && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {showResult && !option.isCorrect && selectedAnswer === option.id && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>

      {!showResult && (
        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
        >
          Sprawdź odpowiedź
        </Button>
      )}

      {showResult && (
        <div
          className={`glass-card p-4 rounded-xl ${
            isCorrect ? "border-2 border-green-500" : "border-2 border-red-500"
          }`}
        >
          <p className="text-center font-semibold text-foreground">
            {isCorrect ? "Brawo! Poprawna odpowiedź!" : "Niestety, to nie jest poprawna odpowiedź."}
          </p>
        </div>
      )}
    </div>
  );
};