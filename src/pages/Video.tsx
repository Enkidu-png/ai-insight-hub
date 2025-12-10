import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const Video = () => {
  const navigate = useNavigate();
  const [videoWatched, setVideoWatched] = useState(false);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="glass-card rounded-3xl p-8 md:p-12 animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
            Mistrzowskie Prompty AI
          </h1>

          {/* Video Container */}
          <div className="relative rounded-2xl overflow-hidden glass-card border-2 border-white/30 mb-8 aspect-video">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/t-SQLY-rIi4"
              title="AI Prompt Engineering Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => setVideoWatched(true)}
            />
          </div>

          {/* Video Description */}
          <div className="glass-card rounded-2xl p-6 mb-8 border-primary/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Szablony i Techniki Promptingu
            </h2>
            <div className="space-y-6 text-foreground/80">
              <div>
                <h3 className="font-semibold text-foreground mb-3">✅ RTKOFEP — Szablon do wypełnienia</h3>
                <ul className="space-y-2 ml-4 text-sm">
                  <li><strong>[R] Rola:</strong> Jakiej roli ma przyjąć model? Jakiego typu ekspertem ma być?</li>
                  <li><strong>[T] Zadanie (Task):</strong> Co dokładnie ma zostać wykonane? Jaki jest cel końcowy?</li>
                  <li><strong>[K] Kontekst:</strong> Jakie informacje wprowadzające są potrzebne?</li>
                  <li><strong>[O] Ograniczenia:</strong> Co model musi respektować? (Antyhalucynacyjne)</li>
                  <li><strong>[F] Format odpowiedzi:</strong> W jakiej strukturze ma pojawić się finalna odpowiedź?</li>
                  <li><strong>[E] Ewaluacja jakości:</strong> Po czym poznać, że odpowiedź jest dobra?</li>
                  <li><strong>[P] Przykłady:</strong> Jakie materiały referencyjne model ma wziąć pod uwagę?</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">🧠 Chain of Thoughts</h3>
                <ul className="space-y-1 ml-4 text-sm">
                  <li>🎯 CEL/ZADANIE: [Jednym zdaniem: co chcesz osiągnąć?]</li>
                  <li>📥 DANE/ZAŁOŻENIA: [Punktami: liczby, ograniczenia, kontekst]</li>
                  <li>🧭 PLAN KROKÓW (5 etapów)</li>
                  <li>🧩 ROZUMOWANIE (krok po kroku)</li>
                  <li>✅ WYNIK KOŃCOWY: [Wartość + uzasadnienie]</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-3">🌲 Tree of Thoughts</h3>
                <ul className="space-y-1 ml-4 text-sm">
                  <li>🎯 PROBLEM: [Opis w 1-2 zdaniach]</li>
                  <li>🏁 KRYTERIA OCENY: Skuteczność, Koszt/czas, Ryzyko, Zgodność</li>
                  <li>🌲 ŚCIEŻKI (A-D): [Różne podejścia]</li>
                  <li>🧮 OCENA: [Tabela punktowa]</li>
                  <li>🏆 WYBÓR: [Najlepsza ścieżka]</li>
                  <li>🛠 PLAN 5 KROKÓW</li>
                </ul>
              </div>

              <div>
                <p className="text-sm italic">
                  Te techniki pozwolą Ci tworzyć bardziej precyzyjne i skuteczne prompty,
                  które dają lepsze rezultaty w pracy z AI.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => navigate("/exercises")}
            size="lg"
            disabled={!videoWatched}
            className="w-full h-14 text-lg rounded-2xl bg-secondary hover:bg-secondary/90 shadow-lg shadow-secondary/20"
          >
            {videoWatched ? "Dalej" : "Oglądaj film, aby kontynuować"}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Video;
