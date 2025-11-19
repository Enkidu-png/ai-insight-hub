import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardBlockProps {
  title: string;
  cards: Flashcard[];
}

export const FlashcardBlock = ({ title, cards }: FlashcardBlockProps) => {
  const [flippedCards, setFlippedCards] = useState<boolean[]>(
    new Array(cards.length).fill(false)
  );

  const toggleCard = (index: number) => {
    const newFlipped = [...flippedCards];
    newFlipped[index] = !newFlipped[index];
    setFlippedCards(newFlipped);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-foreground">{title}</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <Card
            key={index}
            onClick={() => toggleCard(index)}
            className="glass-card p-6 cursor-pointer min-h-[200px] flex items-center justify-center text-center transition-all hover:scale-105"
          >
            <div className="space-y-4">
              <p className="text-lg font-semibold text-foreground">
                {flippedCards[index] ? card.back : card.front}
              </p>
              <p className="text-sm text-foreground/60">
                {flippedCards[index] ? "Kliknij aby wrócić" : "Kliknij aby odkryć"}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};