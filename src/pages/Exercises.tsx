import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { FlashcardBlock } from "@/components/exercises/FlashcardBlock";
import { MultipleChoiceBlock } from "@/components/exercises/MultipleChoiceBlock";
import { TextImageBlock } from "@/components/exercises/TextImageBlock";
import { PuzzleBlock } from "@/components/exercises/PuzzleBlock";
import { GraphBlock } from "@/components/exercises/GraphBlock";

const Exercises = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = 7;
  const progress = ((currentPage + 1) / totalPages) * 100;

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      navigate("/feedback");
    }
  };

  const goBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-foreground/60 mt-2 text-center">
            Sekcja {currentPage + 1} z {totalPages}
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in">
          {/* Page 0: Sekcja 1 - Wstęp + Fiszki */}
          {currentPage === 0 && (
            <div className="space-y-8">
              <TextImageBlock
                title="Czym jest sztuczna inteligencja w uproszczeniu?"
                content="Wyobraź sobie AI jako 'turbo-autouzupełnianie'. Model nie szuka prawdy w internecie w czasie rzeczywistym, lecz zgaduje kolejne słowo na bazie poprzednich. To właśnie ta cecha sprawia, że potrafi on 'zmyślać', co fachowo nazywamy halucynacjami."
              />
              
              <FlashcardBlock
                title="Podstawowe pojęcia"
                cards={[
                  {
                    front: "Czym jest Halucynacja AI?",
                    back: "To moment, w którym sztuczna inteligencja zaczyna zmyślać fakty i traci wątek, ponieważ brakuje jej kontekstu, a jedynie przewiduje kolejne słowa."
                  },
                  {
                    front: "Czym są Tokeny?",
                    back: "To 'paliwo i pamięć' modelu. Są to małe fragmenty tekstu (części słów, spacje), z których AI składa wypowiedzi. Np. słowo 'szukam' może składać się z tokenów 'szuk' i 'am'."
                  },
                  {
                    front: "Okno kontekstu",
                    back: "To limit pamięci roboczej modelu. Jeśli rozmowa jest zbyt długa, najstarsze tokeny 'wypadają' z pamięci i model zapomina początek konwersacji."
                  }
                ]}
              />
            </div>
          )}

          {/* Page 1: Quiz o tokenach */}
          {currentPage === 1 && (
            <MultipleChoiceBlock
              question="Co wpływa na koszt i czas generowania odpowiedzi przez AI?"
              options={[
                { id: "a", text: "Pora dnia", isCorrect: false },
                { id: "b", text: "Liczba użytych tokenów (długość pytania i odpowiedzi)", isCorrect: true },
                { id: "c", text: "Szybkość pisania na klawiaturze", isCorrect: false },
                { id: "d", text: "Wybrany język (tylko angielski jest darmowy)", isCorrect: false }
              ]}
            />
          )}

          {/* Page 2: Graph R-T-K-O-F-E-P + Puzzle */}
          {currentPage === 2 && (
            <div className="space-y-8">
              <GraphBlock
                title="Idealny Prompt - Rama R-T-K-O-F-E-P"
                nodes={[
                  { id: "r", label: "R - Rola", description: "Nadanie AI osobowości (np. 'Jesteś specjalistą ds. sprzedaży'). Zwiększa szansę na wyspecjalizowane odpowiedzi." },
                  { id: "t", label: "T - Task", description: "Konkretna informacja, co ma zostać wykonane (np. 'Napisz ofertę')." },
                  { id: "k", label: "K - Kontekst", description: "Tło sytuacji (np. 'Klient to firma B2B, zależy im na oszczędności')." },
                  { id: "o", label: "O - Ograniczenia", description: "Czego unikać (np. 'Nie zmyślaj ROI, nie używaj żargonu')." },
                  { id: "f", label: "F - Format", description: "Forma odpowiedzi (np. lista punktowana, tabela, brak kwot)." },
                  { id: "e", label: "E - Ewaluacja", description: "Kryteria sukcesu (np. 'Oferta jest dobra, jeśli jest zwięzła')." },
                  { id: "p", label: "P - Przykłady", description: "Dostarczenie wzoru (np. zanonimizowana poprzednia oferta)." }
                ]}
              />

              <PuzzleBlock
                title="Dopasuj element promptu do definicji"
                pairs={[
                  { left: "Rola", right: "Jesteś specjalistą ds. sprzedaży w branży IT" },
                  { left: "Ograniczenia", right: "Nie twórz fałszywych obietnic ani nierealnych ROI" },
                  { left: "Format", right: "Odpowiedź ma zawierać wstęp, korzyści i CTA" }
                ]}
              />
            </div>
          )}

          {/* Page 3: Przykład + Fiszki zaawansowane */}
          {currentPage === 3 && (
            <div className="space-y-8">
              <TextImageBlock
                title="Zastosowanie w praktyce – Oferta Handlowa"
                content="Zamiast pisać 'Napisz ofertę', stosujemy pełną strukturę. Definiujemy rolę sprzedawcy, zadanie napisania tekstu do 700 słów, podajemy kontekst klienta B2B oraz ograniczenie: 'jeśli nie masz wiedzy, pomiń zamiast zgadywać'. Taki format drastycznie podnosi jakość wyniku."
              />

              <FlashcardBlock
                title="Rodzaje technik"
                cards={[
                  {
                    front: "Zero-shot Prompting",
                    back: "Najprostsze pytanie bez podawania przykładów czy instrukcji krokowej. Np. 'Jak poprawić efektywność?'. Często mało trafne."
                  },
                  {
                    front: "Chain of Thought (CoT)",
                    back: "Technika 'myśl krok po kroku'. Zmusza AI do logicznego rozbicia zadania na etapy (1 → 2 → 3), co zwiększa spójność odpowiedzi."
                  },
                  {
                    front: "Tree of Thoughts (ToT)",
                    back: "Najbardziej zaawansowana technika. Polega na rozważeniu wielu wariantów ('mam 3 opcje') i wyborze najlepszej ścieżki rozwiązania."
                  }
                ]}
              />
            </div>
          )}

          {/* Page 4: Quiz CoT + Puzzle technik */}
          {currentPage === 4 && (
            <div className="space-y-8">
              <MultipleChoiceBlock
                question="Jaka jest główna 'wada' stosowania zaawansowanych technik typu Chain of Thought czy Tree of Thoughts?"
                options={[
                  { id: "a", text: "Są zbyt trudne do napisania dla laika", isCorrect: false },
                  { id: "b", text: "Są bardziej 'kosztowne' (zużywają więcej tokenów), bo model musi 'myśleć na głos'", isCorrect: true },
                  { id: "c", text: "Zawsze prowadzą do halucynacji", isCorrect: false }
                ]}
              />

              <PuzzleBlock
                title="Porównanie technik"
                pairs={[
                  { left: "Zero-shot", right: "Napisz e-mail do klienta" },
                  { left: "Chain of Thought", right: "Pomyśl krok po kroku: zidentyfikuj problem, potem znajdź rozwiązanie" },
                  { left: "Tree of Thoughts", right: "Przeanalizuj trzy różne warianty rozwiązania i wybierz najlepszy" }
                ]}
              />
            </div>
          )}

          {/* Page 5: Custom GPTs + Graph bezpieczeństwa */}
          {currentPage === 5 && (
            <div className="space-y-8">
              <TextImageBlock
                title="Czym jest System Prompt?"
                content="Aby stworzyć własnego asystenta (Custom GPT), musimy nadać mu 'mózg'. System Prompt to instrukcja, która definiuje jego osobowość i zasady. Możemy np. wkleić całą wiedzę z tego kursu i kazać mu działać jako 'Prompt Engineer', który będzie poprawiał Twoje polecenia."
              />

              <GraphBlock
                title="Bezpieczeństwo danych"
                nodes={[
                  { id: "train", label: "Trening Modelu", description: "Twoje czaty mogą służyć do nauki AI. Można to wyłączyć w ustawieniach." },
                  { id: "anon", label: "Anonimizacja", description: "Zastępuj dane wrażliwe (nazwiska, nazwy firm) hasłami typu 'Firma A', 'Pracownik X'." },
                  { id: "verify", label: "Weryfikacja", description: "Zawsze sprawdzaj wynik. Nie wysyłaj 'na ślepo' (pamiętaj o historii z raportem wysłanym o 7:50)." }
                ]}
              />
            </div>
          )}

          {/* Page 6: Quizy finalne + Puzzle ryzyk */}
          {currentPage === 6 && (
            <div className="space-y-8">
              <MultipleChoiceBlock
                question="Czy wyłączenie zgody na trenowanie modelu w ustawieniach (privacy.openai.com) zapewnia 100% prywatności i sprawia, że dane nie trafiają na serwery?"
                options={[
                  { id: "a", text: "Tak, dane zostają tylko na moim komputerze", isCorrect: false },
                  { id: "b", text: "Nie, dane i tak trafiają na serwery (np. w celu wykrywania nadużyć/błędów), ale nie są używane do nauki", isCorrect: true }
                ]}
              />

              <PuzzleBlock
                title="Podsumowanie Ryzyk"
                pairs={[
                  { left: "Halucynacje (zmyślanie)", right: "Stosowanie Ograniczeń [O] w prompcie i weryfikacja" },
                  { left: "Utrata kontekstu (zapominanie)", right: "Dbanie o limit tokenów, nieprzeciąganie wątku" },
                  { left: "Wyciek danych wrażliwych", right: "Anonimizacja danych przed wpisaniem w czat" }
                ]}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-12">
            <Button
              onClick={goBack}
              variant="outline"
              disabled={currentPage === 0}
              className="h-12 px-6"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Wstecz
            </Button>

            <Button
              onClick={goNext}
              className="h-12 px-6"
            >
              {currentPage === totalPages - 1 ? "Zakończ" : "Dalej"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Exercises;